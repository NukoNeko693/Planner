import type { CalendarEvent, EventScope } from "@/features/calendar/types";
import { prisma } from "@/lib/prisma";

const asDatabaseDate = (value: string) => new Date(`${value}T00:00:00.000Z`);

export async function createEvent(input: {
  title: string;
  date: string;
  scope: EventScope;
  creatorId: string;
  classId: string | null;
}): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const event = await tx.event.create({
      data: {
        title: input.title,
        eventDate: asDatabaseDate(input.date),
        scope: input.scope,
        creatorId: input.creatorId,
        classId: input.scope === "CLASS" ? input.classId : null,
      },
      select: { id: true },
    });
    await tx.auditLog.create({
      data: {
        actorId: input.creatorId,
        action: "EVENT_CREATE",
        entityType: "Event",
        entityId: event.id,
        metadata: { scope: input.scope },
      },
    });
  });
}

export async function findVisibleEvents(
  userId: string,
  classId: string | null,
  from: string,
  to: string,
): Promise<CalendarEvent[]> {
  const events = await prisma.event.findMany({
    where: {
      deletedAt: null,
      eventDate: { gte: asDatabaseDate(from), lte: asDatabaseDate(to) },
      OR: [
        { scope: "SCHOOL" },
        { scope: "PERSONAL", creatorId: userId },
        ...(classId ? [{ scope: "CLASS" as const, classId }] : []),
      ],
    },
    select: {
      id: true,
      title: true,
      eventDate: true,
      scope: true,
      creatorId: true,
      creator: { select: { name: true } },
    },
    orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }],
  });
  return events.map((event) => ({
    id: event.id,
    title: event.title,
    date: event.eventDate.toISOString().slice(0, 10),
    scope: event.scope as EventScope,
    creatorId: event.creatorId,
    creatorName: event.creator.name,
  }));
}

export async function updateSchoolEvent(input: {
  eventId: string;
  title: string;
  date: string;
  actorId: string;
}): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const result = await tx.event.updateMany({
      where: { id: input.eventId, scope: "SCHOOL", deletedAt: null },
      data: { title: input.title, eventDate: asDatabaseDate(input.date) },
    });
    if (result.count !== 1) return false;
    await tx.auditLog.create({
      data: {
        actorId: input.actorId,
        action: "EVENT_UPDATE",
        entityType: "Event",
        entityId: input.eventId,
      },
    });
    return true;
  });
}

export async function deleteSchoolEvent(input: {
  eventId: string;
  actorId: string;
}): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const result = await tx.event.updateMany({
      where: { id: input.eventId, scope: "SCHOOL", deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (result.count !== 1) return false;
    await tx.auditLog.create({
      data: {
        actorId: input.actorId,
        action: "EVENT_DELETE",
        entityType: "Event",
        entityId: input.eventId,
      },
    });
    return true;
  });
}

export async function deleteClassEvent(input: {
  eventId: string;
  actorId: string;
  classId: string;
}): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const result = await tx.event.updateMany({
      where: {
        id: input.eventId,
        scope: "CLASS",
        classId: input.classId,
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });
    if (result.count !== 1) return false;
    await tx.auditLog.create({
      data: {
        actorId: input.actorId,
        action: "EVENT_DELETE",
        entityType: "Event",
        entityId: input.eventId,
      },
    });
    return true;
  });
}
