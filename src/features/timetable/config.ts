export const TIMETABLE_DAYS = [
  { weekday: 1, label: "月", periods: 7 },
  { weekday: 2, label: "火", periods: 7 },
  { weekday: 3, label: "水", periods: 6 },
  { weekday: 4, label: "木", periods: 6 },
  { weekday: 5, label: "金", periods: 6 },
  { weekday: 6, label: "土", periods: 4 },
] as const;

export const MAX_TIMETABLE_PERIODS = 7;
