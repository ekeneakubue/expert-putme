"use server";

import { createAccount } from "@/lib/accounts";
import {
  isValidFullName,
  isValidJambReg,
  isValidNigerianPhone,
  isValidPassword,
  normalizeJambReg,
  normalizePhone,
} from "@/lib/validation";

export type RegisterState = {
  error?: string;
  success?: boolean;
};

export async function registerCandidate(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const fullName = String(formData.get("fullName") ?? "").trim().replace(/\s+/g, " ");
  const jambReg = normalizeJambReg(String(formData.get("jambReg") ?? ""));
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!isValidFullName(fullName)) {
    return { error: "Enter your full name as it appears on your JAMB slip." };
  }

  if (!isValidJambReg(jambReg)) {
    return { error: "JAMB registration number must be 10 digits followed by 2 letters." };
  }

  if (!isValidNigerianPhone(phone)) {
    return { error: "Enter a valid Nigerian phone number." };
  }

  if (!isValidPassword(password)) {
    return { error: "Password must be at least 6 characters." };
  }

  try {
    const created = await createAccount({
      fullName,
      jambReg,
      phone: normalizePhone(phone),
      password,
    });

    if (!created.ok) {
      return { error: created.error };
    }
  } catch {
    return {
      error: "Could not save your seat. Make sure the database is connected.",
    };
  }

  return { success: true };
}
