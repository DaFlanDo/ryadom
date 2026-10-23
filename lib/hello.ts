// «привет, я Катя» — если человек не написал своё, собираем из имени.
// Отдельный модуль без "use client": нужен и странице, и серверной картинке-превью.
export function defaultHello(name: string): string {
  const first = name.trim().split(/\s+/)[0];
  return first ? `привет, я ${first}` : "";
}
