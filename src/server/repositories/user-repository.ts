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

export async function findActiveUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: {
      email: { equals: email.trim(), mode: "insensitive" },
      status: "ACTIVE",
    },
    select: { id: true, username: true, name: true, role: true },
  });
}

export async function findOrCreateGoogleUser(email: string, name: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await findActiveUserByEmail(normalizedEmail);
  if (existing) return existing;

  const localPart = normalizedEmail.split("@")[0] || "google-user";
  const baseUsername = localPart.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 40);
  let username = baseUsername || "google-user";
  let suffix = 1;

  while (
    await prisma.user.findUnique({ where: { username }, select: { id: true } })
  ) {
    username = `${baseUsername}-${suffix++}`;
  }

  return prisma.user.create({
    data: { email: normalizedEmail, name: name.trim() || username, username },
    select: { id: true, username: true, name: true, role: true },
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
