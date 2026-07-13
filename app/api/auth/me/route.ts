// Кто вошёл: фронт спрашивает на старте редактора.
import { NextResponse } from "next/server";
import { getSessionPsychId } from "@/lib/session";
import { getOwnerRow } from "@/lib/profiles";

export async function GET() {
  const psychId = await getSessionPsychId();
  if (!psychId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { handle } = await getOwnerRow(psychId);
    if (!handle) {
      // сессия валидна, но строки нет (БД сбросили) — считаем разлогином
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ handle });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "server error" },
      { status: 500 }
    );
  }
}
