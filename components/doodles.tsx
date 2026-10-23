"use client";

// Рисованная от руки веточка — подпись «сделано на Ryadom» и мелкие акценты.
// Цвет — currentColor, поэтому подстраивается под тему.
export function Sprig({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 27.5c4.6-5.4 10.1-11.6 21-21.3" />
      <path d="M11.6 20.6c-3.4-.6-5.7-3.6-5.4-8.2 4.1.3 6.4 3.4 5.4 8.2z" fill="currentColor" fillOpacity=".2" />
      <path d="M17.2 14.8c-.2-4.3 2.1-7.2 6.3-8.1 1.1 4.1-1.6 7.4-6.3 8.1z" fill="currentColor" fillOpacity=".2" />
      <path d="M14.4 17.9c3.2-1.2 6.4-.3 8.4 2.8-3.1 2-6.4 1.2-8.4-2.8z" fill="currentColor" fillOpacity=".2" />
    </svg>
  );
}
