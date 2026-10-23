// ════════════════════════════════════════════════════════════
//  Ryadom · модель данных профиля (типы)
//  Block — размеченное объединение: поле `type` выбирает форму.
//  Добавить новый тип блока = добавить вариант сюда + компонент.
// ════════════════════════════════════════════════════════════

export type StatementBlock = {
  type: "statement";
  color?: "moss" | "deep" | "soft" | "card";
  text: string;
  caption?: string;
};

export type TextBlock = {
  type: "text";
  title?: string;
  body: string;
};

export type GridBlock = {
  type: "grid";
  title?: string;
  items: { label: string; img: string }[];
};

export type VideoBlock = {
  type: "video";
  title?: string;
  img: string;
  caption?: string;
  url?: string; // ссылка на само видео (YouTube, VK…); по клику открывается в новой вкладке
};

export type StepsBlock = {
  type: "steps";
  title?: string;
  items: { n: string; title: string; text: string }[];
};

export type EducationBlock = {
  type: "education";
  title?: string;
  items: { place: string; detail: string }[];
  diplomas?: string[];
};

export type PhotoBlock = {
  type: "photo";
  img: string;
  caption?: string;
};

export type PricingBlock = {
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

export type FaqBlock = {
  type: "faq";
  title?: string;
  items: { q: string; a: string }[];
};

export type ReviewsBlock = {
  type: "reviews";
  title?: string;
  items: { stars: number; text: string; author: string }[];
};

export type MetaBlock = {
  type: "meta";
  items: { value: string; label: string }[];
};

export type CtaBlock = {
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
};

export type Profile = {
  header: ProfileHeader;
  highlights: Highlight[];
  blocks: Block[];
  doors: { book: Door; message: Door };
};
