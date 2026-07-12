import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { userPath } from "@/lib/user-path";
import { findVisibleEvents } from "@/server/repositories/event-repository";
import { findActiveUserContext } from "@/server/repositories/user-repository";

import { EventForm } from "./event-form";
import { DeleteEventButton } from "./delete-event-button";
import { SchoolEventControls } from "./school-event-controls";

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

function parseMonth(value?: string): Date {
  if (value && /^\d{4}-\d{2}$/.test(value)) {
    const date = new Date(`${value}-01T00:00:00`);
    if (!Number.isNaN(date.getTime())) return date;
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await findActiveUserContext(session.user.id);
  if (!user) redirect("/login");

  const { month: monthParam } = await searchParams;
  const month = parseMonth(monthParam);
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const previous = new Date(month.getFullYear(), month.getMonth() - 1, 1);
  const next = new Date(month.getFullYear(), month.getMonth() + 1, 1);
  const cells = Array.from(
    { length: first.getDay() + last.getDate() },
    (_, index) => index - first.getDay() + 1,
  );
  while (cells.length % 7) cells.push(last.getDate() + 1);

  const availableClasses = [
    ...(user.classId && user.schoolClass
      ? [
          {
            id: user.classId,
            name: user.schoolClass.name,
            type: "HOMEROOM" as const,
          },
        ]
      : []),
    ...user.electiveMemberships.map((membership) => ({
      id: membership.schoolClass.id,
      name: membership.schoolClass.name,
      type: "ELECTIVE" as const,
    })),
  ];
  const ownGrade =
    user.schoolClass?.schoolDivision && user.schoolClass.grade
      ? [
          {
            schoolDivision: user.schoolClass.schoolDivision,
            grade: user.schoolClass.grade,
          },
        ]
      : [];
  const visibleGrades =
    user.role === "ADMIN"
      ? (["MIDDLE", "HIGH"] as const).flatMap((schoolDivision) =>
          [1, 2, 3].map((grade) => ({ schoolDivision, grade })),
        )
      : [...ownGrade, ...user.gradeTeamMemberships].filter(
          (item, index, all) =>
            all.findIndex(
              (candidate) =>
                candidate.schoolDivision === item.schoolDivision &&
                candidate.grade === item.grade,
            ) === index,
        );
  const writableGrades =
    user.role === "ADMIN"
      ? visibleGrades
      : user.role === "TEACHER"
        ? visibleGrades
        : [];
  const events = await findVisibleEvents(
    session.user.id,
    availableClasses.map((item) => item.id),
    visibleGrades,
    dateKey(first),
    dateKey(last),
  );
  const monthValue = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            className="text-sm font-semibold text-blue-700 hover:underline"
            href={userPath(session.user.username, "dashboard")}
          >
            ← ダッシュボード
          </Link>
          <h1 className="mt-2 text-3xl font-bold">カレンダー</h1>
          <p className="mt-1 text-slate-600">
            個人予定と{user.schoolClass?.name ?? "未所属"}
            のクラス予定を確認できます。
          </p>
        </div>
        <EventForm
          defaultDate={dateKey(new Date())}
          isAdmin={user.role === "ADMIN"}
          classes={availableClasses}
          grades={writableGrades}
        />
      </header>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <Link
            aria-label="前の月"
            className="rounded-lg border px-4 py-2 hover:bg-slate-50"
            href={`${userPath(session.user.username, "calendar")}?month=${monthValue(previous)}`}
          >
            ‹
          </Link>
          <h2 className="text-xl font-bold">
            {month.getFullYear()}年 {month.getMonth() + 1}月
          </h2>
          <Link
            aria-label="次の月"
            className="rounded-lg border px-4 py-2 hover:bg-slate-50"
            href={`${userPath(session.user.username, "calendar")}?month=${monthValue(next)}`}
          >
            ›
          </Link>
        </div>
        <div className="grid grid-cols-7 bg-slate-50 text-center text-sm font-bold">
          {weekdays.map((day, index) => (
            <div
              className={`p-3 ${index === 0 ? "text-red-600" : index === 6 ? "text-blue-600" : ""}`}
              key={day}
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, index) => {
            const inMonth = day >= 1 && day <= last.getDate();
            const key = inMonth
              ? dateKey(new Date(month.getFullYear(), month.getMonth(), day))
              : "";
            const dayEvents = events.filter((event) => event.date === key);
            return (
              <div
                className={`min-h-28 border-t border-r border-slate-100 p-2 ${inMonth ? "bg-white" : "bg-slate-50"}`}
                key={index}
              >
                {inMonth ? (
                  <span className="text-sm font-semibold">{day}</span>
                ) : null}
                <div className="mt-1 space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${event.scope === "PERSONAL" ? "bg-violet-100 text-violet-900" : event.scope === "SCHOOL" ? "bg-emerald-100 text-emerald-900" : "bg-blue-100 text-blue-900"}`}
                      key={event.id}
                      title={`${event.creatorName}が作成`}
                    >
                      <span aria-hidden="true">
                        {event.scope === "PERSONAL"
                          ? "👤"
                          : event.scope === "SCHOOL"
                            ? "🌐"
                            : event.scope === "GRADE"
                              ? "🎓"
                              : "🏫"}
                      </span>{" "}
                      {event.scope === "PERSONAL"
                        ? "個人"
                        : event.scope === "SCHOOL"
                          ? "学校全体"
                          : event.scope === "GRADE"
                            ? `${event.schoolDivision === "MIDDLE" ? "中学" : "高校"}${event.grade}年`
                            : (event.className ?? "クラス")}
                      ・{event.title}
                      {event.scope === "CLASS" &&
                      user.role === "TEACHER" &&
                      event.classId ? (
                        <DeleteEventButton
                          eventId={event.id}
                          classId={event.classId}
                        />
                      ) : null}
                      {event.scope === "SCHOOL" && user.role === "ADMIN" ? (
                        <SchoolEventControls event={event} />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <p className="mt-4 text-sm text-slate-500">
        個人予定は本人のみ、クラス予定は同じクラス、学年予定は同じ学年、学校全体予定はすべてのログインユーザーに表示されます。
      </p>
    </main>
  );
}
