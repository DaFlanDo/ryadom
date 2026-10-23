// ════════════════════════════════════════════════════════════
//  Стикеры — объёмные эмодзи Microsoft Fluent Emoji (лицензия MIT,
//  public/stickers/LICENSE). Файлы лежат в public/stickers/<id>.webp.
//  Список закрытый: в профиль можно сохранить только id отсюда.
// ════════════════════════════════════════════════════════════
import type { StickerCorner } from "./types";

export const STICKER_GROUPS = [
  {
    title: "Природа",
    items: [
      ["herb", "Веточка"], ["seedling", "Росток"], ["potted-plant", "Растение"], ["fallen-leaf", "Листья"],
      ["tulip", "Тюльпан"], ["cherry-blossom", "Сакура"], ["blossom", "Цветок"], ["sunflower", "Подсолнух"],
      ["lotus", "Лотос"], ["bouquet", "Букет"], ["sun", "Солнце"], ["sun-behind-cloud", "Облачко"],
      ["crescent-moon", "Месяц"], ["rainbow", "Радуга"], ["glowing-star", "Звезда"], ["sparkles", "Искры"],
    ],
  },
  {
    title: "Уют",
    items: [
      ["hot-beverage", "Кофе"], ["teacup-without-handle", "Чай"], ["teapot", "Чайник"], ["cookie", "Печенье"],
      ["honey-pot", "Мёд"], ["candle", "Свеча"], ["teddy-bear", "Мишка"], ["yarn", "Клубок"],
      ["books", "Книги"], ["open-book", "Книга"], ["love-letter", "Письмо"], ["couch-and-lamp", "Кабинет"],
      ["house-with-garden", "Дом"], ["puzzle-piece", "Пазл"], ["thought-balloon", "Мысль"],
    ],
  },
  {
    title: "Сердце и настроение",
    items: [
      ["yellow-heart", "Жёлтое сердце"], ["green-heart", "Зелёное сердце"], ["orange-heart", "Оранжевое сердце"],
      ["sparkling-heart", "Сияющее сердце"], ["heart-with-ribbon", "Сердце с бантом"], ["mending-heart", "Заживающее сердце"],
      ["hugging-face", "Объятия"], ["relieved-face", "Спокойствие"], ["smiling-face-with-hearts", "Тепло"],
    ],
  },
  {
    title: "Зверята",
    items: [["cat", "Кот"], ["hedgehog", "Ёжик"], ["snail", "Улитка"], ["butterfly", "Бабочка"], ["dove", "Голубь"]],
  },
] as const;

export type StickerId = (typeof STICKER_GROUPS)[number]["items"][number][0];

export const STICKER_IDS = STICKER_GROUPS.flatMap((g) => g.items.map(([id]) => id)) as [StickerId, ...StickerId[]];

export const STICKER_LABEL: Record<string, string> = Object.fromEntries(
  STICKER_GROUPS.flatMap((g) => g.items.map(([id, label]) => [id, label]))
);

export const stickerSrc = (id: string) => `/stickers/${id}.webp`;

export const CORNERS: { value: StickerCorner; label: string }[] = [
  { value: "tl", label: "Слева сверху" },
  { value: "tr", label: "Справа сверху" },
  { value: "bl", label: "Слева снизу" },
  { value: "br", label: "Справа снизу" },
];
