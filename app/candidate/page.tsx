import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DownloadMockSlipButton } from "@/app/components/download-mock-slip-button";
import { Logo } from "@/app/components/logo";
import { MockEnrollmentPanel } from "@/app/components/mock-enrollment-panel";
import { leaveHall } from "@/app/actions/session";
import {
  canStartMockExam,
  encodeResultPayload,
  getAttemptsRemaining,
  getCandidate,
  getMockEnrollment,
} from "@/lib/candidate";
import { MOCK_ATTEMPTS_ALLOWED, MOCK_FEE_NAIRA } from "@/lib/mock";
import { getHallState } from "@/lib/hall";
import { listSubjects } from "@/lib/subjects";
import { formatJambReg } from "@/lib/validation";

export const metadata: Metadata = {
  title: "Candidate desk",
  description: "Select subjects and pay for your Expert PUTME Mock.",
};

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function CandidatePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const candidate = await getCandidate();
  if (!candidate) redirect("/login");

  const params = await searchParams;
  const paymentRaw = params.payment;
  const paymentStatus = Array.isArray(paymentRaw) ? paymentRaw[0] : paymentRaw;

  const [hall, subjects, enrollment] = await Promise.all([
    getHallState(),
    listSubjects(),
    getMockEnrollment(),
  ]);

  const firstName = candidate.fullName.split(" ")[0];
  const subjectOptions = subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
  }));
  const subjectNamesById = new Map(
    subjects.map((subject) => [subject.id, subject.name]),
  );
  const enrolledSubjects =
    enrollment?.subjectIds
      .map((id) => subjectNamesById.get(id) ?? id)
      .filter(Boolean) ?? [];

  const attemptsRemaining = getAttemptsRemaining(enrollment);
  const canStart = canStartMockExam(enrollment);
  const subscriptionActive = Boolean(enrollment?.paid) && attemptsRemaining > 0;
  const subscriptionExhausted =
    Boolean(enrollment?.paid) && attemptsRemaining === 0;
  const attempts = enrollment?.attempts ?? [];

  const paymentMessage =
    paymentStatus === "success"
      ? `Paystack payment confirmed. You have ${MOCK_ATTEMPTS_ALLOWED} mock attempts on this subscription.`
      : paymentStatus === "failed"
        ? "Payment was not completed. You can try Paystack checkout again."
        : paymentStatus === "missing" ||
            paymentStatus === "missing-enrollment" ||
            paymentStatus === "reference-mismatch" ||
            paymentStatus === "amount-mismatch"
          ? "We could not verify that payment. Select your subjects and pay again."
          : null;

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-screen/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <div className="flex items-center gap-4 sm:gap-6">
            <p className="hidden text-sm text-ink-muted sm:block">
              <span className="text-ink">{firstName}</span>
              <span className="mx-2 text-line">·</span>
              <span className="font-mono text-xs tracking-wider">
                {formatJambReg(candidate.jambReg)}
              </span>
            </p>
            <form action={leaveHall}>
              <button
                type="submit"
                className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-8 sm:py-12">
        {paymentMessage ? (
          <p
            role="status"
            className={`mb-6 border px-4 py-3 text-sm ${
              paymentStatus === "success"
                ? "border-signal/30 bg-signal/10 text-ink"
                : "border-flare/40 bg-flare/10 text-ink"
            }`}
          >
            {paymentMessage}
          </p>
        ) : null}

        <section className="rise grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-signal">
              Candidate desk · 2026 mock
            </p>
            <h1 className="font-display mt-3 text-[clamp(2.4rem,6vw,3.75rem)] leading-none tracking-tight">
              Welcome, {firstName}.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-ink-muted">
              Select four subjects, pay {formatNaira(MOCK_FEE_NAIRA)} once, and
              sit the CBT mock up to {MOCK_ATTEMPTS_ALLOWED} times.
            </p>
          </div>

          <aside className="overflow-hidden rounded-[4px] border border-line bg-monitor p-5 text-signal-ink sm:p-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-signal">
              Candidate slip
            </p>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.16em] text-signal-ink/45">
                  Name
                </dt>
                <dd className="mt-1">{candidate.fullName}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.16em] text-signal-ink/45">
                  JAMB number
                </dt>
                <dd className="mt-1 font-mono tracking-wider">
                  {formatJambReg(candidate.jambReg)}
                </dd>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="rounded-[2px] bg-signal/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-signal">
                  {subscriptionActive
                    ? `Paid · ${attemptsRemaining} left`
                    : subscriptionExhausted
                      ? "Paid · used up"
                      : "Unpaid"}
                </span>
                <span
                  className={`rounded-[2px] border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                    hall.paperOpen
                      ? "border-signal/40 text-signal"
                      : "border-line text-signal-ink/55"
                  }`}
                >
                  {hall.paperOpen ? "Hall open" : "Self-paced"}
                </span>
              </div>
            </dl>
          </aside>
        </section>

        <MockEnrollmentPanel
          subjects={subjectOptions}
          initialSelected={enrollment?.subjectIds ?? []}
          paid={subscriptionActive}
          paidAt={enrollment?.paidAt}
          attemptsAllowed={MOCK_ATTEMPTS_ALLOWED}
        />

        {subscriptionExhausted ? (
          <section className="mt-8 border border-flare/30 bg-flare/10 px-6 py-5 sm:px-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
              Subscription
            </p>
            <h2 className="font-display mt-2 text-2xl tracking-tight">
              All {MOCK_ATTEMPTS_ALLOWED} attempts used
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-ink-muted">
              Your previous results stay saved below. Choose subjects again and
              pay {formatNaira(MOCK_FEE_NAIRA)} for another {MOCK_ATTEMPTS_ALLOWED}{" "}
              attempts.
            </p>
          </section>
        ) : null}

        {enrollment?.paid && !subscriptionExhausted ? (
          <section className="mt-8 overflow-hidden rounded-[4px] border border-line bg-screen px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
                  Mock paper
                </p>
                <h2 className="font-display mt-2 text-3xl tracking-tight">
                  {canStart ? "Your exam is unlocked" : "Subscription active"}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">
                  {attemptsRemaining} of {MOCK_ATTEMPTS_ALLOWED} attempts
                  remaining on this payment. Download your slip, then start when
                  ready.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:items-stretch">
                <DownloadMockSlipButton
                  data={{
                    fullName: candidate.fullName,
                    jambReg: formatJambReg(candidate.jambReg),
                    subjects: enrolledSubjects,
                    paidAt: enrollment.paidAt,
                    reference: enrollment.reference,
                    amount: enrollment.amount ?? MOCK_FEE_NAIRA,
                  }}
                />
                {canStart ? (
                  <Link
                    href="/candidate/exam"
                    className="rounded-[3px] bg-ink px-5 py-3.5 text-center text-sm font-semibold text-screen transition-colors hover:bg-signal sm:min-w-[14rem]"
                  >
                    Start mock exam
                  </Link>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {attempts.length > 0 ? (
          <section className="mt-8 border border-line bg-screen">
            <div className="border-b border-line px-6 py-4 sm:px-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
                Attempt history
              </p>
              <h2 className="font-display mt-2 text-2xl tracking-tight">
                Saved mock results
              </h2>
            </div>
            <ul>
              {[...attempts].reverse().map((attempt) => {
                const payload = encodeResultPayload({
                  ...attempt,
                  attemptsUsed: enrollment?.attemptsUsed ?? attempt.attemptNumber,
                  attemptsAllowed: MOCK_ATTEMPTS_ALLOWED,
                  fullName: candidate.fullName,
                  jambReg: candidate.jambReg,
                });
                return (
                  <li
                    key={`${attempt.attemptNumber}-${attempt.submittedAt}`}
                    className="flex flex-col gap-3 border-b border-line px-6 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-8"
                  >
                    <div>
                      <p className="font-medium">
                        Attempt {attempt.attemptNumber}
                      </p>
                      <p className="mt-1 text-sm text-ink-muted">
                        {attempt.correct}/{attempt.total} · {attempt.percent}% ·{" "}
                        {formatWhen(attempt.submittedAt)}
                      </p>
                    </div>
                    <Link
                      href={`/candidate/exam/result?r=${payload}`}
                      className="text-sm font-medium text-signal underline-offset-2 hover:underline"
                    >
                      View result
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  );
}
