"use client";

import type { ReactNode } from "react";
import type { Door } from "@/lib/types";
import { linkHref } from "@/lib/urls";
import { useEditing } from "@/components/blocks/EditContext";

// Кнопка «Записаться» / «Написать». На публичной странице это ссылка,
// если специалист указал адрес; в редакторе — просто кнопка, чтобы
// клик не уводил со страницы во время правки.
export function DoorLink({ door, className, children }: { door: Door; className: string; children?: ReactNode }) {
  const editing = useEditing();
  const href = linkHref(door.url);
  const content = children ?? door.label;

  if (editing || !href) {
    return (
      <span className={`${className} cursor-default`} aria-disabled={!href || undefined}>
        {content}
      </span>
    );
  }
  const external = !href.startsWith("tel:") && !href.startsWith("mailto:");
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {content}
    </a>
  );
}
