import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { userPath } from "@/lib/user-path";
import {
  listClassAdministrationData,
  listGradeTeams,
} from "@/server/repositories/admin-class-repository";
import { findActiveUserContext } from "@/server/repositories/user-repository";

import { CreateClassForm } from "./create-class-form";
import { MoveStudentForm } from "./move-student-form";
import { GradeTeamForm } from "./grade-team-form";

export default async function AdminClassesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const admin = await findActiveUserContext(session.user.id);
  if (admin?.role !== "ADMIN")
    redirect(userPath(session.user.username, "dashboard"));
  const [{ homeroomClasses, electiveClasses, members }, gradeTeamData] =
    await Promise.all([listClassAdministrationData(), listGradeTeams()]);
  const classOptions = homeroomClasses.map(({ id, name }) => ({ id, name }));

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <Link
        className="text-sm font-semibold text-blue-700 hover:underline"
        href={userPath(session.user.username, "dashboard")}
      >
        ← ダッシュボード
      </Link>
      <h1 className="mt-3 text-3xl font-bold">ホームルームクラス管理</h1>
      <p className="mt-2 text-slate-600">
        クラスの作成と学生の所属変更を管理します。
      </p>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-blue-700">ホームルーム</p>
        <h2 className="mt-1 text-xl font-bold">新しいホームルームクラス</h2>
        <CreateClassForm />
      </section>
      <section className="mt-6 rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-emerald-700">学年団</p>
        <h2 className="mt-1 text-xl font-bold">学年団の教師</h2>
        <p className="mt-1 text-sm text-slate-600">
          同学年の各クラス担任は自動で所属します。ここでは担任以外の教師を追加できます。
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {(["MIDDLE", "HIGH"] as const).flatMap((schoolDivision) =>
            [1, 2, 3].map((grade) => {
              const classes = gradeTeamData.classes.filter(
                (item) =>
                  item.schoolDivision === schoolDivision &&
                  item.grade === grade,
              );
              if (!classes.length) return null;
              const teachers = [
                ...classes.flatMap((item) =>
                  item.users.map((user) => ({
                    ...user,
                    detail: `${item.name}担任`,
                  })),
                ),
                ...gradeTeamData.additions
                  .filter(
                    (item) =>
                      item.schoolDivision === schoolDivision &&
                      item.grade === grade,
                  )
                  .map((item) => ({ ...item.user, detail: "追加教師" })),
              ];
              return (
                <div
                  className="rounded-xl border border-emerald-200 p-4"
                  key={`${schoolDivision}-${grade}`}
                >
                  <h3 className="font-bold">
                    {schoolDivision === "MIDDLE" ? "中学" : "高校"}
                    {grade}年 学年団
                  </h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    {teachers.map((teacher) => (
                      <li key={`${teacher.id}-${teacher.detail}`}>
                        {teacher.name}{" "}
                        <span className="text-slate-500">
                          （{teacher.detail}）
                        </span>
                      </li>
                    ))}
                  </ul>
                  <GradeTeamForm
                    grade={grade}
                    schoolDivision={schoolDivision}
                  />
                </div>
              );
            }),
          )}
        </div>
      </section>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-blue-700">ホームルーム</p>
        <h2 className="mt-1 text-xl font-bold">ホームルームクラス一覧</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {homeroomClasses.map((schoolClass) => (
            <div
              className="rounded-xl border border-slate-200 p-4"
              key={schoolClass.id}
            >
              <p className="text-xs font-bold text-slate-500">
                {schoolClass.code}
              </p>
              <p className="mt-1 font-bold">{schoolClass.name}</p>
              <p className="mt-2 text-sm text-slate-600">
                学生 {schoolClass._count.users}名
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-6 rounded-2xl border border-violet-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-violet-700">選択授業</p>
        <h2 className="mt-1 text-xl font-bold">選択授業クラス一覧</h2>
        <p className="mt-1 text-sm text-slate-600">
          選択授業はホームルームとは別に、担当教師と参加メンバーで管理されます。
        </p>
        {electiveClasses.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {electiveClasses.map((elective) => (
              <div
                className="rounded-xl border border-violet-200 p-4"
                key={elective.id}
              >
                <p className="font-bold">{elective.name}</p>
                <p className="mt-2 text-sm text-slate-600">
                  担当: {elective.owner?.name ?? "未設定"}
                </p>
                <p className="text-sm text-slate-600">
                  参加メンバー {elective._count.memberships}名
                </p>
                <p className="mt-2 text-xs text-violet-700">
                  参加コード: {elective.joinCode ?? "未発行"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            選択授業はまだ作成されていません。
          </p>
        )}
      </section>
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <p className="px-6 pt-5 text-sm font-bold text-blue-700">
          ホームルーム
        </p>
        <h2 className="border-b border-slate-200 p-6 text-xl font-bold">
          学生・教師のホームルーム所属変更
        </h2>
        <ul className="divide-y divide-slate-100">
          {members.map((member) => (
            <li
              className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center"
              key={member.id}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold">{member.name}</p>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-bold ${member.role === "TEACHER" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}
                  >
                    {member.role === "TEACHER" ? "教師" : "学生"}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {member.username}・現在:{" "}
                  {member.schoolClass?.name ?? "未所属"}
                </p>
              </div>
              <MoveStudentForm
                classes={classOptions}
                currentClassId={member.classId}
                userId={member.id}
              />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
