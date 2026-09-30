import React from "react";

import {
  Body,
  Head,
  Html,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";

import { BRAND_NAME } from "@/lib/branding";

interface SixMonthMilestoneEmailProps {
  name: string | null | undefined;
  planName?: string;
}

const SixMonthMilestoneEmail = ({
  name,
  planName = "Pro",
}: SixMonthMilestoneEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{`6 months with ${BRAND_NAME}`}</Preview>
      <Tailwind>
        <Body className="font-sans text-sm">
          <Text>Hi {name},</Text>
          <Text>What&apos;s been your biggest win using {BRAND_NAME}?</Text>
          <Text>
            It&apos;s been 6 months since you started using advanced{" "}
            {BRAND_NAME} features! Excited to hear your story and feedback for
            us.
          </Text>

          <Text>The {BRAND_NAME} team</Text>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default SixMonthMilestoneEmail;
