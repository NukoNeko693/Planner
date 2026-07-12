import { randomBytes } from "node:crypto";

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

export function findElectiveClassesForUser(userId: string) {
  return prisma.schoolClass.findMany({
    where: { type: "ELECTIVE", memberships: { some: { userId } } },
    select: {
      id: true,
      name: true,
      joinCode: true,
      ownerId: true,
      owner: { select: { name: true } },
      memberships: {
        where: { user: { status: "ACTIVE" } },
        select: {
          user: {
            select: { id: true, name: true, username: true, role: true },
          },
        },
        orderBy: { user: { username: "asc" } },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function createElectiveClass(input: {
  name: string;
  teacherId: string;
}) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const joinCode = randomBytes(4).toString("hex").toUpperCase();
    try {
      return await prisma.schoolClass.create({
        data: {
          name: input.name,
          code: `elective-${randomBytes(8).toString("hex")}`,
          type: "ELECTIVE",
          joinCode,
          ownerId: input.teacherId,
          memberships: { create: { userId: input.teacherId } },
        },
      });
    } catch (error: unknown) {
      if (
        !(error instanceof Error) ||
        !error.message.includes("Unique constraint")
      )
        throw error;
    }
  }
  throw new Error("参加コードを生成できませんでした。");
}

export async function joinElectiveByCode(input: {
  joinCode: string;
  userId: string;
}) {
  const elective = await prisma.schoolClass.findFirst({
    where: { joinCode: input.joinCode.toUpperCase(), type: "ELECTIVE" },
    select: { id: true },
  });
  if (!elective) return "NOT_FOUND" as const;
  await prisma.classMembership.upsert({
    where: { userId_classId: { userId: input.userId, classId: elective.id } },
    update: {},
    create: { userId: input.userId, classId: elective.id },
  });
  return "JOINED" as const;
}

export async function addStudentToElective(input: {
  username: string;
  classId: string;
  teacherId: string;
}) {
  const elective = await prisma.schoolClass.findFirst({
    where: { id: input.classId, type: "ELECTIVE", ownerId: input.teacherId },
    select: { id: true },
  });
  if (!elective) return "FORBIDDEN" as const;
  const student = await prisma.user.findFirst({
    where: {
      username: { equals: input.username, mode: "insensitive" },
      status: "ACTIVE",
      role: "STUDENT",
    },
    select: { id: true },
  });
  if (!student) return "NOT_FOUND" as const;
  await prisma.classMembership.upsert({
    where: { userId_classId: { userId: student.id, classId: elective.id } },
    update: {},
    create: { userId: student.id, classId: elective.id },
  });
  return "ADDED" as const;
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
