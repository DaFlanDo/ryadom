"use client";

import { useEffect, useState } from "react";
import { CloseIcon } from "@/components/icons";

// Мобильный bottom-sheet: выезжает снизу, закрывается тапом по фону.
// Привязан к visualViewport — при открытой клавиатуре iOS панель остаётся
// над клавиатурой, а не прячется под ней.
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  // видимая область: top — отступ сверху, height — высота над клавиатурой
  const [vv, setVv] = useState<{ top: number; height: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    // блокируем прокрутку фона
    document.body.style.overflow = "hidden";

    const visual = window.visualViewport;
    const sync = () => {
      if (!visual) return;
      setVv({ top: visual.offsetTop, height: visual.height });
    };
    sync();
    visual?.addEventListener("resize", sync);
    visual?.addEventListener("scroll", sync);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      visual?.removeEventListener("resize", sync);
      visual?.removeEventListener("scroll", sync);
    };
  }, [open, onClose]);

  if (!open) return null;

  // если visualViewport недоступен — обычный fixed inset-0
  const frameStyle = vv
    ? { top: vv.top, height: vv.height, bottom: "auto" as const }
    : undefined;

  return (
    <div
      className="fixed inset-x-0 top-0 bottom-0 z-[200] flex flex-col justify-end"
      style={frameStyle}
    >
      {/* фон */}
      <div
        className="absolute inset-0 bg-deep/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      {/* панель */}
      <div className="relative w-full max-w-[460px] mx-auto bg-bg rounded-t-3xl shadow-[0_-12px_40px_rgba(20,27,18,0.3)] max-h-full flex flex-col animate-[sheet_.22s_ease-out]">
        <style>{`@keyframes sheet{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        {/* хваталка + заголовок */}
        <div className="shrink-0 pt-3 pb-3 px-5 border-b border-ink/5">
          <div className="w-10 h-1 rounded-full bg-ink/15 mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-ink">{title}</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-card border border-ink/10 text-sub flex items-center justify-center"
              aria-label="Закрыть"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* контент */}
        <div className="overflow-y-auto px-5 py-5 grow overscroll-contain">{children}</div>
        {/* футер */}
        {footer && (
          <div className="shrink-0 px-5 py-4 border-t border-ink/5 bg-bg/95 backdrop-blur">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
