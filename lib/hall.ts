import { promises as fs } from "fs";
import path from "path";

export type HallState = {
  paperOpen: boolean;
  updatedAt: string;
};

const STORE_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(STORE_DIR, "hall.json");

const defaultState: HallState = {
  paperOpen: false,
  updatedAt: new Date(0).toISOString(),
};

async function readHall(): Promise<HallState> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return { ...defaultState, ...(JSON.parse(raw) as HallState) };
  } catch {
    return { ...defaultState };
  }
}

async function writeHall(state: HallState) {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(state, null, 2), "utf8");
}

export async function getHallState() {
  return readHall();
}

export async function setPaperOpen(paperOpen: boolean) {
  const next: HallState = {
    paperOpen,
    updatedAt: new Date().toISOString(),
  };
  await writeHall(next);
  return next;
}
