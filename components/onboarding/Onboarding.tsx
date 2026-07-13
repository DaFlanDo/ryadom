"use client";

import { useEffect, useState } from "react";
import type { Profile } from "@/lib/types";
import {
  METHODS,
  TOPIC_LIST,
  ABOUT_TAGS,
  emptyAnswers,
  composeBio,
  buildStarterProfile,
  type OnboardingAnswers,
} from "@/lib/onboarding";
import { ImageInput } from "@/components/editor/ImageInput";
import { OnboardingPreview } from "./OnboardingPreview";

const input =
  "w-full rounded-xl border border-ink/10 bg-card px-4 py-3 text-[16px] text-ink placeholder:text-sub/50 focus:border-moss focus:ring-2 focus:ring-moss/15 outline-none transition";

const STEPS = [
  "intro",
  "name",
  "avatar",
  "methods",
  "topics",
  "about",
  "details",
  "reveal",
] as const;
type Step = (typeof STEPS)[number];

const FORMATS = ["Онлайн", "Очно", "Онлайн и очно"];

// какую часть превью подсветить/подвести на каждом шаге
const FOCUS: Partial<Record<Step, string>> = {
  name: "name",
  avatar: "avatar",
  methods: "methods",
  topics: "topics",
  about: "about",
  details: "price",
};

export function Onboarding({ onDone }: { onDone: (p: Profile) => void }) {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<OnboardingAnswers>(emptyAnswers);
  // фокус в текстовом поле = клавиатура открыта (надёжнее замеров viewport)
  const [typing, setTyping] = useState(false);

  const set = (patch: Partial<OnboardingAnswers>) => setA((p) => ({ ...p, ...patch }));
  const toggle = (key: "methods" | "topics" | "aboutTags", v: string) =>
    set({
      [key]: a[key].includes(v) ? a[key].filter((x) => x !== v) : [...a[key], v],
    } as Partial<OnboardingAnswers>);

  const cur = STEPS[step];
  const isIntro = cur === "intro";
  const isReveal = cur === "reveal";
  const canNext = cur === "name" ? a.name.trim().length > 0 : true;

  const go = (d: 1 | -1) => setStep((s) => Math.min(STEPS.length - 1, Math.max(0, s + d)));
  const finish = () => onDone(buildStarterProfile(a));

  // Видимая область над клавиатурой + блокировка скролла страницы.
  // iOS при открытии клавиатуры прокручивает layout-viewport вверх, чтобы
  // показать поле, и position:fixed уезжает за экран. Поэтому панель ровняем
  // не только по высоте visualViewport, но и сдвигаем на его offsetTop —
  // тогда она всегда стоит ровно над клавиатурой.
  const vp = useVisualViewport();
  const isWorking = !isIntro && !isReveal;
  useEffect(() => {
    if (!isWorking) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, [isWorking]);
  // клавиатура открыта: фокус в поле, либо видимая область заметно меньше экрана
  const kbOpen = typing || (vp ? vp.height < window.innerHeight * 0.8 : false);

  // ── intro: тёплый вход, без превью ──
  if (isIntro) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <div className="max-w-[460px] w-full mx-auto px-6 grow flex flex-col justify-center text-center">
          <div className="text-5xl mb-6">🌿</div>
          <h1 className="font-serif text-[2.5rem] leading-[1.05] text-ink mb-4">
            Соберём твою страницу
          </h1>
          <p className="text-sub text-[16px] leading-relaxed">
            Несколько вопросов — и рядом из них живьём соберётся твоя страница.
            Будет видно каждый шаг. Поправить потом можно всё.
          </p>
        </div>
        <div className="max-w-[460px] w-full mx-auto px-6 pb-10">
          <button
            onClick={() => go(1)}
            className="w-full bg-moss text-white py-4 rounded-2xl font-semibold text-[16px] shadow-lg shadow-moss/25 hover:bg-mossd transition"
          >
            Поехали
          </button>
        </div>
      </div>
    );
  }

  // ── reveal: финальная подача готовой страницы ──
  if (isReveal) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <div className="grow flex flex-col justify-center py-6">
          <div className="text-center px-6 mb-3">
            <div className="text-4xl mb-3">✨</div>
            <h2 className="font-serif text-[2rem] leading-tight text-ink">
              Готово — это твоя страница
            </h2>
            <p className="text-sub text-[15px] mt-1.5">
              Дальше можно подправить что угодно и добавить блоки.
            </p>
          </div>
          <OnboardingPreview answers={a} focus="reveal" />
        </div>
        <div className="max-w-[460px] w-full mx-auto px-6 pb-10 pt-2">
          <button
            onClick={finish}
            className="w-full bg-moss text-white py-4 rounded-2xl font-semibold text-[16px] shadow-lg shadow-moss/25 hover:bg-mossd transition"
          >
            Хочу подправить →
          </button>
          <button onClick={() => go(-1)} className="w-full text-center text-[13px] text-sub mt-3">
            Назад
          </button>
        </div>
      </div>
    );
  }

  // ── рабочие шаги: превью сверху, вопрос по центру, навигация снизу ──
  const last = step === STEPS.length - 2; // "details" — последний вопрос
  return (
    <div
      className="fixed inset-x-0 top-0 z-10 bg-bg flex flex-col overflow-hidden"
      style={{
        height: vp ? vp.height : "100dvh",
        transform: vp ? `translateY(${vp.offsetTop}px)` : undefined,
      }}
      onFocusCapture={(e) => {
        const t = e.target as HTMLElement;
        if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") setTyping(true);
      }}
      onBlurCapture={(e) => {
        const t = e.target as HTMLElement;
        if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") setTyping(false);
      }}
    >
      {/* прогресс */}
      <div className="shrink-0 max-w-[460px] w-full mx-auto px-5 pt-5">
        <div className="h-1 rounded-full bg-ink/10 overflow-hidden">
          <div
            className="h-full bg-moss transition-all duration-500"
            style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* живое превью — фиксированный размер (compact при клавиатуре), не схлопывается */}
      <div className="shrink-0 min-h-0 overflow-hidden">
        <OnboardingPreview answers={a} focus={FOCUS[cur]} compact={kbOpen} />
      </div>

      {/* вопрос — короткий центрируется, длинный скроллится сверху */}
      <div className="grow shrink min-h-0 overflow-y-auto">
        <div className="min-h-full max-w-[460px] w-full mx-auto px-5 py-4 flex flex-col">
          <div className="m-auto w-full">
        {cur === "name" && (
          <Q title="Как тебя зовут?" sub="Имя и фамилия — как клиенту привычно тебя видеть. Сразу появится на странице.">
            <input
              className={input}
              placeholder="Екатерина Морозова"
              value={a.name}
              onChange={(e) => set({ name: e.target.value })}
              autoComplete="off"
              autoCapitalize="words"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="next"
            />
          </Q>
        )}

        {cur === "avatar" && (
          <Q title="Добавь фото" sub="Тёплое живое фото — половина доверия. Как только встанет — страница станет твоей.">
            <div className="flex flex-col items-center gap-3 py-1">
              <ImageInput value={a.avatar} onChange={(v) => set({ avatar: v })} round size={104} />
              {a.avatar && (
                <p className="rise text-[14px] text-moss font-medium text-center">
                  Вот теперь это твоя страница ✨
                </p>
              )}
            </div>
          </Q>
        )}

        {cur === "methods" && (
          <Q title="В каком подходе работаешь?" sub="Тапни методы — можно несколько. Встанут рядом с именем.">
            <Chips options={METHODS} selected={a.methods} onToggle={(v) => toggle("methods", v)} />
          </Q>
        )}

        {cur === "topics" && (
          <Q title="С чем ты помогаешь?" sub="Тапай темы — из них соберётся блок «С чем работаю».">
            <Chips options={TOPIC_LIST} selected={a.topics} onToggle={(v) => toggle("topics", v)} />
          </Q>
        )}

        {cur === "about" && (
          <AboutStep a={a} set={set} toggle={(v) => toggle("aboutTags", v)} />
        )}

        {cur === "details" && (
          <Q title="Формат и связь" sub="Последний шаг. Всё необязательно — можно заполнить потом.">
            <div className="space-y-5">
              <div>
                <p className="text-[13px] font-medium text-sub mb-2">Формат</p>
                <Chips options={FORMATS} selected={[a.format]} onToggle={(v) => set({ format: v })} single />
              </div>
              <div>
                <p className="text-[13px] font-medium text-sub mb-2">Цена разовой сессии</p>
                <input
                  className={input}
                  placeholder="напр. 3 500 ₽"
                  value={a.price}
                  onChange={(e) => set({ price: e.target.value })}
                  inputMode="numeric"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
              <div>
                <p className="text-[13px] font-medium text-sub mb-2">Телеграм для связи</p>
                <div className="flex items-center gap-2">
                  <span className="text-sub text-[16px]">@</span>
                  <input
                    className={input}
                    placeholder="username"
                    value={a.tg}
                    onChange={(e) => set({ tg: e.target.value.replace(/^@/, "") })}
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </div>
              </div>
            </div>
          </Q>
        )}
          </div>
        </div>
      </div>

      {/* навигация */}
      <div className="shrink-0 max-w-[460px] w-full mx-auto px-5 pb-5 pt-2">
        <div className="flex gap-3">
          <button
            onClick={() => go(-1)}
            className="px-5 py-4 rounded-2xl border border-ink/10 text-ink font-medium text-[15px]"
          >
            Назад
          </button>
          <button
            onClick={() => go(1)}
            disabled={!canNext}
            className="grow bg-moss text-white py-4 rounded-2xl font-semibold text-[16px] shadow-lg shadow-moss/25 hover:bg-mossd transition disabled:opacity-40"
          >
            {last ? "Готово" : "Далее"}
          </button>
        </div>
        {!last && (
          <button onClick={() => go(1)} className="w-full text-center text-[13px] text-sub mt-3">
            Пропустить
          </button>
        )}
      </div>
    </div>
  );
}

// ── Шаг «о себе»: теги + пара фраз → продукт собирает тёплый абзац ──
function AboutStep({
  a,
  set,
  toggle,
}: {
  a: OnboardingAnswers;
  set: (p: Partial<OnboardingAnswers>) => void;
  toggle: (v: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  const assemble = () => {
    setBusy(true);
    // лёгкая пауза, чтобы «сборка» читалась как момент, а не мгновенный свитч
    setTimeout(() => {
      set({ bio: composeBio(a) });
      setBusy(false);
    }, 850);
  };

  return (
    <Q
      title="Пара слов о себе"
      sub="Самое мучительное поле. Натапай, как ты рядом, кинь пару фраз — а текст соберём за тебя. Потом поправишь под себя."
    >
      <div className="space-y-4">
        <div>
          <p className="text-[13px] font-medium text-sub mb-2">Как с тобой рядом?</p>
          <Chips options={ABOUT_TAGS} selected={a.aboutTags} onToggle={toggle} />
        </div>

        <div>
          <p className="text-[13px] font-medium text-sub mb-2">Своими словами — пара фраз (необязательно)</p>
          <textarea
            rows={2}
            className={input + " resize-y leading-relaxed"}
            placeholder="напр. люблю работать с подростками; верю, что человек сам знает ответ"
            value={a.aboutNotes}
            onChange={(e) => set({ aboutNotes: e.target.value })}
          />
        </div>

        {busy ? (
          <div className="space-y-2 py-1">
            <div className="shimmer h-3.5 rounded-full w-full" />
            <div className="shimmer h-3.5 rounded-full w-[88%]" />
            <div className="shimmer h-3.5 rounded-full w-[70%]" />
            <p className="text-[13px] text-moss font-medium pt-1">Собираю текст…</p>
          </div>
        ) : !a.bio ? (
          <button
            onClick={assemble}
            className="w-full bg-deep text-white py-3.5 rounded-xl font-semibold text-[15px] hover:opacity-90 transition"
          >
            Собрать текст ✨
          </button>
        ) : (
          <div className="rise space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-sage">Черновик — поправь под себя</span>
              <button onClick={assemble} className="text-[13px] font-medium text-moss">
                Собрать заново ↻
              </button>
            </div>
            <textarea
              rows={4}
              className={input + " resize-y leading-relaxed"}
              value={a.bio}
              onChange={(e) => set({ bio: e.target.value })}
            />
          </div>
        )}
      </div>
    </Q>
  );
}

// высота видимой области (над клавиатурой) — для панели ровно в размер экрана
function useVisualViewport() {
  const [vp, setVp] = useState<{ height: number; offsetTop: number } | null>(null);
  useEffect(() => {
    const v = window.visualViewport;
    if (!v) return;
    const sync = () => setVp({ height: v.height, offsetTop: v.offsetTop });
    sync();
    v.addEventListener("resize", sync);
    v.addEventListener("scroll", sync);
    return () => {
      v.removeEventListener("resize", sync);
      v.removeEventListener("scroll", sync);
    };
  }, []);
  return vp;
}

function Q({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-serif text-[1.7rem] leading-tight text-ink mb-1.5">{title}</h2>
      <p className="text-sub text-[14px] leading-relaxed mb-4">{sub}</p>
      {children}
    </div>
  );
}

function Chips({
  options,
  selected,
  onToggle,
  single = false,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  single?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            onClick={() => onToggle(o)}
            className={`px-4 py-2.5 rounded-full text-[15px] font-medium border transition ${
              on
                ? "bg-moss text-white border-moss"
                : "bg-card text-ink border-ink/10 hover:border-moss/40"
            }`}
          >
            {on && !single ? "✓ " : ""}
            {o}
          </button>
        );
      })}
    </div>
  );
}
