import { NextApiRequest, NextApiResponse } from "next";

import { checkRateLimit, rateLimiters } from "@/ee/features/security";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";

import { identifyUser, trackAnalytics } from "@/lib/analytics";
import { qstash } from "@/lib/cron";
import { dub } from "@/lib/dub";
import { isBlacklistedEmail } from "@/lib/edge-config/blacklist";
import { sendVerificationRequestEmail } from "@/lib/emails/send-verification-request";
import prisma from "@/lib/prisma";
import { CustomUser } from "@/lib/types";
import { log } from "@/lib/utils";
import { getIpAddress } from "@/lib/utils/ip";

const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL;

function getMainDomainUrl(): string {
  if (process.env.NODE_ENV === "development") {
    return process.env.NEXTAUTH_URL || "http://localhost:3000";
  }
  return process.env.NEXTAUTH_URL || "https://app.papermark.com";
}

// This function can run for a maximum of 180 seconds
export const config = {
  maxDuration: 180,
};

export const authOptions: NextAuthOptions = {
  pages: {
    error: "/login",
  },
  providers: [
    EmailProvider({
      async sendVerificationRequest({ identifier, url }) {
        const hasValidNextAuthUrl = !!process.env.NEXTAUTH_URL;
        let finalUrl = url;

        if (!hasValidNextAuthUrl) {
          const mainDomainUrl = getMainDomainUrl();
          const urlObj = new URL(url);
          const mainDomainObj = new URL(mainDomainUrl);
          urlObj.hostname = mainDomainObj.hostname;
          urlObj.protocol = mainDomainObj.protocol;
          urlObj.port = mainDomainObj.port || "";

          finalUrl = urlObj.toString();
        }

        // In development, send the email but also log the URL
        if (process.env.NODE_ENV === "development") {
          await sendVerificationRequestEmail({
            url: finalUrl,
            email: identifier,
          });
          console.log("[Login Email Sent] Check your inbox for:", identifier);
        } else {
          await sendVerificationRequestEmail({
            url: finalUrl,
            email: identifier,
          });
        }
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  cookies: {
    sessionToken: {
      name: `${VERCEL_DEPLOYMENT ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: VERCEL_DEPLOYMENT,
      },
    },
  },
  callbacks: {
    jwt: async (params) => {
      const { token, user, trigger, account } = params;
      if (!token.email) {
        return {};
      }
      if (user) {
        token.user = user;
      }
      // Track SAML provider on the token
      if (
        (account?.provider === "saml" || account?.provider === "saml-idp") &&
        user
      ) {
        token.provider = "saml";
      }
      // refresh the user data
      if (trigger === "update") {
        const user = token?.user as CustomUser;
        const refreshedUser = await prisma.user.findUnique({
          where: { id: user.id },
        });
        if (refreshedUser) {
          token.user = refreshedUser;
        } else {
          return {};
        }

        if (refreshedUser?.email !== user.email) {
          if (user.id && refreshedUser.email) {
            await prisma.account.deleteMany({
              where: { userId: user.id },
            });
          }
        }
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user = {
        id: token.sub,
        // @ts-ignore
        ...(token.user || session.user),
      } as CustomUser;
      return session;
    },
  },
  events: {
    async createUser(message) {
      await identifyUser(message.user.email ?? message.user.id);
      await trackAnalytics({
        event: "User Signed Up",
        email: message.user.email,
        userId: message.user.id,
      });

      await qstash.publishJSON({
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/cron/welcome-user`,
        body: {
          userId: message.user.id,
        },
        delay: 15 * 60,
      });
    },
  },
};

const getAuthOptions = (req: NextApiRequest): NextAuthOptions => {
  return {
    ...authOptions,
    callbacks: {
      ...authOptions.callbacks,
      signIn: async ({ user }) => {
        if (!user.email || (await isBlacklistedEmail(user.email))) {
          await identifyUser(user.email ?? user.id);
          await trackAnalytics({
            event: "User Sign In Attempted",
            email: user.email ?? undefined,
            userId: user.id,
          });
          return false;
        }

        // Apply rate limiting for signin attempts
        try {
          if (req) {
            const clientIP = getIpAddress(req.headers);
            const rateLimitResult = await checkRateLimit(
              rateLimiters.auth,
              clientIP,
            );

            if (!rateLimitResult.success) {
              log({
                message: `Rate limit exceeded for IP ${clientIP} during signin attempt`,
                type: "error",
              });
              return false;
            }
          }
        } catch (error) {}

        return true;
      },
    },
    events: {
      ...authOptions.events,
      signIn: async (message) => {
        await Promise.allSettled([
          identifyUser(message.user.email ?? message.user.id),
          trackAnalytics({
            event: "User Signed In",
            email: message.user.email,
          }),
        ]);

        if (message.isNewUser) {
          const { dub_id } = req.cookies;
          if (dub_id && process.env.DUB_API_KEY) {
            try {
              await dub.track.lead({
                clickId: dub_id,
                eventName: "Sign Up",
                customerExternalId: message.user.id,
                customerName: message.user.name,
                customerEmail: message.user.email,
                customerAvatar: message.user.image ?? undefined,
              });
            } catch (err) {
              console.error("dub.track.lead failed", err);
            }
          }
        }
      },
    },
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  return NextAuth(req, res, getAuthOptions(req));
}
