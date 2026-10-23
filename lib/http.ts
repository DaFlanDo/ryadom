// Общие помощники для route handlers.
import { NextResponse } from "next/server";

export const jsonError = (error: string, status: number) => NextResponse.json({ error }, { status });

// Изменяющие запросы принимаем только с Content-Type: application/json.
// Чужой сайт не может отправить такой запрос без CORS-preflight, а
// preflight мы не разрешаем, — это закрывает CSRF вместе с SameSite=Lax.
export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  if (!req.headers.get("content-type")?.includes("application/json")) return null;
  try {
    const body = await req.json();
    return body && typeof body === "object" && !Array.isArray(body) ? body : null;
  } catch {
    return null;
  }
}

// Ошибки БД наружу не отдаём: в логах — подробности, клиенту — общий текст.
export function serverError(e: unknown) {
  console.error(e);
  return jsonError("Что-то пошло не так, попробуйте ещё раз", 500);
}
