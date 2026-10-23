// ════════════════════════════════════════════════════════════
//  Темы оформления. Цвета живут в app/globals.css: тема переопределяет
//  CSS-переменные --color-*, на которые завязаны все классы Tailwind,
//  поэтому компоненты про темы почти ничего не знают. Отличается ещё
//  рисованный элемент у заголовков (components/doodles.tsx).
// ════════════════════════════════════════════════════════════
import type { ThemeId } from "./types";

export const THEMES: { id: ThemeId; name: string; mood: string; swatch: [string, string, string] }[] = [
  { id: "moss", name: "Мох", mood: "Зелень, лес, спокойствие", swatch: ["#EEF2E8", "#5A6E4B", "#C4886A"] },
  { id: "clay", name: "Глина", mood: "Тёплая терракота и крем", swatch: ["#F6EDE4", "#B5654A", "#6E8B5E"] },
  { id: "dusk", name: "Сумерки", mood: "Мягкая лаванда и вечер", swatch: ["#ECE8F4", "#6B5FA8", "#D9907A"] },
];

export const THEME_IDS = THEMES.map((t) => t.id) as [ThemeId, ...ThemeId[]];
export const DEFAULT_THEME: ThemeId = "moss";
