// Загрузка фото в Supabase Storage. Принимает FormData (file) или
// JSON ({dataUrl}). Кладёт в bucket profile-images под ключом
// <psychId>/<uuid>.<ext>, возвращает публичный URL для записи в jsonb.
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSessionPsychId } from "@/lib/session";
import { supabaseAdmin, PROFILE_BUCKET } from "@/lib/supabase/server";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB — фото уже ужато на клиенте

function extFromType(type: string): string {
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  if (type.includes("gif")) return "gif";
  return "jpg";
}

// "data:image/jpeg;base64,XXXX" → { buffer, contentType }
function parseDataUrl(dataUrl: string): { buffer: Buffer; contentType: string } | null {
  const m = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl);
  if (!m) return null;
  return { contentType: m[1], buffer: Buffer.from(m[2], "base64") };
}

export async function POST(req: Request) {
  const psychId = await getSessionPsychId();
  if (!psychId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let buffer: Buffer;
  let contentType: string;

  const ctype = req.headers.get("content-type") || "";
  try {
    if (ctype.includes("application/json")) {
      const { dataUrl } = await req.json();
      const parsed = typeof dataUrl === "string" ? parseDataUrl(dataUrl) : null;
      if (!parsed) return NextResponse.json({ error: "bad dataUrl" }, { status: 400 });
      buffer = parsed.buffer;
      contentType = parsed.contentType;
    } else {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "file required" }, { status: 400 });
      }
      contentType = file.type || "image/jpeg";
      buffer = Buffer.from(await file.arrayBuffer());
    }
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ error: "not an image" }, { status: 400 });
  }
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "too large" }, { status: 413 });
  }

  const key = `${psychId}/${randomUUID()}.${extFromType(contentType)}`;
  try {
    const db = supabaseAdmin();
    const { error } = await db.storage
      .from(PROFILE_BUCKET)
      .upload(key, buffer, { contentType, upsert: false });
    if (error) throw error;

    const { data } = db.storage.from(PROFILE_BUCKET).getPublicUrl(key);
    return NextResponse.json({ url: data.publicUrl });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "upload failed" },
      { status: 500 }
    );
  }
}
