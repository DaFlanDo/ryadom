"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/uploadImage";

// Загрузка картинки файлом из галереи/камеры.
export function ImageInput({
  value,
  onChange,
  round = false,
  size = 64,
  maxDim = 1100,
}: {
  value?: string;
  onChange: (v: string) => void;
  round?: boolean;
  size?: number;
  maxDim?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = () => inputRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadImage(file, maxDim));
    } catch {
      alert("Не получилось загрузить картинку");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const rounded = round ? "rounded-full" : "rounded-xl";

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={pick}
        className={`relative overflow-hidden ${rounded} border border-ink/10 bg-bg shrink-0 flex items-center justify-center`}
        style={{ width: size, height: size }}
        aria-label="Загрузить фото"
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl">📷</span>
        )}
        {busy && (
          <span className="absolute inset-0 bg-white/70 flex items-center justify-center text-[11px] text-moss">
            …
          </span>
        )}
      </button>

      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={pick}
          className="px-3.5 py-2 rounded-lg bg-card border border-ink/10 text-[14px] font-medium text-ink hover:border-moss/40 transition w-fit"
        >
          {value ? "Заменить фото" : "Загрузить фото"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[12px] text-sub text-left w-fit"
          >
            Убрать
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />
    </div>
  );
}
