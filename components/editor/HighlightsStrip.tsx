"use client";

import { useRef, useState } from "react";
import type { Highlight } from "@/lib/types";
import { uploadImage } from "@/lib/uploadImage";
import { HighlightThumb } from "@/components/paper";

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


  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pt-7 pb-2">
      {highlights.map((s, i) => (
        <button key={i} onClick={() => onOpen(i)}>
          <HighlightThumb highlight={s} index={i} />
        </button>
      ))}

      {/* добавить актуальное */}
      <button onClick={() => fileRef.current?.click()} disabled={busy} className="flex flex-col items-center gap-1.5 shrink-0 w-[70px]">
        <span className="w-[66px] h-[72px] border-2 border-dashed border-moss/50 flex items-center justify-center text-moss text-2xl bg-moss/5">
          {busy ? "…" : "+"}
        </span>
        <span className="hand hand-sm text-moss">добавить</span>
      </button>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
    </div>
  );
}
