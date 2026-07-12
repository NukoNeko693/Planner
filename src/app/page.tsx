import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { userPath } from "@/lib/user-path";

export default async function HomePage() {
  const session = await auth();
  redirect(
    session?.user ? userPath(session.user.username, "dashboard") : "/login",
  );
}
