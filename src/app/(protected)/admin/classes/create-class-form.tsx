"use client";

import { useActionState } from "react";
import { createClass, type AdminClassState } from "./actions";

const initialState: AdminClassState = {};

export function CreateClassForm() {
  const [state, action, pending] = useActionState(createClass, initialState);
  return (
    <form
      action={action}
      className="mt-4 grid gap-3 sm:grid-cols-[10rem_8rem_1fr_auto]"
    >
      <select
        aria-label="学校区分"
        className="rounded-xl border border-slate-300 px-4 py-3"
        name="schoolDivision"
        required
      >
        <option value="MIDDLE">中学</option>
        <option value="HIGH">高校</option>
      </select>
      <select
        aria-label="学年"
        className="rounded-xl border border-slate-300 px-4 py-3"
        name="grade"
        required
      >
        <option value="1">1年</option>
        <option value="2">2年</option>
        <option value="3">3年</option>
      </select>
      <input
        aria-label="組"
        className="rounded-xl border border-slate-300 px-4 py-3"
        maxLength={100}
        name="classLabel"
        placeholder="例: A または 1"
        required
      />
      <button
        className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "作成中…" : "クラスを作成"}
      </button>
      {state.error ? (
        <p
          className="text-sm font-medium text-red-700 sm:col-span-4"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p
          className="text-sm font-medium text-emerald-700 sm:col-span-4"
          role="status"
        >
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
