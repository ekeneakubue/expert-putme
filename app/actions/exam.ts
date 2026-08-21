"use server";

import { redirect } from "next/navigation";
import {
  canStartMockExam,
  encodeResultPayload,
  getCandidate,
  getMockEnrollment,
  recordMockAttempt,
} from "@/lib/candidate";
import { scoreExam } from "@/lib/exam";
import { MOCK_ATTEMPTS_ALLOWED } from "@/lib/mock";

export type SubmitExamState = {
  error?: string;
};

export async function submitMockExam(
  _prev: SubmitExamState,
  formData: FormData,
): Promise<SubmitExamState> {
  const candidate = await getCandidate();
  if (!candidate) redirect("/login");

  const enrollment = await getMockEnrollment();
  if (!canStartMockExam(enrollment)) {
    if (enrollment?.paid) {
      return {
        error: `You have used all ${MOCK_ATTEMPTS_ALLOWED} attempts on this subscription.`,
      };
    }
    redirect("/candidate");
  }

  const raw = String(formData.get("answers") ?? "");
  let answers: Record<string, "A" | "B" | "C" | "D" | ""> = {};

  try {
    answers = JSON.parse(raw) as Record<string, "A" | "B" | "C" | "D" | "">;
  } catch {
    return { error: "Could not read your answers. Try submitting again." };
  }

  const result = await scoreExam(answers);
  const recorded = await recordMockAttempt({
    ...result,
    submittedAt: new Date().toISOString(),
  });

  if (!recorded.ok) {
    return { error: recorded.error };
  }

  const payload = encodeResultPayload({
    ...result,
    attemptNumber: recorded.attempt.attemptNumber,
    attemptsUsed: recorded.enrollment.attemptsUsed,
    attemptsAllowed: MOCK_ATTEMPTS_ALLOWED,
    submittedAt: recorded.attempt.submittedAt,
    fullName: candidate.fullName,
    jambReg: candidate.jambReg,
  });

  redirect(`/candidate/exam/result?r=${payload}`);
}
