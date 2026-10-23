// ════════════════════════════════════════════════════════════
//  Картинка-превью ссылки ryadom.app/<handle> (og:image).
//  Когда страницу пересылают в Telegram или WhatsApp, вместо голого фото
//  приходит карточка в теме психолога: бумага, полароид на креплении,
//  «привет, я Катя», имя и начало «пары слов». Каждая пересылка —
//  маленькое приглашение на Рядом.
//  Рисует next/og (satori): только flex-вёрстка и шрифты буферами.
// ════════════════════════════════════════════════════════════
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Profile, ThemeId } from "@/lib/types";
import { getProfileByHandle } from "@/lib/profiles";
import { isReservedHandle } from "@/lib/handles";
import { defaultHello } from "@/lib/hello";
import { DEFAULT_THEME, fastenerOf } from "@/lib/themes";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Страница психолога на Рядом";

type Palette = { paper: string; ink: string; sub: string; hand: string; frame: string; background: string };

// Те же цвета, что в app/globals.css, плюс «фактура» из градиентов
// (шум SVG satori не умеет, а линейку и пятна — умеет)
const PALETTE: Record<ThemeId, Palette> = {
  note: {
    paper: "#F4EFE4", ink: "#2B2A22", sub: "#6F6A5A", hand: "#B9785B", frame: "#FFFFFF",
    background: "radial-gradient(circle at 85% 15%, rgba(185,120,91,.10), transparent 45%)",
  },
  notebook: {
    paper: "#FBFBF6", ink: "#1F2B47", sub: "#55617C", hand: "#2F4FA8", frame: "#FFFFFF",
    background:
      "linear-gradient(90deg, transparent 62px, rgba(214,80,70,.4) 62px, rgba(214,80,70,.4) 65px, transparent 65px), repeating-linear-gradient(180deg, transparent 0px, transparent 41px, rgba(80,120,200,.2) 41px, rgba(80,120,200,.2) 43px)",
  },
  herbarium: {
    paper: "#F7F3EA", ink: "#34402C", sub: "#6E7563", hand: "#7C8F6A", frame: "#FFFDF8",
    background:
      "radial-gradient(circle at 88% 20%, rgba(194,128,123,.20), transparent 35%), radial-gradient(circle at 70% 95%, rgba(124,143,106,.20), transparent 40%)",
  },
  evening: {
    paper: "#24211E", ink: "#EDE4D3", sub: "#ADA290", hand: "#E9C98F", frame: "#EDE4D3",
    background: "radial-gradient(circle at 75% 15%, rgba(243,190,110,.24), transparent 50%)",
  },
};

// Шрифты тем: рукописный и «книжный»
const HAND_FONT: Record<ThemeId, { family: string; weight: 400 | 600 }> = {
  note: { family: "Caveat", weight: 600 },
  notebook: { family: "Bad Script", weight: 400 },
  herbarium: { family: "Marck Script", weight: 400 },
  evening: { family: "Neucha", weight: 400 },
};
const TITLE_FONT: Record<ThemeId, string> = {
  note: "Cormorant Garamond",
  notebook: "PT Serif",
  herbarium: "Cormorant Garamond",
  evening: "Cormorant Garamond",
};

// Google Fonts отдаёт TTF, если не представляться браузером; text= урезает
// шрифт до нужных букв, так что весит он считанные килобайты
async function googleFont(family: string, weight: number, text: string): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url, { cache: "force-cache" })).text();
  const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!src) throw new Error(`Шрифт ${family} не загрузился`);
  return (await fetch(src, { cache: "force-cache" })).arrayBuffer();
}

// Своё фото — по ссылке; заглушка из public/ — встраиваем как data-URL
async function imageSrc(src: string): Promise<string> {
  const local = src && src.startsWith("/") ? src : !src ? "/placeholder-avatar.svg" : null;
  if (!local) return src;
  const file = await readFile(path.join(process.cwd(), "public", local));
  const mime = local.endsWith(".svg") ? "image/svg+xml" : local.endsWith(".png") ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${file.toString("base64")}`;
}

// Домен для подписи на карточке: из адреса сайта, на Vercel — адрес проекта
function siteHost(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (!url) return "ryadom.app";
  try {
    return new URL(url.includes("://") ? url : `https://${url}`).host;
  } catch {
    return "ryadom.app";
  }
}

const clip = (s: string, max: number) => (s.length > max ? s.slice(0, max).replace(/\s+\S*$/, "") + "…" : s);

function Fastener({ theme }: { theme: ThemeId }) {
  const kind = fastenerOf(theme);
  const at = { position: "absolute" as const, top: -26, left: 132 };
  if (kind === "clip") {
    return (
      <svg style={{ ...at, top: -40, left: 60 }} width="34" height="84" viewBox="0 0 22 54" fill="none" stroke="#9AA3B5" strokeWidth="2.4" strokeLinecap="round">
        <path d="M7 14V40a5 5 0 0 0 10 0V8a7 7 0 0 0-14 0v34" />
      </svg>
    );
  }
  if (kind === "flower") {
    return (
      <svg style={{ ...at, top: -46, left: 90 }} width="170" height="116" viewBox="0 0 64 44">
        <path d="M4 40C20 30 34 20 58 6" stroke="#7C8F6A" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <ellipse cx="22" cy="27" rx="8" ry="3.4" fill="#9DB08A" transform="rotate(-50 22 27)" />
        <ellipse cx="34" cy="20" rx="8" ry="3.4" fill="#9DB08A" transform="rotate(20 34 20)" />
        <ellipse cx="44" cy="13" rx="7" ry="3" fill="#9DB08A" transform="rotate(-55 44 13)" />
        <circle cx="56" cy="7" r="4.5" fill="#D9A3A0" />
        <circle cx="60" cy="10" r="3.4" fill="#D9A3A0" />
        <circle cx="52.5" cy="10.5" r="3.4" fill="#D9A3A0" />
        <circle cx="56.5" cy="9" r="2" fill="#E8C56F" />
      </svg>
    );
  }
  if (kind === "pin") {
    return (
      <div
        style={{
          ...at, top: -14, left: 172, width: 30, height: 30, borderRadius: 999,
          backgroundImage: "radial-gradient(circle at 35% 35%, #FFE3A8, #E3A857 55%, #9A6A2A)",
          boxShadow: "0 5px 6px rgba(0,0,0,.55)",
        }}
      />
    );
  }
  return (
    <div style={{ ...at, width: 140, height: 42, background: "rgba(232,214,170,.85)", transform: "rotate(4deg)" }} />
  );
}

function Card({ profile, avatar, footer }: { profile: Profile; avatar: string; footer: string }) {
  const theme = profile.theme ?? DEFAULT_THEME;
  const c = PALETTE[theme];
  const h = profile.header;
  const hello = h.hello ?? defaultHello(h.name);
  const note = h.note ? clip(h.note, 120) : "";
  const hand = HAND_FONT[theme].family;
  const title = TITLE_FONT[theme];

  return (
    <div
      style={{
        width: "100%", height: "100%", display: "flex", alignItems: "center", position: "relative",
        backgroundColor: c.paper, backgroundImage: c.background, padding: "0 80px", color: c.ink,
      }}
    >
      {/* полароид с фото на креплении */}
      <div
        style={{
          display: "flex", flexDirection: "column", position: "relative", flexShrink: 0,
          background: c.frame, padding: "18px 18px 64px", transform: "rotate(-4deg)",
          boxShadow: "0 24px 48px -12px rgba(20,15,10,.45), 0 3px 6px rgba(20,15,10,.12)",
        }}
      >
        <img src={avatar} width={340} height={380} style={{ objectFit: "cover" }} alt="" />
        <Fastener theme={theme} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", marginLeft: 76, maxWidth: 620 }}>
        {hello && (
          <div style={{ fontFamily: hand, fontSize: 60, color: c.hand, transform: "rotate(-2deg)", marginLeft: -4 }}>{hello}</div>
        )}
        <div style={{ fontFamily: title, fontSize: 72, lineHeight: 1.05, marginTop: 6 }}>{clip(h.name, 40)}</div>
        {h.role && <div style={{ fontFamily: "Inter", fontSize: 28, color: c.sub, marginTop: 14 }}>{clip(h.role, 60)}</div>}
        {note && (
          <div style={{ fontFamily: hand, fontSize: 34, lineHeight: 1.25, marginTop: 30, color: c.ink, opacity: 0.9 }}>{note}</div>
        )}
      </div>

      <div
        style={{
          position: "absolute", right: 64, bottom: 40, display: "flex", alignItems: "center",
          fontFamily: hand, fontSize: 30, color: c.sub,
        }}
      >
        {footer}
      </div>
    </div>
  );
}

export default async function Image({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  let profile: Profile | null = null;
  if (!isReservedHandle(handle)) {
    try {
      profile = await getProfileByHandle(handle);
    } catch {
      profile = null;
    }
  }

  // Профиля нет — общая карточка Рядом, чтобы превью не было пустым
  const fallback: Profile = {
    theme: "note",
    header: {
      name: "Рядом", role: "тёплая страница для психолога", bio: "", avatar: "", cover: "",
      status: "", meta: [], hello: "страница, после которой не страшно прийти",
    },
    highlights: [], blocks: [], doors: { book: { label: "", url: "" }, message: { label: "", url: "" } },
  };
  const p = profile ?? fallback;
  const theme = p.theme ?? DEFAULT_THEME;
  const h = p.header;
  const hello = h.hello ?? defaultHello(h.name);
  // у несуществующего профиля в подписи только сам сайт
  const footer = profile ? `${siteHost()}/${handle}` : siteHost();
  const handText = `${hello}${h.note ?? ""}${footer}…`;

  const [handFont, titleFont, inter, avatar] = await Promise.all([
    googleFont(HAND_FONT[theme].family, HAND_FONT[theme].weight, handText),
    googleFont(TITLE_FONT[theme], TITLE_FONT[theme] === "PT Serif" ? 400 : 500, `${h.name}…`),
    googleFont("Inter", 500, `${h.role || "психолог"}…`),
    imageSrc(h.avatar),
  ]);

  return new ImageResponse(<Card profile={p} avatar={avatar} footer={footer} />, {
    ...size,
    fonts: [
      { name: HAND_FONT[theme].family, data: handFont, weight: HAND_FONT[theme].weight, style: "normal" },
      { name: TITLE_FONT[theme], data: titleFont, weight: TITLE_FONT[theme] === "PT Serif" ? 400 : 500, style: "normal" },
      { name: "Inter", data: inter, weight: 500, style: "normal" },
    ],
    // мессенджеры и так кэшируют превью; час — чтобы правки доезжали в тот же день
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
  });
}
