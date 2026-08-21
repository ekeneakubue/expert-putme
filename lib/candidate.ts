import { cookies } from "next/headers";
import { MOCK_ATTEMPTS_ALLOWED, MOCK_FEE_NAIRA } from "@/lib/mock";

export type Candidate = {
  fullName: string;
  jambReg: string;
  phone: string;
};

export type MockAttemptResult = {
  attemptNumber: number;
  correct: number;
  attempted: number;
  total: number;
  percent: number;
  subjects: Array<{
    subjectId: string;
    name: string;
    correct: number;
    total: number;
  }>;
  submittedAt: string;
};

export type MockEnrollment = {
  subjectIds: string[];
  paid: boolean;
  paidAt?: string;
  amount: number;
  reference?: string;
  attemptsUsed: number;
  attempts: MockAttemptResult[];
};

const CANDIDATE_COOKIE = "expertputme_candidate";
export const ENROLLMENT_COOKIE = "expertputme_enrollment";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

function normalizeAttempts(raw: unknown): MockAttemptResult[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is MockAttemptResult => {
      if (!item || typeof item !== "object") return false;
      const attempt = item as Partial<MockAttemptResult>;
      return (
        typeof attempt.attemptNumber === "number" &&
        typeof attempt.correct === "number" &&
        typeof attempt.total === "number" &&
        typeof attempt.submittedAt === "string"
      );
    })
    .map((attempt) => ({
      attemptNumber: attempt.attemptNumber,
      correct: attempt.correct,
      attempted: attempt.attempted ?? attempt.correct,
      total: attempt.total,
      percent:
        attempt.percent ??
        (attempt.total === 0
          ? 0
          : Math.round((attempt.correct / attempt.total) * 100)),
      subjects: Array.isArray(attempt.subjects) ? attempt.subjects : [],
      submittedAt: attempt.submittedAt,
    }))
    .sort((a, b) => a.attemptNumber - b.attemptNumber);
}

export function getAttemptsRemaining(enrollment: MockEnrollment | null) {
  if (!enrollment?.paid) return 0;
  return Math.max(0, MOCK_ATTEMPTS_ALLOWED - (enrollment.attemptsUsed || 0));
}

export function canStartMockExam(enrollment: MockEnrollment | null) {
  return Boolean(
    enrollment?.paid &&
      enrollment.subjectIds.length === 4 &&
      getAttemptsRemaining(enrollment) > 0,
  );
}

export async function setCandidate(candidate: Candidate) {
  const store = await cookies();
  store.set(CANDIDATE_COOKIE, JSON.stringify(candidate), cookieOptions);
}

export async function getCandidate(): Promise<Candidate | null> {
  const store = await cookies();
  const raw = store.get(CANDIDATE_COOKIE)?.value;
  if (!raw) return null;

  try {
    const data = JSON.parse(raw) as Candidate;
    if (!data.fullName || !data.jambReg || !data.phone) return null;
    return data;
  } catch {
    return null;
  }
}

export async function clearCandidate() {
  const store = await cookies();
  store.delete(CANDIDATE_COOKIE);
  store.delete(ENROLLMENT_COOKIE);
}

export async function getMockEnrollment(): Promise<MockEnrollment | null> {
  const store = await cookies();
  const raw = store.get(ENROLLMENT_COOKIE)?.value;
  if (!raw) return null;

  try {
    const data = JSON.parse(raw) as MockEnrollment & {
      subjectCodes?: string[];
    };
    const subjectIds = data.subjectIds ?? data.subjectCodes;
    if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
      return null;
    }

    const attempts = normalizeAttempts(data.attempts);
    const attemptsUsed = Math.max(
      Number(data.attemptsUsed) || 0,
      attempts.length,
    );

    return {
      subjectIds,
      paid: Boolean(data.paid),
      paidAt: data.paidAt,
      amount: data.amount || MOCK_FEE_NAIRA,
      reference: data.reference,
      attemptsUsed,
      attempts,
    };
  } catch {
    return null;
  }
}

export async function setMockEnrollment(enrollment: MockEnrollment) {
  const store = await cookies();
  const attempts = normalizeAttempts(enrollment.attempts);
  const payload: MockEnrollment = {
    ...enrollment,
    attemptsUsed: Math.max(enrollment.attemptsUsed || 0, attempts.length),
    attempts,
  };
  store.set(ENROLLMENT_COOKIE, JSON.stringify(payload), cookieOptions);
}

export async function recordMockAttempt(
  result: Omit<MockAttemptResult, "attemptNumber">,
) {
  const enrollment = await getMockEnrollment();
  if (!canStartMockExam(enrollment) || !enrollment) {
    return { ok: false as const, error: "No mock attempts remaining." };
  }

  const attemptNumber = enrollment.attempts.length + 1;
  const attempt: MockAttemptResult = {
    ...result,
    attemptNumber,
  };

  const next: MockEnrollment = {
    ...enrollment,
    attemptsUsed: enrollment.attemptsUsed + 1,
    attempts: [...enrollment.attempts, attempt],
  };

  await setMockEnrollment(next);
  return { ok: true as const, enrollment: next, attempt };
}

export function encodeResultPayload(payload: Record<string, unknown>) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}
