import MemberApproved from "@/components/emails/member-approved";

import { sendEmail } from "@/lib/resend";

export const sendMemberApprovedEmail = async ({
  memberEmail,
  teamName,
  dashboardUrl,
}: {
  memberEmail: string;
  teamName: string;
  dashboardUrl: string;
}) => {
  try {
    await sendEmail({
      to: memberEmail,
      subject: `Your access to ${teamName} has been approved`,
      react: MemberApproved({ teamName, dashboardUrl }),
      test: process.env.NODE_ENV === "development",
      system: true,
    });
  } catch (e) {
    console.error(e);
  }
};
