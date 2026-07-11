import type { CalendarEvent, EventScope } from "@/features/calendar/types";
import { prisma } from "@/lib/prisma";

const asDatabaseDate = (value: string) => new Date(`${value}T00:00:00.000Z`);

export async function createEvent(input: {
  title: string;
  date: string;
  scope: EventScope;
  creatorId: string;
}): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const event = await tx.event.create({
      data: {
        title: input.title,
        eventDate: asDatabaseDate(input.date),
        scope: input.scope,
        creatorId: input.creatorId,
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
  from: string,
  to: string,
): Promise<CalendarEvent[]> {
  const events = await prisma.event.findMany({
    where: {
      deletedAt: null,
      eventDate: { gte: asDatabaseDate(from), lte: asDatabaseDate(to) },
      OR: [{ scope: "CLASS" }, { scope: "PERSONAL", creatorId: userId }],
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
