"use client";

import { useRef, useState } from "react";
import type { Highlight } from "@/lib/types";
import { uploadImage } from "@/lib/uploadImage";

// Полноэкранный просмотрщик актуальных с правкой прямо внутри истории:
// листаешь слайды, пишешь подпись, добавляешь фото, удаляешь — как в соцсети.
export function EditableStoryViewer({
  highlights,
  startIndex,
  onChange,
  onClose,
}: {
  highlights: Highlight[];
  startIndex: number;
  onChange: (hs: Highlight[]) => void;
  onClose: () => void;
}) {
  const [hi, setHi] = useState(startIndex);
  const [si, setSi] = useState(0);
  const [capEditing, setCapEditing] = useState(false);
  const [titleEditing, setTitleEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const h = highlights[Math.min(hi, highlights.length - 1)];
  if (!h) {
    onClose();
    return null;
  }
  const slide = h.slides[Math.min(si, h.slides.length - 1)];

  const update = (mut: (hs: Highlight[]) => Highlight[]) => onChange(mut(highlights));

  const next = () => {
    if (si < h.slides.length - 1) setSi(si + 1);
    else if (hi < highlights.length - 1) {
      setHi(hi + 1);
      setSi(0);
    }
  };
  const prev = () => {
    if (si > 0) setSi(si - 1);
    else if (hi > 0) {
      const p = hi - 1;
      setHi(p);
      setSi(Math.max(0, highlights[p].slides.length - 1));
    }
  };

  const setCaption = (text: string) =>
    update((hs) =>
      hs.map((x, i) =>
        i === hi
          ? { ...x, slides: x.slides.map((s, j) => (j === si ? { ...s, caption: text } : s)) }
          : x
      )
    );

  const setTitle = (t: string) =>
    update((hs) => hs.map((x, i) => (i === hi ? { ...x, title: t } : x)));

  const addPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const img = await uploadImage(file);
      const newIdx = h.slides.length;
      update((hs) => hs.map((x, i) => (i === hi ? { ...x, slides: [...x.slides, { img }] } : x)));
      setSi(newIdx);
    } catch {
      alert("Не получилось загрузить фото");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const deleteHighlight = () => {
    const remaining = highlights.filter((_, i) => i !== hi);
    onChange(remaining);
    if (remaining.length === 0) return onClose();
    setHi(Math.min(hi, remaining.length - 1));
    setSi(0);
  };

  const deleteSlide = () => {
    if (h.slides.length <= 1) {
      if (confirm("Это последний слайд — удалить актуальное целиком?")) deleteHighlight();
      return;
    }
    update((hs) =>
      hs.map((x, i) => (i === hi ? { ...x, slides: x.slides.filter((_, j) => j !== si) } : x))
    );
    setSi(Math.max(0, Math.min(si, h.slides.length - 2)));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-deep flex items-center justify-center">
      <div className="relative w-full max-w-[440px] h-full sm:h-[92vh] sm:rounded-2xl overflow-hidden mx-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={`${hi}-${si}`} src={slide.img} alt="" className="pop absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-deep/70 via-transparent to-deep/90" />

        {/* прогресс по слайдам */}
        <div className="absolute top-3 left-3 right-3 flex gap-1.5 z-30">
          {h.slides.map((_, i) => (
            <div key={i} className={`h-[3px] flex-1 rounded-full ${i <= si ? "bg-white" : "bg-white/30"}`} />
          ))}
        </div>

        {/* шапка: название (тап → правка) + закрыть */}
        <div className="absolute top-7 left-4 right-4 flex items-center justify-between z-30 text-white gap-3">
          {titleEditing ? (
            <input
              autoFocus
              value={h.title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTitleEditing(false)}
              onKeyDown={(e) => e.key === "Enter" && setTitleEditing(false)}
              className="bg-white/15 rounded-lg px-2.5 py-1 text-[15px] font-semibold outline-none w-44"
            />
          ) : (
            <button onClick={() => setTitleEditing(true)} className="text-[15px] font-semibold drop-shadow flex items-center gap-1.5">
              {h.title} <span className="text-white/60 text-[12px]">✎</span>
            </button>
          )}
          <button onClick={onClose} className="text-white/90 text-2xl leading-none px-2" aria-label="Закрыть">
            ✕
          </button>
        </div>

        {/* навигация: тап-зоны (выключены при правке подписи) */}
        {!capEditing && (
          <>
            <button onClick={prev} className="absolute left-0 top-12 bottom-44 w-1/3 z-10" aria-label="Назад" />
            <button onClick={next} className="absolute right-0 top-12 bottom-44 w-2/3 z-10" aria-label="Вперёд" />
            {hi + si > 0 && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-white/60 text-3xl pointer-events-none">‹</span>
            )}
            <span className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-white/60 text-3xl pointer-events-none">›</span>
          </>
        )}

        {/* низ: подпись + панель действий */}
        <div className="absolute bottom-0 inset-x-0 z-30 px-4 pb-6 pt-16 bg-gradient-to-t from-deep via-deep/70 to-transparent">
          {capEditing ? (
            <div className="mb-3">
              <textarea
                autoFocus
                rows={3}
                value={slide.caption ?? ""}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Подпись к этому фото…"
                className="w-full bg-white/15 text-white placeholder:text-white/50 rounded-xl px-3 py-2.5 text-[16px] outline-none resize-none"
              />
              <button
                onClick={() => setCapEditing(false)}
                className="mt-2 w-full bg-white text-deep py-2.5 rounded-xl font-semibold text-[14px]"
              >
                Готово
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCapEditing(true)}
              className="block text-left w-full mb-4 text-white text-[18px] font-medium leading-snug drop-shadow"
            >
              {slide.caption || <span className="text-white/55">Нажми, чтобы добавить подпись…</span>}
            </button>
          )}

          {!capEditing && (
            <>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={busy}
                  className="grow bg-white text-deep py-3 rounded-xl font-semibold text-[14px] disabled:opacity-60"
                >
                  {busy ? "Загрузка…" : "＋ Фото в историю"}
                </button>
                <button
                  onClick={deleteSlide}
                  className="px-4 bg-white/15 text-white rounded-xl font-medium text-[14px] border border-white/20"
                >
                  🗑 Слайд
                </button>
              </div>
              <button onClick={deleteHighlight} className="w-full text-center text-white/55 text-[13px] py-1">
                Удалить актуальное
              </button>
            </>
          )}
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={addPhoto} />
      </div>
    </div>
  );
}
