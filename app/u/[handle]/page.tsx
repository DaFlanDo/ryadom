// Публичная страница психолога: /u/<handle>.
// SSR — нужно для красивой ссылки-визитки и OG-превью при шеринге
// (это канал распространения продукта). Рендерит тот же <Profile>, что и
// редактор/главная, из данных в БД.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Profile } from "@/components/Profile";
import { getProfileByHandle } from "@/lib/profiles";

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

  const { name, role, bio, avatar, cover } = profile.header;
  const title = `${name} — ${role}`;
  const description = bio?.slice(0, 200);
  const image = cover || avatar;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PublicProfilePage({ params }: Params) {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);
  if (!profile) notFound();
  return <Profile profile={profile} />;
}
