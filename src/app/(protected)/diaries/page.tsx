import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { userPath } from "@/lib/user-path";
import { findActiveUserContext } from "@/server/repositories/user-repository";
import { findSubmittedDiariesForTeacher } from "@/server/repositories/weekly-plan-repository";
import { replyToDiaryAction } from "./actions";

export default async function DiariesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await findActiveUserContext(session.user.id);
  if (!user || user.role !== "TEACHER" || !user.classId)
    redirect(userPath(session.user.username, "dashboard"));
  const diaries = await findSubmittedDiariesForTeacher(user.id);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6">
      <Link
        className="text-sm font-semibold text-blue-700 hover:underline"
        href={userPath(session.user.username, "dashboard")}
      >
        ← ダッシュボード
      </Link>
      <h1 className="mt-2 text-3xl font-bold">提出された日記</h1>
      <p className="mt-1 text-slate-600">
        {user.schoolClass?.name}の学生から提出された日記です。
      </p>
      <div className="mt-6 space-y-4">
        {diaries.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-slate-500 shadow-sm">
            提出された日記はまだありません。
          </p>
        ) : (
          diaries.map((diary) => (
            <article
              className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm"
              key={diary.id}
            >
              <div className="flex flex-wrap justify-between gap-2">
                <h2 className="font-bold">{diary.user.name}</h2>
                <time className="text-sm font-semibold text-slate-600">
                  {diary.diaryDate.toISOString().slice(0, 10)}
                </time>
              </div>
              <p className="mt-3 leading-relaxed whitespace-pre-wrap">
                {diary.content}
              </p>
              <form
                action={replyToDiaryAction}
                className="mt-4 rounded-lg bg-blue-50 p-3"
              >
                <input name="diaryId" type="hidden" value={diary.id} />
                <label className="text-sm font-bold text-blue-900">
                  先生からの返信
                </label>
                <textarea
                  className="mt-2 min-h-20 w-full rounded-md border border-blue-200 bg-white p-2"
                  defaultValue={diary.teacherReply}
                  maxLength={2000}
                  name="reply"
                  placeholder="生徒への返信を入力"
                  required
                />
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">
                    {diary.repliedAt
                      ? `返信済み：${diary.repliedAt.toLocaleString("ja-JP")}`
                      : "未返信"}
                  </span>
                  <button className="rounded-md bg-blue-700 px-4 py-2 text-sm font-bold text-white">
                    {diary.repliedAt ? "返信を更新" : "返信する"}
                  </button>
                </div>
              </form>
              <p className="mt-3 text-xs text-slate-400">
                提出：{diary.submittedAt?.toLocaleString("ja-JP")}
              </p>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
