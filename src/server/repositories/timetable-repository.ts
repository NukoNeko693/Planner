import { prisma } from "@/lib/prisma";

export function listHomeroomClasses() {
  return prisma.schoolClass.findMany({
    where: { type: "HOMEROOM" },
    select: { id: true, name: true },
    orderBy: [
      { schoolDivision: "asc" },
      { grade: "asc" },
      { classLabel: "asc" },
    ],
  });
}

export function findTimetable(classId: string) {
  return prisma.timetableEntry.findMany({
    where: { classId },
    select: { weekday: true, period: true, subject: true, teacherName: true },
    orderBy: [{ period: "asc" }, { weekday: "asc" }],
  });
}

export async function saveTimetable(input: {
  classId: string;
  actorId: string;
  entries: {
    weekday: number;
    period: number;
    subject: string;
    teacherName: string;
  }[];
}) {
  await prisma.$transaction(async (tx) => {
    for (const entry of input.entries) {
      const where = {
        classId_weekday_period: {
          classId: input.classId,
          weekday: entry.weekday,
          period: entry.period,
        },
      };
      if (entry.subject || entry.teacherName) {
        await tx.timetableEntry.upsert({
          where,
          update: { subject: entry.subject, teacherName: entry.teacherName },
          create: { classId: input.classId, ...entry },
        });
      } else {
        await tx.timetableEntry.deleteMany({
          where: where.classId_weekday_period,
        });
      }
    }
    await tx.auditLog.create({
      data: {
        actorId: input.actorId,
        action: "TIMETABLE_UPDATE",
        entityType: "SchoolClass",
        entityId: input.classId,
      },
    });
  });
}
