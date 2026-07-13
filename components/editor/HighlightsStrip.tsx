"use client";

import { useRef, useState } from "react";
import type { Highlight } from "@/lib/types";
import { uploadImage } from "@/lib/uploadImage";

// Ряд актуальных в редакторе: кружки (тап → правка) + «+» (тап → одно фото → новое актуальное).
export function HighlightsStrip({
  highlights,
  onOpen,
  onCreate,
}: {
  highlights: Highlight[];
  onOpen: (index: number) => void;
  onCreate: (img: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      onCreate(await uploadImage(file));
    } catch {
      alert("Не получилось загрузить фото");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const coverOf = (h: Highlight) => h.cover || h.slides[0]?.img;

  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar px-5 py-6">
      {highlights.map((s, i) => {
        const cov = coverOf(s);
        return (
          <button
            key={i}
            onClick={() => onOpen(i)}
            className="flex flex-col items-center gap-1.5 shrink-0 w-16"
          >
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-moss to-sage">
              {cov ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cov} alt={s.title} className="w-full h-full rounded-full object-cover ring-2 ring-bg" />
              ) : (
                <div className="w-full h-full rounded-full bg-card ring-2 ring-bg flex items-center justify-center text-xl">
                  {s.emoji ?? ""}
                </div>
              )}
            </div>
            <span className="text-[11px] text-sub truncate w-full text-center">{s.title}</span>
          </button>
        );
      })}

      {/* добавить актуальное */}
      <button
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className="flex flex-col items-center gap-1.5 shrink-0 w-16"
      >
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-moss/50 flex items-center justify-center text-moss text-2xl bg-moss/5">
          {busy ? "…" : "+"}
        </div>
        <span className="text-[11px] text-moss">Добавить</span>
      </button>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
    </div>
  );
}
