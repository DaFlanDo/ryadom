// ════════════════════════════════════════════════════════════
//  Хэши паролей на scrypt из node:crypto, без внешних библиотек.
//  Формат: "scrypt$N$r$p$<соль base64>$<хэш base64>" — параметры
//  лежат рядом с хэшем, их можно поднять позже, не ломая старые пароли.
// ════════════════════════════════════════════════════════════
import "server-only";
import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from "crypto";

const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;

function scrypt(password: string, salt: Buffer, keylen: number, opts: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scryptCb(password, salt, keylen, opts, (err, key) => (err ? reject(err) : resolve(key)))
  );
}

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

export function passwordError(password: string): string | null {
  if (password.length < PASSWORD_MIN) return `Пароль — не короче ${PASSWORD_MIN} символов`;
  if (password.length > PASSWORD_MAX) return "Слишком длинный пароль";
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEYLEN, { N, r: R, p: P });
  return ["scrypt", N, R, P, salt.toString("base64"), key.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, saltB64, keyB64] = parts;
  const expected = Buffer.from(keyB64, "base64");
  const key = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });
  return key.length === expected.length && timingSafeEqual(key, expected);
}

// Хэш-пустышка: для несуществующего email проверяем пароль против него,
// чтобы ответ по времени не выдавал, зарегистрирован ли адрес.
let dummyHash: Promise<string> | null = null;
export function dummyPasswordHash(): Promise<string> {
  dummyHash ??= hashPassword(randomBytes(16).toString("hex"));
  return dummyHash;
}
