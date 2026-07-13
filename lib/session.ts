// ════════════════════════════════════════════════════════════
//  Сессия владельца — подписанная httpOnly cookie, без внешних либ.
//  Формат значения: "<psychId>.<hmac>" (HMAC-SHA256 по SESSION_SECRET).
//  Сейчас сессию выдаёт dev-логин по handle; позже сюда же сядет
//  Telegram initData → тот же setSessionCookie(psychId).
// ════════════════════════════════════════════════════════════
import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "ryadom_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 дней

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) {
    throw new Error(
      "SESSION_SECRET не задан в .env.local (см. .env.example). openssl rand -hex 32"
    );
  }
  return s;
}

function sign(psychId: string): string {
  const sig = createHmac("sha256", secret()).update(psychId).digest("hex");
  return `${psychId}.${sig}`;
}

function verify(value: string): string | null {
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return null;
  const psychId = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const expected = createHmac("sha256", secret()).update(psychId).digest("hex");
  // постоянное по времени сравнение
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return psychId;
}

// Читает и валидирует cookie. Возвращает psychId или null.
export async function getSessionPsychId(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  try {
    return verify(raw);
  } catch {
    return null;
  }
}

export async function setSessionCookie(psychId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, sign(psychId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
