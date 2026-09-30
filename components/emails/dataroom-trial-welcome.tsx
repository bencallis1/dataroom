import React from "react";

import { Body, Head, Html, Tailwind, Text } from "@react-email/components";

import { BRAND_NAME } from "@/lib/branding";

interface WelcomeEmailProps {
  name: string | null | undefined;
}

const DataroomTrialWelcomeEmail = ({ name }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="font-sans text-sm">
          <Text>Hi{name && ` ${name}`},</Text>
          <Text>
            Thanks for creating a {BRAND_NAME} trial. Do you need any help with
            Data Rooms setup?
          </Text>
          <Text>The {BRAND_NAME} team</Text>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default DataroomTrialWelcomeEmail;
