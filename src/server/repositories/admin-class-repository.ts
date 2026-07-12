import { prisma } from "@/lib/prisma";

export async function listClassAdministrationData() {
  const [homeroomClasses, electiveClasses, members] = await Promise.all([
    prisma.schoolClass.findMany({
      where: { type: "HOMEROOM" },
      select: {
        id: true,
        code: true,
        name: true,
        schoolDivision: true,
        grade: true,
        classLabel: true,
        _count: {
          select: { users: { where: { role: "STUDENT", status: "ACTIVE" } } },
        },
      },
      orderBy: { code: "asc" },
    }),
    prisma.schoolClass.findMany({
      where: { type: "ELECTIVE" },
      select: {
        id: true,
        code: true,
        name: true,
        joinCode: true,
        owner: { select: { name: true, username: true } },
        _count: { select: { memberships: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { role: { in: ["STUDENT", "TEACHER"] }, status: "ACTIVE" },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        classId: true,
        schoolClass: { select: { name: true } },
      },
      orderBy: { username: "asc" },
    }),
  ]);
  return { homeroomClasses, electiveClasses, members };
}

export async function createSchoolClass(input: {
  schoolDivision: "MIDDLE" | "HIGH";
  grade: number;
  classLabel: string;
  actorId: string;
}): Promise<"CREATED" | "DUPLICATE"> {
  return prisma.$transaction(async (tx) => {
    const classLabel = input.classLabel.normalize("NFKC").toUpperCase();
    const prefix = input.schoolDivision === "MIDDLE" ? "中学" : "高校";
    const code = `${input.schoolDivision === "MIDDLE" ? "J" : "H"}${input.grade}-${classLabel}`;
    const name = `${prefix}${input.grade}年${classLabel}組`;
    const exists = await tx.schoolClass.findFirst({
      where: {
        schoolDivision: input.schoolDivision,
        grade: input.grade,
        classLabel,
      },
      select: { id: true },
    });
    if (exists) return "DUPLICATE";
    const schoolClass = await tx.schoolClass.create({
      data: {
        code,
        name,
        type: "HOMEROOM",
        schoolDivision: input.schoolDivision,
        grade: input.grade,
        classLabel,
      },
      select: { id: true },
    });
    await tx.auditLog.create({
      data: {
        actorId: input.actorId,
        action: "CLASS_CREATE",
        entityType: "SchoolClass",
        entityId: schoolClass.id,
        metadata: {
          code,
          name,
          schoolDivision: input.schoolDivision,
          grade: input.grade,
          classLabel,
        },
      },
    });
    return "CREATED";
  });
}

export async function addTeacherToGradeTeam(input: {
  schoolDivision: "MIDDLE" | "HIGH";
  grade: number;
  username: string;
  actorId: string;
}): Promise<"ADDED" | "NOT_FOUND" | "HOMEROOM_TEACHER"> {
  return prisma.$transaction(async (tx) => {
    const teacher = await tx.user.findFirst({
      where: {
        username: { equals: input.username, mode: "insensitive" },
        role: "TEACHER",
        status: "ACTIVE",
      },
      select: {
        id: true,
        schoolClass: {
          select: { type: true, schoolDivision: true, grade: true },
        },
      },
    });
    if (!teacher) return "NOT_FOUND";
    if (
      teacher.schoolClass?.type === "HOMEROOM" &&
      teacher.schoolClass.schoolDivision === input.schoolDivision &&
      teacher.schoolClass.grade === input.grade
    )
      return "HOMEROOM_TEACHER";
    await tx.gradeTeamMembership.upsert({
      where: {
        userId_schoolDivision_grade: {
          userId: teacher.id,
          schoolDivision: input.schoolDivision,
          grade: input.grade,
        },
      },
      update: {},
      create: {
        userId: teacher.id,
        schoolDivision: input.schoolDivision,
        grade: input.grade,
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: input.actorId,
        action: "GRADE_TEAM_TEACHER_ADD",
        entityType: "User",
        entityId: teacher.id,
        metadata: { schoolDivision: input.schoolDivision, grade: input.grade },
      },
    });
    return "ADDED";
  });
}

export async function listGradeTeams() {
  const [classes, additions] = await Promise.all([
    prisma.schoolClass.findMany({
      where: {
        type: "HOMEROOM",
        schoolDivision: { not: null },
        grade: { not: null },
      },
      select: {
        id: true,
        name: true,
        schoolDivision: true,
        grade: true,
        users: {
          where: { role: "TEACHER", status: "ACTIVE" },
          select: { id: true, name: true, username: true },
        },
      },
      orderBy: [
        { schoolDivision: "asc" },
        { grade: "asc" },
        { classLabel: "asc" },
      ],
    }),
    prisma.gradeTeamMembership.findMany({
      select: {
        schoolDivision: true,
        grade: true,
        user: { select: { id: true, name: true, username: true } },
      },
    }),
  ]);
  return { classes, additions };
}

export async function moveUserToHomeroom(input: {
  userId: string;
  classId: string;
  actorId: string;
}): Promise<"MOVED" | "NOT_FOUND"> {
  return prisma.$transaction(async (tx) => {
    const [member, targetClass] = await Promise.all([
      tx.user.findFirst({
        where: {
          id: input.userId,
          role: { in: ["STUDENT", "TEACHER"] },
          status: "ACTIVE",
        },
        select: { id: true, classId: true, role: true },
      }),
      tx.schoolClass.findFirst({
        where: { id: input.classId, type: "HOMEROOM" },
        select: { id: true },
      }),
    ]);
    if (!member || !targetClass) return "NOT_FOUND";
    await tx.user.update({
      where: { id: member.id },
      data: { classId: targetClass.id },
    });
    await tx.auditLog.create({
      data: {
        actorId: input.actorId,
        action: "HOMEROOM_MEMBER_MOVE",
        entityType: "User",
        entityId: member.id,
        metadata: {
          role: member.role,
          previousClassId: member.classId,
          classId: targetClass.id,
        },
      },
    });
    return "MOVED";
  });
}
