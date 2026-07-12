"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import {
  addStudentToElective,
  addUserToClass,
  createElectiveClass,
  joinElectiveByCode,
} from "@/server/repositories/class-repository";
import { findActiveUserContext } from "@/server/repositories/user-repository";

export type AddMemberState = { error?: string; success?: string };
export type ClassActionState = AddMemberState;

async function currentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return findActiveUserContext(session.user.id);
}

export async function createElective(
  _: ClassActionState,
  formData: FormData,
): Promise<ClassActionState> {
  const actor = await currentUser();
  if (!actor || (actor.role !== "TEACHER" && actor.role !== "ADMIN"))
    return { error: "選択授業を作成できるのは教師または管理者だけです。" };
  const parsed = z
    .string()
    .trim()
    .min(1)
    .max(80)
    .safeParse(formData.get("name"));
  if (!parsed.success)
    return { error: "授業名を1〜80文字で入力してください。" };
  const elective = await createElectiveClass({
    name: parsed.data,
    teacherId: actor.id,
  });
  revalidatePath("/class");
  return {
    success: `「${elective.name}」を作成しました。参加コード: ${elective.joinCode}`,
  };
}

export async function joinElective(
  _: ClassActionState,
  formData: FormData,
): Promise<ClassActionState> {
  const actor = await currentUser();
  if (!actor || actor.role !== "STUDENT")
    return { error: "参加コードで参加できるのは生徒だけです。" };
  const rawJoinCode = formData.get("joinCode");
  const normalizedJoinCode =
    typeof rawJoinCode === "string"
      ? rawJoinCode.normalize("NFKC").replace(/[\s-]/g, "").toUpperCase()
      : "";
  const parsed = z
    .string()
    .regex(/^[A-F0-9]{8}$/)
    .safeParse(normalizedJoinCode);
  if (!parsed.success)
    return { error: "8文字の参加コードを入力してください。" };
  const result = await joinElectiveByCode({
    joinCode: parsed.data,
    userId: actor.id,
  });
  if (result === "NOT_FOUND")
    return { error: "参加コードが正しくありません。" };
  revalidatePath("/class");
  return { success: "選択授業に参加しました。" };
}

export async function addElectiveStudent(
  _: ClassActionState,
  formData: FormData,
): Promise<ClassActionState> {
  const actor = await currentUser();
  if (!actor || (actor.role !== "TEACHER" && actor.role !== "ADMIN"))
    return { error: "生徒を追加できるのは教師または管理者だけです。" };
  const parsed = z
    .object({
      classId: z.string().cuid(),
      username: z.string().trim().min(1).max(50),
    })
    .safeParse({
      classId: formData.get("classId"),
      username: formData.get("username"),
    });
  if (!parsed.success)
    return { error: "追加する生徒のユーザー名を入力してください。" };
  const result = await addStudentToElective({
    ...parsed.data,
    teacherId: actor.id,
  });
  if (result === "FORBIDDEN")
    return { error: "この授業へ生徒を追加する権限がありません。" };
  if (result === "NOT_FOUND")
    return { error: "指定された生徒が見つかりません。" };
  revalidatePath("/class");
  return { success: "選択授業に生徒を追加しました。" };
}

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
