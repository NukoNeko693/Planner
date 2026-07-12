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

  const requestedClassId = formData.get("classId");
  const availableClassIds = [
    ...(user.classId ? [user.classId] : []),
    ...user.electiveMemberships.map((membership) => membership.schoolClass.id),
  ];
  if (
    parsed.data.scope === "CLASS" &&
    (typeof requestedClassId !== "string" ||
      !availableClassIds.includes(requestedClassId))
  ) {
    return {
      error: "共有する所属クラスを選択してください。",
    };
  }
  if (parsed.data.scope === "SCHOOL" && user.role !== "ADMIN") {
    return { error: "学校全体予定を作成できるのは管理者だけです。" };
  }
  const requestedDivision = formData.get("schoolDivision");
  const requestedGrade = Number(formData.get("grade"));
  const gradeTarget: {
    schoolDivision: "MIDDLE" | "HIGH";
    grade: number;
  } | null =
    (requestedDivision === "MIDDLE" || requestedDivision === "HIGH") &&
    Number.isInteger(requestedGrade) &&
    requestedGrade >= 1 &&
    requestedGrade <= 3
      ? {
          schoolDivision: requestedDivision as "MIDDLE" | "HIGH",
          grade: requestedGrade,
        }
      : null;
  if (parsed.data.scope === "GRADE") {
    if (!gradeTarget) return { error: "対象の学年団を選択してください。" };
    const isHomeroomTeacher =
      user.role === "TEACHER" &&
      user.schoolClass?.schoolDivision === gradeTarget.schoolDivision &&
      user.schoolClass.grade === gradeTarget.grade;
    const isAdditionalTeacher =
      user.role === "TEACHER" &&
      user.gradeTeamMemberships.some(
        (item) =>
          item.schoolDivision === gradeTarget.schoolDivision &&
          item.grade === gradeTarget.grade,
      );
    if (user.role !== "ADMIN" && !isHomeroomTeacher && !isAdditionalTeacher) {
      return {
        error: "学年予定を作成できるのは対象学年団の教師または管理者だけです。",
      };
    }
  }
  await persistEvent({
    ...parsed.data,
    creatorId: session.user.id,
    classId:
      parsed.data.scope === "CLASS" ? (requestedClassId as string) : null,
    schoolDivision:
      parsed.data.scope === "GRADE" ? gradeTarget!.schoolDivision : null,
    grade: parsed.data.scope === "GRADE" ? gradeTarget!.grade : null,
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
  if (!user) return;
  const eventId = formData.get("eventId");
  const classId = formData.get("classId");
  const teacherClassIds = [
    ...(user.classId ? [user.classId] : []),
    ...user.electiveMemberships.map((membership) => membership.schoolClass.id),
  ];
  if (
    user.role !== "TEACHER" ||
    typeof eventId !== "string" ||
    !eventId ||
    typeof classId !== "string" ||
    !teacherClassIds.includes(classId)
  ) {
    return;
  }
  await deleteClassEvent({
    eventId,
    actorId: user.id,
    classId,
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
