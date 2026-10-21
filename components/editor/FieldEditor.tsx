"use client";

// ════════════════════════════════════════════════════════════
//  Ryadom · рендер одного поля формы блока.
//  Управляется схемой Field из lib/blockSchema.ts: kind выбирает контрол.
//  Используется внутри BlockForm (лист правки блока).
// ════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import type { Field } from "@/lib/blockSchema";
import { ImageInput } from "./ImageInput";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CloseIcon,
  StarIcon,
} from "@/components/icons";

export const inputCls =
  "w-full rounded-xl border border-ink/10 bg-card px-3.5 py-2.5 text-[16px] text-ink placeholder:text-sub/50 focus:border-moss focus:ring-2 focus:ring-moss/15 outline-none transition";

// цветовые свотчи для statement.color
const COLOR_SWATCH: Record<string, string> = {
  moss: "bg-moss",
  deep: "bg-deep",
  soft: "bg-soft",
  card: "bg-card border border-ink/20",
};

// ── textarea с авто-высотой ──
function AutoTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fit = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };
  useEffect(fit, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onInput={fit}
      rows={3}
      className={inputCls + " resize-none leading-relaxed min-h-[5rem]"}
    />
  );
}

// ── подпись поля ──
function Label({ children }: { children: React.ReactNode }) {
  return <span className="block text-[13px] font-medium text-sub mb-1.5">{children}</span>;
}

// ── одно поле ──
export function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  switch (field.kind) {
    case "text":
      return (
        <div>
          <Label>{field.label}</Label>
          <input
            className={inputCls}
            placeholder={field.ph}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
          {field.hint && <p className="text-[12px] text-sub/70 mt-1">{field.hint}</p>}
        </div>
      );

    case "textarea":
      return (
        <div>
          <Label>{field.label}</Label>
          <AutoTextarea
            value={(value as string) ?? ""}
            placeholder={field.ph}
            onChange={onChange}
          />
          {field.hint && <p className="text-[12px] text-sub/70 mt-1">{field.hint}</p>}
        </div>
      );

    case "image":
      return (
        <div>
          <Label>{field.label}</Label>
          <ImageInput value={(value as string) ?? ""} onChange={onChange} size={72} />
        </div>
      );

    case "select": {
      const current = (value as string) ?? field.options[0]?.value;
      const isColor = field.key === "color";
      return (
        <div>
          <Label>{field.label}</Label>
          {isColor ? (
            <div className="flex gap-2.5">
              {field.options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => onChange(o.value)}
                  aria-label={o.label}
                  className={`w-9 h-9 rounded-full ${COLOR_SWATCH[o.value] ?? "bg-card"} ${
                    current === o.value ? "ring-2 ring-offset-2 ring-moss ring-offset-bg" : ""
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {field.options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => onChange(o.value)}
                  className={`px-3.5 py-2 rounded-xl text-[14px] font-medium border transition ${
                    current === o.value
                      ? "bg-moss text-white border-moss"
                      : "bg-card text-ink border-ink/10"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    case "stars": {
      const n = (value as number) ?? 0;
      return (
        <div>
          <Label>{field.label}</Label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange(s)}
                aria-label={`${s} звёзд`}
                className={s <= n ? "text-clay" : "text-ink/15"}
              >
                <StarIcon className="w-6 h-6" />
              </button>
            ))}
          </div>
        </div>
      );
    }

    case "toggle": {
      const on = Boolean(value);
      return (
        <button
          type="button"
          onClick={() => onChange(!on)}
          className="flex items-center justify-between w-full py-1"
        >
          <span className="text-[15px] text-ink">{field.label}</span>
          <span
            className={`relative w-11 h-6 rounded-full transition ${on ? "bg-moss" : "bg-ink/15"}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                on ? "left-[1.375rem]" : "left-0.5"
              }`}
            />
          </span>
        </button>
      );
    }

    case "stringlist": {
      const list = (value as string[]) ?? [];
      const setAt = (i: number, v: string) =>
        onChange(list.map((x, j) => (j === i ? v : x)));
      const removeAt = (i: number) => onChange(list.filter((_, j) => j !== i));
      const add = () => onChange([...list, ""]);
      return (
        <div>
          <Label>{field.label}</Label>
          <div className="space-y-2.5">
            {list.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="grow">
                  {field.image ? (
                    <ImageInput value={item} onChange={(v) => setAt(i, v)} size={64} />
                  ) : (
                    <input
                      className={inputCls}
                      value={item}
                      onChange={(e) => setAt(i, e.target.value)}
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="shrink-0 w-9 h-9 mt-0.5 rounded-lg text-sub hover:text-red-500 hover:bg-red-50 transition flex items-center justify-center"
                  aria-label="Удалить"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <AddButton label={field.addLabel} onClick={add} />
        </div>
      );
    }

    case "list": {
      const items = (value as Record<string, unknown>[]) ?? [];
      const setItem = (i: number, patch: Record<string, unknown>) =>
        onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
      const removeItem = (i: number) => onChange(items.filter((_, j) => j !== i));
      const moveItem = (i: number, dir: -1 | 1) => {
        const j = i + dir;
        if (j < 0 || j >= items.length) return;
        const next = [...items];
        [next[i], next[j]] = [next[j], next[i]];
        onChange(next);
      };
      return (
        <div>
          <Label>{field.label}</Label>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl border border-ink/10 bg-bg/60 p-3.5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-sage tracking-wide uppercase">
                    {String(item[field.itemTitleKey] || `${i + 1}`).slice(0, 28) || `${i + 1}`}
                  </span>
                  <div className="flex items-center gap-1">
                    <MiniBtn onClick={() => moveItem(i, -1)} disabled={i === 0}><ArrowUpIcon className="w-3.5 h-3.5" /></MiniBtn>
                    <MiniBtn onClick={() => moveItem(i, 1)} disabled={i === items.length - 1}><ArrowDownIcon className="w-3.5 h-3.5" /></MiniBtn>
                    <MiniBtn onClick={() => removeItem(i)} danger><CloseIcon className="w-3.5 h-3.5" /></MiniBtn>
                  </div>
                </div>
                {field.itemFields.map((f) => (
                  <FieldEditor
                    key={f.key}
                    field={f}
                    value={item[f.key]}
                    onChange={(v) => setItem(i, { [f.key]: v })}
                  />
                ))}
              </div>
            ))}
          </div>
          <AddButton
            label={field.addLabel}
            onClick={() => onChange([...items, field.defaultItem()])}
          />
        </div>
      );
    }
  }
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-moss/40 text-moss text-[14px] font-medium hover:bg-moss/5 transition"
    >
      + {label}
    </button>
  );
}

function MiniBtn({
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
      onClick={onClick}
      disabled={disabled}
      className={`w-7 h-7 rounded-lg flex items-center justify-center text-[13px] transition ${
        disabled
          ? "opacity-25"
          : danger
          ? "text-red-400 hover:bg-red-50"
          : "text-sub hover:bg-ink/5"
      }`}
    >
      {children}
    </button>
  );
}
