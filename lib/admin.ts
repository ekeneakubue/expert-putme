import { cookies } from "next/headers";

const COOKIE = "expertputme_admin";

export async function setAdminSession() {
  const store = await cookies();
  store.set(COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  return store.get(COOKIE)?.value === "1";
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "admin123";
}
