// ════════════════════════════════════════════════════════════
//  Курированный набор зелёных пейзажей — локальные файлы в public/landscapes/.
//  Используются как картинки-плейсхолдеры (онбординг, дефолты новых блоков),
//  пока психолог не загрузил свои фото. Это НЕ mock-данные профиля —
//  это переиспользуемый пул изображений.
// ════════════════════════════════════════════════════════════

export const LANDSCAPES = [
  "/landscapes/landscape-01.jpg",
  "/landscapes/landscape-02.jpg",
  "/landscapes/landscape-03.jpg",
  "/landscapes/landscape-04.jpg",
  "/landscapes/landscape-05.jpg",
  "/landscapes/landscape-06.jpg",
  "/landscapes/landscape-07.jpg",
  "/landscapes/landscape-08.jpg",
  "/landscapes/landscape-09.jpg",
  "/landscapes/landscape-10.jpg",
] as const;

// Пейзаж по индексу с зацикливанием (для галерей/списков любой длины).
export function landscape(i: number): string {
  const n = LANDSCAPES.length;
  return LANDSCAPES[((i % n) + n) % n];
}
