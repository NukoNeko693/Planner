import { prisma } from "@/lib/prisma";

const dbDate = (value: string) => new Date(`${value}T00:00:00.000Z`);

export function findWeeklyPlan(userId: string, from: string, to: string) {
  return Promise.all([
    prisma.weeklyPlanItem.findMany({
      where: { userId, planDate: { gte: dbDate(from), lte: dbDate(to) } },
      orderBy: [{ planDate: "asc" }, { startTime: "asc" }],
    }),
    prisma.weeklyNote.findUnique({
      where: { userId_weekStart: { userId, weekStart: dbDate(from) } },
    }),
    prisma.dailyDiary.findMany({
      where: { userId, diaryDate: { gte: dbDate(from), lte: dbDate(to) } },
      orderBy: { diaryDate: "asc" },
    }),
  ]);
}

export function saveDailyDiary(input: {
  userId: string;
  date: string;
  content: string;
  submit: boolean;
}) {
  const diaryDate = dbDate(input.date);
  return prisma.dailyDiary.upsert({
    where: { userId_diaryDate: { userId: input.userId, diaryDate } },
    create: {
      userId: input.userId,
      diaryDate,
      content: input.content,
      submittedAt: input.submit ? new Date() : null,
    },
    update: {
      content: input.content,
      ...(input.submit ? { submittedAt: new Date() } : {}),
    },
  });
}

export function findSubmittedDiariesForTeacher(classId: string) {
  return prisma.dailyDiary.findMany({
    where: {
      submittedAt: { not: null },
      user: { classId, status: "ACTIVE", role: "STUDENT" },
    },
    select: {
      id: true,
      diaryDate: true,
      content: true,
      submittedAt: true,
      teacherReply: true,
      repliedAt: true,
      user: { select: { name: true } },
    },
    orderBy: [{ diaryDate: "desc" }, { submittedAt: "desc" }],
    take: 100,
  });
}

export function replyToDiary(input: {
  diaryId: string;
  classId: string;
  reply: string;
}) {
  return prisma.dailyDiary.updateMany({
    where: {
      id: input.diaryId,
      submittedAt: { not: null },
      user: { classId: input.classId, status: "ACTIVE", role: "STUDENT" },
    },
    data: { teacherReply: input.reply, repliedAt: new Date() },
  });
}

export function createPlanItem(input: {
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
}) {
  return prisma.weeklyPlanItem.create({
    data: {
      userId: input.userId,
      planDate: dbDate(input.date),
      startTime: input.startTime,
      endTime: input.endTime,
      title: input.title,
    },
  });
}

export function deletePlanItem(userId: string, id: string) {
  return prisma.weeklyPlanItem.deleteMany({ where: { id, userId } });
}

export function togglePlanItem(userId: string, id: string, completed: boolean) {
  return prisma.weeklyPlanItem.updateMany({
    where: { id, userId },
    data: { completed },
  });
}

export function saveWeeklyNote(input: {
  userId: string;
  weekStart: string;
  goal: string;
  memo: string;
  reflection: string;
}) {
  const key = {
    userId_weekStart: {
      userId: input.userId,
      weekStart: dbDate(input.weekStart),
    },
  };
  const data = {
    goal: input.goal,
    memo: input.memo,
    reflection: input.reflection,
  };
  return prisma.weeklyNote.upsert({
    where: key,
    create: {
      userId: input.userId,
      weekStart: dbDate(input.weekStart),
      ...data,
    },
    update: data,
  });
}
