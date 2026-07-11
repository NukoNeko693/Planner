import { redirect } from "next/navigation";
import Link from "next/link";

import { auth, signOut } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const roleLabels = {
    STUDENT: "学生",
    TEACHER: "教師",
    ADMIN: "管理者",
  } as const;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-blue-700">セルマネ</p>
          <h1 className="mt-1 text-2xl font-bold">
            こんにちは、{session.user.name}さん
          </h1>
          <p className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            権限：{roleLabels[session.user.role]}
          </p>
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
      {session.user.role === "TEACHER" ? (
        <section className="mt-6 rounded-2xl border border-amber-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">提出された日記</h2>
          <p className="mt-2 text-slate-600">
            クラスの学生が提出した日記を確認できます。
          </p>
          <Link
            className="mt-5 inline-flex rounded-xl bg-amber-600 px-5 py-3 font-bold text-white hover:bg-amber-700"
            href="/diaries"
          >
            日記を確認する
          </Link>
        </section>
      ) : null}
      <section className="mt-6 rounded-2xl border border-violet-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">1週間の計画表</h2>
        <p className="mt-2 text-slate-600">
          時間ごとの予定、今週の目標、メモ、振り返りを個人用に管理できます。
        </p>
        <Link
          className="mt-5 inline-flex rounded-xl bg-violet-700 px-5 py-3 font-bold text-white hover:bg-violet-800"
          href="/weekly"
        >
          週間計画表を開く
        </Link>
      </section>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">所属クラス</h2>
        <p className="mt-2 text-slate-600">
          クラスメンバーと権限を確認できます。
        </p>
        <Link
          className="mt-5 inline-flex rounded-xl border border-slate-300 px-5 py-3 font-bold hover:bg-slate-50"
          href="/class"
        >
          クラスを開く
        </Link>
      </section>
    </main>
  );
}
