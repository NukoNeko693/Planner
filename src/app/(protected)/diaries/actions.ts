"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { diaryReplySchema } from "@/features/weekly-plan/validation";
import { findActiveUserContext } from "@/server/repositories/user-repository";
import { replyToDiary } from "@/server/repositories/weekly-plan-repository";

export async function replyToDiaryAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;
  const teacher = await findActiveUserContext(session.user.id);
  if (!teacher || teacher.role !== "TEACHER" || !teacher.classId) return;
  const parsed = diaryReplySchema.safeParse({
    diaryId: formData.get("diaryId"),
    reply: formData.get("reply"),
  });
  if (!parsed.success) return;
  await replyToDiary({ classId: teacher.classId, ...parsed.data });
  revalidatePath("/diaries");
  revalidatePath("/weekly");
}
