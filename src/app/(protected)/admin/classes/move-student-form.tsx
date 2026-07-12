"use client";

import { useActionState } from "react";
import { moveMember, type AdminClassState } from "./actions";

const initialState: AdminClassState = {};

export function MoveStudentForm({
  userId,
  currentClassId,
  classes,
}: {
  userId: string;
  currentClassId: string | null;
  classes: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(moveMember, initialState);
  return (
    <form
      action={action}
      className="flex flex-wrap items-center justify-end gap-2"
    >
      <input name="userId" type="hidden" value={userId} />
      <select
        aria-label="移動先クラス"
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        defaultValue={currentClassId ?? ""}
        name="classId"
        required
      >
        <option disabled value="">
          クラスを選択
        </option>
        {classes.map((schoolClass) => (
          <option key={schoolClass.id} value={schoolClass.id}>
            {schoolClass.name}
          </option>
        ))}
      </select>
      <button
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold hover:bg-slate-50 disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "変更中…" : "移動"}
      </button>
      {state.error ? (
        <p className="w-full text-right text-xs text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="w-full text-right text-xs text-emerald-700" role="status">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
