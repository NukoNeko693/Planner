export type EventScope = "PERSONAL" | "CLASS" | "SCHOOL";

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  scope: EventScope;
  creatorId: string;
  creatorName: string;
};
