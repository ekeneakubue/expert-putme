import type { Metadata } from "next";
import Link from "next/link";
import { UploadQuestionsPanel } from "@/app/components/upload-questions-panel";
import { listQuestions } from "@/lib/questions";
import { listSubjects } from "@/lib/subjects";

export const metadata: Metadata = {
  title: "Questions",
};

export default async function AdminQuestionsPage() {
  const [subjects, questions] = await Promise.all([
    listSubjects(),
    listQuestions(),
  ]);

  const subjectNames = new Map(subjects.map((subject) => [subject.id, subject.name]));

  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-signal">
        Questions
      </p>
      <h1 className="font-display mt-3 text-4xl leading-none tracking-tight sm:text-5xl">
        Question bank
      </h1>
      <p className="mt-4 max-w-xl text-ink-muted leading-7">
        Build and review CBT items by subject. Questions added here will feed
        the mock paper.
      </p>

      <UploadQuestionsPanel
        subjects={subjects.map((subject) => ({
          id: subject.id,
          name: subject.name,
        }))}
        questionCount={questions.length}
      />

      {questions.length === 0 ? (
        <div className="mt-6 border border-dashed border-line bg-field-deep/35 px-5 py-8">
          <p className="font-display text-2xl tracking-tight">
            Waiting for the first item
          </p>
          <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">
            Choose a subject and upload a CSV to seed the bank.
          </p>
          <Link
            href="/admin/subjects"
            className="mt-5 inline-flex text-sm font-medium text-signal underline-offset-2 hover:underline"
          >
            Go to subjects
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto border border-line bg-screen">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-line bg-field-deep/50 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium sm:px-5">Subject</th>
                <th className="px-4 py-3 font-medium sm:px-5">Question</th>
                <th className="px-4 py-3 font-medium sm:px-5">Answer</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question) => (
                <tr
                  key={question.id}
                  className="border-b border-line last:border-b-0"
                >
                  <td className="px-4 py-3.5 text-ink-muted sm:px-5">
                    {subjectNames.get(question.subjectId) ?? question.subjectId}
                  </td>
                  <td className="px-4 py-3.5 font-medium sm:px-5">
                    <span className="line-clamp-2">{question.question}</span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-ink-muted sm:px-5">
                    {question.answer}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
