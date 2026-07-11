"use client";

import { deleteSchoolEventAction, updateSchoolEventAction } from "./actions";

export function SchoolEventControls({
  event,
}: {
  event: { id: string; title: string; date: string };
}) {
  return (
    <details className="mt-1">
      <summary className="cursor-pointer text-[11px] font-bold text-emerald-800">
        管理
      </summary>
      <form
        action={updateSchoolEventAction}
        className="mt-2 space-y-2 rounded bg-white/80 p-2"
      >
        <input name="eventId" type="hidden" value={event.id} />
        <input
          aria-label="タイトル"
          className="w-full rounded border px-2 py-1 text-xs"
          defaultValue={event.title}
          maxLength={100}
          name="title"
          required
        />
        <input
          aria-label="日付"
          className="w-full rounded border px-2 py-1 text-xs"
          defaultValue={event.date}
          name="date"
          required
          type="date"
        />
        <button
          className="rounded bg-emerald-700 px-2 py-1 text-xs font-bold text-white"
          type="submit"
        >
          更新
        </button>
      </form>
      <form action={deleteSchoolEventAction} className="mt-1">
        <input name="eventId" type="hidden" value={event.id} />
        <button
          className="rounded px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-100"
          onClick={(clickEvent) => {
            if (!window.confirm("この学校全体予定を削除しますか？"))
              clickEvent.preventDefault();
          }}
          type="submit"
        >
          削除
        </button>
      </form>
    </details>
  );
}
