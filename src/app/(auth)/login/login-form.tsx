"use client";

import { useActionState } from "react";

import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initialState);

  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label
          className="mb-2 block text-sm font-semibold text-slate-700"
          htmlFor="username"
        >
          ユーザー名
        </label>
        <input
          autoComplete="username"
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
          id="username"
          name="username"
          required
        />
      </div>
      <div>
        <label
          className="mb-2 block text-sm font-semibold text-slate-700"
          htmlFor="password"
        >
          パスワード
        </label>
        <input
          autoComplete="current-password"
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
          id="password"
          name="password"
          required
          type="password"
        />
      </div>
      {state.error ? (
        <p
          aria-live="polite"
          className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <button
        className="w-full rounded-xl bg-blue-700 px-4 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "ログイン中…" : "ログイン"}
      </button>
    </form>
  );
}
