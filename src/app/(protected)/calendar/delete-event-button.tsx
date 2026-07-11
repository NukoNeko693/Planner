"use client";

import { deleteClassEventAction } from "./actions";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  return (
    <form action={deleteClassEventAction} className="mt-1">
      <input name="eventId" type="hidden" value={eventId} />
      <button
        className="rounded px-1 text-[11px] font-bold text-red-700 hover:bg-red-100"
        onClick={(event) => {
          if (!window.confirm("このクラス予定を削除しますか？")) {
            event.preventDefault();
          }
        }}
        type="submit"
      >
        削除
      </button>
    </form>
  );
}
