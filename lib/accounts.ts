import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export type AccountRecord = {
  fullName: string;
  jambReg: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
};

export type PublicAccount = Omit<AccountRecord, "passwordHash">;

export async function findAccount(jambReg: string) {
  const candidate = await prisma.candidate.findUnique({
    where: { jambReg },
  });
  if (!candidate) return null;

  return {
    fullName: candidate.fullName,
    jambReg: candidate.jambReg,
    phone: candidate.phone,
    passwordHash: candidate.passwordHash,
    createdAt: candidate.createdAt.toISOString(),
  } satisfies AccountRecord;
}

export async function createAccount(input: {
  fullName: string;
  jambReg: string;
  phone: string;
  password: string;
}) {
  const existing = await prisma.candidate.findUnique({
    where: { jambReg: input.jambReg },
  });

  if (existing) {
    return {
      ok: false as const,
      error: "This JAMB number already has a seat. Log in instead.",
    };
  }

  const candidate = await prisma.candidate.create({
    data: {
      fullName: input.fullName,
      jambReg: input.jambReg,
      phone: input.phone,
      passwordHash: hashPassword(input.password),
    },
  });

  return {
    ok: true as const,
    account: {
      fullName: candidate.fullName,
      jambReg: candidate.jambReg,
      phone: candidate.phone,
      passwordHash: candidate.passwordHash,
      createdAt: candidate.createdAt.toISOString(),
    } satisfies AccountRecord,
  };
}

export async function listAccounts(): Promise<PublicAccount[]> {
  const candidates = await prisma.candidate.findMany({
    orderBy: { createdAt: "desc" },
  });

  return candidates.map((candidate) => ({
    fullName: candidate.fullName,
    jambReg: candidate.jambReg,
    phone: candidate.phone,
    createdAt: candidate.createdAt.toISOString(),
  }));
}

export async function authenticateAccount(jambReg: string, password: string) {
  const account = await findAccount(jambReg);
  if (!account || !verifyPassword(password, account.passwordHash)) {
    return null;
  }
  return account;
}

export async function resetAccountPassword(input: {
  jambReg: string;
  phone: string;
  password: string;
}) {
  const account = await findAccount(input.jambReg);
  if (!account || account.phone !== input.phone) {
    return {
      ok: false as const,
      error: "No seat matches that JAMB number and phone.",
    };
  }

  const candidate = await prisma.candidate.update({
    where: { jambReg: input.jambReg },
    data: { passwordHash: hashPassword(input.password) },
  });

  return {
    ok: true as const,
    account: {
      fullName: candidate.fullName,
      jambReg: candidate.jambReg,
      phone: candidate.phone,
      passwordHash: candidate.passwordHash,
      createdAt: candidate.createdAt.toISOString(),
    } satisfies AccountRecord,
  };
}
