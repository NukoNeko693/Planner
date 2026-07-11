"use client";

import { useActionState, useRef } from "react";

import { createEvent, type CreateEventState } from "./actions";

const initialState: CreateEventState = {};

export function EventForm({ defaultDate }: { defaultDate: string }) {
  const [state, action, pending] = useActionState(createEvent, initialState);
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
        onClick={() => dialogRef.current?.showModal()}
        type="button"
      >
        ＋ 予定を追加
      </button>
      <dialog
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-slate-950/40"
        ref={dialogRef}
      >
        <form action={action} className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-blue-700">新しい予定</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                予定を追加
              </h2>
            </div>
            <button
              aria-label="閉じる"
              className="rounded-lg px-3 py-2 text-xl hover:bg-slate-100"
              onClick={() => dialogRef.current?.close()}
              type="button"
            >
              ×
            </button>
          </div>
          <div className="mt-6 space-y-5">
            <div>
              <label
                className="mb-2 block text-sm font-semibold"
                htmlFor="event-title"
              >
                タイトル
              </label>
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                id="event-title"
                maxLength={100}
                name="title"
                required
              />
            </div>
            <div>
              <label
                className="mb-2 block text-sm font-semibold"
                htmlFor="event-date"
              >
                日付
              </label>
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                defaultValue={defaultDate}
                id="event-date"
                name="date"
                required
                type="date"
              />
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">公開範囲</legend>
              <div className="grid grid-cols-3 gap-2">
                <label className="cursor-pointer rounded-xl border border-slate-300 p-3 text-center has-checked:border-blue-700 has-checked:bg-blue-50">
                  <input
                    className="mr-1"
                    defaultChecked
                    name="scope"
                    type="radio"
                    value="PERSONAL"
                  />{" "}
                  個人
                </label>
                <label className="cursor-pointer rounded-xl border border-slate-300 p-3 text-center has-checked:border-blue-700 has-checked:bg-blue-50">
                  <input
                    className="mr-1"
                    name="scope"
                    type="radio"
                    value="CLASS"
                  />{" "}
                  クラス
                </label>
                <button
                  className="rounded-xl border border-slate-300 p-3 text-slate-500 hover:bg-slate-50"
                  onClick={() =>
                    window.alert("学年予定は現在対応していません。")
                  }
                  type="button"
                >
                  学年
                </button>
              </div>
            </fieldset>
          </div>
          {state.error ? (
            <p
              className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
              role="alert"
            >
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p
              className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"
              role="status"
            >
              {state.success}
            </p>
          ) : null}
          <button
            className="mt-6 w-full rounded-xl bg-blue-700 px-4 py-3 font-bold text-white disabled:opacity-60"
            disabled={pending}
            type="submit"
          >
            {pending ? "追加中…" : "予定を追加"}
          </button>
        </form>
      </dialog>
    </>
  );
}
