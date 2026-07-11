"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { createEventSchema } from "@/features/calendar/validation";
import {
  createEvent as persistEvent,
  deleteClassEvent,
  deleteSchoolEvent,
  updateSchoolEvent,
} from "@/server/repositories/event-repository";
import { findActiveUserContext } from "@/server/repositories/user-repository";

export type CreateEventState = { error?: string; success?: string };

export async function createEvent(
  _: CreateEventState,
  formData: FormData,
): Promise<CreateEventState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "ログインが必要です。" };
  const user = await findActiveUserContext(session.user.id);
  if (!user) {
    return {
      error:
        "セッション情報が古くなっています。一度ログアウトして、もう一度ログインしてください。",
    };
  }

  const parsed = createEventSchema.safeParse({
    title: formData.get("title"),
    date: formData.get("date"),
    scope: formData.get("scope"),
  });
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
    };

  if (parsed.data.scope === "CLASS" && !user.classId) {
    return {
      error: "所属クラスが設定されていないため、クラス予定を作成できません。",
    };
  }
  if (parsed.data.scope === "SCHOOL" && user.role !== "ADMIN") {
    return { error: "学校全体予定を作成できるのは管理者だけです。" };
  }
  await persistEvent({
    ...parsed.data,
    creatorId: session.user.id,
    classId: user.classId,
  });
  revalidatePath("/calendar");
  return { success: "予定を追加しました。" };
}

export async function deleteClassEventAction(
  formData: FormData,
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const user = await findActiveUserContext(session.user.id);
  const eventId = formData.get("eventId");
  if (
    !user?.classId ||
    user.role !== "TEACHER" ||
    typeof eventId !== "string" ||
    !eventId
  ) {
    return;
  }
  await deleteClassEvent({
    eventId,
    actorId: user.id,
    classId: user.classId,
  });
  revalidatePath("/calendar");
}

export async function updateSchoolEventAction(
  formData: FormData,
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const user = await findActiveUserContext(session.user.id);
  const eventId = formData.get("eventId");
  const parsed = createEventSchema.safeParse({
    title: formData.get("title"),
    date: formData.get("date"),
    scope: "SCHOOL",
  });
  if (user?.role !== "ADMIN" || typeof eventId !== "string" || !parsed.success)
    return;
  await updateSchoolEvent({
    eventId,
    title: parsed.data.title,
    date: parsed.data.date,
    actorId: user.id,
  });
  revalidatePath("/calendar");
}

export async function deleteSchoolEventAction(
  formData: FormData,
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const user = await findActiveUserContext(session.user.id);
  const eventId = formData.get("eventId");
  if (user?.role !== "ADMIN" || typeof eventId !== "string" || !eventId) return;
  await deleteSchoolEvent({ eventId, actorId: user.id });
  revalidatePath("/calendar");
}
