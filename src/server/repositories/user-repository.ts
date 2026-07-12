import { prisma } from "@/lib/prisma";

export async function findActiveUserByUsername(username: string) {
  return prisma.user.findFirst({
    where: {
      username: { equals: username.trim(), mode: "insensitive" },
      status: "ACTIVE",
    },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      passwordHash: true,
    },
  });
}

export async function activeUserExists(userId: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: { id: userId, status: "ACTIVE" },
    select: { id: true },
  });
  return Boolean(user);
}

export async function findActiveUserContext(userId: string) {
  return prisma.user.findFirst({
    where: { id: userId, status: "ACTIVE" },
    select: {
      id: true,
      role: true,
      classId: true,
      schoolClass: {
        select: { name: true, schoolDivision: true, grade: true },
      },
      gradeTeamMemberships: { select: { schoolDivision: true, grade: true } },
      electiveMemberships: {
        select: { schoolClass: { select: { id: true, name: true } } },
        orderBy: { schoolClass: { name: "asc" } },
      },
    },
  });
}
