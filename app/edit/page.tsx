import type { Viewport } from "next";
import { Editor } from "@/components/editor/Editor";

export const metadata = {
  title: "Конструктор профиля — Ryadom",
};

// На iOS Safari зумит к любому contentEditable с font-size < 16px (а у нас
// почти весь текст блоков мельче). maximum-scale=1 убирает этот автозум.
// Только для редактора — публичный профиль (/) сохраняет обычный pinch-zoom.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function EditPage() {
  return <Editor />;
}
