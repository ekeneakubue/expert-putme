export const JAMB_REG_PATTERN = /^\d{10}[A-Z]{2}$/;

export function normalizeJambReg(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 12);
}

export function isValidJambReg(value: string) {
  return JAMB_REG_PATTERN.test(normalizeJambReg(value));
}

export function formatJambReg(value: string) {
  const normalized = normalizeJambReg(value);
  if (normalized.length <= 10) return normalized;
  return `${normalized.slice(0, 10)} ${normalized.slice(10)}`;
}

export function isValidFullName(value: string) {
  const name = value.trim().replace(/\s+/g, " ");
  if (name.length < 3 || name.length > 80) return false;
  if (!name.includes(" ")) return false;
  return /^[A-Za-z][A-Za-z.'\- ]+$/.test(name);
}

export function isValidNigerianPhone(value: string) {
  const compact = value.replace(/[\s-]/g, "");
  return /^(?:\+234|234|0)[789]\d{9}$/.test(compact);
}

export function isValidPassword(value: string) {
  return value.length >= 6 && value.length <= 72;
}

export function normalizePhone(value: string) {
  const compact = value.replace(/[\s-]/g, "");
  if (compact.startsWith("+234")) return `0${compact.slice(4)}`;
  if (compact.startsWith("234")) return `0${compact.slice(3)}`;
  return compact;
}
