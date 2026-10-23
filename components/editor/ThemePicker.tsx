"use client";

import type { ThemeId } from "@/lib/types";
import { THEMES } from "@/lib/themes";
import { ThemeScope } from "@/components/ThemeScope";
import { Note } from "@/components/paper";
import { CheckIcon } from "@/components/icons";

// Лист «Оформление»: каждая карточка — кусочек страницы в своей теме
// (бумага, почерк, крепление, кнопка), чтобы выбирать глазами.
export function ThemePicker({ value, onChange }: { value: ThemeId; onChange: (t: ThemeId) => void }) {
  return (
    <div className="space-y-3">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          aria-pressed={value === t.id}
          className={`block w-full text-left rounded-2xl overflow-hidden transition ring-2 ${
            value === t.id ? "ring-moss" : "ring-transparent hover:ring-ink/10"
          }`}
        >
          <ThemeScope theme={t.id}>
            <div className="paper relative px-4 pt-5 pb-4">
              <div className="flex items-start gap-4">
                <Note index={1} className="flex-1">
                  <p className="hand hand-xl text-hand">{t.name}</p>
                  <p className="text-[12.5px] text-sub mt-1">{t.mood}</p>
                </Note>
                {value === t.id && (
                  <span className="mt-2 w-7 h-7 shrink-0 rounded-full bg-moss text-btn-ink flex items-center justify-center">
                    <CheckIcon className="w-4 h-4" />
                  </span>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <span className="btn-shape px-4 py-2 bg-moss text-btn-ink text-[13px] font-semibold">Записаться</span>
                <span className="btn-shape px-4 py-2 bg-card border border-ink/10 text-ink text-[13px] font-semibold">Написать</span>
              </div>
            </div>
          </ThemeScope>
        </button>
      ))}
    </div>
  );
}
