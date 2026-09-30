// Central branding for this deployment. Set the env vars in Vercel to override.

export const BRAND_NAME = "Kensho Datarooms";
export const COMPANY_NAME = "Kensho Collective";

export const BRAND_URL =
  process.env.NEXT_PUBLIC_MARKETING_URL ||
  "https://www.portal.kenshocollective.com";

// Hostname shown in place of the default link domain (e.g. in link settings)
export const BRAND_HOST = BRAND_URL.replace(/^https?:\/\//, "").replace(
  /\/.*$/,
  "",
);

export const BRAND_LOGO = "/_static/kensho_logo_header.svg";

// Shown in the UI, so it must be a NEXT_PUBLIC_ variable
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "";

// Server-only: sender address on a Resend-verified domain
export const EMAIL_FROM =
  process.env.EMAIL_FROM || `${BRAND_NAME} <noreply@kenshocollective.com>`;
