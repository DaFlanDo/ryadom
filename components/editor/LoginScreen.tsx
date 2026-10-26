"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import { handleError } from "@/lib/handles";
import { stickerSrc } from "@/lib/stickers";
import { ThemeScope } from "@/components/ThemeScope";
import { Fix, Note, Polaroid } from "@/components/paper";

// Экран входа в конструктор — в той же «Записке», что и главная: сверху
// кусочек будущей страницы, ниже форма на листе бумаги. Регистрация и вход —
// главное действие, песочница без регистрации — запасной путь под формой.

export type AuthMode = "login" | "register";
export type AuthForm = { email: string; password: string; handle?: string };

const AVATAR = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=70";

const field =
  "w-full bg-bg/70 border border-ink/12 rounded-xl px-3.5 py-3 text-[16px] text-ink placeholder:text-sub/60 " +
  "outline-none focus:border-moss/60 focus:bg-card focus:ring-4 focus:ring-moss/10 transition";

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-[13px] font-medium text-sub mb-1.5">
      {children}
    </label>
  );
}

export function LoginScreen({ onAuth }: { onAuth: (mode: AuthMode, form: AuthForm) => Promise<void> }) {
  const [mode, setMode] = useState<AuthMode>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const h = handle.trim().toLowerCase();
  const register = mode === "register";

  // «войти» на главной ведёт сюда с ?mode=login — сразу открываем вход
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("mode") === "login") setMode("login");
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (register) {
      const invalid = handleError(h);
      if (invalid) return setError(invalid);
      if (password.length < 8) return setError("Пароль — не короче 8 символов");
    }
    setBusy(true);
    setError(null);
    try {
      await onAuth(mode, register ? { email, password, handle: h } : { email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось войти");
      setBusy(false);
    }
  };

  return (
    <ThemeScope theme="note" className="min-h-screen sm:py-10 sm:px-6">
      <main className="paper relative max-w-[440px] mx-auto min-h-screen sm:min-h-0 pb-10 overflow-x-clip sm:rounded-[2.2rem] sm:shadow-[0_30px_80px_-20px_rgba(20,15,10,0.45)]">
        <div className="px-6 pt-6 flex items-center justify-between">
          <Link href="/" className="font-serif text-[26px] text-ink">
            Ryadom
          </Link>
          <Link href="/" className="hand hand-md text-sub hover:text-ink">
            ← на главную
          </Link>
        </div>

        {/* кусочек будущей страницы: фото и адрес, который уйдёт клиентам */}
        <div className="relative h-[168px] mt-4" aria-hidden>
          <div className="absolute left-8 top-3 w-[118px]">
            <Polaroid src={AVATAR} caption="это вы" index={0} imgClassName="h-[112px]" />
          </div>
          <div className="absolute right-6 top-9 w-[196px]">
            <Note index={3} fix="center" pad="px-4 py-3">
              <p className="hand hand-md text-sub">ваша ссылка</p>
              <p className="font-serif text-[19px] text-ink mt-0.5">
                ryadom.app/<span className="text-clay">{h || "kate"}</span>
              </p>
            </Note>
          </div>
          <img
            src={stickerSrc("potted-plant")}
            alt=""
            className="sticker absolute left-[138px] top-[104px] w-12 h-12 rotate-6"
          />
        </div>

        <div className="px-6 mt-3">
          <p className="hand hand-lg text-hand -rotate-2 origin-left">{register ? "начнём?" : "с возвращением"}</p>
          <h1 className="font-serif text-[2rem] leading-[1.1] text-ink mt-1.5">
            {register ? "Своя страница за пару минут" : "Вход в конструктор"}
          </h1>
          <p className="text-sub text-[15px] leading-relaxed mt-2.5">
            {register
              ? "Почта, пароль и адрес — остальное подскажем по шагам."
              : "Страница ждёт там же, где вы её оставили."}
          </p>
        </div>

        <div className="px-5 mt-6">
          <form onSubmit={submit} className="note-card relative px-5 pt-6 pb-5 space-y-4">
            <Fix className="left-[42%] -top-3" rotate={-3} />

            <div role="tablist" className="flex gap-1 bg-soft rounded-xl p-1 text-[14px] font-medium">
              {(["register", "login"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => {
                    setMode(m);
                    setError(null);
                  }}
                  className={`flex-1 py-2 rounded-lg transition ${
                    mode === m ? "bg-card text-ink shadow-sm" : "text-sub hover:text-ink"
                  }`}
                >
                  {m === "register" ? "Регистрация" : "Вход"}
                </button>
              ))}
            </div>

            <div>
              <Label htmlFor="auth-email">Почта</Label>
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@mail.ru"
                className={field}
              />
            </div>
            <div>
              <Label htmlFor="auth-password">Пароль</Label>
              <input
                id="auth-password"
                type="password"
                required
                autoComplete={register ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={register ? "не короче 8 символов" : "••••••••"}
                className={field}
              />
            </div>
            {register && (
              <div>
                <Label htmlFor="auth-handle">Адрес страницы</Label>
                <div className={`${field} flex items-center !py-0 focus-within:border-moss/60 focus-within:bg-card focus-within:ring-4 focus-within:ring-moss/10`}>
                  <span className="text-sub text-[15px] select-none">ryadom.app/</span>
                  <input
                    id="auth-handle"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="kate"
                    className="flex-1 min-w-0 bg-transparent py-3 px-0.5 text-[16px] text-ink placeholder:text-sub/60 outline-none"
                  />
                </div>
                <p className="text-[12.5px] text-sub mt-1.5">Эту ссылку вы будете отправлять клиентам</p>
              </div>
            )}

            {error && (
              <p role="alert" className="text-[13px] text-clayd bg-clay/10 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full btn-shape bg-moss text-btn-ink py-3.5 font-semibold text-[15px] shadow-md shadow-moss/25 disabled:opacity-50 hover:bg-mossd transition-colors"
            >
              {busy ? "Секунду…" : register ? "Создать страницу" : "Войти"}
            </button>
          </form>
        </div>

        <div className="px-6 mt-7">
          <div className="flex items-center gap-3 text-[13px] text-sub">
            <span className="h-px flex-1 bg-ink/10" />
            или
            <span className="h-px flex-1 bg-ink/10" />
          </div>
          {/* Обычная ссылка, не <Link>: /try — обработчик, создающий песочницу, его нельзя
              дёргать клиентским переходом или prefetch'ем */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/try"
            className="mt-4 flex items-center justify-center gap-2.5 btn-shape bg-card border border-ink/12 text-ink py-3.5 font-semibold text-[15px] hover:border-moss/50 transition-colors"
          >
            <img src={stickerSrc("hot-beverage")} alt="" className="w-6 h-6" />
            Попробовать без регистрации
          </a>
          <p className="hand hand-md text-sub text-center mt-2.5">
            готовая страница-пример, правьте как свою · удалится через сутки
          </p>
        </div>
      </main>
    </ThemeScope>
  );
}
