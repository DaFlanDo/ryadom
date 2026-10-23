// Вход по email и паролю. Ответ одинаковый для «нет такого email» и
// «неверный пароль», и по времени тоже (см. dummyPasswordHash).
import { NextResponse } from "next/server";
import { findAccountByEmail } from "@/lib/profiles";
import { setSessionCookie } from "@/lib/session";
import { normalizeEmail } from "@/lib/email";
import { dummyPasswordHash, verifyPassword } from "@/lib/password";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { jsonError, readJson, serverError } from "@/lib/http";

const WRONG = "Неверный email или пароль";

export async function POST(req: Request) {
  if (!rateLimit(`login:${clientIp(req)}`, 10, 60_000)) {
    return jsonError("Слишком много попыток, подождите минуту", 429);
  }
  const body = await readJson(req);
  if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
    return jsonError(WRONG, 400);
  }

  try {
    const account = await findAccountByEmail(normalizeEmail(body.email));
    const hash = account?.password_hash ?? (await dummyPasswordHash());
    const ok = await verifyPassword(body.password, hash);
    if (!account?.password_hash || !ok) return jsonError(WRONG, 401);

    await setSessionCookie(account.id);
    return NextResponse.json({ handle: account.handle });
  } catch (e) {
    return serverError(e);
  }
}
