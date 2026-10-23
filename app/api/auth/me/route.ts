// Кто вошёл: фронт спрашивает на старте редактора.
import { NextResponse } from "next/server";
import { getSessionPsychId } from "@/lib/session";
import { getOwnerRow } from "@/lib/profiles";
import { jsonError, serverError } from "@/lib/http";

export async function GET() {
  const psychId = await getSessionPsychId();
  if (!psychId) return jsonError("unauthorized", 401);

  try {
    const { handle } = await getOwnerRow(psychId);
    // сессия валидна, но строки нет (аккаунт удалён) — считаем разлогином
    if (!handle) return jsonError("unauthorized", 401);
    return NextResponse.json({ handle });
  } catch (e) {
    return serverError(e);
  }
}
