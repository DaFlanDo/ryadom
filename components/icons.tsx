// ════════════════════════════════════════════════════════════
//  Ryadom · набор SVG-иконок (вместо эмодзи).
//  Контурные, stroke 1.75, наследуют цвет через currentColor —
//  красятся классами text-*. Геометрия по мотивам Lucide.
// ════════════════════════════════════════════════════════════
import type { BlockType } from "@/lib/types";

type IconProps = { className?: string };

// контурная иконка: общий каркас svg
function Stroke({ className = "w-4 h-4", children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function TelegramIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  );
}

export function PlayIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

// звезда рейтинга — заливкой, чтобы читалась в мелком размере
export function StarIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2.5l2.92 6.02 6.58.72-4.9 4.45 1.34 6.51L12 16.94 6.06 20.2l1.34-6.51-4.9-4.45 6.58-.72L12 2.5z" />
    </svg>
  );
}

export function CameraIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M14.5 4h-5L7.5 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.5L14.5 4z" />
      <circle cx="12" cy="13" r="3" />
    </Stroke>
  );
}

export function TrashIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </Stroke>
  );
}

export function ArrowUpIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </Stroke>
  );
}

export function ArrowDownIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </Stroke>
  );
}

export function CloseIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Stroke>
  );
}

export function CheckIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M20 6 9 17l-5-5" />
    </Stroke>
  );
}

export function PencilIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </Stroke>
  );
}

export function LinkIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Stroke>
  );
}

export function PlusIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </Stroke>
  );
}

export function SparkleIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2.75c.2 0 .38.13.44.32l1.6 5.02a2.5 2.5 0 0 0 1.62 1.62l5.02 1.6a.46.46 0 0 1 0 .88l-5.02 1.6a2.5 2.5 0 0 0-1.62 1.62l-1.6 5.02a.46.46 0 0 1-.88 0l-1.6-5.02a2.5 2.5 0 0 0-1.62-1.62l-5.02-1.6a.46.46 0 0 1 0-.88l5.02-1.6a2.5 2.5 0 0 0 1.62-1.62l1.6-5.02a.46.46 0 0 1 .44-.32z" />
      <path d="M19 2.5l.55 1.72c.08.26.28.46.54.54L21.8 5.3a.21.21 0 0 1 0 .4l-1.71.55a.86.86 0 0 0-.54.54L19 8.5a.21.21 0 0 1-.4 0l-.55-1.71a.86.86 0 0 0-.54-.54L15.8 5.7a.21.21 0 0 1 0-.4l1.71-.54a.86.86 0 0 0 .54-.54L18.6 2.5a.21.21 0 0 1 .4 0z" />
    </svg>
  );
}

export function LeafIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </Stroke>
  );
}

// ── Иконки типов блоков (библиотека «добавить блок») ──

function QuoteIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M9 5H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h3v1a4 4 0 0 1-3 3.87" />
      <path d="M20 5h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h3v1a4 4 0 0 1-3 3.87" />
    </Stroke>
  );
}

function TypeIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" />
      <path d="M12 4v16" />
      <path d="M9 20h6" />
    </Stroke>
  );
}

function GridIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <Stroke className={className}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </Stroke>
  );
}

function PlayCircleIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <Stroke className={className}>
      <circle cx="12" cy="12" r="9.25" />
      <path d="m10 8.5 5.5 3.5-5.5 3.5z" />
    </Stroke>
  );
}

function StairsIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M3 20h4.5v-4.5H12V11h4.5V6.5H21" />
    </Stroke>
  );
}

function GraduationIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M22 9.5 12 5 2 9.5l10 4.5 10-4.5z" />
      <path d="M6 11.8V16c0 1.66 2.69 3 6 3s6-1.34 6-3v-4.2" />
      <path d="M22 9.5V14" />
    </Stroke>
  );
}

function ImageIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <Stroke className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
    </Stroke>
  );
}

function TagIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z" />
      <circle cx="7.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
    </Stroke>
  );
}

function HelpIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <Stroke className={className}>
      <circle cx="12" cy="12" r="9.25" />
      <path d="M9.1 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </Stroke>
  );
}

function ChatIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22l5.9-2z" />
    </Stroke>
  );
}

function ChartIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M6 20v-4" />
      <path d="M12 20V10" />
      <path d="M18 20V4" />
    </Stroke>
  );
}

function TargetIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <Stroke className={className}>
      <circle cx="12" cy="12" r="9.25" />
      <circle cx="12" cy="12" r="5.5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </Stroke>
  );
}

const BLOCK_ICONS: Record<BlockType, (p: IconProps) => React.ReactNode> = {
  statement: QuoteIcon,
  text: TypeIcon,
  grid: GridIcon,
  video: PlayCircleIcon,
  steps: StairsIcon,
  education: GraduationIcon,
  photo: ImageIcon,
  pricing: TagIcon,
  faq: HelpIcon,
  reviews: ChatIcon,
  meta: ChartIcon,
  cta: TargetIcon,
};

export function BlockTypeIcon({ type, className }: { type: BlockType; className?: string }) {
  const Icon = BLOCK_ICONS[type];
  return <Icon className={className} />;
}
