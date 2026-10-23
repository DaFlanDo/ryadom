"use client";

import type { ProfileHeader as Header, Door } from "@/lib/types";
import { ProfileHeader } from "@/components/ProfileHeader";
import { LinkIcon, StickerIcon } from "@/components/icons";

// Шапка в режиме правки: текст и фото правятся прямо в ProfileHeader
// (editing-контекст), а кнопки «ссылки» и «стикер» открывают листы.
export function EditableHeader({
  header,
  doors,
  onChange,
  onEditLinks,
  onEditSticker,
}: {
  header: Header;
  doors: { book: Door; message: Door };
  onChange: (h: Header) => void;
  onEditLinks: () => void;
  onEditSticker: () => void;
}) {
  return (
    <div className="relative">
      <ProfileHeader header={header} doors={doors} onChange={onChange} />
      <div className="absolute top-3 left-3 z-30 flex gap-1.5">
        <button
          onClick={onEditLinks}
          className="bg-deep/70 text-white text-[12px] px-2.5 py-1 rounded-full hover:bg-deep transition flex items-center gap-1.5"
        >
          <LinkIcon className="w-3.5 h-3.5" /> ссылки
        </button>
        <button
          onClick={onEditSticker}
          className="bg-deep/70 text-white text-[12px] px-2.5 py-1 rounded-full hover:bg-deep transition flex items-center gap-1.5"
        >
          <StickerIcon className="w-3.5 h-3.5" /> стикер
        </button>
      </div>
    </div>
  );
}
