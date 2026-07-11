import { scryptSync, timingSafeEqual } from "node:crypto";

export function verifyPassword(password: string, digest: string): boolean {
  const [salt, expectedHex] = digest.split(":");
  if (!salt || !expectedHex) return false;
  const expected = Buffer.from(expectedHex, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
