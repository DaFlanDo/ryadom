// ════════════════════════════════════════════════════════════
//  Клиентская загрузка фото: ужать → отправить в Storage → вернуть URL.
//  Это замена прямого base64-в-данные: в Profile теперь ложится короткий
//  публичный URL вместо тяжёлого data-URL.
//  Фолбэк: если аплоад не удался (нет сети/ключей/сессии) — возвращаем
//  ужатый data-URL, чтобы редактор не ломался (предпросмотр останется,
//  но это не сохранится корректно на сервере — см. console.warn).
// ════════════════════════════════════════════════════════════
import { fileToResizedDataURL } from "@/lib/image";

export async function uploadImage(file: File, maxDim = 1100): Promise<string> {
  const dataUrl = await fileToResizedDataURL(file, maxDim);
  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ dataUrl }),
    });
    if (!res.ok) throw new Error(`upload ${res.status}`);
    const { url } = await res.json();
    if (typeof url !== "string") throw new Error("no url");
    return url;
  } catch (e) {
    console.warn("uploadImage: фолбэк на data-URL (фото не ушло в Storage)", e);
    return dataUrl;
  }
}
