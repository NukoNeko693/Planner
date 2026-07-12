export type EventScope = "PERSONAL" | "CLASS" | "GRADE" | "SCHOOL";

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  scope: EventScope;
  creatorId: string;
  creatorName: string;
  classId: string | null;
  className: string | null;
  schoolDivision: "MIDDLE" | "HIGH" | null;
  grade: number | null;
};
