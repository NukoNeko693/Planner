import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { findWeeklyPlan } from "@/server/repositories/weekly-plan-repository";
import {
  addPlanItem,
  deletePlanItemAction,
  saveWeeklyNoteAction,
  togglePlanItemAction,
} from "./actions";

const dayNames = ["月", "火", "水", "木", "金", "土", "日"];
const key = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
function monday(value?: string) {
  const base =
    value && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00`)
      : new Date();
  if (Number.isNaN(base.getTime())) return monday();
  base.setDate(base.getDate() - ((base.getDay() + 6) % 7));
  return base;
}

export default async function WeeklyPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const start = monday((await searchParams).week);
  const days = Array.from(
    { length: 7 },
    (_, i) =>
      new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  );
  const [items, note] = await findWeeklyPlan(
    session.user.id,
    key(days[0]),
    key(days[6]),
  );
  const move = (amount: number) =>
    key(
      new Date(start.getFullYear(), start.getMonth(), start.getDate() + amount),
    );

  return (
    <main className="mx-auto min-h-screen max-w-[1500px] px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            className="text-sm font-semibold text-blue-700 hover:underline"
            href="/dashboard"
          >
            ← ダッシュボード
          </Link>
          <h1 className="mt-2 text-3xl font-bold">1週間の計画表</h1>
          <p className="mt-1 text-slate-600">
            あなただけに表示される個人用プランナーです。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            className="rounded-lg border bg-white px-4 py-2"
            href={`/weekly?week=${move(-7)}`}
          >
            ‹ 前週
          </Link>
          <span className="px-2 font-bold">
            {start.getFullYear()}年 {start.getMonth() + 1}月
          </span>
          <Link
            className="rounded-lg border bg-white px-4 py-2"
            href={`/weekly?week=${move(7)}`}
          >
            次週 ›
          </Link>
        </div>
      </header>

      <form
        action={saveWeeklyNoteAction}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <input name="weekStart" type="hidden" value={key(start)} />
        <label className="text-sm font-bold text-violet-800">今週の目標</label>
        <div className="mt-2 flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2"
            defaultValue={note?.goal ?? ""}
            maxLength={300}
            name="goal"
            placeholder="今週達成したいこと"
          />
          <button className="rounded-lg bg-violet-700 px-4 py-2 font-bold text-white">
            保存
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm font-bold">
            メモ
            <textarea
              className="mt-1 block min-h-20 w-full rounded-lg border border-slate-300 p-3 font-normal"
              defaultValue={note?.memo ?? ""}
              name="memo"
              placeholder="忘れたくないこと"
            />
          </label>
          <label className="text-sm font-bold">
            1週間の振り返り
            <textarea
              className="mt-1 block min-h-20 w-full rounded-lg border border-slate-300 p-3 font-normal"
              defaultValue={note?.reflection ?? ""}
              name="reflection"
              placeholder="できたこと・次週に活かすこと"
            />
          </label>
        </div>
      </form>

      <section className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid min-w-[1120px] grid-cols-7">
          {days.map((day, index) => {
            const date = key(day);
            const dayItems = items.filter(
              (item) => item.planDate.toISOString().slice(0, 10) === date,
            );
            return (
              <article
                className="min-h-[620px] border-r border-slate-200 last:border-r-0"
                key={date}
              >
                <div
                  className={`border-b p-3 text-center ${index === 5 ? "bg-blue-50 text-blue-700" : index === 6 ? "bg-red-50 text-red-700" : "bg-slate-50"}`}
                >
                  <span className="text-lg font-bold">{day.getDate()}</span>{" "}
                  <span className="text-sm">{dayNames[index]}曜日</span>
                </div>
                <div className="space-y-2 p-2">
                  {dayItems.map((item) => (
                    <div
                      className={`rounded-lg border p-2 ${item.completed ? "bg-emerald-50 opacity-70" : "bg-violet-50"}`}
                      key={item.id}
                    >
                      <div className="text-xs font-bold text-slate-600">
                        {item.startTime}–{item.endTime}
                      </div>
                      <p
                        className={`mt-1 text-sm font-semibold break-words ${item.completed ? "line-through" : ""}`}
                      >
                        {item.title}
                      </p>
                      <div className="mt-2 flex gap-1">
                        <form action={togglePlanItemAction}>
                          <input name="id" type="hidden" value={item.id} />
                          <input
                            name="completed"
                            type="hidden"
                            value={String(item.completed)}
                          />
                          <button className="text-xs font-bold text-emerald-700">
                            {item.completed ? "戻す" : "完了"}
                          </button>
                        </form>
                        <form action={deletePlanItemAction}>
                          <input name="id" type="hidden" value={item.id} />
                          <button className="text-xs font-bold text-red-600">
                            削除
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                  <form
                    action={addPlanItem}
                    className="mt-3 space-y-2 border-t border-dashed border-slate-300 pt-3"
                  >
                    <input name="date" type="hidden" value={date} />
                    <input
                      className="w-full rounded-md border px-2 py-1.5 text-sm"
                      maxLength={80}
                      name="title"
                      placeholder="予定を追加"
                      required
                    />
                    <div className="flex items-center gap-1">
                      <input
                        className="w-full min-w-0 rounded-md border px-1 py-1 text-xs"
                        defaultValue="09:00"
                        name="startTime"
                        type="time"
                      />
                      <span>–</span>
                      <input
                        className="w-full min-w-0 rounded-md border px-1 py-1 text-xs"
                        defaultValue="10:00"
                        name="endTime"
                        type="time"
                      />
                    </div>
                    <button className="w-full rounded-md bg-slate-800 py-1.5 text-xs font-bold text-white">
                      ＋ 追加
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
