"use client";

import type { Door } from "@/lib/types";

const inputCls =
  "w-full rounded-xl border border-ink/10 bg-card px-3.5 py-2.5 text-[16px] text-ink placeholder:text-sub/50 focus:border-moss focus:ring-2 focus:ring-moss/15 outline-none transition";

// Лист «Кнопки и ссылки»: подписи и URL дверей под шапкой.
// Остальной текст шапки правится инлайн прямо на превью.
export function HeaderEditor({
  doors,
  onChange,
}: {
  doors: { book: Door; message: Door };
  onChange: (d: { book: Door; message: Door }) => void;
}) {
  const setDoor = (k: "book" | "message", patch: Partial<Door>) =>
    onChange({ ...doors, [k]: { ...doors[k], ...patch } });

  const rows: { k: "book" | "message"; title: string; ph: string }[] = [
    { k: "book", title: "Кнопка записи", ph: "Записаться" },
    { k: "message", title: "Кнопка сообщения", ph: "Написать" },
  ];

  return (
    <div className="space-y-5">
      <p className="text-[13px] text-sub leading-relaxed">
        Текст и ссылки кнопок под шапкой. Имя, статус и остальное правятся прямо на странице.
      </p>
      {rows.map(({ k, title, ph }) => (
        <div key={k} className="space-y-2">
          <span className="block text-[13px] font-medium text-sub">{title}</span>
          <input
            className={inputCls}
            placeholder={ph}
            value={doors[k].label}
            onChange={(e) => setDoor(k, { label: e.target.value })}
          />
          <input
            className={inputCls}
            placeholder="https://… или tg://…"
            value={doors[k].url}
            onChange={(e) => setDoor(k, { url: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
}
