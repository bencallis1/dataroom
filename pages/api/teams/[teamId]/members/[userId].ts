import { NextApiRequest, NextApiResponse } from "next";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";

import { sendMemberApprovedEmail } from "@/lib/emails/send-member-approved";
import { errorhandler } from "@/lib/errorHandler";
import prisma from "@/lib/prisma";
import { CustomUser } from "@/lib/types";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "PUT") {
    // PUT /api/teams/:teamId/members/:userId
    // Body: { action: "approve" | "reject" }
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).end("Unauthorized");
    }

    const { teamId, userId: targetUserId } = req.query as {
      teamId: string;
      userId: string;
    };
    const currentUserId = (session.user as CustomUser).id;
    const { action } = req.body as { action: "approve" | "reject" };

    if (!action || !["approve", "reject"].includes(action)) {
      return res.status(400).json("Invalid action. Must be 'approve' or 'reject'");
    }

    try {
      // Verify requester is an admin of the team
      const requesterTeam = await prisma.userTeam.findUnique({
        where: {
          userId_teamId: { userId: currentUserId, teamId },
        },
        select: { role: true },
      });

      if (!requesterTeam || requesterTeam.role !== "ADMIN") {
        return res.status(403).json("Only admins can approve or reject members");
      }

      // Verify the target user is PENDING in this team
      const targetUserTeam = await prisma.userTeam.findUnique({
        where: {
          userId_teamId: { userId: targetUserId, teamId },
        },
        select: { status: true },
      });

      if (!targetUserTeam) {
        return res.status(404).json("User not found in this team");
      }

      if (targetUserTeam.status !== "PENDING") {
        return res.status(400).json("User is not pending approval");
      }

      if (action === "approve") {
        await prisma.userTeam.update({
          where: {
            userId_teamId: { userId: targetUserId, teamId },
          },
          data: { status: "ACTIVE" },
        });

        // Email the approved user
        const [team, targetUser] = await Promise.all([
          prisma.team.findUnique({
            where: { id: teamId },
            select: { name: true },
          }),
          prisma.user.findUnique({
            where: { id: targetUserId },
            select: { email: true },
          }),
        ]);

        if (team && targetUser?.email) {
          sendMemberApprovedEmail({
            memberEmail: targetUser.email,
            teamName: team.name,
            dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/documents`,
          });
        }

        return res.status(200).json("Member approved");
      }

      if (action === "reject") {
        // Remove the user from the team entirely
        await prisma.userTeam.delete({
          where: {
            userId_teamId: { userId: targetUserId, teamId },
          },
        });

        return res.status(200).json("Member rejected");
      }
    } catch (error) {
      errorhandler(error, res);
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
