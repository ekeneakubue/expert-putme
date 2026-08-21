import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DownloadMockResultButton } from "@/app/components/download-mock-result-button";
import { Logo } from "@/app/components/logo";
import { getAttemptsRemaining, getCandidate, getMockEnrollment } from "@/lib/candidate";
import { MOCK_ATTEMPTS_ALLOWED } from "@/lib/mock";
import { formatJambReg } from "@/lib/validation";

export const metadata: Metadata = {
  title: "Mock result",
};

type ResultPayload = {
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
  fullName: string;
  jambReg: string;
  attemptNumber?: number;
  attemptsUsed?: number;
  attemptsAllowed?: number;
};

export default async function ExamResultPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const candidate = await getCandidate();
  if (!candidate) redirect("/login");

  const enrollment = await getMockEnrollment();
  const remaining = getAttemptsRemaining(enrollment);

  const params = await searchParams;
  const raw = Array.isArray(params.r) ? params.r[0] : params.r;

  let result: ResultPayload | null = null;
  if (raw) {
    try {
      result = JSON.parse(
        Buffer.from(raw, "base64url").toString("utf8"),
      ) as ResultPayload;
    } catch {
      result = null;
    }
  }

  if (!result) {
    redirect("/candidate");
  }

  const attemptNumber = result.attemptNumber ?? result.attemptsUsed;
  const attemptsAllowed = result.attemptsAllowed ?? MOCK_ATTEMPTS_ALLOWED;

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-screen/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <Link
            href="/candidate"
            className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
          >
            Candidate desk
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8 sm:py-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-signal">
          Result slip
          {attemptNumber
            ? ` · Attempt ${attemptNumber} of ${attemptsAllowed}`
            : ""}
        </p>
        <h1 className="font-display mt-3 text-4xl tracking-tight sm:text-5xl">
          Mock complete
        </h1>
        <p className="mt-4 text-ink-muted leading-7">
          {result.fullName} · {formatJambReg(result.jambReg)}
          {enrollment?.paid
            ? ` · ${remaining} attempt${remaining === 1 ? "" : "s"} left`
            : ""}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="border border-line bg-screen px-5 py-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">
              Score
            </p>
            <p className="font-display mt-2 text-4xl tracking-tight">
              {result.correct}/{result.total}
            </p>
          </div>
          <div className="border border-line bg-screen px-5 py-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">
              Percent
            </p>
            <p className="font-display mt-2 text-4xl tracking-tight text-signal">
              {result.percent}%
            </p>
          </div>
          <div className="border border-line bg-screen px-5 py-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">
              Attempted
            </p>
            <p className="font-display mt-2 text-4xl tracking-tight">
              {result.attempted}
            </p>
          </div>
        </div>

        <section className="mt-8 border border-line bg-screen">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-2xl tracking-tight">
              Subject breakdown
            </h2>
          </div>
          <ul>
            {result.subjects.map((subject) => (
              <li
                key={subject.subjectId}
                className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 last:border-b-0"
              >
                <span className="font-medium">{subject.name}</span>
                <span className="font-mono text-sm text-ink-muted">
                  {subject.correct}/{subject.total}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <DownloadMockResultButton data={result} />
          {remaining > 0 ? (
            <Link
              href="/candidate/exam"
              className="inline-flex rounded-[3px] border border-line px-5 py-3 text-sm font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-screen"
            >
              Sit again
            </Link>
          ) : null}
          <Link
            href="/candidate"
            className="inline-flex rounded-[3px] bg-ink px-5 py-3 text-sm font-semibold text-screen transition-colors hover:bg-signal"
          >
            Return to candidate desk
          </Link>
        </div>
      </main>
    </div>
  );
}
