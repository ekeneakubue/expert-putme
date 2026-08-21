"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { MockAttemptResult } from "@/lib/candidate";
import { formatWhen } from "@/lib/format";
import { MOCK_ATTEMPTS_ALLOWED } from "@/lib/mock";
import { formatJambReg } from "@/lib/validation";

export type CandidateAttemptsRow = {
  id: string;
  fullName: string;
  jambReg: string;
  paid: boolean;
  subjectLabel: string;
  attemptsUsed: number;
  attempts: MockAttemptResult[];
  createdAt: string;
};

function formatScore(attempt: MockAttemptResult) {
  return `${attempt.correct}/${attempt.total} (${attempt.percent}%)`;
}

export function CandidatesAttemptsTable({
  rows,
}: {
  rows: CandidateAttemptsRow[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = rows.find((row) => row.id === activeId) ?? null;
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!active) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveId(null);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [active]);

  return (
    <>
      <div className="mt-4 overflow-x-auto border border-line bg-screen">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead className="border-b border-line bg-field-deep/50 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-medium sm:px-5">Name</th>
              <th className="px-4 py-3 font-medium sm:px-5">JAMB number</th>
              <th className="px-4 py-3 font-medium sm:px-5">Subjects</th>
              <th className="px-4 py-3 font-medium sm:px-5">Attempts</th>
              <th className="px-4 py-3 font-medium sm:px-5">Registered</th>
              <th className="px-4 py-3 font-medium sm:px-5">History</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const totalAttempts = row.attempts.length;
              return (
                <tr
                  key={row.id}
                  className="border-b border-line last:border-b-0 align-top"
                >
                  <td className="px-4 py-3.5 font-medium sm:px-5">
                    {row.fullName}
                    <span className="mt-1 block text-[11px] font-normal uppercase tracking-[0.14em] text-ink-muted">
                      {row.paid ? "Paid" : "Unpaid"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono tracking-wider sm:px-5">
                    {formatJambReg(row.jambReg)}
                  </td>
                  <td className="max-w-[14rem] px-4 py-3.5 text-ink-muted sm:px-5">
                    {row.subjectLabel}
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <p className="font-mono font-medium text-ink">
                      {totalAttempts}
                    </p>
                    <p className="mt-1 text-[11px] text-ink-muted">
                      {totalAttempts === 1 ? "attempt" : "attempts"} total
                      {row.paid
                        ? ` · ${row.attemptsUsed}/${MOCK_ATTEMPTS_ALLOWED} on current sub`
                        : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-ink-muted sm:px-5">
                    {formatWhen(row.createdAt)}
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <button
                      type="button"
                      onClick={() => setActiveId(row.id)}
                      disabled={totalAttempts === 0}
                      className="rounded-[3px] border border-line px-3 py-2 text-xs font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-screen disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      View all attempts
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {active ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
            onClick={() => setActiveId(null)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[4px] border border-line bg-screen shadow-[0_28px_70px_-36px_rgba(11,28,44,0.55)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line bg-monitor px-5 py-4 text-signal-ink sm:px-6">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-signal">
                  Attempt history
                </p>
                <h2
                  id={titleId}
                  className="font-display mt-1 text-2xl tracking-tight"
                >
                  {active.fullName}
                </h2>
                <p className="mt-1 font-mono text-xs tracking-wider text-signal-ink/65">
                  {formatJambReg(active.jambReg)} · {active.attempts.length}{" "}
                  attempt{active.attempts.length === 1 ? "" : "s"} across all
                  subscriptions
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setActiveId(null)}
                className="rounded-[3px] px-2 py-1 text-sm text-signal-ink/70 transition-colors hover:bg-signal-ink/10 hover:text-signal-ink"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-5 sm:px-6">
              {active.attempts.length === 0 ? (
                <p className="text-sm text-ink-muted">No attempts recorded.</p>
              ) : (
                <ul className="space-y-4">
                  {[...active.attempts].reverse().map((attempt) => (
                    <li
                      key={`${attempt.attemptNumber}-${attempt.submittedAt}`}
                      className="border border-line bg-field/30 px-4 py-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">
                            Attempt {attempt.attemptNumber}
                          </p>
                          <p className="mt-1 text-sm text-ink-muted">
                            {formatWhen(attempt.submittedAt)}
                          </p>
                        </div>
                        <p className="font-mono text-lg font-semibold text-signal">
                          {formatScore(attempt)}
                        </p>
                      </div>

                      {attempt.subjects.length > 0 ? (
                        <ul className="mt-4 space-y-2 border-t border-line pt-3">
                          {attempt.subjects.map((subject) => (
                            <li
                              key={`${attempt.attemptNumber}-${subject.subjectId}`}
                              className="flex items-center justify-between gap-3 text-sm"
                            >
                              <span className="text-ink-muted">
                                {subject.name}
                              </span>
                              <span className="font-mono text-ink">
                                {subject.correct}/{subject.total}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
