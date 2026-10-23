"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import type { Sticker, StickerCorner } from "@/lib/types";
import { CORNERS, STICKER_GROUPS, stickerSrc, type StickerId } from "@/lib/stickers";

// Лист выбора стикера: угол + сетка наклеек по группам.
// Тап по стикеру сразу ставит его, повторный тап по тому же — убирает.
export function StickerPicker({
  value,
  onChange,
}: {
  value?: Sticker;
  onChange: (s: Sticker | undefined) => void;
}) {
  // угол можно выбрать и до стикера — он запомнится для следующего тапа
  const [corner, setCorner] = useState<StickerCorner>(value?.corner ?? "tr");
  const pick = (id: StickerId) => onChange(value?.id === id ? undefined : { id, corner });
  const chooseCorner = (c: StickerCorner) => {
    setCorner(c);
    if (value) onChange({ ...value, corner: c });
  };

  return (
    <div className="space-y-5">
      <div>
        <span className="block text-[13px] font-medium text-sub mb-2">Куда наклеить</span>
        <div className="grid grid-cols-4 gap-1.5 bg-soft rounded-xl p-1">
          {CORNERS.map((c) => (
            <button
              key={c.value}
              type="button"
              aria-label={c.label}
              onClick={() => chooseCorner(c.value)}
              className={`h-12 rounded-lg flex items-center justify-center transition ${
                corner === c.value ? "bg-card shadow-sm" : "opacity-55"
              }`}
            >
              {/* мини-карточка с точкой в выбранном углу */}
              <span className="relative w-9 h-6 rounded-md border-2 border-sage">
                <span
                  className={`absolute w-2.5 h-2.5 rounded-full ${corner === c.value ? "bg-moss" : "bg-sage"} ${
                    c.value[0] === "t" ? "-top-1.5" : "-bottom-1.5"
                  } ${c.value[1] === "l" ? "-left-1.5" : "-right-1.5"}`}
                />
              </span>
            </button>
          ))}
        </div>
      </div>

      {STICKER_GROUPS.map((group) => (
        <div key={group.title}>
          <span className="block text-[13px] font-medium text-sub mb-2">{group.title}</span>
          <div className="grid grid-cols-5 gap-2">
            {group.items.map(([id, label]) => (
              <button
                key={id}
                type="button"
                title={label}
                aria-label={label}
                aria-pressed={value?.id === id}
                onClick={() => pick(id)}
                className={`aspect-square rounded-2xl flex items-center justify-center transition active:scale-95 ${
                  value?.id === id ? "bg-moss/15 ring-2 ring-moss" : "bg-card hover:bg-soft"
                }`}
              >
                <img src={stickerSrc(id)} alt="" className="w-11 h-11" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {value && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="w-full py-3 rounded-xl border border-ink/10 text-[14px] text-sub hover:text-ink"
        >
          Убрать стикер
        </button>
      )}
    </div>
  );
}
