// ════════════════════════════════════════════════════════════
//  Ryadom · проверка профиля на сервере (zod).
//  Повторяет lib/types.ts: редактор — не единственный, кто может
//  прислать PUT /api/profile, поэтому всё, что сохраняем и рендерим,
//  проходит через эту схему. Лишние поля отбрасываются, строки и
//  списки ограничены по длине, ссылки — только безопасные схемы.
// ════════════════════════════════════════════════════════════
import { z } from "zod";
import type { Profile } from "./types";
import { isSafeImage, isSafeLink } from "./urls";
import { STICKER_IDS } from "./stickers";
import { THEME_IDS } from "./themes";

const SHORT = 200;
const LONG = 5000;
const MAX_ITEMS = 50;

const str = (max = SHORT) => z.string().max(max);
const optStr = (max = SHORT) => str(max).optional();
const list = <T extends z.ZodTypeAny>(item: T) => z.array(item).max(MAX_ITEMS);
const image = z.string().max(2048).refine(isSafeImage, "Недопустимая ссылка на картинку");
const link = z.string().max(2048).refine(isSafeLink, "Недопустимая ссылка");
const sticker = z.object({ id: z.enum(STICKER_IDS), corner: z.enum(["tl", "tr", "bl", "br"]) });
const decor = { sticker: sticker.optional() };

const block = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("statement"), ...decor,
    color: z.enum(["moss", "deep", "soft", "card"]).optional(),
    text: str(LONG),
    caption: optStr(),
  }),
  z.object({ type: z.literal("text"), ...decor, title: optStr(), body: str(LONG) }),
  z.object({
    type: z.literal("grid"), ...decor,
    title: optStr(),
    items: list(z.object({ label: str(), img: image })),
  }),
  z.object({
    type: z.literal("video"), ...decor,
    title: optStr(),
    img: image,
    caption: optStr(),
    url: link.optional(),
  }),
  z.object({
    type: z.literal("steps"), ...decor,
    title: optStr(),
    items: list(z.object({ n: str(20), title: str(), text: str(LONG) })),
  }),
  z.object({
    type: z.literal("education"), ...decor,
    title: optStr(),
    items: list(z.object({ place: str(), detail: str(LONG) })),
    diplomas: list(image).optional(),
  }),
  z.object({ type: z.literal("photo"), ...decor, img: image, caption: optStr() }),
  z.object({
    type: z.literal("pricing"), ...decor,
    title: optStr(),
    items: list(
      z.object({
        name: str(),
        price: str(50),
        note: str(LONG),
        featured: z.boolean().optional(),
        badge: optStr(50),
      })
    ),
  }),
  z.object({
    type: z.literal("faq"), ...decor,
    title: optStr(),
    items: list(z.object({ q: str(), a: str(LONG) })),
  }),
  z.object({
    type: z.literal("reviews"), ...decor,
    title: optStr(),
    items: list(z.object({ stars: z.number().int().min(1).max(5), text: str(LONG), author: str() })),
  }),
  z.object({ type: z.literal("meta"), ...decor, items: list(z.object({ value: str(50), label: str() })) }),
  z.object({ type: z.literal("cta"), ...decor, title: str(), text: str(LONG) }),
]);

const door = z.object({ label: str(60), url: link });

export const profileSchema = z.object({
  theme: z.enum(THEME_IDS).optional(),
  header: z.object({
    name: str(),
    role: str(),
    bio: str(LONG),
    avatar: image,
    cover: image,
    status: str(),
    meta: list(str()),
    sticker: sticker.optional(),
  }),
  highlights: list(
    z.object({
      title: str(60),
      cover: image.optional(),
      emoji: optStr(16),
      slides: list(z.object({ img: image, caption: optStr(LONG) })),
    })
  ),
  blocks: z.array(block).max(100),
  doors: z.object({ book: door, message: door }),
});

// Схема и типы не должны разъехаться: если в lib/types.ts появится поле,
// которого нет здесь (или наоборот), эта строка не скомпилируется.
type Parsed = z.infer<typeof profileSchema>;
const sameShape: [Parsed] extends [Profile] ? ([Profile] extends [Parsed] ? true : false) : false = true;
void sameShape;

// Весь профиль в JSON — не больше ~200 КБ (фото лежат в Storage, тут только ссылки).
export const MAX_PROFILE_BYTES = 200_000;

export type ParseResult = { ok: true; profile: Profile } | { ok: false; error: string };

export function parseProfile(raw: unknown): ParseResult {
  if (JSON.stringify(raw ?? null).length > MAX_PROFILE_BYTES) {
    return { ok: false, error: "Профиль слишком большой" };
  }
  const result = profileSchema.safeParse(raw);
  if (!result.success) {
    const issue = result.error.issues[0];
    return { ok: false, error: `${issue.path.join(".") || "profile"}: ${issue.message}` };
  }
  return { ok: true, profile: result.data };
}
