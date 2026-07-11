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
  ]);
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
