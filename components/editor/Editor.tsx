"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";
import type { Block, Highlight, Profile, ProfileHeader as Header, Sticker, ThemeId } from "@/lib/types";
import { emptyProfile } from "@/lib/profile";
import { handleError } from "@/lib/handles";
import { BLOCK_LIBRARY, createBlock } from "@/lib/blockSchema";
import { BlockRenderer } from "@/components/blocks";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BlockTypeIcon,
  CheckIcon,
  PaletteIcon,
  PencilIcon,
  StickerIcon,
  TrashIcon,
} from "@/components/icons";
import { ThemeScope } from "@/components/ThemeScope";
import { Divider } from "@/components/paper";
import { ownerName } from "@/components/Profile";
import { DEFAULT_THEME } from "@/lib/themes";
import { EditProvider } from "@/components/blocks/EditContext";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { Sheet } from "./Sheet";
import { BlockForm } from "./BlockForm";
import { EditableHeader } from "./EditableHeader";
import { HeaderEditor } from "./HeaderEditor";
import { HighlightsStrip } from "./HighlightsStrip";
import { EditableStoryViewer } from "./EditableStoryViewer";
import { StickerPicker } from "./StickerPicker";
import { ThemePicker } from "./ThemePicker";

const STORAGE_KEY = "ryadom:profile:v1";

// ── reducer ──
type Action =
  | { t: "load"; profile: Profile }
  | { t: "header"; header: Header }
  | { t: "doors"; doors: Profile["doors"] }
  | { t: "theme"; theme: ThemeId }
  | { t: "highlights"; highlights: Highlight[] }
  | { t: "add"; block: Block }
  | { t: "update"; index: number; block: Block }
  | { t: "move"; index: number; dir: -1 | 1 }
  | { t: "delete"; index: number }
  | { t: "reset" };

function reducer(state: Profile, a: Action): Profile {
  switch (a.t) {
    case "load":
      return a.profile;
    case "header":
      return { ...state, header: a.header };
    case "doors":
      return { ...state, doors: a.doors };
    case "theme":
      return { ...state, theme: a.theme };
    case "highlights":
      return { ...state, highlights: a.highlights };
    case "add":
      return { ...state, blocks: [...state.blocks, a.block] };
    case "update":
      return {
        ...state,
        blocks: state.blocks.map((b, i) => (i === a.index ? a.block : b)),
      };
    case "move": {
      const j = a.index + a.dir;
      if (j < 0 || j >= state.blocks.length) return state;
      const blocks = [...state.blocks];
      [blocks[a.index], blocks[j]] = [blocks[j], blocks[a.index]];
      return { ...state, blocks };
    }
    case "delete":
      return { ...state, blocks: state.blocks.filter((_, i) => i !== a.index) };
    case "reset":
      return structuredClone(emptyProfile);
  }
}

type SheetState =
  | null
  | { kind: "library" }
  | { kind: "header" }
  | { kind: "block"; index: number }
  | { kind: "highlight"; index: number }
  | { kind: "theme" }
  | { kind: "sticker"; target: "header" | number };

export function Editor() {
  const [profile, dispatch] = useReducer(reducer, emptyProfile);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [myHandle, setMyHandle] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState<"loading" | "login" | "onboarding" | "edit">("loading");
  const hydrated = useRef(false);
  const lastSavedRef = useRef("");          // последний успешно сохранённый JSON (дедуп PUT)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Подтянуть профиль владельца с сервера (источник правды).
  // Пусто на сервере → локальный черновик (он засинкается автосейвом) → иначе онбординг.
  const loadOwnerProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      const data = res.ok ? await res.json() : { profile: null };
      if (data.profile) {
        lastSavedRef.current = JSON.stringify(data.profile);
        dispatch({ t: "load", profile: data.profile });
        hydrated.current = true;
        setView("edit");
        return;
      }
      let local: Profile | null = null;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) local = JSON.parse(raw);
      } catch {}
      if (local) {
        dispatch({ t: "load", profile: local });
        hydrated.current = true;
        setView("edit"); // автосейв перенесёт черновик на сервер
      } else {
        hydrated.current = true;
        setView("onboarding");
      }
    } catch {
      hydrated.current = true;
      setView("onboarding");
    }
  }, []);

  // Старт: кто вошёл? 401 → экран входа. Бэкенд недоступен (нет ключей) →
  // деградируем в локальный режim, как раньше, чтобы dev/сборка не ломались.
  useEffect(() => {
    (async () => {
      try {
        const me = await fetch("/api/auth/me");
        if (me.status === 401) {
          setView("login");
          return;
        }
        if (!me.ok) throw new Error("auth unavailable");
        try {
          const { handle } = await me.json();
          if (handle) setMyHandle(handle);
        } catch {}
        await loadOwnerProfile();
      } catch {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            dispatch({ t: "load", profile: JSON.parse(raw) });
            hydrated.current = true;
            setView("edit");
            return;
          }
        } catch {}
        hydrated.current = true;
        setView("onboarding");
      }
    })();
  }, [loadOwnerProfile]);

  // Автосохранение: localStorage сразу (кэш) + дебаунс-PUT на сервер.
  useEffect(() => {
    if (!hydrated.current || view !== "edit") return;
    const json = JSON.stringify(profile);
    if (json === lastSavedRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, json);
    } catch {}
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ profile }),
        });
        if (res.ok) {
          lastSavedRef.current = json;
          setSaved(true);
          setTimeout(() => setSaved(false), 1200);
        }
      } catch {
        // сервер недоступен — остаёмся на localStorage-кэше
      }
    }, 1200);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [profile, view]);

  // helper для актуальных
  const setHighlights = (hs: Highlight[]) => dispatch({ t: "highlights", highlights: hs });

  const onAuth = async (mode: AuthMode, form: AuthForm) => {
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || "Не удалось войти");
    if (data?.handle) setMyHandle(data.handle);
    // новый аккаунт начинает с онбординга, а не с чужого черновика в этом браузере
    if (mode === "register") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
    setView("loading");
    await loadOwnerProfile();
  };

  // Публичный адрес профиля и действия верхней панели.
  const publicPath = myHandle ? `/${myHandle}` : "/";
  const shareLink = async () => {
    if (!myHandle) return;
    const url = `${window.location.origin}/${myHandle}`;
    try {
      // Нативный шэр на мобильных, иначе — копирование в буфер.
      if (navigator.share) {
        await navigator.share({ url, title: "Моя страница на Ryadom" });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // отмена шэра / нет доступа к буферу — молча
    }
  };
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setMyHandle(null);
    setView("login");
  };

  if (view === "loading") {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-sub text-sm">
        Загрузка…
      </div>
    );
  }

  if (view === "login") {
    return <LoginScreen onAuth={onAuth} />;
  }

  if (view === "onboarding") {
    return (
      <Onboarding
        onDone={(p) => {
          hydrated.current = true;
          dispatch({ t: "load", profile: p });
          setView("edit");
        }}
      />
    );
  }

  const blocks = profile.blocks;
  const sheetBlock = sheet?.kind === "block" ? blocks[sheet.index] : null;
  const sheetBlockLabel = sheetBlock
    ? BLOCK_LIBRARY.find((b) => b.type === sheetBlock.type)?.label ?? "Блок"
    : "";

  // Стикер, который сейчас правится в листе: шапки или блока
  const stickerTarget = sheet?.kind === "sticker" ? sheet.target : null;
  const currentSticker =
    stickerTarget === "header"
      ? profile.header.sticker
      : stickerTarget !== null
        ? blocks[stickerTarget]?.sticker
        : undefined;
  const setSticker = (s: Sticker | undefined) => {
    if (stickerTarget === "header") {
      dispatch({ t: "header", header: { ...profile.header, sticker: s } });
    } else if (stickerTarget !== null && blocks[stickerTarget]) {
      dispatch({ t: "update", index: stickerTarget, block: { ...blocks[stickerTarget], sticker: s } });
    }
  };

  return (
    <ThemeScope theme={profile.theme} className="min-h-screen">
      {/* верхняя панель */}
      <div className="sticky top-0 z-50 bg-bg/90 backdrop-blur border-b border-ink/5">
        <div className="max-w-[460px] mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-serif text-xl text-ink">Ryadom</span>
          <div className="flex items-center gap-2">
            <span
              className={`text-[12px] whitespace-nowrap transition-opacity ${
                saved ? "opacity-100 text-moss" : "opacity-0"
              }`}
            >
              Сохранено ✓
            </span>
            {myHandle && (
              <button
                onClick={shareLink}
                className="text-[13px] font-semibold text-btn-ink bg-moss px-3.5 py-1.5 rounded-lg whitespace-nowrap"
              >
                {copied ? "Скопировано ✓" : "Поделиться"}
              </button>
            )}
            <button
              onClick={() => setSheet({ kind: "theme" })}
              aria-label="Оформление"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-ink/70 hover:bg-ink/5"
            >
              <PaletteIcon className="w-5 h-5" />
            </button>
            {/* вторичные действия — в меню, чтобы панель не разъезжалась на мобиле */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Ещё"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-ink/70 hover:bg-ink/5 text-xl leading-none"
              >
                ⋯
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 min-w-[176px] bg-card border border-ink/10 rounded-xl shadow-lg py-1.5 flex flex-col">
                    <Link
                      href={publicPath}
                      target="_blank"
                      onClick={() => setMenuOpen(false)}
                      className="px-4 py-2 text-[14px] text-ink hover:bg-ink/5 text-left"
                    >
                      Открыть профиль ↗
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        if (confirm("Начать профиль заново? Текущий будет удалён.")) {
                          try {
                            localStorage.removeItem(STORAGE_KEY);
                          } catch {}
                          hydrated.current = false;
                          lastSavedRef.current = "";
                          setView("onboarding");
                        }
                      }}
                      className="px-4 py-2 text-[14px] text-ink hover:bg-ink/5 text-left"
                    >
                      Начать заново
                    </button>
                    {myHandle && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                        className="px-4 py-2 text-[14px] text-sub hover:bg-ink/5 text-left"
                      >
                        Выйти
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="paper max-w-[440px] mx-auto pb-28 min-h-screen">
        {/* шапка: правится инлайн (фото — тапом, текст — поверх обложки) */}
        <EditProvider editing>
          <EditableHeader
            header={profile.header}
            doors={profile.doors}
            onChange={(h) => dispatch({ t: "header", header: h })}
            onEditLinks={() => setSheet({ kind: "header" })}
            onEditSticker={() => setSheet({ kind: "sticker", target: "header" })}
          />
        </EditProvider>

        {/* актуальные: кружки + «+» */}
        <HighlightsStrip
          highlights={profile.highlights}
          onOpen={(i) => setSheet({ kind: "highlight", index: i })}
          onCreate={(img) => {
            const idx = profile.highlights.length;
            setHighlights([...profile.highlights, { title: "Новое", slides: [{ img }] }]);
            setSheet({ kind: "highlight", index: idx });
          }}
        />

        {/* лента блоков — превью в режиме просмотра, правка через тап-выбор */}
        <Divider />

        <div className="px-5 space-y-11">
          {blocks.map((block, i) => (
            <BlockSelectWrap
              key={i}
              selected={selected === i}
              onSelect={() => setSelected(i)}
              onOpen={() => setSheet({ kind: "block", index: i })}
            >
              <BlockRenderer block={block} doors={profile.doors} owner={ownerName(profile)} />
            </BlockSelectWrap>
          ))}
        </div>
      </div>

      {/* нижняя зона: бар выбранного блока ИЛИ кнопка добавления */}
      <div className="fixed bottom-0 left-0 w-full z-40 pointer-events-none">
        <div className="max-w-[460px] mx-auto px-4 pb-6 pt-12 bg-gradient-to-t from-bg via-bg/90 to-transparent pointer-events-auto">
          {selected !== null && selected < blocks.length ? (
            <BlockActionBar
              first={selected === 0}
              last={selected === blocks.length - 1}
              onUp={() => dispatch({ t: "move", index: selected, dir: -1 })}
              onDown={() => dispatch({ t: "move", index: selected, dir: 1 })}
              onEdit={() => setSheet({ kind: "block", index: selected })}
              onSticker={() => setSheet({ kind: "sticker", target: selected })}
              onDelete={() => {
                if (confirm("Удалить блок?")) {
                  dispatch({ t: "delete", index: selected });
                  setSelected(null);
                }
              }}
              onClose={() => setSelected(null)}
            />
          ) : (
            <button
              onClick={() => setSheet({ kind: "library" })}
              className="w-full bg-moss text-btn-ink py-4 rounded-2xl font-semibold text-[16px] shadow-lg shadow-moss/30 hover:bg-mossd transition"
            >
              + Добавить блок
            </button>
          )}
        </div>
      </div>

      {/* ── Лист: библиотека блоков ── */}
      <Sheet open={sheet?.kind === "library"} onClose={() => setSheet(null)} title="Библиотека блоков">
        <div className="grid grid-cols-2 gap-3">
          {BLOCK_LIBRARY.map((b) => (
            <button
              key={b.type}
              onClick={() => {
                dispatch({ t: "add", block: createBlock(b.type) });
                setSelected(blocks.length); // выделяем только что добавленный
                setSheet({ kind: "block", index: blocks.length });
              }}
              className="text-left bg-card border border-ink/10 rounded-2xl p-4 hover:border-moss/40 transition"
            >
              <div className="w-10 h-10 rounded-xl bg-soft text-moss flex items-center justify-center mb-2.5">
                <BlockTypeIcon type={b.type} className="w-5 h-5" />
              </div>
              <div className="text-[15px] font-semibold text-ink">{b.label}</div>
              <div className="text-[12px] text-sub leading-snug mt-0.5">{b.hint}</div>
            </button>
          ))}
        </div>
      </Sheet>

      {/* ── Лист: правка блока (форма по схеме) ── */}
      <Sheet
        open={sheet?.kind === "block"}
        onClose={() => setSheet(null)}
        title={sheetBlockLabel}
        footer={
          <button
            onClick={() => setSheet(null)}
            className="w-full bg-moss text-btn-ink py-3.5 rounded-xl font-semibold text-[15px]"
          >
            Готово
          </button>
        }
      >
        {sheet?.kind === "block" && sheetBlock && (
          <BlockForm
            block={sheetBlock}
            onChange={(b) => dispatch({ t: "update", index: sheet.index, block: b })}
          />
        )}
      </Sheet>

      {/* ── Лист: оформление (тема страницы) ── */}
      <Sheet
        open={sheet?.kind === "theme"}
        onClose={() => setSheet(null)}
        title="Оформление"
        footer={
          <button onClick={() => setSheet(null)} className="w-full bg-moss text-btn-ink py-3.5 rounded-xl font-semibold text-[15px]">
            Готово
          </button>
        }
      >
        <ThemePicker
          value={profile.theme ?? DEFAULT_THEME}
          onChange={(theme) => dispatch({ t: "theme", theme })}
        />
      </Sheet>

      {/* ── Лист: стикер шапки или блока ── */}
      <Sheet
        open={sheet?.kind === "sticker"}
        onClose={() => setSheet(null)}
        title="Стикер"
        footer={
          <button onClick={() => setSheet(null)} className="w-full bg-moss text-btn-ink py-3.5 rounded-xl font-semibold text-[15px]">
            Готово
          </button>
        }
      >
        <StickerPicker key={String(stickerTarget)} value={currentSticker} onChange={setSticker} />
      </Sheet>

      {/* ── Лист: кнопки и ссылки (нетекстовые поля дверей) ── */}
      <Sheet
        open={sheet?.kind === "header"}
        onClose={() => setSheet(null)}
        title="Кнопки и ссылки"
        footer={
          <button onClick={() => setSheet(null)} className="w-full bg-moss text-btn-ink py-3.5 rounded-xl font-semibold text-[15px]">
            Готово
          </button>
        }
      >
        <HeaderEditor doors={profile.doors} onChange={(d) => dispatch({ t: "doors", doors: d })} />
      </Sheet>

      {/* ── Полноэкранная правка актуальных прямо в сторис ── */}
      {sheet?.kind === "highlight" && profile.highlights.length > 0 && (
        <EditableStoryViewer
          highlights={profile.highlights}
          startIndex={sheet.index}
          onChange={(hs) => setHighlights(hs)}
          onClose={() => setSheet(null)}
        />
      )}
    </ThemeScope>
  );
}

// ── Обёртка блока на превью: тап выделяет, повторный тап / ✎ открывает форму ──
function BlockSelectWrap({
  selected,
  onSelect,
  onOpen,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={() => (selected ? onOpen() : onSelect())}
      className={`relative rounded-2xl cursor-pointer transition ${
        selected
          ? "outline outline-2 outline-moss outline-offset-2"
          : "outline outline-1 outline-dashed outline-sage/25 outline-offset-2"
      }`}
    >
      {/* блок в режиме просмотра; тап всплывает к обёртке и выделяет блок */}
      {children}
      {selected && (
        <span className="absolute -top-2.5 left-3 z-10 bg-moss text-btn-ink text-[11px] font-medium px-2 py-0.5 rounded-full shadow">
          нажми, чтобы изменить
        </span>
      )}
    </div>
  );
}

// ── Док-бар действий над выбранным блоком ──
function BlockActionBar({
  first,
  last,
  onUp,
  onDown,
  onEdit,
  onSticker,
  onDelete,
  onClose,
}: {
  first: boolean;
  last: boolean;
  onUp: () => void;
  onDown: () => void;
  onEdit: () => void;
  onSticker: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5 bg-deep text-white rounded-2xl p-1.5 shadow-lg shadow-deep/30">
      <BarBtn onClick={onUp} disabled={first} aria="Вверх"><ArrowUpIcon className="w-4.5 h-4.5" /></BarBtn>
      <BarBtn onClick={onDown} disabled={last} aria="Вниз"><ArrowDownIcon className="w-4.5 h-4.5" /></BarBtn>
      <button
        onClick={onEdit}
        className="grow mx-0.5 bg-moss text-btn-ink py-2.5 rounded-xl font-semibold text-[15px] hover:bg-mossd transition flex items-center justify-center gap-2"
      >
        <PencilIcon className="w-4 h-4" /> Редактировать
      </button>
      <BarBtn onClick={onSticker} aria="Стикер"><StickerIcon className="w-4.5 h-4.5" /></BarBtn>
      <BarBtn onClick={onDelete} danger aria="Удалить"><TrashIcon className="w-4.5 h-4.5" /></BarBtn>
      <BarBtn onClick={onClose} aria="Готово"><CheckIcon className="w-4.5 h-4.5" /></BarBtn>
    </div>
  );
}

function BarBtn({
  children,
  onClick,
  disabled,
  danger,
  aria,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  aria: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={aria}
      className={`w-10 h-10 rounded-xl flex items-center justify-center text-[16px] transition ${
        disabled ? "opacity-25" : danger ? "text-red-300 hover:bg-white/10" : "text-white hover:bg-white/15"
      }`}
    >
      {children}
    </button>
  );
}

// ── Экран входа (временный dev-логин по handle; позже — Telegram) ──
type AuthMode = "login" | "register";
type AuthForm = { email: string; password: string; handle?: string };

const authInput =
  "w-full bg-card border border-ink/15 rounded-xl px-3 py-3 text-[16px] text-ink outline-none focus:border-moss/60 transition";

function LoginScreen({ onAuth }: { onAuth: (mode: AuthMode, form: AuthForm) => Promise<void> }) {
  const [mode, setMode] = useState<AuthMode>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const h = handle.trim().toLowerCase();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "register") {
      const invalid = handleError(h);
      if (invalid) return setError(invalid);
      if (password.length < 8) return setError("Пароль — не короче 8 символов");
    }
    setBusy(true);
    setError(null);
    try {
      await onAuth(mode, mode === "register" ? { email, password, handle: h } : { email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось войти");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-[360px] space-y-3">
        <h1 className="font-serif text-2xl text-ink">
          {mode === "register" ? "Своя страница за пару минут" : "Вход в конструктор"}
        </h1>
        <div className="flex gap-1 bg-soft rounded-xl p-1 text-[14px] font-medium">
          {(["register", "login"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg transition ${mode === m ? "bg-card text-ink shadow-sm" : "text-sub"}`}
            >
              {m === "register" ? "Регистрация" : "Вход"}
            </button>
          ))}
        </div>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={authInput}
        />
        <input
          type="password"
          required
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "register" ? "Пароль, от 8 символов" : "Пароль"}
          className={authInput}
        />
        {mode === "register" && (
          <div>
            <div className="flex items-center bg-card border border-ink/15 rounded-xl px-3 focus-within:border-moss/60 transition">
              <span className="text-sub text-[15px] select-none">ryadom.app/</span>
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="kate"
                className="flex-1 bg-transparent py-3 px-1 text-[16px] text-ink outline-none"
              />
            </div>
            <p className="text-[12px] text-sub mt-1.5">Адрес вашей страницы, его вы будете отправлять клиентам</p>
          </div>
        )}
        {error && <p className="text-[12px] text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-moss text-btn-ink py-3.5 rounded-xl font-semibold text-[15px] disabled:opacity-50 hover:bg-mossd transition"
        >
          {busy ? "Секунду…" : mode === "register" ? "Создать страницу" : "Войти"}
        </button>
      </form>
    </div>
  );
}
