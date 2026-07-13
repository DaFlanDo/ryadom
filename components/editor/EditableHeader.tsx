"use client";

import { useRef } from "react";
import type { ProfileHeader as Header, Door } from "@/lib/types";
import { ProfileHeader } from "@/components/ProfileHeader";
import { uploadImage } from "@/lib/uploadImage";

// Шапка в режиме правки: текст правится инлайн (внутри ProfileHeader,
// через editing-контекст), аватар и обложка — тапом, кнопки/ссылки — в листе.
export function EditableHeader({
  header,
  doors,
  onChange,
  onEditLinks,
}: {
  header: Header;
  doors: { book: Door; message: Door };
  onChange: (h: Header) => void;
  onEditLinks: () => void;
}) {
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const handle = (key: "avatar" | "cover") => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      onChange({ ...header, [key]: await uploadImage(file) });
    } catch {
      alert("Не получилось загрузить фото");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="relative">
      <ProfileHeader header={header} doors={doors} onChange={onChange} />

      {/* тап по обложке (только верхняя полоса — текст ниже остаётся доступен) */}
      <button
        onClick={() => coverRef.current?.click()}
        className="absolute top-0 inset-x-0 h-36 z-10"
        aria-label="Сменить обложку"
      />
      <span className="absolute top-3 right-3 z-30 bg-deep/70 text-white text-[12px] px-2.5 py-1 rounded-full pointer-events-none">
        📷 обложка
      </span>

      {/* кнопки и ссылки */}
      <button
        onClick={onEditLinks}
        className="absolute top-3 left-3 z-30 bg-deep/70 text-white text-[12px] px-2.5 py-1 rounded-full hover:bg-deep transition"
      >
        🔗 ссылки
      </button>

      {/* тап по аватару (поверх всего) */}
      <button
        onClick={() => avatarRef.current?.click()}
        className="absolute left-5 top-[96px] w-24 h-24 rounded-full z-30"
        aria-label="Сменить фото профиля"
      >
        <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-moss text-white text-[13px] flex items-center justify-center ring-2 ring-bg">
          📷
        </span>
      </button>

      <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handle("avatar")} />
      <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handle("cover")} />
    </div>
  );
}
