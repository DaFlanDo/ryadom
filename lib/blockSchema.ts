// ════════════════════════════════════════════════════════════
//  Ryadom · библиотека блоков и дефолты
//  BLOCK_LIBRARY — меню «добавить», createBlock — стартовые данные
//  нового блока. Правка теперь инлайн (см. components/blocks/inline.tsx),
//  поэтому BLOCK_SCHEMAS/HEADER_SCHEMA остаются как справочная модель полей.
// ════════════════════════════════════════════════════════════
import type { Block, BlockType } from "./types";
import { LANDSCAPES, landscape } from "./landscapes";

// нейтральная картинка-заглушка для новых блоков (зелёный пейзаж из пула)
export const PLACEHOLDER_IMG = LANDSCAPES[0];

// ── Описание поля формы ──
// ph — пример-плейсхолдер в инпуте; hint — подсказка под полем.
export type Field =
  | { key: string; label: string; kind: "text" | "textarea" | "image"; ph?: string; hint?: string }
  | { key: string; label: string; kind: "select"; options: { value: string; label: string }[]; hint?: string }
  | { key: string; label: string; kind: "stars"; hint?: string }
  | { key: string; label: string; kind: "toggle"; hint?: string }
  | { key: string; label: string; kind: "stringlist"; image?: boolean; addLabel: string; hint?: string }
  | {
      key: string;
      label: string;
      kind: "list";
      itemFields: Field[];
      itemTitleKey: string;
      addLabel: string;
      defaultItem: () => Record<string, unknown>;
      hint?: string;
    };

// ── Библиотека блоков (меню «добавить»; иконка — BlockTypeIcon по type) ──
export const BLOCK_LIBRARY: {
  type: BlockType;
  label: string;
  hint: string;
}[] = [
  { type: "topics", label: "С чем приходят", hint: "Запросы живыми фразами" },
  { type: "meeting", label: "Первая встреча", hint: "Как она пройдёт — снимает страх" },
  { type: "text", label: "Обо мне", hint: "Текст как письмо" },
  { type: "statement", label: "Цитата", hint: "Ваш главный принцип" },
  { type: "steps", label: "Как проходит работа", hint: "Шаги-тропинка" },
  { type: "education", label: "Образование", hint: "Годы, дипломы, супервизия" },
  { type: "pricing", label: "Цены", hint: "Как меню в кофейне" },
  { type: "faq", label: "Вопросы", hint: "О чём часто спрашивают" },
  { type: "reviews", label: "Отзывы", hint: "Записки от клиентов" },
  { type: "photo", label: "Фото", hint: "Полароид с подписью" },
  { type: "grid", label: "Фото-альбом", hint: "Несколько полароидов" },
  { type: "video", label: "Видео", hint: "Ссылка на видео о себе" },
  { type: "meta", label: "Факты", hint: "Три штампа: время, формат…" },
  { type: "cta", label: "Финал", hint: "«Если откликнулось — напишите»" },
];

// ── Схемы полей по типу блока ──
export const BLOCK_SCHEMAS: Record<BlockType, Field[]> = {
  statement: [
    { key: "text", label: "Текст", kind: "textarea", ph: "Например: «Терапия должна делать тебя свободнее, а не привязывать к терапевту.»" },
    { key: "caption", label: "Подпись (необязательно)", kind: "text", ph: "— мой принцип в работе" },
  ],
  text: [
    { key: "title", label: "Заголовок", kind: "text", ph: "Обо мне" },
    { key: "body", label: "Текст", kind: "textarea", ph: "Расскажи о себе простыми словами — как клиенту, который только зашёл." },
  ],
  grid: [
    { key: "title", label: "Заголовок", kind: "text" },
    {
      key: "items",
      label: "Темы",
      kind: "list",
      itemTitleKey: "label",
      addLabel: "Добавить тему",
      defaultItem: () => ({ label: "Тема", img: PLACEHOLDER_IMG }),
      itemFields: [
        { key: "label", label: "Название", kind: "text" },
        { key: "img", label: "Фото", kind: "image" },
      ],
    },
  ],
  video: [
    { key: "title", label: "Заголовок", kind: "text" },
    { key: "img", label: "Обложка", kind: "image" },
    { key: "caption", label: "Подпись", kind: "text" },
  ],
  steps: [
    { key: "title", label: "Заголовок", kind: "text" },
    {
      key: "items",
      label: "Шаги",
      kind: "list",
      itemTitleKey: "title",
      addLabel: "Добавить шаг",
      defaultItem: () => ({ n: "01", title: "Шаг", text: "Описание шага" }),
      itemFields: [
        { key: "n", label: "Номер", kind: "text" },
        { key: "title", label: "Название", kind: "text" },
        { key: "text", label: "Описание", kind: "textarea" },
      ],
    },
  ],
  education: [
    { key: "title", label: "Заголовок", kind: "text" },
    {
      key: "items",
      label: "Пункты",
      kind: "list",
      itemTitleKey: "place",
      addLabel: "Добавить пункт",
      defaultItem: () => ({ place: "Учебное заведение", detail: "Специальность · год" }),
      itemFields: [
        { key: "year", label: "Год", kind: "text", ph: "2014" },
        { key: "place", label: "Где / что", kind: "text" },
        { key: "detail", label: "Детали", kind: "text" },
      ],
    },
    { key: "diplomas", label: "Сканы дипломов", kind: "stringlist", image: true, addLabel: "Добавить скан" },
    { key: "trust", label: "Что ещё важно", kind: "stringlist", addLabel: "Добавить строку", hint: "Например: «хожу на супервизию», «прохожу личную терапию»" },
  ],
  photo: [
    { key: "img", label: "Фото", kind: "image" },
    { key: "caption", label: "Подпись", kind: "textarea" },
  ],
  pricing: [
    { key: "title", label: "Заголовок", kind: "text" },
    {
      key: "items",
      label: "Тарифы",
      kind: "list",
      itemTitleKey: "name",
      addLabel: "Добавить тариф",
      defaultItem: () => ({ name: "Тариф", price: "0 ₽", note: "", featured: false }),
      itemFields: [
        { key: "name", label: "Название", kind: "text" },
        { key: "price", label: "Цена", kind: "text" },
        { key: "note", label: "Подпись", kind: "text" },
        { key: "featured", label: "Обвести от руки", kind: "toggle" },
        { key: "badge", label: "Пометка рукой (напр. «выгоднее на 1 500 ₽»)", kind: "text" },
      ],
    },
    { key: "terms", label: "Условия", kind: "textarea", ph: "оплата после встречи · перенос за сутки — бесплатно" },
  ],
  faq: [
    { key: "title", label: "Заголовок", kind: "text" },
    {
      key: "items",
      label: "Вопросы",
      kind: "list",
      itemTitleKey: "q",
      addLabel: "Добавить вопрос",
      defaultItem: () => ({ q: "Вопрос?", a: "Ответ." }),
      itemFields: [
        { key: "q", label: "Вопрос", kind: "text" },
        { key: "a", label: "Ответ", kind: "textarea" },
      ],
    },
  ],
  reviews: [
    { key: "title", label: "Заголовок", kind: "text" },
    {
      key: "items",
      label: "Отзывы",
      kind: "list",
      itemTitleKey: "author",
      addLabel: "Добавить отзыв",
      defaultItem: () => ({ stars: 5, text: "Текст отзыва", author: "Имя, возраст" }),
      itemFields: [
        { key: "stars", label: "Звёзды", kind: "stars" },
        { key: "text", label: "Текст", kind: "textarea" },
        { key: "author", label: "Автор", kind: "text" },
      ],
    },
  ],
  meta: [
    {
      key: "items",
      label: "Метрики (3 шт.)",
      kind: "list",
      itemTitleKey: "label",
      addLabel: "Добавить метрику",
      defaultItem: () => ({ value: "0", label: "метрика" }),
      itemFields: [
        { key: "value", label: "Значение", kind: "text" },
        { key: "label", label: "Подпись", kind: "text" },
      ],
    },
  ],
  cta: [
    { key: "title", label: "Заголовок", kind: "text" },
    { key: "text", label: "Текст", kind: "textarea" },
  ],
  topics: [
    { key: "title", label: "Заголовок", kind: "text", ph: "с чем ко мне приходят" },
    { key: "items", label: "Запросы", kind: "stringlist", addLabel: "Добавить запрос", hint: "Живыми словами: «тревога, которая не отпускает», «со мной что-то не так»" },
  ],
  meeting: [
    { key: "title", label: "Заголовок", kind: "text", ph: "как пройдёт первая встреча" },
    { key: "text", label: "Текст", kind: "textarea", ph: "50 минут по видео. Вы рассказываете, что беспокоит…" },
  ],
};

// ── Дефолтный блок при добавлении ──
export function createBlock(type: BlockType): Block {
  switch (type) {
    case "statement":
      return { type, text: "Новая цитата или заявление", caption: "" };
    case "text":
      return { type, title: "Заголовок", body: "Текст блока…" };
    case "grid":
      return {
        type,
        title: "С чем работаю",
        items: [
          { label: "Тема 1", img: landscape(1) },
          { label: "Тема 2", img: landscape(2) },
        ],
      };
    case "video":
      return { type, title: "Видео-визитка", img: landscape(4), caption: "Короткое видео о себе" };
    case "steps":
      return {
        type,
        title: "Как проходит работа",
        items: [{ n: "01", title: "Шаг", text: "Описание шага" }],
      };
    case "education":
      return {
        type,
        title: "Образование и сертификаты",
        items: [{ place: "Учебное заведение", detail: "Специальность · год" }],
        diplomas: [],
      };
    case "photo":
      return { type, img: landscape(6), caption: "Подпись к фото" };
    case "pricing":
      return {
        type,
        title: "Тарифы",
        items: [{ name: "Разовая сессия", price: "0 ₽", note: "50 минут", featured: false }],
      };
    case "faq":
      return { type, title: "Частые вопросы", items: [{ q: "Вопрос?", a: "Ответ." }] };
    case "reviews":
      return {
        type,
        title: "Отзывы",
        items: [{ stars: 5, text: "Текст отзыва", author: "Имя" }],
      };
    case "meta":
      return {
        type,
        items: [
          { value: "50", label: "минут" },
          { value: "онлайн", label: "формат" },
          { value: "1×", label: "в неделю" },
        ],
      };
    case "cta":
      return {
        type,
        title: "Если откликнулось — напишите",
        text: "Можно сразу записаться, а можно просто написать «здравствуйте» — это ни к чему не обязывает.",
      };
    case "topics":
      return {
        type,
        title: "с чем ко мне приходят",
        items: ["тревога, которая не отпускает", "выгорание", "«со мной что-то не так»"],
      };
    case "meeting":
      return {
        type,
        title: "как пройдёт первая встреча",
        text: "50 минут по видео. Вы рассказываете, что беспокоит, — сколько захотите. Я задаю вопросы и в конце говорю, как вижу нашу работу. Если не подойдём друг другу — это нормально, помогу найти другого специалиста.",
      };
  }
}

// ── Схема шапки профиля ──
export const HEADER_SCHEMA: Field[] = [
  { key: "name", label: "Имя", kind: "text" },
  { key: "role", label: "Специализация", kind: "text" },
  { key: "bio", label: "О себе (коротко)", kind: "textarea" },
  { key: "avatar", label: "Аватар", kind: "image" },
  { key: "cover", label: "Обложка", kind: "image" },
  { key: "status", label: "Статус", kind: "text" },
  { key: "meta", label: "Мета (опыт, формат, языки)", kind: "stringlist", addLabel: "Добавить пункт" },
];

