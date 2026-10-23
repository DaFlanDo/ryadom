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

export type ThemeId = "moss" | "clay" | "dusk";

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
  items: { place: string; detail: string }[];
  diplomas?: string[];
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
  | CtaBlock;

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
  meta: string[]; // первое слово каждой строки выделяется жирным
  sticker?: Sticker;
};

export type Profile = {
  theme?: ThemeId; // нет поля = "moss"
  header: ProfileHeader;
  highlights: Highlight[];
  blocks: Block[];
  doors: { book: Door; message: Door };
};
