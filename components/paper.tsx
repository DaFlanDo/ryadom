"use client";

// ════════════════════════════════════════════════════════════
//  «Бумажные» детали страницы: крепление, записка, полароид, каракули.
//  Блоки не знают про темы — они ставят <Fix/> и <Note/>, а тема решает,
//  скотч это, скрепка, засушенная веточка или булавка. Наклоны заданы
//  заранее по индексу: страница выглядит «от руки», но не прыгает при
//  каждой перерисовке, и пользователю не нужно ничего двигать.
// ════════════════════════════════════════════════════════════
import type { CSSProperties, ReactNode } from "react";
import type { Highlight } from "@/lib/types";
import { useTheme } from "@/components/ThemeScope";
import { fastenerOf } from "@/lib/themes";
import { EditableImage, EditableText } from "@/components/blocks/inline";

const TILTS = [-1.2, 1, -0.6, 1.4, -1.8, 0.8];
export const tilt = (i: number) => TILTS[((i % TILTS.length) + TILTS.length) % TILTS.length];

// ── Крепление ──
export function Fix({ className = "", rotate = 0, small }: { className?: string; rotate?: number; small?: boolean }) {
  const kind = fastenerOf(useTheme());
  const style: CSSProperties = { transform: `rotate(${rotate}deg)` };
  return (
    <span aria-hidden className={`absolute z-10 pointer-events-none ${className}`} style={style}>
      {kind === "tape" && (
        <span
          className={`block ${small ? "w-14 h-5" : "w-[72px] h-6"}`}
          style={{ background: "rgba(232,214,170,.8)", mixBlendMode: "multiply", boxShadow: "0 1px 2px rgba(0,0,0,.08)" }}
        />
      )}
      {kind === "clip" && (
        <svg width={small ? 18 : 22} height={small ? 44 : 54} viewBox="0 0 22 54" fill="none" stroke="#9AA3B5" strokeWidth="2.4" strokeLinecap="round" className="-mt-3">
          <path d="M7 14V40a5 5 0 0 0 10 0V8a7 7 0 0 0-14 0v34" />
        </svg>
      )}
      {kind === "flower" && (
        <svg width={small ? 64 : 92} height={small ? 44 : 62} viewBox="0 0 64 44" className="-mt-4" style={{ filter: "drop-shadow(0 1px 1px rgba(60,50,30,.18))" }}>
          <path d="M4 40C20 30 34 20 58 6" stroke="#7C8F6A" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <g fill="#9DB08A" opacity=".85">
            <ellipse cx="22" cy="27" rx="8" ry="3.4" transform="rotate(-50 22 27)" />
            <ellipse cx="34" cy="20" rx="8" ry="3.4" transform="rotate(20 34 20)" />
            <ellipse cx="44" cy="13" rx="7" ry="3" transform="rotate(-55 44 13)" />
          </g>
          <g fill="#D9A3A0">
            <circle cx="56" cy="7" r="4.5" />
            <circle cx="60" cy="10" r="3.4" />
            <circle cx="52.5" cy="10.5" r="3.4" />
          </g>
          <circle cx="56.5" cy="9" r="2" fill="#E8C56F" />
        </svg>
      )}
      {kind === "pin" && (
        <span
          className="block w-4 h-4 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 35%, #FFE3A8, #E3A857 55%, #9A6A2A)",
            boxShadow: "0 3px 4px rgba(0,0,0,.55)",
          }}
        />
      )}
    </span>
  );
}

// ── Записка: лист бумаги с креплением и лёгким наклоном ──
export function Note({
  children,
  index = 0,
  tone = "note",
  fix = "left",
  className = "",
  pad = "p-[18px]",
}: {
  children: ReactNode;
  index?: number;
  tone?: "note" | "note2";
  fix?: "left" | "center" | "right" | false;
  className?: string;
  pad?: string;
}) {
  const fixPos = fix === "left" ? "left-6 -top-3" : fix === "right" ? "right-7 -top-3" : "left-[40%] -top-3";
  return (
    <div
      className={`note-card relative ${pad} ${className}`}
      // фон задаём стилем: .note-card вне слоёв Tailwind, утилита bg-* её не перебьёт
      style={{ transform: `rotate(${tilt(index)}deg)`, ...(tone === "note2" ? { background: "var(--color-note2)" } : {}) }}
    >
      {fix && <Fix className={fixPos} rotate={tilt(index + 2) * 3} />}
      {children}
    </div>
  );
}

// ── Полароид: фото в белой рамке с подписью от руки ──
export function Polaroid({
  src,
  onChange,
  caption,
  onCaption,
  captionPlaceholder = "подпись",
  index = 0,
  fix = true,
  className = "",
  imgClassName = "",
}: {
  src: string;
  onChange?: (v: string) => void;
  caption?: string;
  onCaption?: (v: string) => void;
  captionPlaceholder?: string;
  index?: number;
  fix?: boolean;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <figure className={`polaroid relative p-2 pb-1 ${className}`} style={{ transform: `rotate(${tilt(index) * 2.4}deg)` }}>
      {fix && <Fix className="left-1/2 -translate-x-1/2 -top-3" rotate={tilt(index + 1) * 3} small />}
      <div className={`relative overflow-hidden ${imgClassName}`}>
        <EditableImage value={src} onChange={onChange} className="w-full h-full object-cover" />
      </div>
      <figcaption className="min-h-7 px-1 pt-1">
        <EditableText
          as="span"
          className="hand hand-md text-ink"
          value={caption ?? ""}
          onChange={onCaption}
          placeholder={captionPlaceholder}
        />
      </figcaption>
    </figure>
  );
}

// ── Каракули ──
export function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 14" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M2 8c9-6 15-6 23 0s15 6 23 0 15-6 23 0 15 6 23 0 14-6 24-1" />
    </svg>
  );
}

export function Divider() {
  return (
    <div className="flex justify-center my-7 text-sage">
      <Squiggle className="w-28 h-3.5" />
    </div>
  );
}

// Обводка от руки — вокруг выгодной цены
export function HandCircle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 42" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M8 22C5 10 40 3 70 6s28 18 8 27-62 7-70-6c-3-6 4-12 14-15" />
    </svg>
  );
}

// Миниатюра «актуального»: маленький полароид с подписью от руки
export function HighlightThumb({ highlight, index }: { highlight: Highlight; index: number }) {
  const cover = highlight.cover || highlight.slides[0]?.img;
  return (
    <span className="flex flex-col items-center gap-1.5 shrink-0 w-[70px]">
      <span className="polaroid block p-1 pb-3 w-[66px]" style={{ transform: `rotate(${tilt(index) * 2.6}deg)` }}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={highlight.title} className="block w-full h-[56px] object-cover" />
        ) : (
          <span className="flex w-full h-[56px] items-center justify-center bg-soft text-xl">{highlight.emoji ?? ""}</span>
        )}
      </span>
      <span className="hand hand-sm text-ink truncate w-full text-center">{highlight.title}</span>
    </span>
  );
}
