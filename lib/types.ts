// ════════════════════════════════════════════════════════════
//  Ryadom · модель данных профиля (типы)
//  Block — размеченное объединение: поле `type` выбирает форму.
//  Добавить новый тип блока = добавить вариант сюда + компонент.
// ════════════════════════════════════════════════════════════

import type { StickerId } from "./stickers";

// Стикер-наклейка в углу шапки или блока (id — из lib/stickers.ts).
export type StickerCorner = "tl" | "tr" | "bl" | "br";
export type Sticker = { id: StickerId; corner: StickerCorner };
type Decor = { sticker?: Sticker };

export type ThemeId = "note" | "notebook" | "herbarium" | "evening";

export type StatementBlock = Decor & {
  type: "statement";
  color?: "moss" | "deep" | "soft" | "card";
  text: string;
  caption?: string;
};

export type TextBlock = Decor & {
  type: "text";
  title?: string;
  body: string;
};

export type GridBlock = Decor & {
  type: "grid";
  title?: string;
  items: { label: string; img: string }[];
};

export type VideoBlock = Decor & {
  type: "video";
  title?: string;
  img: string;
  caption?: string;
  url?: string; // ссылка на само видео (YouTube, VK…); по клику открывается в новой вкладке
};

export type StepsBlock = Decor & {
  type: "steps";
  title?: string;
  items: { n: string; title: string; text: string }[];
};

export type EducationBlock = Decor & {
  type: "education";
  title?: string;
  items: { place: string; detail: string; year?: string }[];
  diplomas?: string[];
  trust?: string[]; // «хожу на супервизию», «прохожу личную терапию»
};

export type PhotoBlock = Decor & {
  type: "photo";
  img: string;
  caption?: string;
};

export type PricingBlock = Decor & {
  type: "pricing";
  title?: string;
  items: {
    name: string;
    price: string;
    note: string;
    featured?: boolean;
    badge?: string;
  }[];
  terms?: string; // «оплата после встречи · перенос за сутки — бесплатно»
};

export type FaqBlock = Decor & {
  type: "faq";
  title?: string;
  items: { q: string; a: string }[];
};

export type ReviewsBlock = Decor & {
  type: "reviews";
  title?: string;
  items: { stars: number; text: string; author: string }[];
};

export type MetaBlock = Decor & {
  type: "meta";
  items: { value: string; label: string }[];
};

export type CtaBlock = Decor & {
  type: "cta";
  title: string;
  text: string;
};

// «С чем ко мне приходят» — живые фразы, а не плитка с фото
export type TopicsBlock = Decor & {
  type: "topics";
  title?: string;
  items: string[];
};

// «Как пройдёт первая встреча» — снимает главный страх клиента
export type MeetingBlock = Decor & {
  type: "meeting";
  title?: string;
  text: string;
};

export type Block =
  | StatementBlock
  | TextBlock
  | GridBlock
  | VideoBlock
  | StepsBlock
  | EducationBlock
  | PhotoBlock
  | PricingBlock
  | FaqBlock
  | ReviewsBlock
  | MetaBlock
  | CtaBlock
  | TopicsBlock
  | MeetingBlock;

export type BlockType = Block["type"];

// Один слайд истории внутри актуального (фото + необязательная подпись).
export type StorySlide = {
  img: string;
  caption?: string;
};

// Актуальное = кружок (обложка/эмодзи) + один или несколько слайдов.
export type Highlight = {
  title: string;
  cover?: string; // обложка-кружок; если нет — берётся первый слайд / эмодзи
  emoji?: string; // запасной вариант кружка, если нет фото
  slides: StorySlide[];
};

export type Door = { label: string; url: string };

export type ProfileHeader = {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  cover: string;
  status: string;
  meta: string[]; // факты: «8 лет практики», «онлайн»…
  sticker?: Sticker;
  hello?: string; // «привет, я Катя»; нет поля — собирается из имени
  note?: string; // «пара слов от меня» — записка под шапкой
  replyHint?: string; // «отвечаю обычно в течение дня»
};

export type Profile = {
  theme?: ThemeId; // нет поля = "note"
  header: ProfileHeader;
  highlights: Highlight[];
  blocks: Block[];
  doors: { book: Door; message: Door };
};
