import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().trim().min(1, "タイトルを入力してください。"),
  date: z.iso.date("正しい日付を入力してください。"),
  scope: z.enum(["PERSONAL", "CLASS", "SCHOOL"]),
});
