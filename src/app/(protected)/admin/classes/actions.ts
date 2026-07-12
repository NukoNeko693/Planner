"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import {
  addTeacherToGradeTeam,
  createSchoolClass,
  moveUserToHomeroom,
} from "@/server/repositories/admin-class-repository";
import { findActiveUserContext } from "@/server/repositories/user-repository";

export type AdminClassState = { error?: string; success?: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await findActiveUserContext(session.user.id);
  return user?.role === "ADMIN" ? user : null;
}

export async function createClass(
  _: AdminClassState,
  formData: FormData,
): Promise<AdminClassState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "管理者権限が必要です。" };
  const parsed = z
    .object({
      schoolDivision: z.enum(["MIDDLE", "HIGH"]),
      grade: z.coerce.number().int().min(1).max(3),
      classLabel: z
        .string()
        .trim()
        .regex(/^[A-Za-zＡ-Ｚａ-ｚ0-9０-９一-龯ぁ-んァ-ヶ]{1,10}$/),
    })
    .safeParse({
      schoolDivision: formData.get("schoolDivision"),
      grade: formData.get("grade"),
      classLabel: formData.get("classLabel"),
    });
  if (!parsed.success)
    return { error: "中学・高校、1〜3年、組を正しく入力してください。" };
  const result = await createSchoolClass({ ...parsed.data, actorId: admin.id });
  if (result === "DUPLICATE")
    return { error: "同じホームルームクラスが既に存在します。" };
  revalidatePath("/admin/classes");
  return { success: "ホームルームクラスを作成しました。" };
}

export async function addGradeTeamTeacher(
  _: AdminClassState,
  formData: FormData,
): Promise<AdminClassState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "管理者権限が必要です。" };
  const parsed = z
    .object({
      schoolDivision: z.enum(["MIDDLE", "HIGH"]),
      grade: z.coerce.number().int().min(1).max(3),
      username: z.string().trim().min(1).max(50),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: "追加する教師と学年団を指定してください。" };
  const result = await addTeacherToGradeTeam({
    ...parsed.data,
    actorId: admin.id,
  });
  if (result === "NOT_FOUND")
    return { error: "指定された教師が見つかりません。" };
  if (result === "HOMEROOM_TEACHER")
    return { error: "その教師は担任として既に学年団に所属しています。" };
  revalidatePath("/admin/classes");
  return { success: "教師を学年団に追加しました。" };
}

export async function moveMember(
  _: AdminClassState,
  formData: FormData,
): Promise<AdminClassState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "管理者権限が必要です。" };
  const parsed = z
    .object({ userId: z.string().min(1), classId: z.string().min(1) })
    .safeParse({
      userId: formData.get("userId"),
      classId: formData.get("classId"),
    });
  if (!parsed.success) return { error: "移動先クラスを選択してください。" };
  const result = await moveUserToHomeroom({
    ...parsed.data,
    actorId: admin.id,
  });
  if (result === "NOT_FOUND")
    return { error: "学生・教師または移動先クラスが見つかりません。" };
  revalidatePath("/admin/classes");
  return { success: "所属クラスを変更しました。" };
}
