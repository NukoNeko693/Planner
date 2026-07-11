"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { addUserToClass } from "@/server/repositories/class-repository";
import { findActiveUserContext } from "@/server/repositories/user-repository";

export type AddMemberState = { error?: string; success?: string };

export async function addMember(
  _: AddMemberState,
  formData: FormData,
): Promise<AddMemberState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "ログインが必要です。" };
  const actor = await findActiveUserContext(session.user.id);
  if (!actor?.classId || (actor.role !== "TEACHER" && actor.role !== "ADMIN")) {
    return { error: "メンバーを追加できるのは教師または管理者だけです。" };
  }
  const parsed = z
    .string()
    .trim()
    .min(1)
    .max(50)
    .safeParse(formData.get("username"));
  if (!parsed.success) return { error: "ユーザー名を入力してください。" };
  const result = await addUserToClass({
    username: parsed.data,
    classId: actor.classId,
    actorId: actor.id,
  });
  if (result === "NOT_FOUND")
    return { error: "指定されたユーザーが見つかりません。" };
  revalidatePath("/class");
  return { success: "クラスにメンバーを追加しました。" };
}
