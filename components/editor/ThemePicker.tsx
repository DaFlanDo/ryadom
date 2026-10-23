"use client";
/* eslint-disable @next/next/no-img-element */

import type { ThemeId } from "@/lib/types";
import { THEMES } from "@/lib/themes";
import { ThemeScope } from "@/components/ThemeScope";
import { TitleMark, TitleUnderline } from "@/components/doodles";
import { CheckIcon } from "@/components/icons";

// Лист «Оформление»: каждая карточка — маленький кусочек страницы,
// отрисованный в своей теме, чтобы выбирать глазами, а не по названию.
const PREVIEW_STICKER: Record<ThemeId, string> = {
  moss: "/stickers/herb.webp",
  clay: "/stickers/hot-beverage.webp",
  dusk: "/stickers/crescent-moon.webp",
};

export function ThemePicker({ value, onChange }: { value: ThemeId; onChange: (t: ThemeId) => void }) {
  return (
    <div className="space-y-3">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          aria-pressed={value === t.id}
          className={`w-full text-left rounded-2xl overflow-hidden transition ring-2 ${
            value === t.id ? "ring-moss" : "ring-transparent hover:ring-ink/10"
          }`}
        >
          <ThemeScope theme={t.id} className="relative p-4">
            <img src={PREVIEW_STICKER[t.id]} alt="" className="sticker absolute -top-1 right-3 w-12 h-12 rotate-12" />
            <div className="flex items-center gap-2">
              <TitleMark />
              <div>
                <p className="font-serif text-[1.35rem] leading-tight text-ink">{t.name}</p>
                <TitleUnderline />
              </div>
            </div>
            <p className="text-[13px] text-sub mt-1">{t.mood}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="px-4 py-2 rounded-xl bg-moss text-white text-[13px] font-semibold">Записаться</span>
              <span className="px-4 py-2 rounded-xl bg-card border border-ink/10 text-ink text-[13px] font-semibold">
                Написать
              </span>
              {value === t.id && (
                <span className="ml-auto w-7 h-7 rounded-full bg-moss text-white flex items-center justify-center">
                  <CheckIcon className="w-4 h-4" />
                </span>
              )}
            </div>
          </ThemeScope>
        </button>
      ))}
    </div>
  );
}
