import { redirect } from "next/navigation";
import Link from "next/link";

import { auth, signOut } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-blue-700">セルマネ</p>
          <h1 className="mt-1 text-2xl font-bold">
            こんにちは、{session.user.name}さん
          </h1>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            className="rounded-xl border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-50"
            type="submit"
          >
            ログアウト
          </button>
        </form>
      </header>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">予定を確認する</h2>
        <p className="mt-2 text-slate-600">
          月間カレンダーで個人・クラスの予定を管理できます。
        </p>
        <Link
          className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
          href="/calendar"
        >
          カレンダーを開く
        </Link>
      </section>
    </main>
  );
}
