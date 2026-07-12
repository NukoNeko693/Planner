"use client";

import { useActionState } from "react";
import { addGradeTeamTeacher, type AdminClassState } from "./actions";

export function GradeTeamForm({
  schoolDivision,
  grade,
}: {
  schoolDivision: "MIDDLE" | "HIGH";
  grade: number;
}) {
  const [state, action, pending] = useActionState(
    addGradeTeamTeacher,
    {} as AdminClassState,
  );
  return (
    <form action={action} className="mt-3 flex flex-wrap gap-2">
      <input name="schoolDivision" type="hidden" value={schoolDivision} />
      <input name="grade" type="hidden" value={grade} />
      <input
        aria-label="教師のユーザー名"
        className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        name="username"
        placeholder="教師のユーザー名"
        required
      />
      <button
        className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "追加中…" : "教師を追加"}
      </button>
      {state.error ? (
        <p className="w-full text-xs text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="w-full text-xs text-emerald-700" role="status">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
