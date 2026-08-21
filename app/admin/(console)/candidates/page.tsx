import type { Metadata } from "next";
import { CandidatesAttemptsTable } from "@/app/components/candidates-attempts-table";
import { listCandidatesWithProgress } from "@/lib/enrollment-db";
import { listSubjects } from "@/lib/subjects";

export const metadata: Metadata = {
  title: "Candidates",
};

export default async function AdminCandidatesPage() {
  let rows: Awaited<ReturnType<typeof listCandidatesWithProgress>> = [];
  let subjects: Awaited<ReturnType<typeof listSubjects>> = [];
  let loadError = false;

  try {
    [rows, subjects] = await Promise.all([
      listCandidatesWithProgress(),
      listSubjects(),
    ]);
  } catch {
    loadError = true;
  }

  const subjectNames = new Map(
    subjects.map((subject) => [subject.id, subject.name]),
  );

  const tableRows = rows.map((row) => ({
    id: row.id,
    fullName: row.fullName,
    jambReg: row.jambReg,
    paid: row.paid,
    subjectLabel:
      row.subjectIds.length > 0
        ? row.subjectIds.map((id) => subjectNames.get(id) ?? id).join(" · ")
        : "—",
    attemptsUsed: row.attemptsUsed,
    attempts: row.attempts,
    createdAt: row.createdAt,
  }));

  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-signal">
        Candidates
      </p>
      <h1 className="font-display mt-3 text-4xl leading-none tracking-tight sm:text-5xl">
        Registered seats
      </h1>
      <p className="mt-4 max-w-xl text-ink-muted leading-7">
        Every JAMB candidate who created a seat for the mock, with enrolled
        subjects and attempt history across subscriptions.
      </p>

      <p className="mt-8 text-sm text-ink-muted">
        {loadError
          ? "Database not ready"
          : rows.length === 0
            ? "No candidates yet"
            : `${rows.length} seat${rows.length === 1 ? "" : "s"}`}
      </p>

      {loadError ? (
        <div className="mt-4 border border-dashed border-line bg-field-deep/35 px-5 py-8">
          <p className="font-display text-2xl tracking-tight">
            Database not ready
          </p>
          <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">
            Run <span className="font-mono text-ink">npx prisma db push</span>{" "}
            to create enrollment and attempt tables.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-4 border border-dashed border-line bg-field-deep/35 px-5 py-8">
          <p className="font-display text-2xl tracking-tight">
            Waiting for the first seat
          </p>
          <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">
            Candidates who sign up with their JAMB number will appear here.
          </p>
        </div>
      ) : (
        <CandidatesAttemptsTable rows={tableRows} />
      )}
    </div>
  );
}
