"use server";

import { redirect } from "next/navigation";
import { resetAccountPassword } from "@/lib/accounts";
import {
  isValidJambReg,
  isValidNigerianPhone,
  isValidPassword,
  normalizeJambReg,
  normalizePhone,
} from "@/lib/validation";

export type ForgotPasswordState = {
  error?: string;
};

export async function resetCandidatePassword(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const jambReg = normalizeJambReg(String(formData.get("jambReg") ?? ""));
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!isValidJambReg(jambReg)) {
    return { error: "JAMB registration number must be 10 digits followed by 2 letters." };
  }

  if (!isValidNigerianPhone(phone)) {
    return { error: "Enter the phone number used at registration." };
  }

  if (!isValidPassword(password)) {
    return { error: "New password must be at least 6 characters." };
  }

  const result = await resetAccountPassword({
    jambReg,
    phone: normalizePhone(phone),
    password,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  redirect("/login");
}
