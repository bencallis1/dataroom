"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { useState } from "react";

import { AlertCircle } from "lucide-react";

import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { z } from "zod";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const { next } = useParams as { next?: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const authError = searchParams?.get("error");
  const isSSORequired = authError === "require-saml-sso";

  const [clickedMethod, setClickedMethod] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [emailButtonText, setEmailButtonText] = useState<string>(
    "Continue with Email",
  );

  const emailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .min(3, { message: "Please enter a valid email." })
    .email({ message: "Please enter a valid email." });

  const emailValidation = emailSchema.safeParse(email);

  return (
    <div className="flex h-screen w-full flex-wrap">
      {/* Left part */}
      <div className="flex w-full justify-center bg-gray-50 ">
        <div
          className="absolute inset-x-0 top-10 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl"
          aria-hidden="true"
        ></div>
        <div className="z-10 mx-5 mt-[calc(1vh)] h-fit w-full max-w-md overflow-hidden rounded-lg sm:mx-0 sm:mt-[calc(2vh)] md:mt-[calc(3vh)]">
          <div className="items-left flex flex-col space-y-3 px-4 py-6 pt-8 sm:px-12">
            <Link href="https://www.portal.kenshocollective.com" target="_blank">
              <img
                src="/_static/kensho_logo_header.svg"
                alt="Papermark Logo"
                className="md:mb-48s -mt-8 mb-36 h-7 w-auto self-start sm:mb-32"
              />
            </Link>
            <Link href="/">
              <span className="text-balance text-3xl font-semibold text-gray-900">
                Kensho Collective Portal
              </span>
            </Link>
            <h3 className="text-balance text-sm text-gray-800">
              Projects, resources, and more.
            </h3>
          </div>
          {isSSORequired && (
            <div className="mx-4 mb-2 flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 sm:mx-12">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-900">
                  Your organization requires SSO login
                </p>
                <p className="mt-1 text-sm text-orange-700">
                  Please use the <strong>SAML SSO</strong> option below to sign
                  in with your company&apos;s identity provider.
                </p>
              </div>
            </div>
          )}
          <form
            className="flex flex-col gap-4 px-4 pt-8 sm:px-12"
            onSubmit={(e) => {
              e.preventDefault();
              if (!emailValidation.success) {
                toast.error(emailValidation.error.errors[0].message);
                return;
              }

              setClickedMethod(true);
              signIn("email", {
                email: emailValidation.data,
                redirect: false,
                ...(next && next.length > 0 ? { callbackUrl: next } : {}),
              }).then((res) => {
                if (res?.ok && !res?.error) {
                  // Store email in sessionStorage for the verification page
                  try {
                    sessionStorage.setItem(
                      "pendingVerificationEmail",
                      emailValidation.data,
                    );
                  } catch {
                    // sessionStorage not available, verification page will show email input
                  }
                  router.push("/auth/email");
                } else {
                  setEmailButtonText("Error sending email - try again?");
                  toast.error("Error sending email - try again?");
                  setClickedMethod(false);
                }
              });
            }}
          >
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={clickedMethod}
              // pattern={patternSimpleEmailRegex}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "flex h-10 w-full rounded-md border-0 bg-background bg-white px-3 py-2 text-sm text-gray-900 ring-1 ring-gray-200 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white",
                email.length > 0 && !emailValidation.success
                  ? "ring-red-500"
                  : "ring-gray-200",
              )}
            />
            <div className="relative">
              <Button
                type="submit"
                loading={clickedMethod}
                disabled={!emailValidation.success || clickedMethod}
                className="focus:shadow-outline w-full transform rounded bg-gray-800 px-4 py-2 text-white transition-colors duration-300 ease-in-out hover:bg-gray-900 focus:outline-none"
              >
                {emailButtonText}
              </Button>
            </div>
          </form>
          <p className="mt-10 w-full max-w-md px-4 text-xs text-muted-foreground sm:px-12">
            By clicking continue, you acknowledge that you have read and agree
            to Papermark&apos;s{" "}
            <a
              href={`${process.env.NEXT_PUBLIC_MARKETING_URL}/terms`}
              target="_blank"
              className="underline"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href={`${process.env.NEXT_PUBLIC_MARKETING_URL}/privacy`}
              target="_blank"
              className="underline"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
      
    </div>
  );
}
