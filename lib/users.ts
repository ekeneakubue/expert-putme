import { UserRole, type User } from "@prisma/client";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export type PublicUser = Omit<User, "passwordHash">;

export async function listUsers(): Promise<PublicUser[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return users.map(({ passwordHash: _passwordHash, ...user }) => user);
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
}

export async function authenticateUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return null;
  }

  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}) {
  const name = input.name.trim().replace(/\s+/g, " ");
  const email = input.email.trim().toLowerCase();
  const role = input.role ?? UserRole.STAFF;

  if (name.length < 2 || name.length > 80) {
    return {
      ok: false as const,
      error: "Enter a name between 2 and 80 characters.",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false as const, error: "Enter a valid email address." };
  }

  if (input.password.length < 6 || input.password.length > 72) {
    return {
      ok: false as const,
      error: "Password must be at least 6 characters.",
    };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      ok: false as const,
      error: "A user with that email already exists.",
    };
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      role,
      passwordHash: hashPassword(input.password),
    },
  });

  const { passwordHash: _passwordHash, ...publicUser } = user;
  return { ok: true as const, user: publicUser };
}
