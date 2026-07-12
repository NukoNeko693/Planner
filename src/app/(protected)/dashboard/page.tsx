import { redirect } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";

import { auth, signOut } from "@/auth";
import { adminClassesPath, userPath } from "@/lib/user-path";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const roleLabels = {
    STUDENT: "学生",
    TEACHER: "教師",
    ADMIN: "管理者",
  } as const;

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
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
      <DashboardGroup
        title="予定・学習"
        description="毎日の予定や学習計画を確認します。"
      >
        <DashboardCard
          title="カレンダー"
          description="個人・クラス・学年・学校全体の予定"
          href={userPath(session.user.username, "calendar")}
        />
        <DashboardCard
          title="週間計画表"
          description="今週の予定、目標、メモ、振り返り"
          href={userPath(session.user.username, "weekly")}
        />
      </DashboardGroup>

      <DashboardGroup
        title="学校案内"
        description="学校生活に関する情報を確認します。"
      >
        <DashboardCard
          title="学校情報"
          description="建学の精神、学則、生徒相談窓口"
          href={userPath(session.user.username, "school-guide")}
        />
        <DashboardCard
          title="お知らせ"
          description="学校・学年・ホームルームからのお知らせと資料"
          href={userPath(session.user.username, "announcements")}
        />
      </DashboardGroup>

      <DashboardGroup
        title="ホームルームクラス"
        description="所属クラスの情報や活動を確認します。"
      >
        <DashboardCard
          title="時間割"
          description="所属ホームルームの授業時間割"
          href={userPath(session.user.username, "timetable")}
        />
        <DashboardCard
          title="クラス情報"
          description="ホームルームと選択授業のメンバー"
          href={userPath(session.user.username, "class")}
        />
        {session.user.role === "TEACHER" ? (
          <DashboardCard
            title="提出された日記"
            description="生徒から提出された日記と返信"
            href={userPath(session.user.username, "diaries")}
          />
        ) : null}
      </DashboardGroup>

      {session.user.role === "ADMIN" ? (
        <DashboardGroup
          title="管理"
          description="学校・クラスの設定を管理します。"
          admin
        >
          <DashboardCard
            title="クラス・学年団管理"
            description="ホームルームの作成、所属変更、学年団の設定"
            href={adminClassesPath(session.user.username)}
            admin
          />
          <DashboardCard
            title="時間割管理"
            description="各ホームルームの時間割を編集"
            href={userPath(session.user.username, "timetable")}
            admin
          />
          <DashboardCard
            title="学校予定管理"
            description="学校全体・学年全体の予定を登録"
            href={userPath(session.user.username, "calendar")}
            admin
          />
        </DashboardGroup>
      ) : null}
    </main>
  );
}

function DashboardGroup({
  title,
  description,
  admin = false,
  children,
}: {
  title: string;
  description: string;
  admin?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`mt-8 rounded-2xl border p-6 ${admin ? "border-amber-200 bg-amber-50/50" : "border-slate-200 bg-white"}`}
    >
      <div className="border-b border-slate-200 pb-4">
        <p
          className={`text-xs font-bold tracking-widest ${admin ? "text-amber-700" : "text-blue-700"}`}
        >
          {admin ? "ADMIN" : "CELLMANE"}
        </p>
        <h2 className="mt-1 text-2xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

function DashboardCard({
  title,
  description,
  href,
  admin = false,
}: {
  title: string;
  description: string;
  href: Route;
  admin?: boolean;
}) {
  return (
    <Link
      className={`group flex min-h-36 flex-col rounded-xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md ${admin ? "border-amber-200 bg-white hover:border-amber-400" : "border-slate-200 hover:border-blue-400"}`}
      href={href}
    >
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
        {description}
      </p>
      <span
        className={`mt-4 text-sm font-bold ${admin ? "text-amber-700" : "text-blue-700"}`}
      >
        開く{" "}
        <span
          aria-hidden="true"
          className="inline-block transition group-hover:translate-x-1"
        >
          →
        </span>
      </span>
    </Link>
  );
}
