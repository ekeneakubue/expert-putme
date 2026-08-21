import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type SubjectRecord = {
  id: string;
  name: string;
  questionCount: number;
};

const STORE_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(STORE_DIR, "subjects.json");

const defaults: SubjectRecord[] = [
  { id: "sub-eng", name: "Use of English", questionCount: 0 },
  { id: "sub-mth", name: "Mathematics", questionCount: 0 },
  { id: "sub-phy", name: "Physics", questionCount: 0 },
  { id: "sub-chm", name: "Chemistry", questionCount: 0 },
  { id: "sub-bio", name: "Biology", questionCount: 0 },
  { id: "sub-gov", name: "Government", questionCount: 0 },
  { id: "sub-eco", name: "Economics", questionCount: 0 },
  { id: "sub-lit", name: "Literature", questionCount: 0 },
];

function normalizeSubject(
  subject: Partial<SubjectRecord> & Pick<SubjectRecord, "name">,
): SubjectRecord {
  return {
    id: subject.id || randomUUID(),
    name: subject.name,
    questionCount: Math.max(0, Number(subject.questionCount) || 0),
  };
}

async function readSubjects(): Promise<SubjectRecord[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<SubjectRecord>[];
    if (!Array.isArray(parsed) || parsed.length === 0) return defaults;
    return parsed
      .filter((subject): subject is Partial<SubjectRecord> & Pick<SubjectRecord, "name"> =>
        Boolean(subject?.name),
      )
      .map(normalizeSubject);
  } catch {
    return defaults;
  }
}

async function writeSubjects(subjects: SubjectRecord[]) {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(subjects, null, 2), "utf8");
}

export async function listSubjects() {
  return readSubjects();
}

export async function findSubject(id: string) {
  const subjects = await readSubjects();
  return subjects.find((subject) => subject.id === id) ?? null;
}

export async function setSubjectQuestionCount(id: string, questionCount: number) {
  const subjects = await readSubjects();
  const next = subjects.map((subject) =>
    subject.id === id
      ? { ...subject, questionCount: Math.max(0, questionCount) }
      : subject,
  );
  await writeSubjects(next);
}

export async function createSubject(input: {
  name: string;
}) {
  const subjects = await readSubjects();
  const name = input.name.trim().replace(/\s+/g, " ");

  if (name.length < 2 || name.length > 60) {
    return {
      ok: false as const,
      error: "Enter a subject name between 2 and 60 characters.",
    };
  }

  if (subjects.some((subject) => subject.name.toLowerCase() === name.toLowerCase())) {
    return {
      ok: false as const,
      error: "A subject with that name already exists.",
    };
  }

  const next: SubjectRecord = {
    id: randomUUID(),
    name,
    questionCount: 0,
  };

  await writeSubjects([...subjects, next]);
  return { ok: true as const, subject: next };
}
