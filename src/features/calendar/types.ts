export type EventScope = "PERSONAL" | "CLASS";

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  scope: EventScope;
  creatorId: string;
  creatorName: string;
};
