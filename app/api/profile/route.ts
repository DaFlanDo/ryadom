// Профиль владельца: чтение и сохранение (источник правды — БД).
import { NextResponse } from "next/server";
import { getSessionPsychId } from "@/lib/session";
import { getOwnerRow, saveOwnerProfile } from "@/lib/profiles";
import { parseProfile } from "@/lib/profileSchema";
import { jsonError, readJson, serverError } from "@/lib/http";

export async function GET() {
  const psychId = await getSessionPsychId();
  if (!psychId) return jsonError("unauthorized", 401);

  try {
    const { profile } = await getOwnerRow(psychId);
    return NextResponse.json({ profile }); // profile может быть null → онбординг
  } catch (e) {
    return serverError(e);
  }
}

export async function PUT(req: Request) {
  const psychId = await getSessionPsychId();
  if (!psychId) return jsonError("unauthorized", 401);

  const body = await readJson(req);
  if (!body) return jsonError("bad json", 400);
  const parsed = parseProfile(body.profile);
  if (!parsed.ok) return jsonError(parsed.error, 400);

  try {
    await saveOwnerProfile(psychId, parsed.profile);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
