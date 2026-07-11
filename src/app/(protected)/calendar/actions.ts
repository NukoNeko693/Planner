"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { createEventSchema } from "@/features/calendar/validation";
import { createEvent as persistEvent } from "@/server/repositories/event-repository";

export type CreateEventState = { error?: string; success?: string };

export async function createEvent(
  _: CreateEventState,
  formData: FormData,
): Promise<CreateEventState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "ログインが必要です。" };

  const parsed = createEventSchema.safeParse({
    title: formData.get("title"),
    date: formData.get("date"),
    scope: formData.get("scope"),
  });
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
    };

  await persistEvent({
    ...parsed.data,
    creatorId: session.user.id,
  });
  revalidatePath("/calendar");
  return { success: "予定を追加しました。" };
}
