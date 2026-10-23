import { describe, expect, it } from "vitest";
import { parseProfile } from "@/lib/profileSchema";
import { buildStarterProfile, emptyAnswers } from "@/lib/onboarding";
import { BLOCK_LIBRARY, createBlock } from "@/lib/blockSchema";
import type { Profile } from "@/lib/types";
import demoProfile from "@/supabase/demo-profile.json";

const starter = (): Profile =>
  buildStarterProfile({
    ...emptyAnswers,
    name: "Анна",
    methods: ["КПТ"],
    topics: ["Тревога", "Выгорание"],
    price: "4000",
    tg: "anna_psy",
    bio: "Помогаю справляться с тревогой.",
  });

describe("схема профиля", () => {
  it("профиль из онбординга проходит без изменений", () => {
    const profile = starter();
    const parsed = parseProfile(profile);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.profile).toEqual(profile);
  });

  it("демо-профиль из supabase/demo-profile.json проходит", () => {
    expect(parseProfile(demoProfile).ok).toBe(true);
  });

  it("каждый блок из библиотеки «добавить» проходит", () => {
    const profile = { ...starter(), blocks: BLOCK_LIBRARY.map((b) => createBlock(b.type)) };
    expect(parseProfile(profile).ok).toBe(true);
  });

  it("стикеры и тема: только из своего списка", () => {
    const ok = { ...starter(), theme: "evening", header: { ...starter().header, sticker: { id: "herb", corner: "br" } } };
    expect(parseProfile(ok).ok).toBe(true);
    const badId = { ...ok, header: { ...ok.header, sticker: { id: "../../etc/passwd", corner: "br" } } };
    expect(parseProfile(badId).ok).toBe(false);
    const badCorner = { ...ok, header: { ...ok.header, sticker: { id: "herb", corner: "middle" } } };
    expect(parseProfile(badCorner).ok).toBe(false);
    expect(parseProfile({ ...ok, theme: "neon" }).ok).toBe(false);
  });

  it("старые темы «Мох», «Глина», «Сумерки» открываются в «Записке»", () => {
    for (const legacy of ["moss", "clay", "dusk"]) {
      const parsed = parseProfile({ ...starter(), theme: legacy });
      expect(parsed.ok && parsed.profile.theme).toBe("note");
    }
  });

  it("онбординг собирает страницу «Записки»: пара слов, запросы, первая встреча, вопросы", () => {
    const p = starter();
    expect(p.header.note).toBeTruthy();
    expect(p.blocks.map((b) => b.type)).toEqual(
      expect.arrayContaining(["topics", "meeting", "steps", "pricing", "faq", "cta"])
    );
    const topics = p.blocks.find((b) => b.type === "topics");
    expect(topics && "items" in topics && topics.items).toContain("тревога, которая не отпускает");
  });

  it("у каждого стикера из списка есть файл", async () => {
    const { existsSync } = await import("node:fs");
    const { STICKER_IDS } = await import("@/lib/stickers");
    for (const id of STICKER_IDS) expect(existsSync(`public/stickers/${id}.webp`), id).toBe(true);
  });

  it("javascript: в кнопке записи отклоняется", () => {
    const profile = starter();
    profile.doors.book.url = "javascript:alert(document.cookie)";
    const parsed = parseProfile(profile);
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.error).toContain("doors.book.url");
  });

  it("data: и http: картинки отклоняются", () => {
    for (const bad of ["data:image/svg+xml,<svg onload=alert(1)>", "http://example.com/a.jpg", "//evil.com/a.jpg"]) {
      const profile = starter();
      profile.header.avatar = bad;
      expect(parseProfile(profile).ok).toBe(false);
    }
  });

  it("неизвестный тип блока и оценка вне 1–5 отклоняются", () => {
    const p1 = { ...starter(), blocks: [{ type: "script", src: "x" }] };
    expect(parseProfile(p1).ok).toBe(false);
    const p2 = { ...starter(), blocks: [{ type: "reviews", items: [{ stars: 10, text: "", author: "" }] }] };
    expect(parseProfile(p2).ok).toBe(false);
  });

  it("лишние поля отбрасываются", () => {
    const profile = { ...starter(), isAdmin: true, header: { ...starter().header, onclick: "x" } };
    const parsed = parseProfile(profile);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect("isAdmin" in parsed.profile).toBe(false);
      expect("onclick" in parsed.profile.header).toBe(false);
    }
  });

  it("нет шапки или профиль огромный — отказ", () => {
    expect(parseProfile({ blocks: [] }).ok).toBe(false);
    expect(parseProfile(null).ok).toBe(false);
    const huge = starter();
    huge.header.bio = "а".repeat(300_000);
    expect(parseProfile(huge).ok).toBe(false);
  });
});
