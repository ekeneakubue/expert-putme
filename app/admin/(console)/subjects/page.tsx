import type { Metadata } from "next";
import { AddSubjectPanel } from "@/app/components/add-subject-panel";
import { listSubjects } from "@/lib/subjects";

export const metadata: Metadata = {
  title: "Subjects",
};

export default async function AdminSubjectsPage() {
  const subjects = await listSubjects();

  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-signal">
        Subjects
      </p>
      <h1 className="font-display mt-3 text-4xl leading-none tracking-tight sm:text-5xl">
        Exam subjects
      </h1>
      <p className="mt-4 max-w-xl text-ink-muted leading-7">
        Manage exam subjects candidates can choose for their mock paper.
      </p>

      <AddSubjectPanel />

      <div className="mt-6 overflow-x-auto border border-line bg-screen">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-field-deep/50 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-medium sm:px-5">Subject</th>
              <th className="px-4 py-3 font-medium sm:px-5">Questions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr
                key={subject.id}
                className="border-b border-line last:border-b-0"
              >
                <td className="px-4 py-3.5 font-medium sm:px-5">{subject.name}</td>
                <td className="px-4 py-3.5 font-mono text-ink-muted sm:px-5">
                  {subject.questionCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
