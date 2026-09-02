import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { userPath } from "@/lib/user-path";

import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect(userPath(session.user.username, "dashboard"));

  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-bold tracking-[0.18em] text-blue-700">
          CELLMANE
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">ログイン</h1>
        <p className="mt-2 text-slate-600">学校の予定表へアクセスします。</p>
        <LoginForm
          googleEnabled={Boolean(
            process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
          )}
        />
      </section>
    </main>
  );
}
