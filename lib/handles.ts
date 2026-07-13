// ════════════════════════════════════════════════════════════
//  Никнеймы живут в корне (ryadom.app/<handle>), поэтому не должны
//  совпадать с системными маршрутами и служебными словами — иначе
//  профиль окажется недоступен (статический роут перекроет [handle]).
//  Резервируем на входе (см. app/api/auth/dev) и на публичной странице.
// ════════════════════════════════════════════════════════════

// латиница/цифры/дефис/подчёркивание, 2–32 символа
export const HANDLE_RE = /^[a-z0-9_-]{2,32}$/;

const RESERVED = new Set([
  "u", "edit", "api", "app", "www", "login", "logout", "signin", "signout",
  "admin", "settings", "profile", "new", "about", "help", "support",
  "terms", "privacy", "static", "public", "favicon", "robots", "sitemap",
]);

export function isReservedHandle(handle: string): boolean {
  return RESERVED.has(handle);
}

// Полная проверка ника: формат + не зарезервирован. Возвращает текст ошибки или null.
export function handleError(handle: string): string | null {
  if (!HANDLE_RE.test(handle)) {
    return "2–32 символа: латиница, цифры, - или _";
  }
  if (isReservedHandle(handle)) {
    return "Этот адрес занят системой, выберите другой";
  }
  return null;
}
