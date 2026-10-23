"use client";

import type { ProfileHeader as Header, Door } from "@/lib/types";
import { CloseIcon, TelegramIcon } from "@/components/icons";
import { useEditing } from "@/components/blocks/EditContext";
import { EditableText } from "@/components/blocks/inline";
import { DoorLink } from "@/components/DoorLink";

export function ProfileHeader({
  header,
  doors,
  onChange,
}: {
  header: Header;
  doors: { book: Door; message: Door };
  onChange?: (h: Header) => void;
}) {
  const editing = useEditing();
  const set = (p: Partial<Header>) => onChange?.({ ...header, ...p });
  const setMeta = (i: number, v: string) =>
    set({ meta: header.meta.map((m, j) => (j === i ? v : m)) });

  return (
    <header className="relative">
      <div className="h-44 relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={header.cover} alt="" className="w-full h-full object-cover" />
        {/* лёгкий тёплый тон вместо плотного мультиплая — фото остаётся фотографией */}
        <div className="absolute inset-0 bg-moss/15 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
      </div>

      <div className="px-5 -mt-14 relative">
        <div className="flex items-end justify-between mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={header.avatar}
            alt={header.name}
            className="w-28 h-28 rounded-full object-cover ring-4 ring-bg shadow-cozy-lg"
          />
          <span className="mb-1 flex items-center gap-1.5 text-[12px] text-sub bg-card/80 backdrop-blur px-3 py-1.5 rounded-full border border-ink/5">
            <span className="w-2 h-2 rounded-full bg-[#6FBF4F]" />
            <EditableText
              as="span"
              value={header.status}
              onChange={(v) => set({ status: v })}
              placeholder="статус"
            />
          </span>
        </div>

        <EditableText
          as="h1"
          className="font-serif text-[2rem] leading-none text-ink mb-0.5"
          value={header.name}
          onChange={(v) => set({ name: v })}
          placeholder="Имя"
        />
        <EditableText
          as="p"
          className="text-clayd text-[14px] font-medium mb-3"
          value={header.role}
          onChange={(v) => set({ role: v })}
          placeholder="Специализация"
        />
        <EditableText
          as="p"
          multiline
          className="text-ink/80 text-[15px] leading-relaxed mb-4"
          value={header.bio}
          onChange={(v) => set({ bio: v })}
          placeholder="Коротко о себе"
        />

        {editing ? (
          <div className="flex flex-wrap items-center gap-2 text-[13px] mb-5">
            {header.meta.map((m, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 bg-soft rounded-full pl-3 pr-1 py-1"
              >
                <EditableText
                  as="span"
                  className="text-ink"
                  value={m}
                  onChange={(v) => setMeta(i, v)}
                  placeholder="пункт"
                />
                <button
                  type="button"
                  onClick={() => set({ meta: header.meta.filter((_, j) => j !== i) })}
                  className="w-5 h-5 rounded-full text-red-400 hover:bg-red-50 flex items-center justify-center"
                  aria-label="Убрать пункт"
                >
                  <CloseIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={() => set({ meta: [...header.meta, "Новый пункт"] })}
              className="rounded-full border border-dashed border-moss/40 text-moss px-3 py-1 text-[13px]"
            >
              + пункт
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[13px] text-sub mb-5">
            {header.meta.map((m, i) => {
              const [first, ...rest] = m.split(" ");
              return (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <span className="text-sage">·</span>}
                  <span>
                    <span className="font-semibold text-ink">{first}</span>
                    {rest.length > 0 && " " + rest.join(" ")}
                  </span>
                </span>
              );
            })}
          </div>
        )}

        <div className="flex gap-2.5">
          <DoorLink
            door={doors.book}
            className="flex-1 text-center bg-moss text-white py-3 rounded-xl font-semibold text-[15px] shadow-md shadow-moss/25 hover:bg-mossd transition-colors"
          />
          <DoorLink
            door={doors.message}
            className="flex-1 bg-card border border-ink/10 text-ink py-3 rounded-xl font-semibold text-[15px] hover:border-moss/40 transition-colors flex items-center justify-center gap-2"
          >
            <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
            {doors.message.label}
          </DoorLink>
        </div>
      </div>
    </header>
  );
}
