// ════════════════════════════════════════════════════════════
//  Сессия владельца — подписанная httpOnly cookie, без внешних либ.
//  Формат значения: "<psychId>.<истекает, unix-секунды>.<hmac>"
//  (HMAC-SHA256 по SESSION_SECRET). Срок зашит в подписанную часть:
//  украденная cookie перестаёт работать через 30 дней, даже если
//  браузер её не удалил.
// ════════════════════════════════════════════════════════════
import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "ryadom_session";
export const SESSION_TTL = 60 * 60 * 24 * 30; // 30 дней

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "SESSION_SECRET не задан или короче 32 символов (см. .env.example). openssl rand -hex 32"
    );
  }
  return s;
}

const now = () => Math.floor(Date.now() / 1000);

function hmac(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("hex");
}

export function signSession(psychId: string, key = secret(), issuedAt = now()): string {
  const payload = `${psychId}.${issuedAt + SESSION_TTL}`;
  return `${payload}.${hmac(payload, key)}`;
}

// Возвращает psychId, если подпись верна и срок не истёк, иначе null.
export function verifySession(value: string, key = secret(), at = now()): string | null {
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [psychId, expires, sig] = parts;
  const expected = Buffer.from(hmac(`${psychId}.${expires}`, key));
  const got = Buffer.from(sig);
  // постоянное по времени сравнение
  if (got.length !== expected.length || !timingSafeEqual(got, expected)) return null;
  if (!/^\d+$/.test(expires) || Number(expires) < at) return null;
  return psychId || null;
}

// Читает и валидирует cookie. Возвращает psychId или null.
export async function getSessionPsychId(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  try {
    return verifySession(raw);
  } catch {
    return null;
  }
}

export async function setSessionCookie(psychId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, signSession(psychId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
