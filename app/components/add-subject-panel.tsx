"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { addSubject, type AddSubjectState } from "@/app/actions/subjects";

const initial: AddSubjectState = {};

export function AddSubjectPanel() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(addSubject, initial);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">Manage the subject pool for the mock.</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-[3px] bg-ink px-4 py-2.5 text-sm font-semibold text-screen transition-colors hover:bg-signal"
        >
          Add subject
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-[4px] border border-line bg-screen shadow-[0_28px_70px_-36px_rgba(11,28,44,0.55)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line bg-monitor px-5 py-4 text-signal-ink sm:px-6">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-signal">
                  Subjects
                </p>
                <h2 id={titleId} className="font-display mt-1 text-2xl tracking-tight">
                  Add subject
                </h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-[3px] px-2 py-1 text-sm text-signal-ink/70 transition-colors hover:bg-signal-ink/10 hover:text-signal-ink"
              >
                Close
              </button>
            </div>

            <form action={action} className="space-y-5 px-5 py-5 sm:px-6">
              <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
                  Subject name
                </span>
                <input
                  name="name"
                  placeholder="Geography"
                  className="mt-2 w-full rounded-[3px] border border-line bg-field/70 px-3 py-2.5 outline-none focus:border-signal focus:bg-screen"
                  required
                  autoFocus
                />
              </label>

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
                  onClick={() => setOpen(false)}
                  className="rounded-[3px] border border-line px-4 py-2.5 text-sm font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-screen"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-[3px] bg-signal px-4 py-2.5 text-sm font-semibold text-signal-ink transition-colors hover:bg-ink disabled:cursor-wait disabled:opacity-70"
                >
                  {pending ? "Saving…" : "Save subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
