"use client";

import { useActionState } from "react";

import { addMember, type AddMemberState } from "./actions";

const initialState: AddMemberState = {};

export function AddMemberForm() {
  const [state, action, pending] = useActionState(addMember, initialState);
  return (
    <form action={action} className="mt-4 flex flex-wrap gap-3">
      <label className="min-w-56 flex-1">
        <span className="sr-only">追加するユーザー名</span>
        <input
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
          name="username"
          placeholder="ユーザー名"
          required
        />
      </label>
      <button
        className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "追加中…" : "メンバーを追加"}
      </button>
      {state.error ? (
        <p className="w-full text-sm font-medium text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p
          className="w-full text-sm font-medium text-emerald-700"
          role="status"
        >
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
