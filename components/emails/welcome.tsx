import React from "react";

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import { BRAND_NAME } from "@/lib/branding";

import { Footer } from "./shared/footer";

interface WelcomeEmailProps {
  name: string | null | undefined;
}

const WelcomeEmail = ({ name }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{`Welcome to ${BRAND_NAME}`}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[600px] rounded border border-solid border-neutral-200 px-10 py-5">
            <Section className="mt-8">
              <Text className="text-2xl font-bold tracking-tighter">
                {BRAND_NAME}
              </Text>
            </Section>
            <Heading className="mx-0 my-7 p-0 text-xl font-semibold text-black">
              Welcome {name ? name : `to ${BRAND_NAME}`}!
            </Heading>
            <Text className="mb-8 text-sm leading-6 text-gray-600">
              Thank you for signing up for {BRAND_NAME}! You can now start
              sharing documents securely, create data rooms, and track
              engagement in real-time.
            </Text>

            <Hr />

            <Heading className="mx-0 my-6 p-0 text-lg font-semibold text-black">
              Getting started
            </Heading>

            <Text className="mb-4 text-sm leading-6 text-gray-600">
              <strong className="font-medium text-black">
                1. Upload your document
              </strong>
              : Simply drag and drop your PDF, spreadsheet, or presentation to
              create a shareable link.
            </Text>

            <Text className="mb-4 text-sm leading-6 text-gray-600">
              <strong className="font-medium text-black">
                2. Share securely
              </strong>
              : Add email verification, password protection, or link expiration
              to control access.
            </Text>

            <Text className="mb-4 text-sm leading-6 text-gray-600">
              <strong className="font-medium text-black">
                3. Track engagement
              </strong>
              : Watch page-by-page analytics in real-time to see who&apos;s
              viewing your documents.
            </Text>

            <Text className="mb-8 text-sm leading-6 text-gray-600">
              <strong className="font-medium text-black">
                4. Create a data room
              </strong>
              : Set up a secure data room for due diligence and enterprise
              document sharing.
            </Text>

            <Section className="mb-8">
              <Link
                className="rounded-lg bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`}
              >
                Go to your dashboard
              </Link>
            </Section>

            <Footer marketing />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
