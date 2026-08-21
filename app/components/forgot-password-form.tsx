"use client";

import { useActionState, useState } from "react";
import {
  resetCandidatePassword,
  type ForgotPasswordState,
} from "@/app/actions/forgot-password";
import { PasswordField } from "@/app/components/password-field";
import { formatJambReg, isValidJambReg, normalizeJambReg } from "@/lib/validation";

const initial: ForgotPasswordState = {};

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(resetCandidatePassword, initial);
  const [jambReg, setJambReg] = useState("");
  const jambOk = isValidJambReg(jambReg);

  return (
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
            Reset your password
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
          <span className="mt-1.5 block text-xs text-ink-muted">
            Use the same phone number from registration.
          </span>
        </label>

        <PasswordField
          autoComplete="new-password"
          placeholder="New password (min. 6 characters)"
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
          disabled={pending}
          className="flex w-full items-center justify-center rounded-[3px] bg-signal px-4 py-3.5 text-sm font-semibold tracking-wide text-signal-ink transition-colors hover:bg-ink disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? "Saving new password…" : "Reset password"}
        </button>
      </div>
    </form>
  );
}
