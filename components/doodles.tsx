"use client";

// Рисованные от руки элементы: неровные линии, как карандашом по бумаге.
// Цвет — currentColor, поэтому они сами подстраиваются под тему.
import { useTheme } from "@/components/ThemeScope";

type P = { className?: string };
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// «Мох»: веточка с тремя листиками
export function Sprig({ className }: P) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden {...stroke}>
      <path d="M5 27.5c4.6-5.4 10.1-11.6 21-21.3" />
      <path d="M11.6 20.6c-3.4-.6-5.7-3.6-5.4-8.2 4.1.3 6.4 3.4 5.4 8.2z" fill="currentColor" fillOpacity=".2" />
      <path d="M17.2 14.8c-.2-4.3 2.1-7.2 6.3-8.1 1.1 4.1-1.6 7.4-6.3 8.1z" fill="currentColor" fillOpacity=".2" />
      <path d="M14.4 17.9c3.2-1.2 6.4-.3 8.4 2.8-3.1 2-6.4 1.2-8.4-2.8z" fill="currentColor" fillOpacity=".2" />
    </svg>
  );
}

// «Глина»: волнистое подчёркивание
export function Squiggle({ className }: P) {
  return (
    <svg viewBox="0 0 96 12" className={className} aria-hidden {...stroke} strokeWidth={2.2}>
      <path d="M2 7.5c6-5 10.5-5.2 15.6-.6 5.3 4.7 9.8 4.4 15.2-.4 5.6-5 10.2-4.9 15.6-.1 5.5 4.8 10 4.6 15.4-.2 5.2-4.6 9.6-4.7 14.9 0 4.1 3.6 7.6 4 13.3.4" />
    </svg>
  );
}

// «Сумерки»: звёздочка с искоркой
export function Twinkle({ className }: P) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden {...stroke}>
      <path
        d="M13 4.5c.9 5.6 2.6 7.7 8.4 8.6-5.7 1-7.5 3-8.4 8.7-.9-5.7-2.7-7.7-8.5-8.7 5.8-.9 7.6-3 8.5-8.6z"
        fill="currentColor"
        fillOpacity=".22"
      />
      <path d="M25 20.5c.4 2.3 1.1 3 3.3 3.4-2.2.4-2.9 1.1-3.3 3.4-.4-2.3-1.1-3-3.3-3.4 2.2-.4 2.9-1.1 3.3-3.4z" />
    </svg>
  );
}

// Украшение заголовка раздела под текущую тему
export function TitleMark() {
  const theme = useTheme();
  if (theme === "clay") return null; // у «Глины» подчёркивание под текстом, см. TitleUnderline
  if (theme === "dusk") return <Twinkle className="w-6 h-6 text-clay shrink-0 -ml-0.5" />;
  return <Sprig className="w-6 h-6 text-moss shrink-0 -ml-0.5" />;
}

export function TitleUnderline() {
  const theme = useTheme();
  if (theme !== "clay") return null;
  return <Squiggle className="w-16 h-2.5 text-clay -mt-0.5" />;
}
