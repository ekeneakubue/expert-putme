import { listQuestions, type QuestionRecord } from "@/lib/questions";
import { listSubjects } from "@/lib/subjects";

export const MOCK_DURATION_MINUTES = 60;

export type ExamQuestion = {
  id: string;
  subjectId: string;
  subjectName: string;
  question: string;
  options: [string, string, string, string];
};

export type ExamPaper = {
  questions: ExamQuestion[];
  subjectNames: string[];
  durationMinutes: number;
};

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [next[index], next[swap]] = [next[swap], next[index]];
  }
  return next;
}

export async function buildExamPaper(subjectIds: string[]): Promise<ExamPaper> {
  const uniqueIds = [...new Set(subjectIds)].slice(0, 4);
  const [subjects, allQuestions] = await Promise.all([
    listSubjects(),
    listQuestions(),
  ]);

  const subjectNameById = new Map(
    subjects.map((subject) => [subject.id, subject.name]),
  );

  const subjectNames = uniqueIds.map(
    (id) => subjectNameById.get(id) ?? "Subject",
  );

  const bySubject = uniqueIds.flatMap((subjectId) => {
    const pool = allQuestions.filter(
      (question) => question.subjectId === subjectId,
    );
    return shuffle(pool).map((question) =>
      toExamQuestion(question, subjectNameById),
    );
  });

  return {
    questions: bySubject,
    subjectNames,
    durationMinutes: MOCK_DURATION_MINUTES,
  };
}

function toExamQuestion(
  question: QuestionRecord,
  subjectNameById: Map<string, string>,
): ExamQuestion {
  return {
    id: question.id,
    subjectId: question.subjectId,
    subjectName: subjectNameById.get(question.subjectId) ?? "Subject",
    question: question.question,
    options: question.options,
  };
}

export async function scoreExam(
  answers: Record<string, "A" | "B" | "C" | "D" | "">,
) {
  const allQuestions = await listQuestions();
  const byId = new Map(allQuestions.map((question) => [question.id, question]));

  let correct = 0;
  let attempted = 0;
  const total = Object.keys(answers).length;

  const breakdown = new Map<string, { correct: number; total: number }>();

  for (const [questionId, choice] of Object.entries(answers)) {
    const question = byId.get(questionId);
    if (!question) continue;

    const bucket = breakdown.get(question.subjectId) ?? {
      correct: 0,
      total: 0,
    };
    bucket.total += 1;

    if (choice) {
      attempted += 1;
      if (choice === question.answer) {
        correct += 1;
        bucket.correct += 1;
      }
    }

    breakdown.set(question.subjectId, bucket);
  }

  const subjects = await listSubjects();
  const subjectNameById = new Map(
    subjects.map((subject) => [subject.id, subject.name]),
  );

  return {
    correct,
    attempted,
    total,
    percent: total === 0 ? 0 : Math.round((correct / total) * 100),
    subjects: [...breakdown.entries()].map(([subjectId, stats]) => ({
      subjectId,
      name: subjectNameById.get(subjectId) ?? "Subject",
      correct: stats.correct,
      total: stats.total,
    })),
  };
}
