import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  adminClassesPath,
  USER_PAGES,
  userPath,
  type UserPage,
} from "@/lib/user-path";

export default auth((request) => {
  const username = request.auth?.user?.username;
  if (!username) return NextResponse.next();

  const parts = request.nextUrl.pathname.split("/").filter(Boolean);
  if (parts.length === 2 && parts[0] === "admin" && parts[1] === "classes") {
    return NextResponse.redirect(
      new URL(adminClassesPath(username), request.url),
    );
  }

  const isUserAdminClasses =
    parts.length === 4 &&
    parts[0] === "users" &&
    parts[2] === "admin" &&
    parts[3] === "classes";
  if (isUserAdminClasses) {
    const requestedUsername = decodeURIComponent(parts[1]);
    if (
      requestedUsername.toLocaleLowerCase() !== username.toLocaleLowerCase()
    ) {
      return NextResponse.redirect(
        new URL(adminClassesPath(username), request.url),
      );
    }
    const rewrittenUrl = request.nextUrl.clone();
    rewrittenUrl.pathname = "/admin/classes";
    return NextResponse.rewrite(rewrittenUrl);
  }

  const legacyPage = parts.length === 1 && USER_PAGES.includes(parts[0]);
  if (legacyPage) {
    return NextResponse.redirect(
      new URL(userPath(username, parts[0] as UserPage), request.url),
    );
  }

  if (
    parts[0] !== "users" ||
    parts.length !== 3 ||
    !USER_PAGES.includes(parts[2])
  ) {
    return NextResponse.next();
  }

  const requestedUsername = decodeURIComponent(parts[1]);
  const page = parts[2] as UserPage;
  if (requestedUsername.toLocaleLowerCase() !== username.toLocaleLowerCase()) {
    return NextResponse.redirect(
      new URL(userPath(username, page), request.url),
    );
  }

  const rewrittenUrl = request.nextUrl.clone();
  rewrittenUrl.pathname = `/${page}`;
  return NextResponse.rewrite(rewrittenUrl);
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/calendar/:path*",
    "/class/:path*",
    "/weekly/:path*",
    "/diaries/:path*",
    "/timetable/:path*",
    "/school-guide/:path*",
    "/announcements/:path*",
    "/users/:path*",
    "/admin/:path*",
  ],
};
