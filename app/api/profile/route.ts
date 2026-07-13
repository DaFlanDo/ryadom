// Профиль владельца: чтение и сохранение (источник правды — БД).
import { NextResponse } from "next/server";
import type { Profile } from "@/lib/types";
import { getSessionPsychId } from "@/lib/session";
import { getOwnerRow, saveOwnerProfile } from "@/lib/profiles";

export async function GET() {
  const psychId = await getSessionPsychId();
  if (!psychId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { profile } = await getOwnerRow(psychId);
    return NextResponse.json({ profile }); // profile может быть null → онбординг
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const psychId = await getSessionPsychId();
  if (!psychId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let profile: unknown;
  try {
    ({ profile } = await req.json());
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  // Лёгкая проверка формы: профиль — объект с blocks/header (детальную
  // валидацию не делаем, источник — наш же типизированный редактор).
  if (!profile || typeof profile !== "object" || !("header" in profile)) {
    return NextResponse.json({ error: "profile invalid" }, { status: 400 });
  }

  try {
    await saveOwnerProfile(psychId, profile as Profile);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "server error" },
      { status: 500 }
    );
  }
}
