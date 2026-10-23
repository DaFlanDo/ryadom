// Загрузка фото в Supabase Storage. Принимает FormData (file) или
// JSON ({dataUrl}). Кладёт в bucket profile-images под ключом
// <psychId>/<uuid>.<ext>, возвращает публичный URL для записи в jsonb.
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSessionPsychId } from "@/lib/session";
import { supabaseAdmin, PROFILE_BUCKET } from "@/lib/supabase/server";
import { sniffImage } from "@/lib/imageType";
import { rateLimit } from "@/lib/rateLimit";
import { jsonError, serverError } from "@/lib/http";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB — фото уже ужато на клиенте

async function readUpload(req: Request): Promise<Buffer | null> {
  const ctype = req.headers.get("content-type") || "";
  if (ctype.includes("application/json")) {
    const { dataUrl } = await req.json();
    const m = typeof dataUrl === "string" ? /^data:[^;]+;base64,(.+)$/s.exec(dataUrl) : null;
    return m ? Buffer.from(m[1], "base64") : null;
  }
  if (ctype.includes("multipart/form-data")) {
    const file = (await req.formData()).get("file");
    return file instanceof File ? Buffer.from(await file.arrayBuffer()) : null;
  }
  return null;
}

export async function POST(req: Request) {
  const psychId = await getSessionPsychId();
  if (!psychId) return jsonError("unauthorized", 401);
  if (!rateLimit(`upload:${psychId}`, 30, 60_000)) return jsonError("Слишком много загрузок", 429);

  let buffer: Buffer | null;
  try {
    buffer = await readUpload(req);
  } catch {
    return jsonError("bad request", 400);
  }
  if (!buffer) return jsonError("file required", 400);
  if (buffer.byteLength > MAX_BYTES) return jsonError("too large", 413);

  const type = sniffImage(buffer);
  if (!type) return jsonError("Нужна картинка: JPEG, PNG, WebP или GIF", 400);

  const key = `${psychId}/${randomUUID()}.${type.ext}`;
  try {
    const db = supabaseAdmin();
    const { error } = await db.storage
      .from(PROFILE_BUCKET)
      .upload(key, buffer, { contentType: type.mime, upsert: false });
    if (error) throw error;

    const { data } = db.storage.from(PROFILE_BUCKET).getPublicUrl(key);
    return NextResponse.json({ url: data.publicUrl });
  } catch (e) {
    return serverError(e);
  }
}
