"use client";

import { useActionState } from "react";
import {
  MAX_TIMETABLE_PERIODS,
  TIMETABLE_DAYS,
} from "@/features/timetable/config";
import { updateTimetable, type TimetableState } from "./actions";

export function TimetableForm({
  classId,
  editable,
  entries,
}: {
  classId: string;
  editable: boolean;
  entries: {
    weekday: number;
    period: number;
    subject: string;
    teacherName: string;
  }[];
}) {
  const [state, action, pending] = useActionState(
    updateTimetable,
    {} as TimetableState,
  );
  const subject = (weekday: number, period: number) =>
    entries.find((item) => item.weekday === weekday && item.period === period)
      ?.subject ?? "";
  const teacherName = (weekday: number, period: number) =>
    entries.find((item) => item.weekday === weekday && item.period === period)
      ?.teacherName ?? "";
  return (
    <form action={action} className="mt-5 overflow-x-auto">
      <input name="classId" type="hidden" value={classId} />
      <table className="w-full min-w-2xl border-collapse text-center">
        <thead>
          <tr>
            <th className="border bg-slate-50 p-3">時限</th>
            {TIMETABLE_DAYS.map((day) => (
              <th className="border bg-slate-50 p-3" key={day.weekday}>
                {day.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from(
            { length: MAX_TIMETABLE_PERIODS },
            (_, index) => index + 1,
          ).map((period) => (
            <tr key={period}>
              <th className="border bg-slate-50 p-3">{period}限</th>
              {TIMETABLE_DAYS.map((day) => (
                <td
                  className={
                    period > day.periods ? "border-0 p-2" : "border p-2"
                  }
                  key={day.weekday}
                >
                  {period > day.periods ? null : editable ? (
                    <div className="min-w-28 space-y-2">
                      <input
                        aria-label={`${day.label}曜日${period}限の教科名`}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        defaultValue={subject(day.weekday, period)}
                        maxLength={30}
                        name={`subject-${day.weekday}-${period}`}
                        placeholder="教科名"
                      />
                      <input
                        aria-label={`${day.label}曜日${period}限の担当教師名`}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        defaultValue={teacherName(day.weekday, period)}
                        maxLength={50}
                        name={`teacher-${day.weekday}-${period}`}
                        placeholder="担当教師"
                      />
                    </div>
                  ) : (
                    <div className="min-h-12">
                      <p className="font-semibold">
                        {subject(day.weekday, period) || "―"}
                      </p>
                      {teacherName(day.weekday, period) ? (
                        <p className="mt-1 text-xs text-slate-500">
                          {teacherName(day.weekday, period)}
                        </p>
                      ) : null}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {state.error ? (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="mt-3 text-sm text-emerald-700" role="status">
          {state.success}
        </p>
      ) : null}
      {editable ? (
        <button
          className="mt-4 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "保存中…" : "時間割を保存"}
        </button>
      ) : null}
    </form>
  );
}
