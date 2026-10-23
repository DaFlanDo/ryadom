"use client";

import { createContext, useContext } from "react";
import type { ThemeId } from "@/lib/types";
import { DEFAULT_THEME } from "@/lib/themes";

// Тема страницы: data-theme переключает CSS-переменные (см. globals.css),
// а контекст нужен тем немногим компонентам, которые рисуют по-разному
// (рисованные элементы у заголовков).
const ThemeContext = createContext<ThemeId>(DEFAULT_THEME);

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeScope({
  theme,
  className = "",
  children,
}: {
  theme?: ThemeId;
  className?: string;
  children: React.ReactNode;
}) {
  const id = theme ?? DEFAULT_THEME;
  return (
    <ThemeContext.Provider value={id}>
      <div data-theme={id} className={`theme-surface text-ink ${className}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
