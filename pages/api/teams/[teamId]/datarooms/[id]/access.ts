import { NextApiRequest, NextApiResponse } from "next";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";

import prisma from "@/lib/prisma";
import { CustomUser } from "@/lib/types";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).end("Unauthorized");
  }

  const requestingUserId = (session.user as CustomUser).id;
  const { teamId, id: dataroomId } = req.query as {
    teamId: string;
    id: string;
  };

  // Only ADMIN or MANAGER can manage access
  const teamAccess = await prisma.userTeam.findUnique({
    where: { userId_teamId: { userId: requestingUserId, teamId } },
    select: { role: true },
  });
  if (!teamAccess) {
    return res.status(401).end("Unauthorized");
  }
  if (teamAccess.role === "MEMBER") {
    return res.status(403).end("Forbidden");
  }

  // Confirm dataroom belongs to team
  const dataroom = await prisma.dataroom.findUnique({
    where: { id: dataroomId, teamId },
    select: { id: true },
  });
  if (!dataroom) {
    return res.status(404).end("Not Found");
  }

  if (req.method === "GET") {
    // GET /api/teams/:teamId/datarooms/:id/access
    // Returns all users with explicit access grants
    const accesses = await prisma.dataroomUserAccess.findMany({
      where: { dataroomId },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    return res.status(200).json({ accesses });
  }

  if (req.method === "POST") {
    // POST /api/teams/:teamId/datarooms/:id/access
    // Body: { userId: string }  — grant access
    const { userId } = req.body as { userId: string };
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Confirm user is a MEMBER of the team
    const targetMember = await prisma.userTeam.findUnique({
      where: { userId_teamId: { userId, teamId } },
      select: { role: true },
    });
    if (!targetMember) {
      return res.status(404).json({ error: "User is not a member of this team" });
    }

    const access = await prisma.dataroomUserAccess.upsert({
      where: { dataroomId_userId: { dataroomId, userId } },
      create: { dataroomId, userId },
      update: {},
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });
    return res.status(201).json({ access });
  }

  if (req.method === "DELETE") {
    // DELETE /api/teams/:teamId/datarooms/:id/access
    // Body: { userId: string }  — revoke access
    const { userId } = req.body as { userId: string };
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    await prisma.dataroomUserAccess.deleteMany({
      where: { dataroomId, userId },
    });
    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
