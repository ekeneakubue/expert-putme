"use server";

import { redirect } from "next/navigation";
import {
  clearAdminSession,
  getAdminPassword,
  isAdminAuthenticated,
  setAdminSession,
} from "@/lib/admin";
import { setPaperOpen } from "@/lib/hall";

export type AdminLoginState = {
  error?: string;
};

export async function loginAdmin(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const password = String(formData.get("password") ?? "");

  if (!password || password !== getAdminPassword()) {
    return { error: "Incorrect admin password." };
  }

  await setAdminSession();
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function openMockPaper() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  await setPaperOpen(true);
}

export async function sealMockPaper() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  await setPaperOpen(false);
}
