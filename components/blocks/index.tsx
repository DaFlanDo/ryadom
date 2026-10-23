// ════════════════════════════════════════════════════════════
//  Ryadom · блоки страницы в стиле «Записки».
//  Один компонент на тип блока, BlockRenderer выбирает нужный.
//  Один и тот же код рисует публичную страницу И редактор:
//  правка включается контекстом (EditProvider) через примитивы inline.tsx.
//  Бумага, крепления и почерк берутся из темы (components/paper.tsx).
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
  TopicsBlock,
  MeetingBlock,
  Door,
} from "@/lib/types";
import { PlayIcon, StarIcon } from "@/components/icons";
import { PLACEHOLDER_IMG } from "@/lib/blockSchema";
import { landscape } from "@/lib/landscapes";
import { useEditing } from "./EditContext";
import { DoorLink } from "@/components/DoorLink";
import { StickerBadge } from "@/components/StickerBadge";
import { Fix, HandCircle, Note, Polaroid, tilt } from "@/components/paper";
import { linkHref } from "@/lib/urls";
import { EditableText, EditableImage, ItemControls, AddItem, EditOnly } from "./inline";

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

// Заголовок раздела — от руки, как пометка в блокноте
function SectionTitle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editing = useEditing();
  if (!editing && !value) return null;
  return (
    <EditableText
      as="h3"
      className="block hand hand-xl text-ink mb-3 px-1"
      value={value}
      onChange={onChange}
      placeholder="заголовок"
    />
  );
}

// [1] Цитата-принцип: крупный курсив и подпись от руки
function Statement({ block, onChange }: BP<StatementBlock>) {
  const set = (p: Partial<StatementBlock>) => onChange?.({ ...block, ...p });
  return (
    <section className="relative px-1 pt-3">
      <span aria-hidden className="absolute -left-1 -top-6 font-serif text-[88px] leading-none text-clay/35 select-none">
        “
      </span>
      <EditableText
        as="p"
        multiline
        className="block font-serif italic text-[1.6rem] leading-[1.2] text-ink pl-4"
        value={block.text}
        onChange={(v) => set({ text: v })}
        placeholder="Ваш главный принцип в работе"
      />
      <EditableText
        as="p"
        className="block hand hand-md text-sub mt-2 pl-4"
        value={block.caption ?? ""}
        onChange={(v) => set({ caption: v })}
        placeholder="— мой главный принцип"
      />
    </section>
  );
}

// [2] Обо мне — как письмо, с буквицей
function Text({ block, onChange }: BP<TextBlock>) {
  const set = (p: Partial<TextBlock>) => onChange?.({ ...block, ...p });
  return (
    <section>
      <SectionTitle value={block.title ?? ""} onChange={(v) => set({ title: v })} />
      <EditableText
        as="p"
        multiline
        className="block text-ink/85 text-[15px] leading-[1.65] px-1 first-letter:float-left first-letter:font-serif first-letter:text-[3.4rem] first-letter:leading-[.8] first-letter:mr-2 first-letter:mt-1.5 first-letter:text-moss"
        value={block.body}
        onChange={(v) => set({ body: v })}
        placeholder="Расскажите о себе простыми словами — как клиенту, который только зашёл"
      />
    </section>
  );
}

// [3] С чем приходят — живые фразы
function Topics({ block, onChange }: BP<TopicsBlock>) {
  const editing = useEditing();
  const set = (p: Partial<TopicsBlock>) => onChange?.({ ...block, ...p });
  const setItem = (i: number, v: string) => set({ items: block.items.map((t, j) => (j === i ? v : t)) });
  return (
    <section>
      <SectionTitle value={block.title ?? ""} onChange={(v) => set({ title: v })} />
      <div className="flex flex-wrap gap-2 px-1">
        {block.items.map((t, i) => (
          <span key={i} className="group/item relative inline-flex bg-moss/10 text-mossd rounded-full px-3.5 py-1.5 text-[14px]">
            <EditableText as="span" value={t} onChange={(v) => setItem(i, v)} placeholder="запрос" />
            {editing && <ItemControls onRemove={() => set({ items: block.items.filter((_, j) => j !== i) })} />}
          </span>
        ))}
      </div>
      <AddItem label="Добавить запрос" onClick={() => set({ items: [...block.items, "новый запрос"] })} className="mt-3" />
    </section>
  );
}

// [4] Первая встреча — записка на скотче
function Meeting({ block, onChange }: BP<MeetingBlock>) {
  const set = (p: Partial<MeetingBlock>) => onChange?.({ ...block, ...p });
  return (
    <Note index={2}>
      <EditableText
        as="h3"
        className="block hand hand-xl text-ink"
        value={block.title ?? ""}
        onChange={(v) => set({ title: v })}
        placeholder="как пройдёт первая встреча"
      />
      <EditableText
        as="p"
        multiline
        className="block text-sub text-[14.5px] leading-relaxed mt-2"
        value={block.text}
        onChange={(v) => set({ text: v })}
        placeholder="Сколько длится, где, что будет происходить, что если не подойдём друг другу"
      />
    </Note>
  );
}

// [5] Фото-альбом — полароиды по двое
function Grid({ block, onChange }: BP<GridBlock>) {
  const set = (p: Partial<GridBlock>) => onChange?.({ ...block, ...p });
  const setItem = (i: number, p: Partial<GridBlock["items"][number]>) =>
    set({ items: block.items.map((it, j) => (j === i ? { ...it, ...p } : it)) });
  const last = block.items.length - 1;
  return (
    <section>
      <SectionTitle value={block.title ?? ""} onChange={(v) => set({ title: v })} />
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 px-1 pt-2">
        {block.items.map((it, i) => (
          <div key={i} className="group/item relative">
            <Polaroid
              src={it.img}
              onChange={(v) => setItem(i, { img: v })}
              caption={it.label}
              onCaption={(v) => setItem(i, { label: v })}
              index={i}
              fix={i % 2 === 0}
              imgClassName="h-32"
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
        label="Добавить фото"
        onClick={() => set({ items: [...block.items, { label: "", img: landscape(block.items.length) }] })}
        className="mt-4"
      />
    </section>
  );
}

// [6] Видео — полароид с кнопкой, по клику открывается само видео
function Video({ block, onChange }: BP<VideoBlock>) {
  const set = (p: Partial<VideoBlock>) => onChange?.({ ...block, ...p });
  const editing = useEditing();
  const href = linkHref(block.url);
  return (
    <section>
      <SectionTitle value={block.title ?? ""} onChange={(v) => set({ title: v })} />
      {!editing && href && (
        <a href={href} target="_blank" rel="noopener noreferrer" className="sr-only">
          Смотреть видео
        </a>
      )}
      <figure
        className="polaroid relative p-2.5 pb-1 mx-1 cursor-pointer group"
        style={{ transform: `rotate(${tilt(3)}deg)` }}
        onClick={!editing && href ? () => window.open(href, "_blank", "noopener,noreferrer") : undefined}
      >
        <Fix className="left-1/2 -translate-x-1/2 -top-3" rotate={-3} />
        <div className="relative h-52 overflow-hidden">
          <EditableImage value={block.img} onChange={(v) => set({ img: v })} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-deep/20 pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <PlayIcon className="w-6 h-6 text-ink ml-1" />
            </div>
          </div>
        </div>
        <figcaption className="px-1 pt-1.5 pb-1">
          <EditableText
            as="span"
            className="hand hand-md text-ink"
            value={block.caption ?? ""}
            onChange={(v) => set({ caption: v })}
            placeholder="подпись к видео"
          />
        </figcaption>
      </figure>
      {editing && (
        <input
          value={block.url ?? ""}
          onChange={(e) => set({ url: e.target.value })}
          placeholder="Ссылка на видео: YouTube, VK, Rutube…"
          className="mt-4 w-full rounded-xl border border-ink/10 bg-card px-3.5 py-2.5 text-[14px] text-ink placeholder:text-sub/50 focus:border-moss outline-none"
        />
      )}
    </section>
  );
}

// [7] Как проходит работа — тропинка из шагов
function Steps({ block, onChange }: BP<StepsBlock>) {
  const set = (p: Partial<StepsBlock>) => onChange?.({ ...block, ...p });
  const setItem = (i: number, p: Partial<StepsBlock["items"][number]>) =>
    set({ items: block.items.map((it, j) => (j === i ? { ...it, ...p } : it)) });
  const last = block.items.length - 1;
  return (
    <section>
      <SectionTitle value={block.title ?? ""} onChange={(v) => set({ title: v })} />
      <ol className="relative px-1 mt-1">
        {/* пунктирная тропинка за кружками */}
        <span aria-hidden className="absolute left-[18px] top-4 bottom-4 border-l-2 border-dashed border-sage" />
        {block.items.map((it, i) => (
          <li key={i} className="group/item relative flex gap-4 items-start pb-5 last:pb-0">
            <span className="relative z-10 w-9 h-9 shrink-0 rounded-full bg-card border border-ink/10 flex items-center justify-center">
              <EditableText
                as="span"
                className="hand hand-lg text-clay"
                value={it.n.replace(/^0+(?=\d)/, "")}
                onChange={(v) => setItem(i, { n: v })}
                placeholder="1"
              />
            </span>
            <div className="pt-1 min-w-0 flex-1">
              <EditableText
                as="p"
                className="block font-semibold text-[15px] text-ink"
                value={it.title}
                onChange={(v) => setItem(i, { title: v })}
                placeholder="Шаг"
              />
              <EditableText
                as="p"
                multiline
                className="block text-sub text-[13.5px] leading-snug mt-0.5"
                value={it.text}
                onChange={(v) => setItem(i, { text: v })}
                placeholder="Что происходит на этом шаге"
              />
            </div>
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
        label="Добавить шаг"
        onClick={() =>
          set({ items: [...block.items, { n: String(block.items.length + 1), title: "Шаг", text: "Описание шага" }] })
        }
        className="mt-3"
      />
    </section>
  );
}

// [8] Образование — годы на полях, дипломы на скотче, то, что важнее дипломов
function Education({ block, onChange }: BP<EducationBlock>) {
  const editing = useEditing();
  const set = (p: Partial<EducationBlock>) => onChange?.({ ...block, ...p });
  const setItem = (i: number, p: Partial<EducationBlock["items"][number]>) =>
    set({ items: block.items.map((it, j) => (j === i ? { ...it, ...p } : it)) });
  const diplomas = block.diplomas ?? [];
  const trust = block.trust ?? [];
  const last = block.items.length - 1;
  return (
    <section>
      <SectionTitle value={block.title ?? ""} onChange={(v) => set({ title: v })} />
      <ul className="space-y-3.5 px-1">
        {block.items.map((it, i) => (
          <li key={i} className="group/item relative flex gap-3.5">
            <EditableText
              as="span"
              className="hand hand-lg text-clay w-12 shrink-0 pt-0.5"
              value={it.year ?? ""}
              onChange={(v) => setItem(i, { year: v })}
              placeholder="год"
            />
            <div className="min-w-0">
              <EditableText
                as="p"
                className="block font-semibold text-[14.5px] text-ink leading-tight"
                value={it.place}
                onChange={(v) => setItem(i, { place: v })}
                placeholder="Где учились"
              />
              <EditableText
                as="p"
                className="block text-[13.5px] text-sub mt-0.5"
                value={it.detail}
                onChange={(v) => setItem(i, { detail: v })}
                placeholder="Специальность, программа"
              />
            </div>
            <ItemControls
              onRemove={() => set({ items: block.items.filter((_, j) => j !== i) })}
              onUp={() => set({ items: move(block.items, i, -1) })}
              onDown={() => set({ items: move(block.items, i, 1) })}
              first={i === 0}
              last={i === last}
            />
          </li>
        ))}
      </ul>
      <AddItem
        label="Добавить пункт"
        onClick={() => set({ items: [...block.items, { year: "", place: "Учебное заведение", detail: "Специальность" }] })}
        className="mt-3"
      />

      {(trust.length > 0 || editing) && (
        <div className="mt-4 px-1 space-y-1">
          {trust.map((t, i) => (
            <p key={i} className="group/item relative hand hand-md text-mossd flex gap-1.5">
              <span aria-hidden>✓</span>
              <EditableText
                as="span"
                value={t}
                onChange={(v) => set({ trust: trust.map((x, j) => (j === i ? v : x)) })}
                placeholder="хожу на супервизию"
              />
              <ItemControls onRemove={() => set({ trust: trust.filter((_, j) => j !== i) })} />
            </p>
          ))}
          <EditOnly>
            <button
              type="button"
              onClick={() => set({ trust: [...trust, "регулярно хожу на супервизию"] })}
              className="hand hand-md text-moss"
            >
              + что ещё важно (супервизия, личная терапия…)
            </button>
          </EditOnly>
        </div>
      )}

      {(diplomas.length > 0 || editing) && (
        <div className="flex gap-4 overflow-x-auto no-scrollbar px-2 pt-6 pb-2">
          {diplomas.map((src, i) => (
            <div key={i} className="group/item relative shrink-0 w-[104px]">
              <Polaroid src={src} onChange={(v) => set({ diplomas: diplomas.map((d, j) => (j === i ? v : d)) })} index={i + 1} imgClassName="h-24" />
              <ItemControls onRemove={() => set({ diplomas: diplomas.filter((_, j) => j !== i) })} />
            </div>
          ))}
          <EditOnly>
            <button
              type="button"
              onClick={() => set({ diplomas: [...diplomas, PLACEHOLDER_IMG] })}
              className="shrink-0 w-[104px] h-[128px] border-2 border-dashed border-moss/40 text-moss text-[13px] flex items-center justify-center"
            >
              + диплом
            </button>
          </EditOnly>
        </div>
      )}
    </section>
  );
}

// [9] Фото — один полароид с подписью
function Photo({ block, onChange }: BP<PhotoBlock>) {
  const set = (p: Partial<PhotoBlock>) => onChange?.({ ...block, ...p });
  return (
    <div className="px-6 pt-2">
      <Polaroid
        src={block.img}
        onChange={(v) => set({ img: v })}
        caption={block.caption}
        onCaption={(v) => set({ caption: v })}
        captionPlaceholder="подпись: «мой кабинет»"
        index={4}
        imgClassName="h-56"
      />
    </div>
  );
}

// [10] Цены — меню из кофейни: точки до цены, выгодное обведено от руки
function Pricing({ block, onChange }: BP<PricingBlock>) {
  const editing = useEditing();
  const set = (p: Partial<PricingBlock>) => onChange?.({ ...block, ...p });
  const setItem = (i: number, p: Partial<PricingBlock["items"][number]>) =>
    set({ items: block.items.map((it, j) => (j === i ? { ...it, ...p } : it)) });
  const last = block.items.length - 1;
  return (
    <Note index={5} fix="center" className="px-5 pt-5">
      <EditableText
        as="h3"
        className="block hand hand-xl text-ink"
        value={block.title ?? ""}
        onChange={(v) => set({ title: v })}
        placeholder="сколько стоит"
      />
      <div className="mt-3 space-y-3">
        {block.items.map((it, i) => (
          <div key={i} className="group/item relative">
            <div className="flex items-end">
              <EditableText as="span" className="text-[15px] text-ink" value={it.name} onChange={(v) => setItem(i, { name: v })} placeholder="Встреча" />
              <span className="leader" />
              <span className="relative font-serif text-[22px] font-semibold text-ink whitespace-nowrap">
                {it.featured && <HandCircle className="absolute -left-3 -top-2 w-[calc(100%+24px)] h-[calc(100%+12px)] text-clay pointer-events-none" />}
                <EditableText as="span" value={it.price} onChange={(v) => setItem(i, { price: v })} placeholder="0 ₽" />
              </span>
            </div>
            <EditableText as="p" className="block text-[13px] text-sub" value={it.note} onChange={(v) => setItem(i, { note: v })} placeholder="50 минут, онлайн" />
            {(it.featured || editing) && (
              <EditableText
                as="p"
                className="block hand hand-md text-clay text-right"
                value={it.badge ?? ""}
                onChange={(v) => setItem(i, { badge: v })}
                placeholder="пометка: «выгоднее на 1 500 ₽»"
              />
            )}
            <EditOnly>
              <button
                type="button"
                onClick={() => setItem(i, { featured: !it.featured })}
                className={`absolute -left-3 top-1 p-1 rounded-full ${it.featured ? "text-clay" : "text-sage"}`}
                aria-label={it.featured ? "Убрать обводку" : "Обвести от руки"}
              >
                <StarIcon className="w-3.5 h-3.5" />
              </button>
            </EditOnly>
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
        label="Добавить строку"
        onClick={() => set({ items: [...block.items, { name: "Встреча", price: "0 ₽", note: "", featured: false }] })}
        className="mt-3"
      />
      {(block.terms || editing) && (
        <div className="border-t border-dashed border-ink/15 mt-4 pt-3">
          <EditableText
            as="p"
            multiline
            className="block hand hand-md text-sub"
            value={block.terms ?? ""}
            onChange={(v) => set({ terms: v })}
            placeholder="оплата после встречи · перенос за сутки — бесплатно"
          />
        </div>
      )}
    </Note>
  );
}

// [11] Вопросы — пунктир и плюсики от руки
function Faq({ block, onChange }: BP<FaqBlock>) {
  const editing = useEditing();
  const set = (p: Partial<FaqBlock>) => onChange?.({ ...block, ...p });
  const setItem = (i: number, p: Partial<FaqBlock["items"][number]>) =>
    set({ items: block.items.map((it, j) => (j === i ? { ...it, ...p } : it)) });
  const last = block.items.length - 1;
  return (
    <section>
      <SectionTitle value={block.title ?? ""} onChange={(v) => set({ title: v })} />
      <div className="px-1">
        {block.items.map((it, i) =>
          editing ? (
            <div key={i} className="group/item relative py-3 border-b-[1.5px] border-dashed border-ink/15">
              <EditableText as="p" className="block font-serif text-[19px] font-semibold text-ink pr-6" value={it.q} onChange={(v) => setItem(i, { q: v })} placeholder="Вопрос" />
              <EditableText as="p" multiline className="block text-sub text-[14px] leading-relaxed mt-1" value={it.a} onChange={(v) => setItem(i, { a: v })} placeholder="Ответ" />
              <ItemControls
                onRemove={() => set({ items: block.items.filter((_, j) => j !== i) })}
                onUp={() => set({ items: move(block.items, i, -1) })}
                onDown={() => set({ items: move(block.items, i, 1) })}
                first={i === 0}
                last={i === last}
              />
            </div>
          ) : (
            <details key={i} className="group py-3 border-b-[1.5px] border-dashed border-ink/15">
              <summary className="flex justify-between items-start gap-3 cursor-pointer">
                <span className="font-serif text-[19px] font-semibold text-ink leading-snug">{it.q}</span>
                <span className="hand hand-xl text-clay leading-none group-open:hidden">+</span>
                <span className="hand hand-xl text-clay leading-none hidden group-open:inline">−</span>
              </summary>
              <p className="text-sub text-[14px] leading-relaxed mt-1.5">{it.a}</p>
            </details>
          )
        )}
      </div>
      <AddItem label="Добавить вопрос" onClick={() => set({ items: [...block.items, { q: "Вопрос?", a: "Ответ." }] })} className="mt-3" />
    </section>
  );
}

// [12] Отзывы — записки разного цвета, лесенкой
function Reviews({ block, onChange }: BP<ReviewsBlock>) {
  const set = (p: Partial<ReviewsBlock>) => onChange?.({ ...block, ...p });
  const setItem = (i: number, p: Partial<ReviewsBlock["items"][number]>) =>
    set({ items: block.items.map((it, j) => (j === i ? { ...it, ...p } : it)) });
  const last = block.items.length - 1;
  return (
    <section>
      <SectionTitle value={block.title ?? ""} onChange={(v) => set({ title: v })} />
      <div className="space-y-6 pt-2">
        {block.items.map((it, i) => (
          <div key={i} className={`group/item relative w-[86%] ${i % 2 ? "ml-auto" : ""}`}>
            <Note index={i * 3 + 1} tone={i % 2 ? "note" : "note2"} fix={i % 2 ? "right" : "left"}>
              <EditableText
                as="p"
                multiline
                className="block font-serif italic text-[17.5px] leading-snug text-ink"
                value={it.text}
                onChange={(v) => setItem(i, { text: v })}
                placeholder="Текст отзыва"
              />
              <EditableText
                as="p"
                className="block hand hand-md text-ink mt-2"
                value={it.author}
                onChange={(v) => setItem(i, { author: v })}
                placeholder="— Имя, возраст"
              />
            </Note>
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
        label="Добавить отзыв"
        onClick={() => set({ items: [...block.items, { stars: 5, text: "Текст отзыва", author: "— Имя" }] })}
        className="mt-4"
      />
    </section>
  );
}

// [13] Факты — почтовые штампы
function Meta({ block, onChange }: BP<MetaBlock>) {
  const set = (p: Partial<MetaBlock>) => onChange?.({ ...block, ...p });
  const setItem = (i: number, p: Partial<MetaBlock["items"][number]>) =>
    set({ items: block.items.map((it, j) => (j === i ? { ...it, ...p } : it)) });
  return (
    <section>
      <div className="flex flex-wrap justify-center gap-3.5">
        {block.items.map((it, i) => (
          <div
            key={i}
            className="group/item relative w-[98px] h-[98px] rounded-full border-2 border-dashed border-moss/50 bg-card/40 flex flex-col items-center justify-center text-center"
            style={{ transform: `rotate(${tilt(i) * 3}deg)` }}
          >
            <EditableText as="span" className="font-serif text-[26px] leading-none text-ink" value={it.value} onChange={(v) => setItem(i, { value: v })} placeholder="50" />
            <EditableText as="span" className="hand hand-sm text-sub" value={it.label} onChange={(v) => setItem(i, { label: v })} placeholder="минут" />
            {block.items.length > 1 && <ItemControls onRemove={() => set({ items: block.items.filter((_, j) => j !== i) })} />}
          </div>
        ))}
      </div>
      <AddItem label="Добавить штамп" onClick={() => set({ items: [...block.items, { value: "1×", label: "в неделю" }] })} className="mt-4" />
    </section>
  );
}

// [14] Финал — конверт с подписью
function Cta({ block, doors, owner, onChange }: { block: CtaBlock; doors: { book: Door; message: Door }; owner?: string; onChange?: Edit<CtaBlock> }) {
  const set = (p: Partial<CtaBlock>) => onChange?.({ ...block, ...p });
  return (
    <article className="relative overflow-hidden rounded-[20px] bg-final text-final-ink px-5 pt-10 pb-5">
      <svg aria-hidden className="absolute inset-x-0 top-0 w-full h-14 opacity-25" viewBox="0 0 342 56" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M0 0l171 48L342 0" />
      </svg>
      <EditableText
        as="p"
        className="block font-serif text-[1.7rem] leading-[1.15]"
        value={block.title}
        onChange={(v) => set({ title: v })}
        placeholder="Если откликнулось — напишите"
      />
      <EditableText
        as="p"
        multiline
        className="block text-[14px] leading-relaxed opacity-75 mt-2"
        value={block.text}
        onChange={(v) => set({ text: v })}
        placeholder="Можно просто написать «здравствуйте»"
      />
      <div className="flex gap-2.5 mt-5">
        <DoorLink
          door={doors.book}
          className="flex-1 text-center btn-shape bg-final-btn text-final py-3 font-semibold text-[15px] hover:opacity-90 transition"
        />
        <DoorLink
          door={doors.message}
          className="flex-1 text-center btn-shape border-[1.5px] border-final-ink/40 py-3 font-semibold text-[15px] hover:bg-white/5 transition"
        />
      </div>
      {owner && <p className="hand hand-xl text-right mt-4">— {owner}</p>}
    </article>
  );
}

// ── Диспетчер: тип блока → компонент ──
export function BlockRenderer({
  block,
  doors,
  owner,
  onChange,
}: {
  block: Block;
  doors: { book: Door; message: Door };
  owner?: string; // имя для подписи «— Катя» в финале
  onChange?: Edit<Block>;
}) {
  return (
    <div className="relative">
      <BlockBody block={block} doors={doors} owner={owner} onChange={onChange} />
      <StickerBadge sticker={block.sticker} />
    </div>
  );
}

function BlockBody({
  block,
  doors,
  owner,
  onChange,
}: {
  block: Block;
  doors: { book: Door; message: Door };
  owner?: string;
  onChange?: Edit<Block>;
}) {
  switch (block.type) {
    case "statement":
      return <Statement block={block} onChange={onChange} />;
    case "text":
      return <Text block={block} onChange={onChange} />;
    case "topics":
      return <Topics block={block} onChange={onChange} />;
    case "meeting":
      return <Meeting block={block} onChange={onChange} />;
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
      return <Cta block={block} doors={doors} owner={owner} onChange={onChange} />;
  }
}
