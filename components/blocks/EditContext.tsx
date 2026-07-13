"use client";

import { createContext, useContext } from "react";

// Один render-путь для публичной страницы и редактора.
// editing=false (по умолчанию) → блоки рисуют статичный текст/фото.
// editing=true → те же блоки дают инлайн-правку через примитивы из inline.tsx.
const EditContext = createContext(false);

export function EditProvider({
  editing,
  children,
}: {
  editing: boolean;
  children: React.ReactNode;
}) {
  return <EditContext.Provider value={editing}>{children}</EditContext.Provider>;
}

export function useEditing() {
  return useContext(EditContext);
}
