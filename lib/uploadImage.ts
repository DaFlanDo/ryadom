// ════════════════════════════════════════════════════════════
//  Клиентская загрузка фото: ужать → отправить в Storage → вернуть URL.
//  В Profile ложится короткий публичный URL, а не тяжёлый data-URL.
//  Если загрузка не удалась — бросаем ошибку: все места вызова
//  показывают «Не получилось загрузить фото», а сервер data-URL
//  в профиле всё равно не принял бы (см. lib/profileSchema.ts).
// ════════════════════════════════════════════════════════════
import { fileToResizedDataURL } from "@/lib/image";

export async function uploadImage(file: File, maxDim = 1100): Promise<string> {
  const dataUrl = await fileToResizedDataURL(file, maxDim);
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ dataUrl }),
  });
  if (!res.ok) throw new Error(`upload ${res.status}`);
  const { url } = await res.json();
  if (typeof url !== "string") throw new Error("no url");
  return url;
}
