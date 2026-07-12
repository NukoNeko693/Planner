"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  createAnnouncement,
  reviewAnnouncement,
} from "@/server/repositories/announcement-repository";
import { findActiveUserContext } from "@/server/repositories/user-repository";

export type AnnouncementState = { error?: string; success?: string };
const allowedTypes = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

export async function submitAnnouncement(
  _: AnnouncementState,
  formData: FormData,
): Promise<AnnouncementState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "ログインが必要です。" };
  const actor = await findActiveUserContext(session.user.id);
  if (!actor) return { error: "ユーザーを確認できません。" };
  const parsed = z
    .object({
      title: z.string().trim().min(1).max(100),
      body: z.string().trim().min(1).max(5000),
      purpose: z.string().trim().max(1000),
      scope: z.enum(["HOMEROOM", "GRADE", "SCHOOL"]),
    })
    .safeParse({
      title: formData.get("title"),
      body: formData.get("body"),
      purpose: formData.get("purpose") ?? "",
      scope: formData.get("scope"),
    });
  if (!parsed.success)
    return { error: "タイトル、本文、共有範囲を正しく入力してください。" };
  if (actor.role === "STUDENT" && !parsed.data.purpose)
    return { error: "生徒の申請には公開目的が必要です。" };

  let classId: string | null = null;
  let schoolDivision: "MIDDLE" | "HIGH" | null = null;
  let grade: number | null = null;
  if (parsed.data.scope === "HOMEROOM") {
    const requested = String(formData.get("classId") ?? "");
    classId = actor.role === "ADMIN" ? requested : actor.classId;
    if (
      !classId ||
      !(await prisma.schoolClass.findFirst({
        where: { id: classId, type: "HOMEROOM" },
        select: { id: true },
      }))
    )
      return { error: "共有先のホームルームを選択してください。" };
  }
  if (parsed.data.scope === "GRADE") {
    const division = formData.get("schoolDivision");
    const requestedGrade = Number(formData.get("grade"));
    if (
      (division !== "MIDDLE" && division !== "HIGH") ||
      ![1, 2, 3].includes(requestedGrade)
    )
      return { error: "共有先の学年を選択してください。" };
    const permitted =
      actor.role === "ADMIN" ||
      (actor.schoolClass?.schoolDivision === division &&
        actor.schoolClass.grade === requestedGrade) ||
      actor.gradeTeamMemberships.some(
        (item) =>
          item.schoolDivision === division && item.grade === requestedGrade,
      );
    if (!permitted) return { error: "所属していない学年には共有できません。" };
    schoolDivision = division;
    grade = requestedGrade;
  }

  const fileValues = formData
    .getAll("attachments")
    .filter((item): item is File => item instanceof File && item.size > 0);
  if (fileValues.length > 5) return { error: "添付資料は5件までです。" };
  const files = [];
  for (const file of fileValues) {
    if (!allowedTypes.has(file.type) || file.size > 10 * 1024 * 1024)
      return {
        error: "添付できるのはPDF・PNG・JPEG・WebP（1件10MBまで）です。",
      };
    files.push({
      fileName: file.name.slice(0, 200),
      mimeType: file.type,
      size: file.size,
      data: new Uint8Array(await file.arrayBuffer()),
    });
  }
  await createAnnouncement({
    ...parsed.data,
    purpose:
      actor.role === "STUDENT"
        ? parsed.data.purpose
        : parsed.data.purpose || null,
    authorId: actor.id,
    directPublish: actor.role !== "STUDENT",
    classId,
    schoolDivision,
    grade,
    files,
  });
  revalidatePath("/announcements");
  return {
    success:
      actor.role === "STUDENT"
        ? "公開許可を申請しました。審査結果をお待ちください。"
        : "お知らせを公開しました。",
  };
}

export async function reviewAnnouncementAction(
  formData: FormData,
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const actor = await findActiveUserContext(session.user.id);
  if (!actor || (actor.role !== "TEACHER" && actor.role !== "ADMIN")) return;
  const id = formData.get("id");
  const decision = formData.get("decision");
  const reason = String(formData.get("reason") ?? "").trim();
  if (
    typeof id !== "string" ||
    (decision !== "approve" && decision !== "reject") ||
    (decision === "reject" && !reason)
  )
    return;
  await reviewAnnouncement({
    id,
    reviewerId: actor.id,
    approve: decision === "approve",
    reason: reason || null,
  });
  revalidatePath("/announcements");
}
