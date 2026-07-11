import { prisma } from "@/lib/prisma";

export async function findActiveUserByUsername(username: string) {
  return prisma.user.findFirst({
    where: {
      username: { equals: username.trim(), mode: "insensitive" },
      status: "ACTIVE",
    },
    select: { id: true, name: true, passwordHash: true },
  });
}

export async function activeUserExists(userId: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: { id: userId, status: "ACTIVE" },
    select: { id: true },
  });
  return Boolean(user);
}
