"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin";
import { createSubject } from "@/lib/subjects";

export type AddSubjectState = {
  error?: string;
};

export async function addSubject(
  _prev: AddSubjectState,
  formData: FormData,
): Promise<AddSubjectState> {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const name = String(formData.get("name") ?? "");

  const result = await createSubject({ name });
  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/admin/subjects");
  redirect("/admin/subjects");
}
