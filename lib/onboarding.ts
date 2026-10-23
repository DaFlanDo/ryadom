import type { Profile, ThemeId } from "./types";
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
  note: string; // «пара слов от меня» — записка под шапкой
  theme: ThemeId;
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
  note: "",
  theme: "note",
};

// Готовые варианты «пары слов от меня»: выбрать близкий и поправить под себя
export const NOTE_PRESETS = [
  "Если вы это читаете — наверное, сейчас непросто. Это нормально. Можно начать с одного сообщения, без анкет и обязательств.",
  "Не обязательно точно знать, что не так. Можно прийти с ощущением «что-то не то» — разберёмся вместе.",
  "Здесь можно не держаться. Говорить в своём темпе, сомневаться и задавать любые вопросы.",
  "Первый шаг — самый трудный. Напишите хотя бы «здравствуйте», дальше будет легче.",
];

// Темы из онбординга → живые фразы для блока «с чем ко мне приходят»
const TOPIC_PHRASES: Record<string, string> = {
  Тревога: "тревога, которая не отпускает",
  Выгорание: "выгорание и усталость",
  Самооценка: "«со мной что-то не так»",
  Отношения: "сложности в отношениях",
  Депрессия: "апатия, ничего не радует",
  Травма: "тяжёлый опыт, который не отпускает",
  "Панические атаки": "панические атаки",
  Утрата: "потеря близкого",
  Стресс: "постоянный стресс",
};
const topicPhrase = (t: string) => TOPIC_PHRASES[t] ?? t.toLowerCase();

// «Как пройдёт первая встреча» — из формата работы
function meetingText(format: string): string {
  const where =
    format === "Очно" ? "В кабинете, 50 минут." : format === "Онлайн и очно" ? "Онлайн или в кабинете, 50 минут." : "50 минут по видео.";
  return `${where} Вы рассказываете, что беспокоит, — сколько захотите. Я задаю вопросы и в конце говорю, как вижу нашу работу. Если не подойдём друг другу — это нормально, помогу найти другого специалиста.`;
}

// Типовые вопросы с черновиками ответов: психологу остаётся поправить, а не писать с нуля
const DEFAULT_FAQ = [
  {
    q: "Мне точно нужна терапия?",
    a: "Если сомневаетесь — это уже повод просто написать. Решать, начинать ли, будете вы, без давления.",
  },
  {
    q: "Это конфиденциально?",
    a: "Да. Всё, что вы рассказываете, остаётся между нами. Исключения — только угроза жизни, и о них я скажу заранее.",
  },
  {
    q: "А если станет некомфортно?",
    a: "Об этом можно говорить прямо на встрече — это тоже часть работы. Остановиться можно в любой момент.",
  },
];

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
    blocks.push({ type: "topics", title: "с чем ко мне приходят", items: a.topics.map(topicPhrase) });
  }
  if (a.price.trim()) {
    blocks.push({
      type: "pricing",
      title: "сколько стоит",
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
    theme: a.theme,
    header: {
      name,
      role,
      bio,
      avatar: a.avatar || PLACEHOLDER_AVATAR,
      cover: DEFAULT_COVER,
      status: "беру новых клиентов",
      meta,
      note: a.note.trim() || undefined,
      replyHint: "отвечаю обычно в течение дня",
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

  // актуальное: пока одно «обо мне» с фото — дальше психолог добавит своё
  const highlights = a.avatar ? [{ title: "обо мне", cover: avatar, slides: [{ img: avatar, caption: bio }] }] : [];

  const blocks: Profile["blocks"] = [];

  if (a.topics.length) {
    blocks.push({ type: "topics", title: "с чем ко мне приходят", items: a.topics.map(topicPhrase) });
  }

  blocks.push({ type: "meeting", title: "как пройдёт первая встреча", text: meetingText(a.format) });

  blocks.push({
    type: "steps",
    title: "как проходит работа",
    items: [
      { n: "1", title: "Знакомство", text: "Первая встреча без обязательств — смотрим, подходим ли друг другу." },
      { n: "2", title: "Работа", text: "Регулярные встречи. Разбираем, что и почему происходит." },
      { n: "3", title: "Опора", text: "Уходите с навыками, которые остаются с вами." },
    ],
  });

  if (a.price.trim()) {
    blocks.push({
      type: "pricing",
      title: "сколько стоит",
      items: [
        {
          name: "Встреча, 50 минут",
          price: a.price.trim(),
          note: a.format ? a.format.toLowerCase() : "онлайн",
          featured: false,
        },
      ],
      terms: "оплата после встречи · перенос за сутки — бесплатно",
    });
  }

  blocks.push({ type: "faq", title: "о чём часто спрашивают", items: DEFAULT_FAQ });

  blocks.push({
    type: "cta",
    title: "Если откликнулось — напишите",
    text: "Можно сразу записаться, а можно просто написать «здравствуйте» — это ни к чему не обязывает.",
  });

  return {
    theme: a.theme,
    header: {
      name: a.name.trim() || "Психолог",
      role,
      bio,
      avatar,
      cover: DEFAULT_COVER,
      status: "беру новых клиентов",
      meta,
      note: a.note.trim() || NOTE_PRESETS[0],
      replyHint: "отвечаю обычно в течение дня",
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
