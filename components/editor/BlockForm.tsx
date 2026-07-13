"use client";

// ════════════════════════════════════════════════════════════
//  Ryadom · форма правки одного блока (тело bottom-sheet).
//  Поля берутся из BLOCK_SCHEMAS по типу блока, рисуются FieldEditor.
//  Правка иммутабельна и сразу уходит наверх → живой превью обновляется.
// ════════════════════════════════════════════════════════════

import type { Block } from "@/lib/types";
import { BLOCK_SCHEMAS } from "@/lib/blockSchema";
import { FieldEditor } from "./FieldEditor";

export function BlockForm({
  block,
  onChange,
}: {
  block: Block;
  onChange: (b: Block) => void;
}) {
  const schema = BLOCK_SCHEMAS[block.type];
  // блок — это объект с произвольными полями; правим по ключу схемы
  const data = block as unknown as Record<string, unknown>;
  const set = (key: string, value: unknown) =>
    onChange({ ...data, [key]: value } as unknown as Block);

  return (
    <div className="space-y-5">
      {schema.map((field) => (
        <FieldEditor
          key={field.key}
          field={field}
          value={data[field.key]}
          onChange={(v) => set(field.key, v)}
        />
      ))}
    </div>
  );
}
