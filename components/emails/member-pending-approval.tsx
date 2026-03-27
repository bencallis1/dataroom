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

export default function MemberPendingApproval({
  memberName,
  memberEmail,
  teamName,
  approvalUrl,
}: {
  memberName: string;
  memberEmail: string;
  teamName: string;
  approvalUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>
        {memberName || memberEmail} is waiting for approval to join {teamName}
      </Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 w-[465px] p-5">
            <Text className="mx-0 mb-8 mt-4 p-0 text-center text-2xl font-normal">
              <span className="font-bold tracking-tighter">Papermark</span>
            </Text>
            <Text className="mx-0 mb-8 mt-4 p-0 text-center text-xl font-semibold">
              New member awaiting approval
            </Text>
            <Text className="text-sm leading-6 text-black">Hi,</Text>
            <Text className="text-sm leading-6 text-black">
              <span className="font-semibold">{memberName || memberEmail}</span>
              {memberName ? (
                <>
                  {" "}({memberEmail})
                </>
              ) : null}{" "}
              has accepted an invitation to join{" "}
              <span className="font-semibold">{teamName}</span> and is waiting
              for your approval before they can access the workspace.
            </Text>
            <Section className="my-8 text-center">
              <Button
                className="rounded bg-black text-center text-xs font-semibold text-white no-underline"
                href={approvalUrl}
                style={{ padding: "12px 20px" }}
              >
                Review and approve
              </Button>
            </Section>
            <Text className="text-sm leading-6 text-black">
              or copy and paste this URL into your browser:
            </Text>
            <Text className="max-w-sm flex-wrap break-words font-medium text-purple-600 no-underline">
              {approvalUrl.replace(/^https?:\/\//, "")}
            </Text>
            <Hr />
            <Footer />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
