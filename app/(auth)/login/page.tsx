import { Metadata } from "next";

import { BRAND_NAME, BRAND_URL } from "@/lib/branding";

import { GTMComponent } from "@/components/gtm-component";

import LoginClient from "./page-client";

const data = {
  description: `Login to ${BRAND_NAME}`,
  title: `Login | ${BRAND_NAME}`,
  url: "/login",
};

export const metadata: Metadata = {
  metadataBase: new URL(BRAND_URL),
  title: data.title,
  description: data.description,
  openGraph: {
    title: data.title,
    description: data.description,
    url: data.url,
    siteName: BRAND_NAME,
    images: [
      {
        url: "/_static/meta-image.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: data.title,
    description: data.description,
    images: ["/_static/meta-image.png"],
  },
};

export default function LoginPage() {
  return (
    <>
      <GTMComponent />
      <LoginClient />
    </>
  );
}
