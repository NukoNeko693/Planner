"use client";

import { useActionState, useState } from "react";
import { submitAnnouncement, type AnnouncementState } from "./actions";

export function AnnouncementForm({
  isStudent,
  classes,
  grades,
}: {
  isStudent: boolean;
  classes: { id: string; name: string }[];
  grades: { schoolDivision: "MIDDLE" | "HIGH"; grade: number }[];
}) {
  const [state, action, pending] = useActionState(
    submitAnnouncement,
    {} as AnnouncementState,
  );
  const [scope, setScope] = useState("HOMEROOM");
  return (
    <form action={action} className="mt-5 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-bold">
          タイトル
          <input
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal"
            maxLength={100}
            name="title"
            required
          />
        </label>
        <label className="text-sm font-bold">
          共有単位
          <select
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal"
            name="scope"
            onChange={(e) => setScope(e.target.value)}
            value={scope}
          >
            <option value="HOMEROOM">ホームルーム</option>
            <option value="GRADE">学年</option>
            <option value="SCHOOL">学校全体</option>
          </select>
        </label>
      </div>
      {scope === "HOMEROOM" ? (
        <label className="block text-sm font-bold">
          共有先クラス
          <select
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal"
            name="classId"
            required
            defaultValue={classes[0]?.id}
          >
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {scope === "GRADE" ? (
        <label className="block text-sm font-bold">
          共有先学年
          <select
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal"
            defaultValue=""
            onChange={(event) => {
              const [division, grade] = event.target.value.split(":");
              const form = event.currentTarget.form!;
              (
                form.elements.namedItem("schoolDivision") as HTMLInputElement
              ).value = division;
              (form.elements.namedItem("grade") as HTMLInputElement).value =
                grade;
            }}
            required
          >
            <option disabled value="">
              学年を選択
            </option>
            {grades.map((item) => (
              <option
                key={`${item.schoolDivision}-${item.grade}`}
                value={`${item.schoolDivision}:${item.grade}`}
              >
                {item.schoolDivision === "MIDDLE" ? "中学" : "高校"}
                {item.grade}年
              </option>
            ))}
          </select>
          <input name="schoolDivision" type="hidden" />
          <input name="grade" type="hidden" />
        </label>
      ) : null}
      <label className="block text-sm font-bold">
        本文
        <textarea
          className="mt-2 min-h-40 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal"
          maxLength={5000}
          name="body"
          required
        />
      </label>
      <label className="block text-sm font-bold">
        公開目的{" "}
        {isStudent ? (
          <span className="text-red-600">（承認申請に必須）</span>
        ) : (
          <span className="font-normal text-slate-500">（任意）</span>
        )}
        <textarea
          className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal"
          maxLength={1000}
          name="purpose"
          required={isStudent}
          placeholder="誰に、何のために伝えるお知らせかを記入してください。"
        />
      </label>
      <label className="block text-sm font-bold">
        添付資料
        <input
          accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
          className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 font-normal"
          multiple
          name="attachments"
          type="file"
        />
        <span className="mt-1 block font-normal text-slate-500">
          PDF・PNG・JPEG・WebP、5件まで、1件10MBまで
        </span>
      </label>
      {state.error ? (
        <p
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p
          className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"
          role="status"
        >
          {state.success}
        </p>
      ) : null}
      <button
        className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white disabled:opacity-60"
        disabled={
          pending ||
          (scope === "HOMEROOM" && !classes.length) ||
          (scope === "GRADE" && !grades.length)
        }
        type="submit"
      >
        {pending ? "送信中…" : isStudent ? "公開許可を申請" : "お知らせを公開"}
      </button>
    </form>
  );
}
