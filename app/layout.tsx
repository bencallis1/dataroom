import { Metadata } from "next";
import { Inter } from "next/font/google";

import { BRAND_NAME, BRAND_URL } from "@/lib/branding";

import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

const data = {
  description: "Secure document sharing and data rooms",
  title: BRAND_NAME,
  url: "/",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
