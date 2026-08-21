"use server";

import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin";
import { createUser } from "@/lib/users";

export type AddUserState = {
  error?: string;
};

export async function addUser(
  _prev: AddUserState,
  formData: FormData,
): Promise<AddUserState> {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const roleValue = String(formData.get("role") ?? "STAFF");
  const role =
    roleValue === UserRole.ADMIN ? UserRole.ADMIN : UserRole.STAFF;

  try {
    const result = await createUser({ name, email, password, role });
    if (!result.ok) {
      return { error: result.error };
    }
  } catch {
    return {
      error: "Could not save user. Make sure the database is connected.",
    };
  }

  revalidatePath("/admin/users");
  redirect("/admin/users");
}
