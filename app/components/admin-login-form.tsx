"use client";

import { useActionState } from "react";
import { loginAdmin, type AdminLoginState } from "@/app/actions/admin";
import { PasswordField } from "@/app/components/password-field";

const initial: AdminLoginState = {};

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, initial);

  return (
    <form
      action={action}
      className="overflow-hidden rounded-[4px] border border-line bg-screen shadow-[0_28px_70px_-36px_rgba(11,28,44,0.55)]"
    >
      <div className="flex items-start justify-between gap-4 border-b border-line bg-monitor px-6 py-4 text-signal-ink sm:px-8">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-signal">
            Control room
          </p>
          <h2 className="font-display mt-1 text-2xl tracking-tight">
            Admin sign in
          </h2>
        </div>
        <p className="font-mono text-[11px] text-signal-ink/60">
          2026/<span className="text-flare">OPS</span>
        </p>
      </div>

      <div className="space-y-5 px-6 py-6 sm:px-8">
        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
            Email
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="mt-2 w-full rounded-[3px] border border-line bg-field/70 px-3 py-2.5 outline-none focus:border-signal focus:bg-screen"
          />
        </label>

        <PasswordField
          autoComplete="current-password"
          placeholder="Password"
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
          {pending ? "Checking…" : "Enter control room"}
        </button>
      </div>
    </form>
  );
}
