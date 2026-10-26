// Публичная страница психолога: ryadom.app/<handle>.
// SSR — нужно для красивой ссылки-визитки и OG-превью при шеринге
// (это канал распространения продукта). Рендерит тот же <Profile>, что и
// редактор/главная, из данных в БД.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Profile } from "@/components/Profile";
import { getProfileByHandle } from "@/lib/profiles";
import { isReservedHandle, isSandboxHandle } from "@/lib/handles";

// Профиль может меняться в редакторе — не кэшируем агрессивно.
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { handle } = await params;
  let profile = null;
  try {
    profile = await getProfileByHandle(handle);
  } catch {
    // нет ключей/БД — отдадим дефолтные мета, страница покажет 404 ниже
  }
  if (!profile) {
    return { title: "Профиль не найден — Ryadom" };
  }

  const { name, role, bio, note } = profile.header;
  const title = `${name} — ${role}`;
  const description = (note || bio)?.slice(0, 200);

  // Картинку превью рисует opengraph-image.tsx рядом — Next подставит её сам
  return {
    title,
    description,
    // Демо-песочницы живут сутки — поисковикам их показывать незачем
    ...(isSandboxHandle(handle) && { robots: { index: false, follow: false } }),
    openGraph: { title, description, type: "profile" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PublicProfilePage({ params }: Params) {
  const { handle } = await params;
  // Служебные слова не могут быть профилем (и не должны запрашивать БД).
  if (isReservedHandle(handle)) notFound();
  const profile = await getProfileByHandle(handle);
  if (!profile) notFound();
  return <Profile profile={profile} />;
}
