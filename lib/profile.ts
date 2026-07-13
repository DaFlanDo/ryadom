import type { Profile } from "./types";

// ════════════════════════════════════════════════════════════
//  Пустой профиль — стартовое состояние редактора до онбординга/загрузки.
//  Реальные данные приходят из Supabase (см. lib/profiles.ts) или собираются
//  онбордингом (см. lib/onboarding.ts). Демо-профиля больше нет.
// ════════════════════════════════════════════════════════════
export const emptyProfile: Profile = {
  header: {
    name: "",
    role: "Психолог",
    bio: "",
    avatar: "",
    cover: "",
    status: "",
    meta: [],
  },
  highlights: [],
  blocks: [],
  doors: {
    book: { label: "Записаться", url: "#" },
    message: { label: "Написать", url: "#" },
  },
};
