import type { Profile } from "./types";
import { LANDSCAPES } from "./landscapes";

// ── Справочники для онбординга ──
export const METHODS = [
  "КПТ",
  "ACT",
  "Гештальт",
  "Схема-терапия",
  "Психоанализ",
  "EMDR",
  "Психодрама",
  "Системная терапия",
];

// Картинки тем — из локального пула зелёных пейзажей (плейсхолдеры).
export const TOPICS: Record<string, { emoji: string; img: string }> = {
  Тревога: { emoji: "🌧️", img: LANDSCAPES[1] },
  Выгорание: { emoji: "🔥", img: LANDSCAPES[2] },
  Самооценка: { emoji: "🌱", img: LANDSCAPES[3] },
  Отношения: { emoji: "💞", img: LANDSCAPES[4] },
  Депрессия: { emoji: "🌑", img: LANDSCAPES[5] },
  Травма: { emoji: "🩹", img: LANDSCAPES[6] },
  "Панические атаки": { emoji: "⚡", img: LANDSCAPES[7] },
  Утрата: { emoji: "🕊️", img: LANDSCAPES[0] },
  Стресс: { emoji: "😮‍💨", img: LANDSCAPES[8] },
};

export const TOPIC_LIST = Object.keys(TOPICS);

// Теги-настроения для шага «о себе»: тапаешь, а текст собирается сам.
export const ABOUT_TAGS = [
  "бережно, без давления",
  "без оценок и ярлыков",
  "тепло и по-человечески",
  "опираюсь на практику",
  "помогаю найти опору",
  "честно и прямо",
  "в комфортном темпе",
  "с заботой о безопасности",
];

// Обложка по умолчанию — зелёный пейзаж из локального пула.
const DEFAULT_COVER = LANDSCAPES[0];

// Мягкий плейсхолдер-аватар (пустой шаблон, пока человек не загрузил фото).
// Файл из public/, а не data-URL: в профиле разрешены только ссылки.
const PLACEHOLDER_AVATAR = "/placeholder-avatar.svg";

export type OnboardingAnswers = {
  name: string;
  avatar: string;
  methods: string[];
  bio: string; // финальный (редактируемый) текст «о себе»
  topics: string[];
  format: string; // "Онлайн" | "Очно" | "Онлайн и очно"
  price: string;
  tg: string;
  aboutTags: string[]; // выбранные теги-настроения
  aboutNotes: string; // пара фраз своими словами (сырьё для сборки)
};

export const emptyAnswers: OnboardingAnswers = {
  name: "",
  avatar: "",
  methods: [],
  bio: "",
  topics: [],
  format: "Онлайн",
  price: "",
  tg: "",
  aboutTags: [],
  aboutNotes: "",
};

// ── Локальная «AI»-сборка тёплого абзаца из тегов и фраз ──
// Без бэкенда: складывает живой текст от первого лица из того, что натапали.
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function joinRu(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return items.slice(0, -1).join(", ") + " и " + items[items.length - 1];
}

function cleanPhrase(s: string): string {
  let t = s.trim().replace(/\s+/g, " ");
  if (!t) return "";
  t = t[0].toUpperCase() + t.slice(1);
  if (!/[.!?…]$/.test(t)) t += ".";
  return t;
}

export function composeBio(a: OnboardingAnswers): string {
  const name = a.name.trim();
  const sentences: string[] = [];

  // 1. Кто я + подход
  const methodPhrase = a.methods.length
    ? pick([
        ` и работаю в подходе ${joinRu(a.methods)}`,
        `, работаю в подходе ${joinRu(a.methods)}`,
        `. В работе опираюсь на ${joinRu(a.methods)}`,
      ])
    : "";
  if (name) {
    sentences.push(
      pick([
        `Меня зовут ${name}, я психолог${methodPhrase}.`,
        `Я ${name}, психолог${methodPhrase}.`,
      ]).replace(/\.\./g, ".")
    );
  } else {
    sentences.push(`Я психолог${methodPhrase}.`.replace(/\.\./g, "."));
  }

  // 2. С чем приходят
  if (a.topics.length) {
    const list = joinRu(a.topics.map((t) => t.toLowerCase()));
    sentences.push(
      pick([
        `Чаще всего ко мне приходят с такими запросами: ${list}.`,
        `Помогаю разобраться с тем, что давит: ${list}.`,
        `Рядом со мной можно бережно прожить ${list}.`,
      ])
    );
  }

  // 3. Как я рядом (теги-настроения)
  if (a.aboutTags.length) {
    const tone = joinRu(a.aboutTags.map((t) => t.toLowerCase()));
    sentences.push(
      pick([
        `Рядом со мной — ${tone}.`,
        `Работаю ${tone}.`,
        `Со мной ${tone} — так, как удобно именно тебе.`,
      ])
    );
  }

  // 4. Своими словами (если что-то написал — вплетаем как есть)
  const note = cleanPhrase(a.aboutNotes);
  if (note) sentences.push(note);

  // запасной вариант, если совсем ничего не выбрали
  if (sentences.length === 1 && !a.methods.length && !a.topics.length && !a.aboutTags.length) {
    sentences.push(
      "Помогаю разобраться в том, что тревожит, и найти опору — бережно и без давления."
    );
  }

  return sentences.join(" ");
}

// ── Профиль-черновик для живого превью (терпим к пустым полям) ──
export function buildDraftProfile(a: OnboardingAnswers): Profile {
  const name = a.name.trim() || "Твоё имя";
  const role = a.methods.length ? `Психолог · ${a.methods.join(", ")}` : "Психолог";
  const bio =
    a.bio.trim() || "Пара тёплых слов о себе появится здесь — соберём их вместе.";

  const meta: string[] = [];
  if (a.format) meta.push(a.format.toLowerCase());
  meta.push("RU");

  const blocks: Profile["blocks"] = [];
  if (a.topics.length) {
    blocks.push({
      type: "grid",
      title: "С чем работаю",
      items: a.topics.map((t) => ({ label: t, img: TOPICS[t]?.img ?? DEFAULT_COVER })),
    });
  }
  if (a.price.trim()) {
    blocks.push({
      type: "pricing",
      title: "Стоимость",
      items: [
        {
          name: "Разовая сессия",
          price: a.price.trim(),
          note: a.format ? a.format.toLowerCase() : "онлайн",
          featured: false,
        },
      ],
    });
  }

  return {
    header: {
      name,
      role,
      bio,
      avatar: a.avatar || PLACEHOLDER_AVATAR,
      cover: DEFAULT_COVER,
      status: "веду приём",
      meta,
    },
    highlights: [],
    blocks,
    doors: {
      book: { label: "Записаться", url: "#" },
      message: { label: "Написать", url: "#" },
    },
  };
}

// ── Собрать готовый профиль из ответов ──
export function buildStarterProfile(a: OnboardingAnswers): Profile {
  const avatar = a.avatar || PLACEHOLDER_AVATAR;
  const role = a.methods.length
    ? `Психолог · ${a.methods.join(", ")}`
    : "Психолог";
  const bio =
    a.bio.trim() ||
    composeBio(a) ||
    "Помогаю разобраться в том, что тревожит, и найти опору. Бережно и без давления.";

  const meta: string[] = [];
  if (a.format) meta.push(a.format.toLowerCase());
  meta.push("RU");

  // актуальные: «Обо мне» + по одному на первые темы
  const highlights = [
    { title: "Обо мне", cover: avatar, slides: [{ img: avatar, caption: bio }] },
    ...a.topics.slice(0, 3).map((t) => ({
      title: t,
      emoji: TOPICS[t]?.emoji ?? "✨",
      slides: [
        {
          img: TOPICS[t]?.img ?? DEFAULT_COVER,
          caption: `Помогаю с темой «${t.toLowerCase()}». Подробнее расскажу на первой встрече.`,
        },
      ],
    })),
  ];

  const blocks: Profile["blocks"] = [];

  if (a.topics.length) {
    blocks.push({
      type: "grid",
      title: "С чем работаю",
      items: a.topics.map((t) => ({
        label: t,
        img: TOPICS[t]?.img ?? DEFAULT_COVER,
      })),
    });
  }

  blocks.push({
    type: "steps",
    title: "Как проходит работа",
    items: [
      { n: "01", title: "Знакомство", text: "Первая встреча без обязательств — смотрим, подходим ли друг другу." },
      { n: "02", title: "Работа", text: "Регулярные встречи. Разбираем, что и почему происходит." },
      { n: "03", title: "Опора", text: "Уходишь с навыками, которые остаются с тобой." },
    ],
  });

  if (a.price.trim()) {
    blocks.push({
      type: "pricing",
      title: "Стоимость",
      items: [
        {
          name: "Разовая сессия",
          price: a.price.trim(),
          note: a.format ? a.format.toLowerCase() : "онлайн",
          featured: false,
        },
      ],
    });
  }

  blocks.push({
    type: "cta",
    title: "С чего начать — решаешь ты",
    text: "Можно записаться на сессию. А можно сначала просто написать — это ни к чему не обязывает.",
  });

  return {
    header: {
      name: a.name.trim() || "Психолог",
      role,
      bio,
      avatar,
      cover: DEFAULT_COVER,
      status: "веду приём",
      meta,
    },
    highlights,
    blocks,
    doors: {
      book: { label: "Записаться", url: "#" },
      message: {
        label: "Написать",
        url: a.tg.trim() ? `https://t.me/${a.tg.trim().replace(/^@/, "")}` : "#",
      },
    },
  };
}
