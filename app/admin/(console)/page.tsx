import type { Metadata } from "next";
import Link from "next/link";
import {
  openMockPaper,
  sealMockPaper,
} from "@/app/actions/admin";
import { listAccounts } from "@/lib/accounts";
import { formatWhen } from "@/lib/format";
import { getHallState } from "@/lib/hall";

export const metadata: Metadata = {
  title: "Overview",
};

export default async function AdminOverviewPage() {
  let accountCount = 0;
  try {
    const accounts = await listAccounts();
    accountCount = accounts.length;
  } catch {
    accountCount = 0;
  }

  const hall = await getHallState();

  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-signal">
        Overview
      </p>
      <h1 className="font-display mt-3 text-4xl leading-none tracking-tight sm:text-5xl">
        Hall control
      </h1>
      <p className="mt-4 max-w-xl text-ink-muted leading-7">
        Snapshot of seats, paper status, and quick controls for the 2026 mock.
      </p>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="border-t border-line pt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">
            Candidates
          </p>
          <p className="font-display mt-2 text-4xl tracking-tight">
            {accountCount}
          </p>
        </div>
        <div className="border-t border-line pt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">
            Paper status
          </p>
          <p className="font-display mt-2 text-4xl tracking-tight">
            {hall.paperOpen ? "Open" : "Sealed"}
          </p>
        </div>
        <div className="border-t border-line pt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">
            Attempts
          </p>
          <p className="font-display mt-2 text-4xl tracking-tight">0</p>
        </div>
      </section>

      <section className="mt-10 overflow-hidden rounded-[4px] border border-line bg-screen">
        <div className="flex flex-col gap-4 border-b border-line bg-monitor px-6 py-5 text-signal-ink sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-signal">
              Mock engine
            </p>
            <h2 className="font-display mt-1 text-2xl tracking-tight">
              {hall.paperOpen ? "Paper is live" : "Paper is sealed"}
            </h2>
            <p className="mt-1 text-sm text-signal-ink/65">
              Last changed {formatWhen(hall.updatedAt)}
            </p>
          </div>
          <form action={hall.paperOpen ? sealMockPaper : openMockPaper}>
            <button
              type="submit"
              className={`rounded-[3px] px-4 py-3 text-sm font-semibold transition-colors ${
                hall.paperOpen
                  ? "border border-flare/50 bg-flare/15 text-signal-ink hover:bg-flare/25"
                  : "bg-signal text-signal-ink hover:bg-screen hover:text-ink"
              }`}
            >
              {hall.paperOpen ? "Seal paper" : "Open paper"}
            </button>
          </form>
        </div>
        <p className="px-6 py-5 text-sm leading-6 text-ink-muted sm:px-8">
          Opening or sealing the paper is optional hall control. Candidates can
          start the mock as soon as payment succeeds.
        </p>
      </section>

      <section className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/admin/candidates"
          className="rounded-[3px] border border-line bg-screen px-4 py-2.5 text-sm font-medium transition-colors hover:border-ink hover:bg-ink hover:text-screen"
        >
          View candidates
        </Link>
        <Link
          href="/admin/subjects"
          className="rounded-[3px] border border-line bg-screen px-4 py-2.5 text-sm font-medium transition-colors hover:border-ink hover:bg-ink hover:text-screen"
        >
          Manage subjects
        </Link>
        <Link
          href="/admin/settings"
          className="rounded-[3px] border border-line bg-screen px-4 py-2.5 text-sm font-medium transition-colors hover:border-ink hover:bg-ink hover:text-screen"
        >
          Settings
        </Link>
      </section>
    </div>
  );
}
