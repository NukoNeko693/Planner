"use client";

import { useActionState } from "react";

import {
  addElectiveStudent,
  createElective,
  joinElective,
  type ClassActionState,
} from "./actions";

const initialState: ClassActionState = {};

function Message({ state }: { state: ClassActionState }) {
  if (state.error)
    return (
      <p className="mt-2 text-sm font-medium text-red-700" role="alert">
        {state.error}
      </p>
    );
  if (state.success)
    return (
      <p className="mt-2 text-sm font-medium text-emerald-700" role="status">
        {state.success}
      </p>
    );
  return null;
}

export function CreateElectiveForm() {
  const [state, action, pending] = useActionState(createElective, initialState);
  return (
    <form action={action} className="mt-4">
      <div className="flex flex-wrap gap-3">
        <input
          className="min-w-56 flex-1 rounded-xl border border-slate-300 px-4 py-3"
          name="name"
          placeholder="例：情報デザイン"
          required
          maxLength={80}
        />
        <button
          className="rounded-xl bg-violet-700 px-5 py-3 font-bold text-white disabled:opacity-60"
          disabled={pending}
        >
          {pending ? "作成中…" : "選択授業を作成"}
        </button>
      </div>
      <Message state={state} />
    </form>
  );
}

export function JoinElectiveForm() {
  const [state, action, pending] = useActionState(joinElective, initialState);
  return (
    <form action={action} className="mt-4">
      <div className="flex flex-wrap gap-3">
        <input
          className="min-w-56 flex-1 rounded-xl border border-slate-300 px-4 py-3 font-mono uppercase"
          name="joinCode"
          placeholder="8文字の参加コード"
          required
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          className="rounded-xl bg-violet-700 px-5 py-3 font-bold text-white disabled:opacity-60"
          disabled={pending}
        >
          {pending ? "参加中…" : "授業に参加"}
        </button>
      </div>
      <Message state={state} />
    </form>
  );
}

export function AddElectiveStudentForm({ classId }: { classId: string }) {
  const [state, action, pending] = useActionState(
    addElectiveStudent,
    initialState,
  );
  return (
    <form action={action} className="mt-3">
      <input type="hidden" name="classId" value={classId} />
      <div className="flex flex-wrap gap-2">
        <input
          className="min-w-48 flex-1 rounded-lg border border-slate-300 px-3 py-2"
          name="username"
          placeholder="生徒のユーザー名"
          required
        />
        <button
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          disabled={pending}
        >
          {pending ? "追加中…" : "生徒を追加"}
        </button>
      </div>
      <Message state={state} />
    </form>
  );
}
