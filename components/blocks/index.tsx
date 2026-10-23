// ════════════════════════════════════════════════════════════
//  Ryadom · библиотека блоков (React-порт render.js)
//  Один компонент на тип блока. BlockRenderer выбирает нужный.
//  Один и тот же код рисует публичную страницу И редактор:
//  правка включается контекстом (EditProvider) через примитивы.
// ════════════════════════════════════════════════════════════
"use client";

import type {
  Block,
  StatementBlock,
  TextBlock,
  GridBlock,
  VideoBlock,
  StepsBlock,
  EducationBlock,
  PhotoBlock,
  PricingBlock,
  FaqBlock,
  ReviewsBlock,
  MetaBlock,
  CtaBlock,
  Door,
} from "@/lib/types";
import { PlayIcon, PlusIcon, StarIcon } from "@/components/icons";
import { PLACEHOLDER_IMG } from "@/lib/blockSchema";
import { landscape } from "@/lib/landscapes";
import { useEditing } from "./EditContext";
import { DoorLink } from "@/components/DoorLink";
import { linkHref } from "@/lib/urls";
import {
  EditableText,
  EditableImage,
  ItemControls,
  AddItem,
  EditOnly,
  StarRating,
} from "./inline";

type Edit<B> = (b: B) => void;
type BP<B> = { block: B; onChange?: Edit<B> };

// переставить элемент списка
function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

// заголовок секции (необязательный) — правится инлайн, в view скрыт при пустом.
// Крупный serif + тёплая чёрточка: страница читается «главами», а не простынёй.
function SectionTitle({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const editing = useEditing();
  if (!editing && !value) return null;
  return (
    <div className="flex items-center gap-2.5 pt-2 mb-3 px-1">
      <span className="w-4 h-[3px] rounded-full bg-clay shrink-0" aria-hidden />
      <EditableText
        as="h3"
        className="font-serif text-[1.4rem] leading-tight text-ink"
        value={value}
        onChange={onChange}
        placeholder="Заголовок"
      />
    </div>
  );
}

// [1] Заявление — цветная карточка
function Statement({ block, onChange }: BP<StatementBlock>) {
  const set = (p: Partial<StatementBlock>) => onChange?.({ ...block, ...p });
  const skin =
    block.color === "moss"
      ? "bg-moss text-white"
      : block.color === "deep"
      ? "bg-deep text-white"
      : block.color === "soft"
      ? "bg-soft text-ink"
      : "bg-card text-ink border border-ink/5";
  return (
    <div>
      <ColorSwatches value={block.color ?? "card"} onChange={(c) => set({ color: c })} />
      <article className={`${skin} rounded-2xl p-6 shadow-sm`}>
        <EditableText
          as="p"
          multiline
          className="font-serif text-[1.55rem] leading-snug mb-3"
          value={block.text}
          onChange={(v) => set({ text: v })}
          placeholder="Заявление или цитата"
        />
        <EditableText
          as="p"
          className="opacity-70 text-[13px]"
          value={block.caption ?? ""}
          onChange={(v) => set({ caption: v })}
          placeholder="Подпись (необязательно)"
        />
      </article>
    </div>
  );
}

const STATEMENT_COLORS: { c: NonNullable<StatementBlock["color"]>; cls: string }[] = [
  { c: "moss", cls: "bg-moss" },
  { c: "deep", cls: "bg-deep" },
  { c: "soft", cls: "bg-soft" },
  { c: "card", cls: "bg-card border border-ink/15" },
];

function ColorSwatches({
  value,
  onChange,
}: {
  value: string;
  onChange: (c: NonNullable<StatementBlock["color"]>) => void;
}) {
  return (
    <EditOnly>
      <div className="flex gap-2 mb-2 px-1">
        {STATEMENT_COLORS.map((o) => (
          <button
            key={o.c}
            type="button"
            onClick={() => onChange(o.c)}
            aria-label={o.c}
            className={`w-6 h-6 rounded-full ${o.cls} ${
              value === o.c ? "ring-2 ring-offset-2 ring-moss ring-offset-bg" : ""
            }`}
          />
        ))}
      </div>
    </EditOnly>
  );
}

// [2] Текстовый блок — без карточки, прямо на фоне: даёт ленте дышать
function Text({ block, onChange }: BP<TextBlock>) {
  const set = (p: Partial<TextBlock>) => onChange?.({ ...block, ...p });
  return (
    <article>
      <SectionTitle value={block.title ?? ""} onChange={(v) => set({ title: v })} />
      <EditableText
        as="p"
        multiline
        className="block text-ink/80 text-[15px] leading-relaxed px-1"
        value={block.body}
        onChange={(v) => set({ body: v })}
        placeholder="Текст блока"
      />
    </article>
  );
}

// [3] Плитка 2×2 с фото
function Grid({ block, onChange }: BP<GridBlock>) {
  const set = (p: Partial<GridBlock>) => onChange?.({ ...block, ...p });
  const setItem = (i: number, p: Partial<GridBlock["items"][number]>) =>
    set({ items: block.items.map((it, j) => (j === i ? { ...it, ...p } : it)) });
  const last = block.items.length - 1;
  return (
    <section>
      <SectionTitle value={block.title ?? ""} onChange={(v) => set({ title: v })} />
      <div className="grid grid-cols-2 gap-3">
        {block.items.map((it, i) => (
          <div key={i} className="group/item relative h-32 rounded-2xl overflow-hidden">
            <EditableImage
              value={it.img}
              onChange={(v) => setItem(i, { img: v })}
              className="w-full h-full object-cover"
              alt={it.label}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep/85 to-transparent pointer-events-none" />
            <EditableText
              as="span"
              className="absolute bottom-3 left-3 right-3 z-10 text-white font-semibold text-[15px]"
              value={it.label}
              onChange={(v) => setItem(i, { label: v })}
              placeholder="Тема"
            />
            <ItemControls
              onRemove={() => set({ items: block.items.filter((_, j) => j !== i) })}
              onUp={() => set({ items: move(block.items, i, -1) })}
              onDown={() => set({ items: move(block.items, i, 1) })}
              first={i === 0}
              last={i === last}
            />
          </div>
        ))}
      </div>
      <AddItem
        label="Добавить тему"
        onClick={() =>
          set({ items: [...block.items, { label: "Тема", img: landscape(block.items.length) }] })
        }
        className="mt-3"
      />
    </section>
  );
}

// [4] Видео-визитка
function Video({ block, onChange }: BP<VideoBlock>) {
  const set = (p: Partial<VideoBlock>) => onChange?.({ ...block, ...p });
  const editing = useEditing();
  const href = linkHref(block.url);
  return (
    <section>
      <SectionTitle value={block.title ?? ""} onChange={(v) => set({ title: v })} />
      {/* на публичной странице карточка — ссылка на само видео */}
      {!editing && href && (
        <a href={href} target="_blank" rel="noopener noreferrer" className="sr-only">
          Смотреть видео
        </a>
      )}
      <article
        className="relative h-56 rounded-2xl overflow-hidden shadow-sm group cursor-pointer"
        onClick={!editing && href ? () => window.open(href, "_blank", "noopener,noreferrer") : undefined}
      >
        <EditableImage
          value={block.img}
          onChange={(v) => set({ img: v })}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-deep/30 pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            <PlayIcon className="w-6 h-6 text-moss ml-1" />
          </div>
        </div>
        <EditableText
          as="p"
          className="absolute bottom-4 left-4 right-4 z-10 text-white font-medium text-[15px] drop-shadow"
          value={block.caption ?? ""}
          onChange={(v) => set({ caption: v })}
          placeholder="Подпись к видео"
        />
      </article>
      {editing && (
        <input
          value={block.url ?? ""}
          onChange={(e) => set({ url: e.target.value })}
          placeholder="Ссылка на видео: YouTube, VK, Rutube…"
          className="mt-2 w-full rounded-xl border border-ink/10 bg-card px-3.5 py-2.5 text-[14px] text-ink placeholder:text-sub/50 focus:border-moss outline-none"
        />
      )}
    </section>
  );
}

// [5] Карусель шагов
function Steps({ block, onChange }: BP<StepsBlock>) {
  const set = (p: Partial<StepsBlock>) => onChange?.({ ...block, ...p });
  const setItem = (i: number, p: Partial<StepsBlock["items"][number]>) =>
    set({ items: block.items.map((it, j) => (j === i ? { ...it, ...p } : it)) });
  const last = block.items.length - 1;
  return (
    <section>
      <SectionTitle value={block.title ?? ""} onChange={(v) => set({ title: v })} />
      <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1">
        {block.items.map((it, i) => (
          <div
            key={i}
            className="group/item relative snap-start shrink-0 w-44 bg-card rounded-2xl p-5 border border-ink/5 shadow-sm"
          >
            <EditableText
              as="div"
              className="text-clayd font-serif text-3xl mb-2"
              value={it.n}
              onChange={(v) => setItem(i, { n: v })}
              placeholder="01"
            />
            <EditableText
              as="p"
              className="font-semibold text-[15px] mb-1"
              value={it.title}
              onChange={(v) => setItem(i, { title: v })}
              placeholder="Шаг"
            />
            <EditableText
              as="p"
              multiline
              className="text-sub text-[13px] leading-snug"
              value={it.text}
              onChange={(v) => setItem(i, { text: v })}
              placeholder="Описание шага"
            />
            <ItemControls
              onRemove={() => set({ items: block.items.filter((_, j) => j !== i) })}
              onUp={() => set({ items: move(block.items, i, -1) })}
              onDown={() => set({ items: move(block.items, i, 1) })}
              first={i === 0}
              last={i === last}
            />
          </div>
        ))}
        <EditOnly>
          <div className="snap-start shrink-0 w-44 flex">
            <AddItem
              label="Шаг"
              onClick={() =>
                set({
                  items: [
                    ...block.items,
                    {
                      n: String(block.items.length + 1).padStart(2, "0"),
                      title: "Шаг",
                      text: "Описание шага",
                    },
                  ],
                })
              }
              className="self-center w-full"
            />
          </div>
        </EditOnly>
      </div>
    </section>
  );
}

// [6] Образование и сертификаты
function Education({ block, onChange }: BP<EducationBlock>) {
  const editing = useEditing();
  const set = (p: Partial<EducationBlock>) => onChange?.({ ...block, ...p });
  const setItem = (i: number, p: Partial<EducationBlock["items"][number]>) =>
    set({ items: block.items.map((it, j) => (j === i ? { ...it, ...p } : it)) });
  const diplomas = block.diplomas ?? [];
  const setDiploma = (i: number, v: string) =>
    set({ diplomas: diplomas.map((d, j) => (j === i ? v : d)) });
  const last = block.items.length - 1;
  return (
    <section>
      <SectionTitle value={block.title ?? ""} onChange={(v) => set({ title: v })} />
      <article className="bg-card rounded-2xl p-5 border border-ink/5 shadow-sm mb-3">
        <ol className="relative border-l border-sage/40 ml-1 space-y-5">
          {block.items.map((it, i) => (
            <li key={i} className="group/item pl-5 relative">
              <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-moss" />
              <EditableText
                as="p"
                className="text-[15px] font-semibold text-ink leading-tight"
                value={it.place}
                onChange={(v) => setItem(i, { place: v })}
                placeholder="Где / что"
              />
              <EditableText
                as="p"
                className="text-[13px] text-sub"
                value={it.detail}
                onChange={(v) => setItem(i, { detail: v })}
                placeholder="Специальность · год"
              />
              <ItemControls
                onRemove={() => set({ items: block.items.filter((_, j) => j !== i) })}
                onUp={() => set({ items: move(block.items, i, -1) })}
                onDown={() => set({ items: move(block.items, i, 1) })}
                first={i === 0}
                last={i === last}
              />
            </li>
          ))}
        </ol>
        <AddItem
          label="Добавить пункт"
          onClick={() =>
            set({
              items: [...block.items, { place: "Учебное заведение", detail: "Специальность · год" }],
            })
          }
          className="mt-4"
        />
      </article>
      {(editing || diplomas.length > 0) && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {diplomas.map((src, i) => (
            <div key={i} className="group/item relative shrink-0">
              <EditableImage
                value={src}
                onChange={(v) => setDiploma(i, v)}
                className="w-28 h-36 object-cover rounded-xl border border-ink/5 shadow-sm"
              />
              <ItemControls onRemove={() => set({ diplomas: diplomas.filter((_, j) => j !== i) })} />
            </div>
          ))}
          <EditOnly>
            <button
              type="button"
              onClick={() => set({ diplomas: [...diplomas, PLACEHOLDER_IMG] })}
              className="shrink-0 w-28 h-36 rounded-xl border border-dashed border-moss/40 text-moss text-[13px] flex items-center justify-center"
            >
              + скан
            </button>
          </EditOnly>
        </div>
      )}
    </section>
  );
}

// [7] Фото-пост
function Photo({ block, onChange }: BP<PhotoBlock>) {
  const editing = useEditing();
  const set = (p: Partial<PhotoBlock>) => onChange?.({ ...block, ...p });
  return (
    <article className="bg-card rounded-2xl overflow-hidden border border-ink/5 shadow-sm">
      <div className="relative">
        <EditableImage
          value={block.img}
          onChange={(v) => set({ img: v })}
          className="w-full h-48 object-cover"
        />
      </div>
      {(editing || block.caption) && (
        <div className="p-5">
          <EditableText
            as="p"
            multiline
            className="text-ink/80 text-[15px] leading-relaxed"
            value={block.caption ?? ""}
            onChange={(v) => set({ caption: v })}
            placeholder="Подпись к фото"
          />
        </div>
      )}
    </article>
  );
}

// [8] Тарифы
function Pricing({ block, onChange }: BP<PricingBlock>) {
  const set = (p: Partial<PricingBlock>) => onChange?.({ ...block, ...p });
  const setItem = (i: number, p: Partial<PricingBlock["items"][number]>) =>
    set({ items: block.items.map((it, j) => (j === i ? { ...it, ...p } : it)) });
  const remove = (i: number) => set({ items: block.items.filter((_, j) => j !== i) });
  const last = block.items.length - 1;
  return (
    <section>
      <SectionTitle value={block.title ?? ""} onChange={(v) => set({ title: v })} />
      <div className="grid grid-cols-2 gap-3">
        {block.items.map((it, i) => {
          const featured = it.featured;
          return (
            <article
              key={i}
              className={`group/item relative rounded-2xl p-5 shadow-cozy ${
                featured ? "bg-moss text-white" : "bg-card text-ink border border-ink/5"
              }`}
            >
              {featured && (
                <EditableText
                  as="span"
                  className="absolute top-3 right-3 z-10 text-[10px] font-semibold bg-clay text-white px-2 py-0.5 rounded-full"
                  value={it.badge ?? ""}
                  onChange={(v) => setItem(i, { badge: v })}
                  placeholder="бейдж"
                />
              )}
              <EditableText
                as="p"
                className="text-[14px] font-semibold mb-1"
                value={it.name}
                onChange={(v) => setItem(i, { name: v })}
                placeholder="Тариф"
              />
              <EditableText
                as="p"
                className={`font-serif text-3xl mb-1 ${featured ? "" : "text-moss"}`}
                value={it.price}
                onChange={(v) => setItem(i, { price: v })}
                placeholder="0 ₽"
              />
              <EditableText
                as="p"
                className={`text-[13px] ${featured ? "text-white/70" : "text-sub"}`}
                value={it.note}
                onChange={(v) => setItem(i, { note: v })}
                placeholder="Описание"
              />
              <EditOnly>
                <button
                  type="button"
                  onClick={() => setItem(i, { featured: !featured })}
                  className={`absolute bottom-2 right-2 z-10 p-1.5 rounded-full ${
                    featured ? "bg-white/20 text-white" : "bg-clay/10 text-clay"
                  }`}
                  aria-label={featured ? "Снять выделение" : "Выделить тариф"}
                >
                  <StarIcon className="w-3.5 h-3.5" />
                </button>
              </EditOnly>
              <ItemControls
                onRemove={() => remove(i)}
                onUp={() => set({ items: move(block.items, i, -1) })}
                onDown={() => set({ items: move(block.items, i, 1) })}
                first={i === 0}
                last={i === last}
              />
            </article>
          );
        })}
      </div>
      <AddItem
        label="Добавить тариф"
        onClick={() =>
          set({ items: [...block.items, { name: "Тариф", price: "0 ₽", note: "", featured: false }] })
        }
        className="mt-3"
      />
    </section>
  );
}

// [9] Частые вопросы
function Faq({ block, onChange }: BP<FaqBlock>) {
  const editing = useEditing();
  const set = (p: Partial<FaqBlock>) => onChange?.({ ...block, ...p });
  const setItem = (i: number, p: Partial<FaqBlock["items"][number]>) =>
    set({ items: block.items.map((it, j) => (j === i ? { ...it, ...p } : it)) });
  const last = block.items.length - 1;
  return (
    <section>
      <SectionTitle value={block.title ?? ""} onChange={(v) => set({ title: v })} />
      <div className="space-y-2">
        {block.items.map((it, i) =>
          editing ? (
            // в правке — оба поля открыты, без сворачивания
            <div
              key={i}
              className="group/item relative bg-card rounded-2xl border border-ink/5 shadow-sm p-4"
            >
              <EditableText
                as="p"
                className="text-[15px] font-medium mb-2 pr-6"
                value={it.q}
                onChange={(v) => setItem(i, { q: v })}
                placeholder="Вопрос"
              />
              <EditableText
                as="p"
                multiline
                className="text-sub text-[14px] leading-relaxed"
                value={it.a}
                onChange={(v) => setItem(i, { a: v })}
                placeholder="Ответ"
              />
              <ItemControls
                onRemove={() => set({ items: block.items.filter((_, j) => j !== i) })}
                onUp={() => set({ items: move(block.items, i, -1) })}
                onDown={() => set({ items: move(block.items, i, 1) })}
                first={i === 0}
                last={i === last}
              />
            </div>
          ) : (
            <details
              key={i}
              className="group bg-card rounded-2xl border border-ink/5 shadow-sm overflow-hidden"
            >
              <summary className="flex justify-between items-center p-4 cursor-pointer text-[15px] font-medium">
                {it.q}
                <span className="text-sage group-open:rotate-45 transition-transform shrink-0 ml-3">
                  <PlusIcon className="w-4 h-4" />
                </span>
              </summary>
              <p className="px-4 pb-4 text-sub text-[14px] leading-relaxed">{it.a}</p>
            </details>
          )
        )}
      </div>
      <AddItem
        label="Добавить вопрос"
        onClick={() => set({ items: [...block.items, { q: "Вопрос?", a: "Ответ." }] })}
        className="mt-2"
      />
    </section>
  );
}

// [10] Отзывы
function Reviews({ block, onChange }: BP<ReviewsBlock>) {
  const set = (p: Partial<ReviewsBlock>) => onChange?.({ ...block, ...p });
  const setItem = (i: number, p: Partial<ReviewsBlock["items"][number]>) =>
    set({ items: block.items.map((it, j) => (j === i ? { ...it, ...p } : it)) });
  const last = block.items.length - 1;
  return (
    <section>
      <SectionTitle value={block.title ?? ""} onChange={(v) => set({ title: v })} />
      <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1">
        {block.items.map((it, i) => (
          <article
            key={i}
            className="group/item relative snap-start shrink-0 w-[78%] bg-soft rounded-2xl p-5"
          >
            <StarRating
              value={it.stars}
              onChange={(v) => setItem(i, { stars: v })}
              className="text-clay mb-3"
            />
            <EditableText
              as="p"
              multiline
              className="text-ink/85 text-[15px] leading-relaxed mb-4"
              value={it.text}
              onChange={(v) => setItem(i, { text: v })}
              placeholder="Текст отзыва"
            />
            <EditableText
              as="p"
              className="text-[13px] font-semibold text-ink"
              value={it.author}
              onChange={(v) => setItem(i, { author: v })}
              placeholder="Имя, возраст"
            />
            <ItemControls
              onRemove={() => set({ items: block.items.filter((_, j) => j !== i) })}
              onUp={() => set({ items: move(block.items, i, -1) })}
              onDown={() => set({ items: move(block.items, i, 1) })}
              first={i === 0}
              last={i === last}
            />
          </article>
        ))}
        <EditOnly>
          <div className="snap-start shrink-0 w-[78%] flex">
            <AddItem
              label="отзыв"
              onClick={() =>
                set({ items: [...block.items, { stars: 5, text: "Текст отзыва", author: "Имя" }] })
              }
              className="w-full flex items-center justify-center"
            />
          </div>
        </EditOnly>
      </div>
    </section>
  );
}

// [11] Мета-полоска
function Meta({ block, onChange }: BP<MetaBlock>) {
  const set = (p: Partial<MetaBlock>) => onChange?.({ ...block, ...p });
  const setItem = (i: number, p: Partial<MetaBlock["items"][number]>) =>
    set({ items: block.items.map((it, j) => (j === i ? { ...it, ...p } : it)) });
  return (
    <article className="bg-soft rounded-2xl p-5">
      <div className="grid grid-cols-3 gap-2 text-center">
        {block.items.map((it, i) => (
          <div key={i} className={`group/item relative ${i === 1 ? "border-x border-ink/10" : ""}`}>
            <EditableText
              as="p"
              className="font-serif text-2xl text-moss"
              value={it.value}
              onChange={(v) => setItem(i, { value: v })}
              placeholder="0"
            />
            <EditableText
              as="p"
              className="text-[12px] text-sub"
              value={it.label}
              onChange={(v) => setItem(i, { label: v })}
              placeholder="метрика"
            />
            {block.items.length > 1 && (
              <ItemControls onRemove={() => set({ items: block.items.filter((_, j) => j !== i) })} />
            )}
          </div>
        ))}
      </div>
      <AddItem
        label="метрику"
        onClick={() => set({ items: [...block.items, { value: "0", label: "метрика" }] })}
        className="mt-3"
      />
    </article>
  );
}

// [12] Финальный блок-контакт
function Cta({
  block,
  doors,
  onChange,
}: {
  block: CtaBlock;
  doors: { book: Door; message: Door };
  onChange?: Edit<CtaBlock>;
}) {
  const set = (p: Partial<CtaBlock>) => onChange?.({ ...block, ...p });
  return (
    <article className="bg-deep text-white rounded-2xl p-6 text-center shadow-cozy-lg">
      <EditableText
        as="p"
        className="font-serif text-[1.6rem] leading-snug mb-2"
        value={block.title}
        onChange={(v) => set({ title: v })}
        placeholder="Заголовок"
      />
      <EditableText
        as="p"
        multiline
        className="text-white/65 text-[14px] leading-relaxed mb-5"
        value={block.text}
        onChange={(v) => set({ text: v })}
        placeholder="Короткий текст"
      />
      <div className="flex gap-2.5">
        <DoorLink
          door={doors.book}
          className="flex-1 text-center bg-moss text-white py-3 rounded-xl font-semibold text-[15px] hover:bg-mossd transition-colors"
        />
        <DoorLink
          door={doors.message}
          className="flex-1 text-center bg-white/10 backdrop-blur border border-white/15 text-white py-3 rounded-xl font-semibold text-[15px] hover:bg-white/20 transition-colors"
        />
      </div>
    </article>
  );
}

// ── Диспетчер: тип блока → компонент ──
export function BlockRenderer({
  block,
  doors,
  onChange,
}: {
  block: Block;
  doors: { book: Door; message: Door };
  onChange?: Edit<Block>;
}) {
  switch (block.type) {
    case "statement":
      return <Statement block={block} onChange={onChange} />;
    case "text":
      return <Text block={block} onChange={onChange} />;
    case "grid":
      return <Grid block={block} onChange={onChange} />;
    case "video":
      return <Video block={block} onChange={onChange} />;
    case "steps":
      return <Steps block={block} onChange={onChange} />;
    case "education":
      return <Education block={block} onChange={onChange} />;
    case "photo":
      return <Photo block={block} onChange={onChange} />;
    case "pricing":
      return <Pricing block={block} onChange={onChange} />;
    case "faq":
      return <Faq block={block} onChange={onChange} />;
    case "reviews":
      return <Reviews block={block} onChange={onChange} />;
    case "meta":
      return <Meta block={block} onChange={onChange} />;
    case "cta":
      return <Cta block={block} doors={doors} onChange={onChange} />;
  }
}
