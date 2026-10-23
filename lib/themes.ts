// ════════════════════════════════════════════════════════════
//  Темы «Записки». Цвета, шрифты и фактура бумаги живут в app/globals.css
//  ([data-theme]); здесь — список для выбора и то, чем в теме крепятся
//  записки и фото (рисует components/paper.tsx).
// ════════════════════════════════════════════════════════════
import type { ThemeId } from "./types";

export type Fastener = "tape" | "clip" | "flower" | "pin";

export const THEMES: { id: ThemeId; name: string; mood: string; fastener: Fastener }[] = [
  { id: "note", name: "Записка", mood: "Крафт, скотч, чернила", fastener: "tape" },
  { id: "notebook", name: "Тетрадь", mood: "Линейка, поля, синяя ручка", fastener: "clip" },
  { id: "herbarium", name: "Гербарий", mood: "Акварель и сухие цветы", fastener: "flower" },
  { id: "evening", name: "Вечер", mood: "Тёмная бумага и свет лампы", fastener: "pin" },
];

export const THEME_IDS = THEMES.map((t) => t.id) as [ThemeId, ...ThemeId[]];
export const DEFAULT_THEME: ThemeId = "note";

// Темы первой версии («Мох», «Глина», «Сумерки») стали цветами внутри «Записки»
export const LEGACY_THEMES: Record<string, ThemeId> = { moss: "note", clay: "note", dusk: "note" };

export const fastenerOf = (theme: ThemeId): Fastener =>
  THEMES.find((t) => t.id === theme)?.fastener ?? "tape";
