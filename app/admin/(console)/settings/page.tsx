import type { Metadata } from "next";
import {
  openMockPaper,
  sealMockPaper,
} from "@/app/actions/admin";
import { formatWhen } from "@/lib/format";
import { getHallState } from "@/lib/hall";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function AdminSettingsPage() {
  const hall = await getHallState();

  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-signal">
        Settings
      </p>
      <h1 className="font-display mt-3 text-4xl leading-none tracking-tight sm:text-5xl">
        Hall settings
      </h1>
      <p className="mt-4 max-w-xl text-ink-muted leading-7">
        Configure the mock engine and how the control room authenticates.
      </p>

      <section className="mt-10 border border-line bg-screen">
        <div className="border-b border-line px-5 py-4 sm:px-6">
          <h2 className="font-display text-2xl tracking-tight">Mock paper</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Current status:{" "}
            <span className="font-medium text-ink">
              {hall.paperOpen ? "Open" : "Sealed"}
            </span>
            <span className="text-ink-muted">
              {" "}
              · last changed {formatWhen(hall.updatedAt)}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3 px-5 py-5 sm:px-6">
          <form action={openMockPaper}>
            <button
              type="submit"
              disabled={hall.paperOpen}
              className="rounded-[3px] bg-signal px-4 py-2.5 text-sm font-semibold text-signal-ink transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-45"
            >
              Open paper
            </button>
          </form>
          <form action={sealMockPaper}>
            <button
              type="submit"
              disabled={!hall.paperOpen}
              className="rounded-[3px] border border-line px-4 py-2.5 text-sm font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-screen disabled:cursor-not-allowed disabled:opacity-45"
            >
              Seal paper
            </button>
          </form>
        </div>
      </section>

      <section className="mt-6 border border-line bg-screen">
        <div className="px-5 py-5 sm:px-6">
          <h2 className="font-display text-2xl tracking-tight">Admin password</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-ink-muted">
            Set <span className="font-mono text-ink">ADMIN_PASSWORD</span> in
            your environment file to change the control room password. Until
            then, the default local password is used.
          </p>
        </div>
      </section>

      <section className="mt-6 border border-line bg-screen">
        <div className="px-5 py-5 sm:px-6">
          <h2 className="font-display text-2xl tracking-tight">Session</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">
                Series
              </dt>
              <dd className="mt-1">2026 CBT mock</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">
                Paper format
              </dt>
              <dd className="mt-1">180 questions · 2 hours · 4 subjects</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
