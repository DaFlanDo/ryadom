// Dev-логин: вход по handle (без пароля). Временный — позже заменится
// на Telegram initData. Создаёт/находит психолога и выдаёт сессию.
import { NextResponse } from "next/server";
import { ensurePsychologist } from "@/lib/profiles";
import { setSessionCookie } from "@/lib/session";
import { handleError } from "@/lib/handles";

export async function POST(req: Request) {
  let handle: unknown;
  try {
    ({ handle } = await req.json());
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  if (typeof handle !== "string") {
    return NextResponse.json({ error: "handle required" }, { status: 400 });
  }
  const h = handle.trim().toLowerCase();
  const err = handleError(h);
  if (err) {
    return NextResponse.json({ error: err }, { status: 400 });
  }

  try {
    const psychId = await ensurePsychologist(h);
    await setSessionCookie(psychId);
    return NextResponse.json({ handle: h });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "server error" },
      { status: 500 }
    );
  }
}
