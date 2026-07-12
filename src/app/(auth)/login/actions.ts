"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import { userPath } from "@/lib/user-path";

export type LoginState = { error?: string };

export async function login(
  _: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const dashboardUrl = userPath(username, "dashboard");
  try {
    await signIn("credentials", {
      username,
      password: formData.get("password"),
      redirectTo: dashboardUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "ユーザー名またはパスワードが正しくありません。" };
    }
    throw error;
  }
  redirect(dashboardUrl);
}
