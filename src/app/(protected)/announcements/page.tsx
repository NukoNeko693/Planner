import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { userPath } from "@/lib/user-path";
import { listHomeroomClasses } from "@/server/repositories/timetable-repository";
import {
  listAnnouncements,
  listPendingAnnouncements,
} from "@/server/repositories/announcement-repository";
import { findActiveUserContext } from "@/server/repositories/user-repository";
import { AnnouncementForm } from "./announcement-form";
import { reviewAnnouncementAction } from "./actions";

const statusLabels = {
  PENDING: "承認待ち",
  PUBLISHED: "公開中",
  REJECTED: "却下",
} as const;
export default async function AnnouncementsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await findActiveUserContext(session.user.id);
  if (!user) redirect("/login");
  const ownGrade =
    user.schoolClass?.schoolDivision && user.schoolClass.grade
      ? [
          {
            schoolDivision: user.schoolClass.schoolDivision,
            grade: user.schoolClass.grade,
          },
        ]
      : [];
  const grades =
    user.role === "ADMIN"
      ? (["MIDDLE", "HIGH"] as const).flatMap((schoolDivision) =>
          [1, 2, 3].map((grade) => ({ schoolDivision, grade })),
        )
      : [...ownGrade, ...user.gradeTeamMemberships].filter(
          (item, i, all) =>
            all.findIndex(
              (x) =>
                x.schoolDivision === item.schoolDivision &&
                x.grade === item.grade,
            ) === i,
        );
  const classes =
    user.role === "ADMIN"
      ? await listHomeroomClasses()
      : user.classId && user.schoolClass
        ? [{ id: user.classId, name: user.schoolClass.name }]
        : [];
  const [announcements, pending] = await Promise.all([
    listAnnouncements(user.id, {
      classId: user.classId,
      grades,
      isAdmin: user.role === "ADMIN",
    }),
    user.role === "STUDENT" ? [] : listPendingAnnouncements(),
  ]);
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <Link
        className="text-sm font-semibold text-blue-700 hover:underline"
        href={userPath(session.user.username, "dashboard")}
      >
        ← ダッシュボード
      </Link>
      <h1 className="mt-3 text-3xl font-bold">お知らせ</h1>
      <p className="mt-2 text-slate-600">
        文章と資料を、ホームルーム・学年・学校全体へ共有できます。
      </p>
      <section className="mt-6 rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">新しいお知らせ</h2>
        <p className="mt-1 text-sm text-slate-600">
          {user.role === "STUDENT"
            ? "公開には教師または管理者の許可が必要です。"
            : "作成後すぐに公開されます。"}
        </p>
        <AnnouncementForm
          classes={classes}
          grades={grades}
          isStudent={user.role === "STUDENT"}
        />
      </section>
      {pending.length ? (
        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/40 p-6">
          <h2 className="text-xl font-bold">生徒からの公開許可申請</h2>
          <div className="mt-4 space-y-4">
            {pending.map((item) => (
              <article
                className="rounded-xl border border-amber-200 bg-white p-5"
                key={item.id}
              >
                <h3 className="font-bold">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  申請者: {item.author.name}・{scopeLabel(item)}
                </p>
                <p className="mt-3 whitespace-pre-wrap">{item.body}</p>
                <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
                  <strong>公開目的:</strong> {item.purpose}
                </p>
                <AttachmentLinks items={item.attachments} />
                <form
                  action={reviewAnnouncementAction}
                  className="mt-4 space-y-2"
                >
                  <input name="id" type="hidden" value={item.id} />
                  <textarea
                    className="w-full rounded-lg border p-3 text-sm"
                    name="reason"
                    placeholder="却下する場合は理由を入力"
                  />
                  <div className="flex gap-2">
                    <button
                      className="rounded-lg bg-emerald-700 px-4 py-2 font-bold text-white"
                      name="decision"
                      value="approve"
                    >
                      許可して公開
                    </button>
                    <button
                      className="rounded-lg bg-red-700 px-4 py-2 font-bold text-white"
                      name="decision"
                      value="reject"
                    >
                      理由を通知して却下
                    </button>
                  </div>
                </form>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <section className="mt-6">
        <h2 className="text-xl font-bold">お知らせ一覧</h2>
        <div className="mt-4 space-y-4">
          {announcements.map((item) => (
            <article
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              key={item.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.author.name}・{scopeLabel(item)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${item.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-800" : item.status === "REJECTED" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}
                >
                  {statusLabels[item.status]}
                </span>
              </div>
              <p className="mt-4 leading-7 whitespace-pre-wrap">{item.body}</p>
              <AttachmentLinks items={item.attachments} />
              {item.status === "REJECTED" ? (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                  <strong>却下理由:</strong> {item.rejectionReason}
                  <br />
                  確認者: {item.reviewer?.name ?? "教師・管理者"}
                </p>
              ) : null}
              {item.status === "PENDING" && item.author.id === user.id ? (
                <p className="mt-4 text-sm font-semibold text-amber-700">
                  公開許可を審査中です。
                </p>
              ) : null}
            </article>
          ))}
          {!announcements.length ? (
            <p className="rounded-xl bg-slate-100 p-5 text-slate-500">
              表示できるお知らせはありません。
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function scopeLabel(item: {
  scope: "HOMEROOM" | "GRADE" | "SCHOOL";
  schoolDivision: "MIDDLE" | "HIGH" | null;
  grade: number | null;
}) {
  if (item.scope === "SCHOOL") return "学校全体";
  if (item.scope === "GRADE")
    return `${item.schoolDivision === "MIDDLE" ? "中学" : "高校"}${item.grade}年`;
  return "ホームルーム";
}
function AttachmentLinks({
  items,
}: {
  items: { id: string; fileName: string; size: number }[];
}) {
  return items.length ? (
    <ul className="mt-4 flex flex-wrap gap-2">
      {items.map((file) => (
        <li key={file.id}>
          <a
            className="inline-flex rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-100"
            href={`/api/announcements/attachments/${file.id}`}
            target="_blank"
          >
            📎 {file.fileName} ({Math.ceil(file.size / 1024)}KB)
          </a>
        </li>
      ))}
    </ul>
  ) : null;
}
