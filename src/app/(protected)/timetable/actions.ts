"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { TIMETABLE_DAYS } from "@/features/timetable/config";
import { prisma } from "@/lib/prisma";
import { saveTimetable } from "@/server/repositories/timetable-repository";
import { findActiveUserContext } from "@/server/repositories/user-repository";

export type TimetableState = { error?: string; success?: string };

export async function updateTimetable(
  _: TimetableState,
  formData: FormData,
): Promise<TimetableState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "ログインが必要です。" };
  const actor = await findActiveUserContext(session.user.id);
  const classId = formData.get("classId");
  if (!actor || typeof classId !== "string")
    return { error: "対象クラスを確認できません。" };
  const target = await prisma.schoolClass.findFirst({
    where: { id: classId, type: "HOMEROOM" },
    select: { id: true },
  });
  if (!target) return { error: "ホームルームクラスが見つかりません。" };
  if (
    actor.role !== "ADMIN" &&
    (actor.role !== "TEACHER" || actor.classId !== classId)
  ) {
    return {
      error:
        "時間割を編集できるのは、このホームルームの教師または管理者だけです。",
    };
  }
  const entries = [];
  for (const day of TIMETABLE_DAYS)
    for (let period = 1; period <= day.periods; period++) {
      const parsed = z
        .string()
        .trim()
        .max(30)
        .safeParse(formData.get(`subject-${day.weekday}-${period}`));
      const teacherName = z
        .string()
        .trim()
        .max(50)
        .safeParse(formData.get(`teacher-${day.weekday}-${period}`));
      if (!parsed.success || !teacherName.success)
        return {
          error: "教科名は30文字、担当教師名は50文字以内で入力してください。",
        };
      entries.push({
        weekday: day.weekday,
        period,
        subject: parsed.data,
        teacherName: teacherName.data,
      });
    }
  await saveTimetable({ classId, actorId: actor.id, entries });
  revalidatePath("/timetable");
  return { success: "時間割を保存しました。" };
}
