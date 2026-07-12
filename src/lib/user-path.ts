const userPages = [
  "dashboard",
  "calendar",
  "class",
  "weekly",
  "diaries",
  "timetable",
  "school-guide",
  "announcements",
] as const;

export type UserPage = (typeof userPages)[number];
export const USER_PAGES: readonly string[] = userPages;

export function userPath(username: string, page: UserPage): Route {
  return `/users/${encodeURIComponent(username)}/${page}` as Route;
}

export function adminClassesPath(username: string): Route {
  return `/users/${encodeURIComponent(username)}/admin/classes` as Route;
}
import type { Route } from "next";
