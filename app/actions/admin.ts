"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import {
  clearAdminSession,
  isAdminAuthenticated,
  setAdminSession,
} from "@/lib/admin";
import { setPaperOpen } from "@/lib/hall";
import { authenticateUser } from "@/lib/users";

export type AdminLoginState = {
  error?: string;
};

export async function loginAdmin(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  try {
    const user = await authenticateUser(email, password);
    if (!user) {
      return { error: "Incorrect email or password." };
    }

    await setAdminSession(user.id);
    redirect("/admin");
  } catch (error) {
    unstable_rethrow(error);
    console.error("Admin login failed:", error);
    return {
      error: "Could not reach the user directory. Try again in a moment.",
    };
  }
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
