import { Body, Head, Html, Tailwind, Text } from "@react-email/components";

import { BRAND_NAME } from "@/lib/branding";

interface HundredViewsCongratsEmailProps {
  name: string | null | undefined;
}

const HundredViewsCongratsEmail = ({
  name,
}: HundredViewsCongratsEmailProps) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="font-sans text-sm">
          <Text>Hi{name && ` ${name}`},</Text>
          <Text>Congrats on 100 views on your {BRAND_NAME} documents.</Text>
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

export default HundredViewsCongratsEmail;
