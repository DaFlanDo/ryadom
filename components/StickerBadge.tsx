// Стикер-наклейка в углу карточки: чуть выходит за край и повёрнут,
// как будто его наклеили рукой. Наклон зависит от угла, чтобы при
// перерисовке стикер не «прыгал».
/* eslint-disable @next/next/no-img-element */
import type { Sticker } from "@/lib/types";
import { STICKER_LABEL, stickerSrc } from "@/lib/stickers";

type Place = Record<Sticker["corner"], { pos: string; rot: string }>;

const PLACE: Place = {
  // слева сверху у блока обычно заголовок раздела — опускаем стикер на карточку
  tl: { pos: "top-10 -left-4", rot: "-12deg" },
  tr: { pos: "-top-5 -right-3", rot: "11deg" },
  bl: { pos: "-bottom-5 -left-3", rot: "8deg" },
  br: { pos: "-bottom-5 -right-3", rot: "-9deg" },
};

// В шапке углы другие: сверху — на обложке под кнопками редактора,
// снизу — рядом с аватаром и над статусом.
export const HEADER_PLACE: Place = {
  tl: { pos: "top-14 left-5", rot: "-10deg" },
  tr: { pos: "top-14 right-5", rot: "10deg" },
  bl: { pos: "top-[146px] left-[132px]", rot: "-6deg" },
  br: { pos: "top-[112px] right-6", rot: "8deg" },
};

export function StickerBadge({
  sticker,
  size = 60,
  place = PLACE,
}: {
  sticker?: Sticker;
  size?: number;
  place?: Place;
}) {
  if (!sticker) return null;
  const { pos, rot } = place[sticker.corner];
  return (
    <img
      key={`${sticker.id}-${sticker.corner}`}
      src={stickerSrc(sticker.id)}
      alt={STICKER_LABEL[sticker.id] ?? ""}
      width={size}
      height={size}
      draggable={false}
      style={{ "--rot": rot, transform: `rotate(${rot})` } as React.CSSProperties}
      className={`sticker sticker-in absolute z-20 select-none pointer-events-auto ${pos}`}
    />
  );
}
