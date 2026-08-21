"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useState } from "react";
import { registerCandidate, type RegisterState } from "@/app/actions/register";
import { PasswordField } from "@/app/components/password-field";
import { formatJambReg, isValidJambReg, normalizeJambReg } from "@/lib/validation";

const initial: RegisterState = {};

export function SignupForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(registerCandidate, initial);
  const [jambReg, setJambReg] = useState("");
  const jambOk = isValidJambReg(jambReg);
  const titleId = useId();
  const success = Boolean(state.success);

  useEffect(() => {
    if (!success) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [success]);

  function goToLogin() {
    router.push("/login");
  }

  return (
    <>
      <form
        action={action}
        className="overflow-hidden rounded-[4px] border border-line bg-screen shadow-[0_28px_70px_-36px_rgba(11,28,44,0.55)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line bg-monitor px-6 py-4 text-signal-ink sm:px-8">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-signal">
              Candidate desk
            </p>
            <h2 className="font-display mt-1 text-2xl tracking-tight">
              Sign up with your JAMB number
            </h2>
          </div>
          <p className="font-mono text-[11px] text-signal-ink/60">
            2026/<span className="text-flare">MOCK</span>
          </p>
        </div>

        <div className="space-y-5 px-6 py-6 sm:px-8">
          <label className="block">
            <span className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
                JAMB registration number
              </span>
              {jambReg.length > 0 ? (
                <span
                  className={`text-[11px] font-medium ${jambOk ? "text-signal" : "text-flare"}`}
                >
                  {jambOk ? "Format matches" : `${jambReg.length}/12`}
                </span>
              ) : null}
            </span>
            <input
              name="jambReg"
              value={formatJambReg(jambReg)}
              onChange={(event) => setJambReg(normalizeJambReg(event.target.value))}
              autoComplete="username"
              spellCheck={false}
              inputMode="text"
              placeholder="1234567890AB"
              aria-invalid={jambReg.length > 0 && !jambOk}
              maxLength={13}
              className="mt-2 w-full rounded-[3px] border border-line bg-field/70 px-3 py-3 font-mono text-[1.05rem] tracking-[0.18em] text-ink outline-none placeholder:tracking-[0.18em] placeholder:text-ink-muted/45 focus:border-signal focus:bg-screen"
              required
            />
            <span className="mt-1.5 block text-xs text-ink-muted">
              10 digits + 2 letters, exactly as printed on your JAMB slip.
            </span>
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
                Full name
              </span>
              <input
                name="fullName"
                autoComplete="name"
                placeholder="As on your JAMB profile"
                className="mt-2 w-full rounded-[3px] border border-line bg-field/70 px-3 py-3 text-[0.95rem] outline-none placeholder:text-ink-muted/45 focus:border-signal focus:bg-screen"
                required
              />
            </label>

            <label className="block">
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
                Phone number
              </span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="0803 000 0000"
                className="mt-2 w-full rounded-[3px] border border-line bg-field/70 px-3 py-3 text-[0.95rem] outline-none placeholder:text-ink-muted/45 focus:border-signal focus:bg-screen"
                required
              />
            </label>
          </div>

          <PasswordField
            autoComplete="new-password"
            placeholder="At least 6 characters"
            hint="You will use this with your JAMB number to log in later."
          />

          {state.error ? (
            <p
              role="alert"
              className="border border-flare/40 bg-flare/10 px-3 py-2 text-sm text-ink"
            >
              {state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending || success}
            className="flex w-full items-center justify-center rounded-[3px] bg-signal px-4 py-3.5 text-sm font-semibold tracking-wide text-signal-ink transition-colors hover:bg-ink disabled:cursor-wait disabled:opacity-70"
          >
            {pending ? "Creating seat…" : "Sign Up"}
          </button>

          <p className="text-center text-xs leading-5 text-ink-muted">
            Already registered? Log in with your JAMB number and password.
          </p>
        </div>
      </form>

      {success ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]" />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[4px] border border-line bg-screen shadow-[0_28px_70px_-36px_rgba(11,28,44,0.55)]"
          >
            <div className="border-b border-line bg-monitor px-5 py-4 text-signal-ink sm:px-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-signal">
                Registration
              </p>
              <h2
                id={titleId}
                className="font-display mt-1 text-2xl tracking-tight"
              >
                Registration successful
              </h2>
            </div>
            <div className="px-5 py-5 sm:px-6">
              <p className="text-ink-muted leading-7">
                Your seat has been created. Log in with your JAMB registration
                number and password to open your candidate desk.
              </p>
              <button
                type="button"
                onClick={goToLogin}
                className="mt-6 flex w-full items-center justify-center rounded-[3px] bg-signal px-4 py-3 text-sm font-semibold text-signal-ink transition-colors hover:bg-ink"
              >
                Continue to login
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
