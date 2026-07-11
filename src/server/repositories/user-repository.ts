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
