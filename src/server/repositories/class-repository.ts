import { prisma } from "@/lib/prisma";

export async function findClassWithMembers(classId: string) {
  return prisma.schoolClass.findUnique({
    where: { id: classId },
    select: {
      id: true,
      name: true,
      users: {
        where: { status: "ACTIVE" },
        select: { id: true, username: true, name: true, role: true },
        orderBy: [{ role: "asc" }, { username: "asc" }],
      },
    },
  });
}

export async function addUserToClass(input: {
  username: string;
  classId: string;
  actorId: string;
}): Promise<"ADDED" | "NOT_FOUND"> {
  return prisma.$transaction(async (tx) => {
    const target = await tx.user.findFirst({
      where: {
        username: { equals: input.username.trim(), mode: "insensitive" },
        status: "ACTIVE",
      },
      select: { id: true, classId: true },
    });
    if (!target) return "NOT_FOUND";
    await tx.user.update({
      where: { id: target.id },
      data: { classId: input.classId },
    });
    await tx.auditLog.create({
      data: {
        actorId: input.actorId,
        action: "CLASS_MEMBER_ADD",
        entityType: "SchoolClass",
        entityId: input.classId,
        metadata: { userId: target.id, previousClassId: target.classId },
      },
    });
    return "ADDED";
  });
}
