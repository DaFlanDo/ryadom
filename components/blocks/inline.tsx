"use client";

import { createElement, useEffect, useRef, useState } from "react";
import { useEditing } from "./EditContext";
import { uploadImage } from "@/lib/uploadImage";

// ════════════════════════════════════════════════════════════
//  Инлайн-примитивы правки.
//  Без editing-контекста отдают статичный вид → публичная страница
//  не меняется. С контекстом — правка прямо на месте.
// ════════════════════════════════════════════════════════════

type Tag = keyof React.JSX.IntrinsicElements;

// ── Текст: правится прямо там, где нарисован ──
// Uncontrolled contentEditable: коммит на blur, внешний value
// синхронизируется только когда поле не в фокусе — иначе на телефоне
// (кириллица/IME) прыгает каретка.
export function EditableText({
  as = "span",
  value,
  onChange,
  placeholder = "",
  multiline = false,
  className = "",
}: {
  as?: Tag;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
}) {
  const editing = useEditing();
  const ref = useRef<HTMLElement>(null);

  // Синк извне только вне фокуса (load/undo/смена блока).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.innerText !== value) el.innerText = value ?? "";
  }, [value, editing]);

  if (!editing) {
    if (!value) return null;
    return createElement(as, { className }, value);
  }

  const commit = () => {
    const text = ref.current?.innerText ?? "";
    if (text !== value) onChange?.(text);
  };

  return createElement(as, {
    ref,
    contentEditable: true,
    suppressContentEditableWarning: true,
    "data-ph": placeholder,
    dir: "auto",
    onBlur: commit,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (!multiline && e.key === "Enter") {
        e.preventDefault();
        (e.target as HTMLElement).blur();
      }
    },
    onPaste: (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    },
    className:
      className +
      " outline-none focus:bg-moss/10 rounded-[4px] cursor-text transition-colors" +
      (multiline ? " whitespace-pre-wrap" : "") +
      " empty:before:content-[attr(data-ph)] empty:before:opacity-40 empty:before:pointer-events-none",
  });
}

// ── Фото: тап-замена прямо на изображении ──
// Рендерит <img> (+ маленький чип 📷 в углу в режиме правки).
// ВАЖНО: непосредственный родитель должен быть relative.
export function EditableImage({
  value,
  onChange,
  className = "",
  alt = "",
}: {
  value: string;
  onChange?: (v: string) => void;
  className?: string;
  alt?: string;
}) {
  const editing = useEditing();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      onChange?.(await uploadImage(file));
    } catch {
      alert("Не получилось загрузить фото");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={value} alt={alt} className={className} />
      {editing && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 z-20 bg-deep/75 text-white text-[12px] px-2.5 py-1 rounded-full backdrop-blur hover:bg-deep transition"
          >
            {busy ? "…" : "📷 фото"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFile}
          />
        </>
      )}
    </>
  );
}

// ── Контролы элемента списка (↑ ↓ ✕) ──
// Плавающий кластер в углу пункта. ВАЖНО: родитель — relative.
export function ItemControls({
  onRemove,
  onUp,
  onDown,
  first,
  last,
}: {
  onRemove: () => void;
  onUp?: () => void;
  onDown?: () => void;
  first?: boolean;
  last?: boolean;
}) {
  const editing = useEditing();
  if (!editing) return null;
  // Скрыты по умолчанию, проявляются только когда внутри элемента (group/item)
  // что-то в фокусе — то есть у того пункта, который сейчас правишь.
  return (
    <div className="absolute -top-2.5 right-1.5 z-30 flex items-center gap-0.5 bg-deep text-white rounded-full px-1 py-0.5 shadow-lg opacity-0 pointer-events-none transition-opacity duration-150 group-focus-within/item:opacity-100 group-focus-within/item:pointer-events-auto">
      {onUp && (
        <Mini onClick={onUp} disabled={first}>
          ↑
        </Mini>
      )}
      {onDown && (
        <Mini onClick={onDown} disabled={last}>
          ↓
        </Mini>
      )}
      <Mini onClick={onRemove} danger>
        ✕
      </Mini>
    </div>
  );
}

function Mini({
  children,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      // не отдаём фокус кнопке — чтобы текст не терял фокус и focus-within не схлопывался
      onPointerDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] transition ${
        disabled
          ? "opacity-25"
          : danger
          ? "text-red-300 hover:bg-white/10"
          : "text-white hover:bg-white/15"
      }`}
    >
      {children}
    </button>
  );
}

// ── «+ добавить» в конце списка ──
export function AddItem({
  label,
  onClick,
  className = "",
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  const editing = useEditing();
  if (!editing) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "w-full py-2.5 rounded-xl border border-dashed border-moss/40 text-moss text-[14px] font-medium hover:bg-moss/5 transition " +
        className
      }
    >
      + {label}
    </button>
  );
}

// ── Обёртка нетекстовых контролов: показывать только в правке ──
export function EditOnly({ children }: { children: React.ReactNode }) {
  const editing = useEditing();
  if (!editing) return null;
  return <>{children}</>;
}

// ── Звёзды: статичные в view, кликабельные в правке ──
export function StarRating({
  value,
  onChange,
  className = "",
}: {
  value: number;
  onChange?: (v: number) => void;
  className?: string;
}) {
  const editing = useEditing();
  if (!editing) {
    return <p className={className}>{"★".repeat(value)}</p>;
  }
  return (
    <div className="flex gap-1 mb-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          className={`text-[15px] leading-none ${
            n <= value ? "text-moss" : "text-moss/20"
          }`}
          aria-label={`${n} звёзд`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
