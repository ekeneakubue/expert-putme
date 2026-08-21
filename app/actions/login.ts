"use server";

import { redirect } from "next/navigation";
import { authenticateAccount } from "@/lib/accounts";
import { setCandidate } from "@/lib/candidate";
import { isValidJambReg, isValidPassword, normalizeJambReg } from "@/lib/validation";

export type LoginState = {
  error?: string;
};

export async function loginCandidate(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const jambReg = normalizeJambReg(String(formData.get("jambReg") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!isValidJambReg(jambReg)) {
    return { error: "JAMB registration number must be 10 digits followed by 2 letters." };
  }

  if (!isValidPassword(password)) {
    return { error: "Enter your password." };
  }

  const account = await authenticateAccount(jambReg, password);
  if (!account) {
    return { error: "Incorrect JAMB number or password." };
  }

  await setCandidate({
    fullName: account.fullName,
    jambReg: account.jambReg,
    phone: account.phone,
  });

  redirect("/candidate");
}
