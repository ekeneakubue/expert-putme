import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CbtExam } from "@/app/components/cbt-exam";
import {
  canStartMockExam,
  getCandidate,
  getAttemptsRemaining,
  getMockEnrollment,
} from "@/lib/candidate";
import { buildExamPaper } from "@/lib/exam";
import { MOCK_ATTEMPTS_ALLOWED } from "@/lib/mock";

export const metadata: Metadata = {
  title: "Mock exam",
  description: "Sit your Expert PUTME Mock CBT paper.",
};

export default async function CandidateExamPage() {
  const candidate = await getCandidate();
  if (!candidate) redirect("/login");

  const enrollment = await getMockEnrollment();
  if (!enrollment?.paid || enrollment.subjectIds.length !== 4) {
    redirect("/candidate");
  }

  if (!canStartMockExam(enrollment)) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 py-16">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-signal">
          Mock exam
        </p>
        <h1 className="font-display mt-3 text-4xl tracking-tight">
          No attempts left
        </h1>
        <p className="mt-4 text-ink-muted leading-7">
          This subscription includes {MOCK_ATTEMPTS_ALLOWED} attempts and you
          have used them all. Return to your desk to review results or pay again
          for another three sits.
        </p>
        <Link
          href="/candidate"
          className="mt-8 inline-flex w-fit rounded-[3px] bg-ink px-5 py-3 text-sm font-semibold text-screen transition-colors hover:bg-signal"
        >
          Back to candidate desk
        </Link>
      </div>
    );
  }

  const paper = await buildExamPaper(enrollment.subjectIds);
  const remaining = getAttemptsRemaining(enrollment);

  if (paper.questions.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 py-16">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-signal">
          Mock exam
        </p>
        <h1 className="font-display mt-3 text-4xl tracking-tight">
          No questions yet
        </h1>
        <p className="mt-4 text-ink-muted leading-7">
          Your seat is paid, but the question bank for your subjects is empty.
          Ask the control room to upload questions, then try again.
        </p>
        <Link
          href="/candidate"
          className="mt-8 inline-flex w-fit rounded-[3px] bg-ink px-5 py-3 text-sm font-semibold text-screen transition-colors hover:bg-signal"
        >
          Back to candidate desk
        </Link>
      </div>
    );
  }

  return (
    <CbtExam
      questions={paper.questions}
      durationMinutes={paper.durationMinutes}
      candidateName={candidate.fullName}
      attemptLabel={`Sit ${enrollment.attemptsUsed + 1} of ${MOCK_ATTEMPTS_ALLOWED} · ${remaining} left after this sit`}
    />
  );
}
