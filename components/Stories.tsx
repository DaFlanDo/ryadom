"use client";

import { useCallback, useEffect, useState } from "react";
import type { Highlight } from "@/lib/types";
import { CloseIcon } from "@/components/icons";
import { HighlightThumb } from "@/components/paper";

// Кружочки актуальных + полноэкранный сторис-просмотрщик.
// Листает слайды внутри актуального, затем переходит к следующему.
export function Stories({ highlights }: { highlights: Highlight[] }) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0); // индекс актуального
  const [si, setSi] = useState(0); // индекс слайда

  const close = useCallback(() => setOpen(false), []);

  const next = useCallback(() => {
    const slides = highlights[hi]?.slides ?? [];
    if (si < slides.length - 1) setSi((s) => s + 1);
    else if (hi < highlights.length - 1) {
      setHi((h) => h + 1);
      setSi(0);
    } else setOpen(false);
  }, [highlights, hi, si]);

  const prev = useCallback(() => {
    if (si > 0) setSi((s) => s - 1);
    else if (hi > 0) {
      const ph = hi - 1;
      setHi(ph);
      setSi(Math.max(0, (highlights[ph]?.slides.length ?? 1) - 1));
    }
  }, [highlights, hi, si]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, next, prev]);

  const h = highlights[hi];
  const slide = h?.slides[si];

  return (
    <>
      {/* Миниатюры-полароиды */}
      {highlights.length > 0 && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pt-7 pb-2">
          {highlights.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setHi(i);
                setSi(0);
                setOpen(true);
              }}
            >
              <HighlightThumb highlight={s} index={i} />
            </button>
          ))}
        </div>
      )}

      {/* Просмотрщик */}
      {open && h && slide && (
        <div className="fixed inset-0 z-[100] bg-deep flex items-center justify-center">
          <div className="relative w-full max-w-[440px] h-full sm:h-[92vh] sm:rounded-2xl overflow-hidden mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={`${hi}-${si}`}
              src={slide.img}
              alt=""
              className="pop absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-deep/60 via-transparent to-deep/80" />

            {/* прогресс — по слайдам текущего актуального */}
            <div className="absolute top-3 left-3 right-3 flex gap-1.5 z-20">
              {h.slides.map((_, i) => (
                <div key={i} className={`h-[3px] flex-1 rounded-full ${i <= si ? "bg-white" : "bg-white/30"}`} />
              ))}
            </div>

            {/* шапка */}
            <div className="absolute top-7 left-4 right-4 flex items-center justify-between z-20 text-white">
              <span className="text-[14px] font-semibold drop-shadow">{h.title}</span>
              <button onClick={close} className="text-white/90 px-2 py-1" aria-label="Закрыть">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* подпись */}
            {slide.caption && (
              <p className="absolute bottom-10 left-5 right-5 text-white text-[18px] font-medium leading-snug drop-shadow z-20">
                {slide.caption}
              </p>
            )}

            {/* зоны тапа */}
            <button onClick={prev} className="absolute left-0 top-0 h-full w-1/3 z-10" aria-label="Назад" />
            <button onClick={next} className="absolute right-0 top-0 h-full w-2/3 z-10" aria-label="Вперёд" />
          </div>
        </div>
      )}
    </>
  );
}
