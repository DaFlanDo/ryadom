"use client";

import type { ProfileHeader as Header, Door } from "@/lib/types";
import { CloseIcon, TelegramIcon } from "@/components/icons";
import { useEditing } from "@/components/blocks/EditContext";
import { EditableImage, EditableText } from "@/components/blocks/inline";
import { DoorLink } from "@/components/DoorLink";
import { HEADER_PLACE, StickerBadge } from "@/components/StickerBadge";
import { Fix, Note } from "@/components/paper";
import { defaultHello } from "@/lib/hello";

// Шапка в духе «Записки»: полароид на скотче, приветствие от руки,
// факты через каракули, записка «пара слов от меня» и кнопки.
// Одна и та же разметка для публичной страницы и редактора (правка инлайн).
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
  const setMeta = (i: number, v: string) => set({ meta: header.meta.map((m, j) => (j === i ? v : m)) });
  const hello = header.hello ?? defaultHello(header.name);

  return (
    <header className="relative">
      {/* обложка: фото кабинета или чего-то своего, мягко уходит в бумагу */}
      <div className="h-48 relative overflow-hidden">
        {(header.cover || editing) && (
          <EditableImage
            value={header.cover}
            onChange={(v) => set({ cover: v })}
            className="w-full h-full object-cover saturate-[.85]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/10 to-transparent pointer-events-none" />
      </div>

      <div className="px-6 relative -mt-[92px]">
        <div className="flex items-end justify-between">
          <figure className="polaroid relative p-2 pb-6 w-[132px] shrink-0" style={{ transform: "rotate(-3deg)" }}>
            <Fix className="left-8 -top-3" rotate={4} />
            <div className="relative h-[124px] overflow-hidden">
              <EditableImage
                value={header.avatar}
                onChange={(v) => set({ avatar: v })}
                alt={header.name}
                className="w-full h-full object-cover"
              />
            </div>
          </figure>
          <span className="mb-2 flex items-center gap-1.5 text-[12.5px] text-sub bg-card/90 px-3 py-1.5 rounded-full border border-ink/10">
            <span className="w-2 h-2 rounded-full bg-[#6FBF4F]" />
            <EditableText as="span" value={header.status} onChange={(v) => set({ status: v })} placeholder="статус" />
          </span>
        </div>

        <EditableText
          as="p"
          className="hand hand-xl text-hand mt-4 -rotate-[1.5deg] origin-left"
          value={hello}
          onChange={(v) => set({ hello: v })}
          placeholder="привет, я …"
        />
        <EditableText
          as="h1"
          className="font-serif text-[2rem] leading-[1.05] text-ink mt-1"
          value={header.name}
          onChange={(v) => set({ name: v })}
          placeholder="Имя"
        />
        <EditableText
          as="p"
          className="text-[14px] text-sub mt-1.5"
          value={header.role}
          onChange={(v) => set({ role: v })}
          placeholder="психолог · подход"
        />

        {/* факты: в правке — список, на странице — строка от руки через «~» */}
        {editing ? (
          <div className="flex flex-wrap items-center gap-2 text-[13px] mt-3">
            {header.meta.map((m, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-soft rounded-full pl-3 pr-1 py-1">
                <EditableText as="span" className="text-ink" value={m} onChange={(v) => setMeta(i, v)} placeholder="факт" />
                <button
                  type="button"
                  onClick={() => set({ meta: header.meta.filter((_, j) => j !== i) })}
                  className="w-5 h-5 rounded-full text-red-400 hover:bg-red-50 flex items-center justify-center"
                  aria-label="Убрать"
                >
                  <CloseIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={() => set({ meta: [...header.meta, "8 лет практики"] })}
              className="rounded-full border border-dashed border-moss/40 text-moss px-3 py-1 text-[13px]"
            >
              + факт
            </button>
          </div>
        ) : (
          header.meta.length > 0 && (
            <p className="hand hand-md text-mossd mt-2">
              {header.meta.map((m, i) => (
                <span key={i}>
                  {i > 0 && <span className="text-sage mx-1.5">~</span>}
                  {m}
                </span>
              ))}
            </p>
          )
        )}

        <EditableText
          as="p"
          multiline
          className="block text-ink/85 text-[15px] leading-relaxed mt-3"
          value={header.bio}
          onChange={(v) => set({ bio: v })}
          placeholder="Коротко: с чем помогаете и как"
        />

        {(header.note || editing) && (
          <Note index={-1} fix="right" className="mt-5">
            <EditableText
              as="p"
              multiline
              className="block hand hand-lg text-ink leading-snug"
              value={header.note ?? ""}
              onChange={(v) => set({ note: v })}
              placeholder="Пара слов от вас: например, «Если вы это читаете — наверное, сейчас непросто…»"
            />
          </Note>
        )}

        <div className="flex gap-2.5 mt-5">
          <DoorLink
            door={doors.book}
            className="flex-1 text-center btn-shape bg-moss text-btn-ink py-3.5 font-semibold text-[15px] shadow-md shadow-moss/25 hover:bg-mossd transition-colors"
          />
          <DoorLink
            door={doors.message}
            className="flex-1 btn-shape bg-card border border-ink/10 text-ink py-3.5 font-semibold text-[15px] hover:border-moss/40 transition-colors flex items-center justify-center gap-2"
          >
            <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
            {doors.message.label}
          </DoorLink>
        </div>
        <EditableText
          as="p"
          className="block hand hand-md text-sub text-center mt-2"
          value={header.replyHint ?? ""}
          onChange={(v) => set({ replyHint: v })}
          placeholder="отвечаю обычно в течение дня"
        />
      </div>
      <StickerBadge sticker={header.sticker} place={HEADER_PLACE} size={64} />
    </header>
  );
}
