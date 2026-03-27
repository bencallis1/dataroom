import React from "react";

import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import { Footer } from "./shared/footer";

export default function MemberApproved({
  teamName,
  dashboardUrl,
}: {
  teamName: string;
  dashboardUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Your access to {teamName} has been approved</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 w-[465px] p-5">
            <Text className="mx-0 mb-8 mt-4 p-0 text-center text-2xl font-normal">
              <span className="font-bold tracking-tighter">Papermark</span>
            </Text>
            <Text className="mx-0 mb-8 mt-4 p-0 text-center text-xl font-semibold">
              You&apos;ve been approved!
            </Text>
            <Text className="text-sm leading-6 text-black">Hi,</Text>
            <Text className="text-sm leading-6 text-black">
              Your request to join{" "}
              <span className="font-semibold">{teamName}</span> has been
              approved. You now have full access to the workspace.
            </Text>
            <Section className="my-8 text-center">
              <Button
                className="rounded bg-black text-center text-xs font-semibold text-white no-underline"
                href={dashboardUrl}
                style={{ padding: "12px 20px" }}
              >
                Go to workspace
              </Button>
            </Section>
            <Hr />
            <Footer />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
