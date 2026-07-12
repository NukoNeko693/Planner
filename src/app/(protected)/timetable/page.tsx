import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { userPath } from "@/lib/user-path";
import {
  findTimetable,
  listHomeroomClasses,
} from "@/server/repositories/timetable-repository";
import { findActiveUserContext } from "@/server/repositories/user-repository";
import { TimetableForm } from "./timetable-form";

export default async function TimetablePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await findActiveUserContext(session.user.id);
  if (!user) redirect("/login");
  const classes = user.role === "ADMIN" ? await listHomeroomClasses() : [];
  const requestedClassId = (await searchParams).classId;
  const selectedClassId =
    user.role === "ADMIN"
      ? classes.some((item) => item.id === requestedClassId)
        ? requestedClassId!
        : classes[0]?.id
      : (user.classId ?? undefined);
  const selectedClass =
    user.role === "ADMIN"
      ? classes.find((item) => item.id === selectedClassId)
      : user.schoolClass && selectedClassId
        ? { id: selectedClassId, name: user.schoolClass.name }
        : null;
  const entries = selectedClassId ? await findTimetable(selectedClassId) : [];
  const editable = Boolean(
    selectedClassId &&
    (user.role === "ADMIN" ||
      (user.role === "TEACHER" && user.classId === selectedClassId)),
  );
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <Link
        className="text-sm font-semibold text-blue-700 hover:underline"
        href={userPath(session.user.username, "dashboard")}
      >
        ← ダッシュボード
      </Link>
      <h1 className="mt-3 text-3xl font-bold">ホームルーム時間割</h1>
      <p className="mt-2 text-slate-600">
        ホームルームの生徒と教師に共有されます。
      </p>
      {user.role === "ADMIN" && classes.length ? (
        <form className="mt-5">
          <label className="mr-3 font-semibold" htmlFor="classId">
            対象クラス
          </label>
          <select
            className="rounded-xl border border-slate-300 px-4 py-3"
            defaultValue={selectedClassId}
            id="classId"
            name="classId"
          >
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <button
            className="ml-2 rounded-xl border px-4 py-3 font-bold"
            type="submit"
          >
            表示
          </button>
        </form>
      ) : null}
      {selectedClass ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold">{selectedClass.name}</h2>
            <span className="text-sm text-slate-500">
              {editable ? "編集できます" : "閲覧のみ"}
            </span>
          </div>
          <TimetableForm
            classId={selectedClass.id}
            editable={editable}
            entries={entries}
          />
        </section>
      ) : (
        <p className="mt-6 rounded-xl bg-amber-50 p-4 text-amber-800">
          ホームルームクラスに所属していません。
        </p>
      )}
    </main>
  );
}
