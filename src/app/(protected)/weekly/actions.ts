"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  planItemSchema,
  weeklyNoteSchema,
} from "@/features/weekly-plan/validation";
import {
  createPlanItem,
  deletePlanItem,
  saveWeeklyNote,
  togglePlanItem,
} from "@/server/repositories/weekly-plan-repository";

async function userId() {
  const session = await auth();
  return session?.user?.id;
}

export async function addPlanItem(formData: FormData) {
  const id = await userId();
  if (!id) return;
  const parsed = planItemSchema.safeParse({
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    title: formData.get("title"),
  });
  if (!parsed.success) return;
  await createPlanItem({ userId: id, ...parsed.data });
  revalidatePath("/weekly");
}

export async function deletePlanItemAction(formData: FormData) {
  const user = await userId();
  const id = formData.get("id");
  if (!user || typeof id !== "string") return;
  await deletePlanItem(user, id);
  revalidatePath("/weekly");
}

export async function togglePlanItemAction(formData: FormData) {
  const user = await userId();
  const id = formData.get("id");
  if (!user || typeof id !== "string") return;
  await togglePlanItem(user, id, formData.get("completed") !== "true");
  revalidatePath("/weekly");
}

export async function saveWeeklyNoteAction(formData: FormData) {
  const id = await userId();
  if (!id) return;
  const parsed = weeklyNoteSchema.safeParse({
    weekStart: formData.get("weekStart"),
    goal: formData.get("goal"),
    memo: formData.get("memo"),
    reflection: formData.get("reflection"),
  });
  if (!parsed.success) return;
  await saveWeeklyNote({ userId: id, ...parsed.data });
  revalidatePath("/weekly");
}
