import { promises as fs } from "fs";
import path from "path";
import { findSubject, setSubjectQuestionCount } from "@/lib/subjects";

export type QuestionRecord = {
  id: string;
  subjectId: string;
  question: string;
  options: [string, string, string, string];
  answer: "A" | "B" | "C" | "D";
  createdAt: string;
};

type QuestionStore = {
  questions: QuestionRecord[];
};

const STORE_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(STORE_DIR, "questions.json");

async function readStore(): Promise<QuestionStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as {
      questions?: Array<Partial<QuestionRecord> & { subjectCode?: string }>;
    };
    if (!parsed || !Array.isArray(parsed.questions)) return { questions: [] };

    return {
      questions: parsed.questions
        .map((question) => {
          const subjectId = question.subjectId ?? question.subjectCode;
          if (
            !question.id ||
            !subjectId ||
            !question.question ||
            !question.options ||
            !question.answer
          ) {
            return null;
          }
          return {
            id: question.id,
            subjectId,
            question: question.question,
            options: question.options,
            answer: question.answer,
            createdAt: question.createdAt ?? new Date().toISOString(),
          } satisfies QuestionRecord;
        })
        .filter((question): question is QuestionRecord => question !== null),
    };
  } catch {
    return { questions: [] };
  }
}

async function writeStore(store: QuestionStore) {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export async function listQuestions() {
  const store = await readStore();
  return store.questions;
}

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function parseAnswer(value: string): QuestionRecord["answer"] | null {
  const cleaned = value.trim().toUpperCase();
  if (cleaned === "A" || cleaned === "B" || cleaned === "C" || cleaned === "D") {
    return cleaned;
  }

  const asIndex = Number(cleaned);
  if (asIndex >= 1 && asIndex <= 4) {
    return (["A", "B", "C", "D"] as const)[asIndex - 1];
  }

  return null;
}

export function parseQuestionsCsv(csvText: string) {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return {
      ok: false as const,
      error: "CSV needs a header row and at least one question.",
    };
  }

  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  const questionIndex = headers.findIndex((header) =>
    ["question", "prompt", "stem"].includes(header),
  );
  const optionIndexes = [
    headers.findIndex((header) => ["optiona", "opta", "a"].includes(header)),
    headers.findIndex((header) => ["optionb", "optb", "b"].includes(header)),
    headers.findIndex((header) => ["optionc", "optc", "c"].includes(header)),
    headers.findIndex((header) => ["optiond", "optd", "d"].includes(header)),
  ];
  const answerIndex = headers.findIndex((header) =>
    ["answer", "correct", "correctanswer", "key"].includes(header),
  );

  if (
    questionIndex < 0 ||
    optionIndexes.some((index) => index < 0) ||
    answerIndex < 0
  ) {
    return {
      ok: false as const,
      error:
        "CSV headers must include question, optionA, optionB, optionC, optionD, and answer.",
    };
  }

  const rows: Omit<QuestionRecord, "id" | "subjectId" | "createdAt">[] = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const cells = splitCsvLine(lines[lineIndex]);
    const question = cells[questionIndex] ?? "";
    const options = optionIndexes.map((index) => cells[index] ?? "") as [
      string,
      string,
      string,
      string,
    ];
    const answer = parseAnswer(cells[answerIndex] ?? "");

    if (!question || options.some((option) => !option) || !answer) {
      return {
        ok: false as const,
        error: `Row ${lineIndex + 1} is incomplete or has an invalid answer.`,
      };
    }

    rows.push({ question, options, answer });
  }

  return { ok: true as const, rows };
}

export async function importQuestionsFromCsv(input: {
  subjectId: string;
  csvText: string;
}) {
  const subject = await findSubject(input.subjectId);
  if (!subject) {
    return { ok: false as const, error: "Select a valid subject." };
  }

  const parsed = parseQuestionsCsv(input.csvText);
  if (!parsed.ok) return parsed;

  const store = await readStore();
  const createdAt = new Date().toISOString();
  const imported = parsed.rows.map((row, index) => ({
    id: `${input.subjectId}-${Date.now()}-${index}`,
    subjectId: input.subjectId,
    ...row,
    createdAt,
  }));

  const nextQuestions = [
    ...store.questions.filter((question) => question.subjectId !== input.subjectId),
    ...imported,
  ];

  await writeStore({ questions: nextQuestions });
  await setSubjectQuestionCount(input.subjectId, imported.length);

  return {
    ok: true as const,
    count: imported.length,
    subjectName: subject.name,
  };
}
