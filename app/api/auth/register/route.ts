// Регистрация: email + пароль + адрес страницы. Сразу выдаёт сессию,
// дальше редактор покажет онбординг (профиль пока пустой).
import { NextResponse } from "next/server";
import { AccountTakenError, createAccount } from "@/lib/profiles";
import { setSessionCookie } from "@/lib/session";
import { handleError } from "@/lib/handles";
import { emailError, normalizeEmail } from "@/lib/email";
import { hashPassword, passwordError } from "@/lib/password";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { jsonError, readJson, serverError } from "@/lib/http";

export async function POST(req: Request) {
  if (!rateLimit(`register:${clientIp(req)}`, 5, 60_000)) {
    return jsonError("Слишком много попыток, подождите минуту", 429);
  }
  const body = await readJson(req);
  if (!body) return jsonError("bad json", 400);

  const { email: rawEmail, password, handle: rawHandle } = body;
  if (typeof rawEmail !== "string" || typeof password !== "string" || typeof rawHandle !== "string") {
    return jsonError("Заполните email, пароль и адрес страницы", 400);
  }
  const email = normalizeEmail(rawEmail);
  const handle = rawHandle.trim().toLowerCase();
  const invalid = emailError(email) ?? handleError(handle) ?? passwordError(password);
  if (invalid) return jsonError(invalid, 400);

  try {
    const psychId = await createAccount(email, handle, await hashPassword(password));
    await setSessionCookie(psychId);
    return NextResponse.json({ handle });
  } catch (e) {
    if (e instanceof AccountTakenError) return jsonError(e.message, 409);
    return serverError(e);
  }
}
