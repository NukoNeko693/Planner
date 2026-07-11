import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { findClassWithMembers } from "@/server/repositories/class-repository";
import { findActiveUserContext } from "@/server/repositories/user-repository";

import { AddMemberForm } from "./add-member-form";

const roleLabels = {
  STUDENT: "学生",
  TEACHER: "教師",
  ADMIN: "管理者",
} as const;

export default async function ClassPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await findActiveUserContext(session.user.id);
  if (!user?.classId) redirect("/dashboard");
  const schoolClass = await findClassWithMembers(user.classId);
  if (!schoolClass) redirect("/dashboard");
  const canAddMember = user.role === "TEACHER" || user.role === "ADMIN";

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <Link
        className="text-sm font-semibold text-blue-700 hover:underline"
        href="/dashboard"
      >
        ← ダッシュボード
      </Link>
      <h1 className="mt-3 text-3xl font-bold">{schoolClass.name}</h1>
      <p className="mt-2 text-slate-600">
        所属クラスのメンバーと権限を確認できます。
      </p>
      {canAddMember ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">メンバー追加</h2>
          <p className="mt-1 text-sm text-slate-600">
            ユーザー名を指定して、このクラスへ追加します。
          </p>
          <AddMemberForm />
        </section>
      ) : null}
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-200 p-5 text-lg font-bold">
          クラスメンバー
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
    </main>
  );
}
