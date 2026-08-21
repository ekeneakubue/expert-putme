"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin";
import { importQuestionsFromCsv } from "@/lib/questions";

export type UploadQuestionsState = {
  error?: string;
};

export async function uploadQuestions(
  _prev: UploadQuestionsState,
  formData: FormData,
): Promise<UploadQuestionsState> {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const subjectId = String(formData.get("subjectId") ?? "").trim();
  const file = formData.get("csv");

  if (!subjectId) {
    return { error: "Select a subject." };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a questions CSV file to upload." };
  }

  if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
    return { error: "Upload a .csv file." };
  }

  const csvText = await file.text();
  const result = await importQuestionsFromCsv({ subjectId, csvText });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/admin/questions");
  revalidatePath("/admin/subjects");
  redirect("/admin/questions");
}
