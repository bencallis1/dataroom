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

interface ThousandViewsCongratsEmailProps {
  name: string | null | undefined;
}

const ThousandViewsCongratsEmail = ({
  name,
}: ThousandViewsCongratsEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{`1000 views on ${BRAND_NAME}.`}</Preview>
      <Tailwind>
        <Body className="font-sans text-sm">
          <Text>Hi{name && ` ${name}`},</Text>
          <Text>Congrats on 1000 views on your {BRAND_NAME} documents.</Text>
          <Text>How is your experience so far?</Text>

          <Text>
            Thanks so much,
            <br />
            The {BRAND_NAME} team
          </Text>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ThousandViewsCongratsEmail;
