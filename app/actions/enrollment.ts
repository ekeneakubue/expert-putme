"use server";

import { headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { getCandidate, setMockEnrollment } from "@/lib/candidate";
import { MOCK_FEE_NAIRA } from "@/lib/mock";
import { initializePaystackPayment } from "@/lib/paystack";
import { listSubjects } from "@/lib/subjects";

export type EnrollmentState = {
  error?: string;
};

function buildReference(jambReg: string) {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const cleanJamb = jambReg.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  return `EPM${cleanJamb}${stamp}${rand}`.slice(0, 50);
}

async function getAppOrigin() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  const headerStore = await headers();
  const host =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function payForMock(
  _prev: EnrollmentState,
  formData: FormData,
): Promise<EnrollmentState> {
  const candidate = await getCandidate();
  if (!candidate) redirect("/login");

  const ids = formData
    .getAll("subjectIds")
    .map((value) => String(value).trim())
    .filter(Boolean);

  const unique = [...new Set(ids)];
  if (unique.length !== 4) {
    return { error: "Select exactly 4 subjects for your mock." };
  }

  const subjects = await listSubjects();
  const availableIds = new Set(subjects.map((subject) => subject.id));

  if (unique.some((id) => !availableIds.has(id))) {
    return { error: "One or more selected subjects are not available." };
  }

  if (!process.env.PAYSTACK_SECRET_KEY) {
    return {
      error: "Paystack is not configured. Add PAYSTACK_SECRET_KEY to your environment.",
    };
  }

  const reference = buildReference(candidate.jambReg);
  const origin = await getAppOrigin();

  await setMockEnrollment({
    subjectIds: unique,
    paid: false,
    amount: MOCK_FEE_NAIRA,
    reference,
    attemptsUsed: 0,
    attempts: [],
  });

  try {
    const checkout = await initializePaystackPayment({
      email: `${candidate.jambReg.toLowerCase()}@candidates.expertputme.app`,
      amountNaira: MOCK_FEE_NAIRA,
      reference,
      callbackUrl: `${origin}/candidate/payment/callback`,
      metadata: {
        jambReg: candidate.jambReg,
        fullName: candidate.fullName,
        phone: candidate.phone,
        subjectIds: unique,
        purpose: "putme_mock",
      },
    });

    redirect(checkout.authorization_url);
  } catch (error) {
    unstable_rethrow(error);

    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not start Paystack checkout. Try again.",
    };
  }
}
