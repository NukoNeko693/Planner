import { z } from "zod";

const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "時刻を確認してください。");

export const planItemSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: time,
    endTime: time,
    title: z.string().trim().min(1, "予定を入力してください。").max(80),
  })
  .refine((value) => value.startTime < value.endTime, {
    message: "終了時刻は開始時刻より後にしてください。",
  });

export const weeklyNoteSchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  goal: z.string().trim().max(300),
  memo: z.string().trim().max(1000),
  reflection: z.string().trim().max(1000),
});
