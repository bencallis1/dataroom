import MemberPendingApproval from "@/components/emails/member-pending-approval";

import { sendEmail } from "@/lib/resend";

export const sendMemberPendingApprovalEmail = async ({
  adminEmail,
  memberName,
  memberEmail,
  teamName,
  approvalUrl,
}: {
  adminEmail: string;
  memberName: string;
  memberEmail: string;
  teamName: string;
  approvalUrl: string;
}) => {
  try {
    await sendEmail({
      to: adminEmail,
      subject: `${memberName || memberEmail} is waiting for approval to join ${teamName}`,
      react: MemberPendingApproval({
        memberName,
        memberEmail,
        teamName,
        approvalUrl,
      }),
      test: process.env.NODE_ENV === "development",
      system: true,
    });
  } catch (e) {
    console.error(e);
  }
};
