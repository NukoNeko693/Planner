import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { userPath } from "@/lib/user-path";
import {
  findClassWithMembers,
  findElectiveClassesForUser,
} from "@/server/repositories/class-repository";
import { findActiveUserContext } from "@/server/repositories/user-repository";

import { AddMemberForm } from "./add-member-form";
import {
  AddElectiveStudentForm,
  CreateElectiveForm,
  JoinElectiveForm,
} from "./elective-forms";

const roleLabels = {
  STUDENT: "学生",
  TEACHER: "教師",
  ADMIN: "管理者",
} as const;

export default async function ClassPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await findActiveUserContext(session.user.id);
  if (!user) redirect(userPath(session.user.username, "dashboard"));
  const [schoolClass, electives] = await Promise.all([
    user.classId ? findClassWithMembers(user.classId) : null,
    findElectiveClassesForUser(user.id),
  ]);
  const canAddMember = user.role === "TEACHER" || user.role === "ADMIN";

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <Link
        className="text-sm font-semibold text-blue-700 hover:underline"
        href={userPath(session.user.username, "dashboard")}
      >
        ← ダッシュボード
      </Link>
      <h1 className="mt-3 text-3xl font-bold">所属クラス</h1>
      <p className="mt-2 text-slate-600">
        ホームルームクラスと選択授業クラスを確認できます。
      </p>
      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-blue-700">ホームルーム</p>
          <h2 className="mt-1 text-xl font-bold">
            {schoolClass?.name ?? "未所属"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            学生は必ず1クラスのみ所属
          </p>
        </div>
        <div className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-violet-700">選択授業</p>
          {electives.length ? (
            <ul className="mt-2 space-y-1">
              {electives.map((elective) => (
                <li className="font-bold" key={elective.id}>
                  {elective.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              所属している選択授業はありません。
            </p>
          )}
          <p className="mt-2 text-sm text-slate-500">複数クラスに所属可能</p>
        </div>
      </section>
      {user.role === "STUDENT" ? (
        <section className="mt-6 rounded-2xl border border-violet-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">参加コードで選択授業に参加</h2>
          <p className="mt-1 text-sm text-slate-600">
            先生から伝えられた参加コードを入力してください。
          </p>
          <JoinElectiveForm />
        </section>
      ) : (
        <section className="mt-6 rounded-2xl border border-violet-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">新しい選択授業</h2>
          <p className="mt-1 text-sm text-slate-600">
            授業を作成すると、生徒向けの参加コードが自動発行されます。
          </p>
          <CreateElectiveForm />
        </section>
      )}
      {canAddMember && schoolClass ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">メンバー追加</h2>
          <p className="mt-1 text-sm text-slate-600">
            ユーザー名を指定して、このクラスへ追加します。
          </p>
          <AddMemberForm />
        </section>
      ) : null}
      {electives.map((elective) => (
        <section
          className="mt-6 overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-sm"
          key={elective.id}
        >
          <div className="border-b border-violet-100 p-5">
            <p className="text-sm font-bold text-violet-700">選択授業</p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">{elective.name}</h2>
              {elective.ownerId === user.id && elective.joinCode ? (
                <span className="rounded-lg bg-violet-50 px-3 py-2 font-mono font-bold text-violet-800">
                  参加コード: {elective.joinCode}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              担当: {elective.owner?.name ?? "未設定"}
            </p>
            {elective.ownerId === user.id ? (
              <AddElectiveStudentForm classId={elective.id} />
            ) : null}
          </div>
          <ul className="divide-y divide-slate-100">
            {elective.memberships.map(({ user: member }) => (
              <li
                className="flex items-center justify-between gap-4 p-4"
                key={member.id}
              >
                <div>
                  <p className="font-bold">{member.name}</p>
                  <p className="text-sm text-slate-500">{member.username}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">
                  {roleLabels[member.role]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {schoolClass ? (
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <h2 className="border-b border-slate-200 p-5 text-lg font-bold">
            ホームルームのメンバー
          </h2>
          <ul className="divide-y divide-slate-100">
            {schoolClass.users.map((member) => (
              <li
                className="flex items-center justify-between gap-4 p-5"
                key={member.id}
              >
                <div>
                  <p className="font-bold">{member.name}</p>
                  <p className="text-sm text-slate-500">{member.username}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">
                  {roleLabels[member.role]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
