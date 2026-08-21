import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE = "expertputme_admin";

export async function setAdminSession(userId: string) {
  const store = await cookies();
  store.set(COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getAdminSessionUserId() {
  const store = await cookies();
  const value = store.get(COOKIE)?.value;
  if (!value || value === "1") return null;
  return value;
}

export async function isAdminAuthenticated() {
  const userId = await getAdminSessionUserId();
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  return Boolean(user);
}

export async function getAdminSessionUser() {
  const userId = await getAdminSessionUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) return null;

  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE);
}
