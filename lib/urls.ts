// ════════════════════════════════════════════════════════════
//  Какие ссылки разрешены в профиле. Всё, что пришло от пользователя,
//  попадает в href и src на публичной странице, поэтому схемы вроде
//  javascript: и data: отсекаем и при сохранении, и при рендере.
// ════════════════════════════════════════════════════════════

const LINK_PROTOCOLS = new Set(["https:", "http:", "tg:", "mailto:", "tel:"]);

// Ссылка кнопки или видео: пусто/"#" = не задана, иначе разрешённая схема.
export function isSafeLink(url: string): boolean {
  if (url === "" || url === "#") return true;
  try {
    return LINK_PROTOCOLS.has(new URL(url).protocol);
  } catch {
    return false;
  }
}

// Ссылку, по которой реально можно перейти, или null (кнопка без ссылки).
export function linkHref(url: string | undefined): string | null {
  if (!url || url === "#" || !isSafeLink(url)) return null;
  return url;
}

// Картинка: пусто, локальный файл из public/ или https (Storage, внешние фото).
export function isSafeImage(url: string): boolean {
  if (url === "") return true;
  if (url.startsWith("/")) return !url.startsWith("//");
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}
