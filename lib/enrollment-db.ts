import type { MockEnrollment, MockAttemptResult } from "@/lib/candidate";
import { prisma } from "@/lib/prisma";

export async function syncEnrollmentToDatabase(
  jambReg: string,
  enrollment: MockEnrollment,
) {
  const candidate = await prisma.candidate.findUnique({
    where: { jambReg },
    select: { id: true },
  });
  if (!candidate) return;

  const paidAt = enrollment.paidAt ? new Date(enrollment.paidAt) : null;

  const record = await prisma.mockEnrollment.upsert({
    where: { candidateId: candidate.id },
    create: {
      candidateId: candidate.id,
      subjectIds: enrollment.subjectIds,
      paid: enrollment.paid,
      paidAt,
      amount: enrollment.amount,
      reference: enrollment.reference,
      attemptsUsed: enrollment.attemptsUsed,
    },
    update: {
      subjectIds: enrollment.subjectIds,
      paid: enrollment.paid,
      paidAt,
      amount: enrollment.amount,
      reference: enrollment.reference,
      attemptsUsed: enrollment.attemptsUsed,
    },
  });

  await prisma.mockAttempt.deleteMany({
    where: { enrollmentId: record.id },
  });

  if (enrollment.attempts.length === 0) return;

  await prisma.mockAttempt.createMany({
    data: enrollment.attempts.map((attempt) => ({
      enrollmentId: record.id,
      attemptNumber: attempt.attemptNumber,
      correct: attempt.correct,
      attempted: attempt.attempted,
      total: attempt.total,
      percent: attempt.percent,
      subjects: attempt.subjects,
      submittedAt: new Date(attempt.submittedAt),
    })),
  });
}

export type CandidateProgressRow = {
  id: string;
  fullName: string;
  jambReg: string;
  phone: string;
  createdAt: string;
  paid: boolean;
  subjectIds: string[];
  attemptsUsed: number;
  attempts: MockAttemptResult[];
};

export async function listCandidatesWithProgress(): Promise<
  CandidateProgressRow[]
> {
  const candidates = await prisma.candidate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      enrollment: {
        include: {
          attempts: {
            orderBy: { attemptNumber: "asc" },
          },
        },
      },
    },
  });

  return candidates.map((candidate) => {
    const enrollment = candidate.enrollment;
    const attempts: MockAttemptResult[] = (enrollment?.attempts ?? []).map(
      (attempt) => ({
        attemptNumber: attempt.attemptNumber,
        correct: attempt.correct,
        attempted: attempt.attempted,
        total: attempt.total,
        percent: attempt.percent,
        subjects: Array.isArray(attempt.subjects)
          ? (attempt.subjects as MockAttemptResult["subjects"])
          : [],
        submittedAt: attempt.submittedAt.toISOString(),
      }),
    );

    return {
      id: candidate.id,
      fullName: candidate.fullName,
      jambReg: candidate.jambReg,
      phone: candidate.phone,
      createdAt: candidate.createdAt.toISOString(),
      paid: Boolean(enrollment?.paid),
      subjectIds: enrollment?.subjectIds ?? [],
      attemptsUsed: enrollment?.attemptsUsed ?? attempts.length,
      attempts,
    };
  });
}
