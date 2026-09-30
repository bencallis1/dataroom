import { Metadata } from "next";

import { BRAND_NAME } from "@/lib/branding";

import SAMLCallbackClient from "./page-client";

export const metadata: Metadata = {
  title: `SSO Login | ${BRAND_NAME}`,
  description: "Completing SSO login",
};

export default function SAMLCallbackPage() {
  return <SAMLCallbackClient />;
}
