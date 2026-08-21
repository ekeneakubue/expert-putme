"use client";

import { useActionState, useMemo, useState } from "react";
import {
  payForMock,
  type EnrollmentState,
} from "@/app/actions/enrollment";
import { MOCK_FEE_NAIRA } from "@/lib/mock";

type SubjectOption = {
  id: string;
  name: string;
};

const initial: EnrollmentState = {};

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function MockEnrollmentPanel({
  subjects,
  initialSelected = [],
  paid = false,
  paidAt,
  attemptsAllowed = 3,
}: {
  subjects: SubjectOption[];
  initialSelected?: string[];
  paid?: boolean;
  paidAt?: string;
  attemptsAllowed?: number;
}) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [state, action, pending] = useActionState(payForMock, initial);

  const selectedNames = useMemo(
    () =>
      selected
        .map((id) => subjects.find((subject) => subject.id === id)?.name)
        .filter(Boolean) as string[],
    [selected, subjects],
  );

  function toggleSubject(id: string) {
    if (paid) return;

    setSelected((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      if (current.length >= 4) return current;
      return [...current, id];
    });
  }

  const ready = selected.length === 4;

  if (paid) {
    return (
      <section className="mt-10 overflow-hidden rounded-[4px] border border-line bg-screen">
        <div className="border-b border-line bg-monitor px-6 py-5 text-signal-ink sm:px-8">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-signal">
            Enrollment
          </p>
          <h2 className="font-display mt-1 text-3xl tracking-tight">
            Payment confirmed
          </h2>
          <p className="mt-2 text-sm text-signal-ink/65">
            {formatNaira(MOCK_FEE_NAIRA)} received
            {paidAt
              ? ` · ${new Intl.DateTimeFormat("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(paidAt))}`
              : ""}
          </p>
        </div>
        <div className="px-6 py-6 sm:px-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
            Your four subjects
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {selectedNames.map((name, index) => (
              <li
                key={name}
                className="border-t border-line pt-3 font-medium"
              >
                <span className="font-mono text-xs text-signal">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="ml-3">{name}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-ink-muted leading-6">
            Your mock seat is paid. This subscription includes{" "}
            {attemptsAllowed} exam attempts. Download your slip, then start from
            this desk.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-signal">
            Step 01 · Subjects
          </p>
          <h2 className="font-display mt-2 text-3xl tracking-tight sm:text-4xl">
            Choose 4 subjects
          </h2>
          <p className="mt-3 max-w-xl text-ink-muted leading-7">
            Pick any four subjects for this mock. You can change them until you
            pay.
          </p>
        </div>
        <p className="font-mono text-sm text-ink-muted">
          <span className="text-ink">{selected.length}</span>/4 selected
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {subjects.map((subject) => {
          const isOn = selected.includes(subject.id);
          const lockedOut = !isOn && selected.length >= 4;

          return (
            <button
              key={subject.id}
              type="button"
              onClick={() => toggleSubject(subject.id)}
              disabled={lockedOut}
              aria-pressed={isOn}
              className={`border px-4 py-4 text-left transition-colors ${
                isOn
                  ? "border-signal bg-signal/10"
                  : lockedOut
                    ? "border-line bg-field-deep/30 opacity-45"
                    : "border-line bg-screen hover:border-signal/50"
              }`}
            >
              <span className="mt-0 block font-medium">{subject.name}</span>
              <span
                className={`mt-3 block text-[11px] font-semibold uppercase tracking-[0.16em] ${
                  isOn ? "text-signal" : "text-ink-muted"
                }`}
              >
                {isOn ? "Selected" : lockedOut ? "Limit reached" : "Select"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-10 overflow-hidden rounded-[4px] border border-line bg-screen">
        <div className="border-b border-line bg-monitor px-6 py-5 text-signal-ink sm:px-8">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-signal">
            Step 02 · Payment
          </p>
          <h3 className="font-display mt-1 text-2xl tracking-tight">
            Pay {formatNaira(MOCK_FEE_NAIRA)} for the mock
          </h3>
        </div>

        <div className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-ink-muted leading-7">
              One-time fee unlocks your CBT mock with the four subjects you
              selected, including {attemptsAllowed} timed exam attempts.
              Checkout is secured by Paystack.
            </p>
            {selectedNames.length > 0 ? (
              <p className="mt-4 text-sm text-ink">
                {selectedNames.join(" · ")}
              </p>
            ) : (
              <p className="mt-4 text-sm text-ink-muted">
                No subjects selected yet.
              </p>
            )}
            {state.error ? (
              <p
                role="alert"
                className="mt-4 border border-flare/40 bg-flare/10 px-3 py-2 text-sm text-ink"
              >
                {state.error}
              </p>
            ) : null}
          </div>

          <div className="lg:text-right">
            <p className="font-display text-4xl tracking-tight">
              {formatNaira(MOCK_FEE_NAIRA)}
            </p>
            <button
              type="button"
              disabled={!ready}
              onClick={() => setConfirmOpen(true)}
              className={`mt-4 w-full rounded-[3px] px-5 py-3.5 text-sm font-semibold tracking-wide transition-colors lg:w-auto lg:min-w-[14rem] ${
                ready
                  ? "bg-ink text-screen hover:bg-signal"
                  : "bg-ink/40 text-screen/70"
              }`}
            >
              Proceed to pay
            </button>
            {!ready ? (
              <p className="mt-2 text-xs text-ink-muted">
                Select 4 subjects to continue.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            aria-label="Close payment dialog"
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
            onClick={() => setConfirmOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pay-title"
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[4px] border border-line bg-screen shadow-[0_28px_70px_-36px_rgba(11,28,44,0.55)]"
          >
            <div className="border-b border-line bg-monitor px-5 py-4 text-signal-ink sm:px-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-signal">
                Checkout
              </p>
              <h2
                id="pay-title"
                className="font-display mt-1 text-2xl tracking-tight"
              >
                Confirm payment
              </h2>
            </div>

            <form action={action} className="space-y-5 px-5 py-5 sm:px-6">
              {selected.map((id) => (
                <input key={id} type="hidden" name="subjectIds" value={id} />
              ))}

              <div>
                <p className="text-sm text-ink-muted">Amount due</p>
                <p className="font-display mt-1 text-3xl tracking-tight">
                  {formatNaira(MOCK_FEE_NAIRA)}
                </p>
              </div>

              <ol className="space-y-2 border-t border-line pt-4">
                {selectedNames.map((name, index) => (
                  <li key={name} className="flex gap-3 text-sm">
                    <span className="font-mono text-signal">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {name}
                  </li>
                ))}
              </ol>

              {state.error ? (
                <p
                  role="alert"
                  className="border border-flare/40 bg-flare/10 px-3 py-2 text-sm text-ink"
                >
                  {state.error}
                </p>
              ) : null}

              <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-5">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="rounded-[3px] border border-line px-4 py-2.5 text-sm font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-screen"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-[3px] bg-signal px-4 py-2.5 text-sm font-semibold text-signal-ink transition-colors hover:bg-ink disabled:cursor-wait disabled:opacity-70"
                >
                  {pending
                    ? "Redirecting to Paystack…"
                    : `Pay ${formatNaira(MOCK_FEE_NAIRA)} with Paystack`}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
