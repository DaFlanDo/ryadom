import type { Profile as ProfileData } from "@/lib/types";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Stories } from "@/components/Stories";
import { BlockRenderer } from "@/components/blocks";
import { ThemeScope } from "@/components/ThemeScope";
import { Divider } from "@/components/paper";
import { Sprig } from "@/components/doodles";

// Имя для подписи «— Катя» в финале: то же, что в «привет, я Катя»,
// а если приветствие своё — первое слово имени
export function ownerName(profile: ProfileData): string {
  const fromHello = profile.header.hello?.match(/(?:^|\s)я\s+([^\s,.!]+)\s*$/i)?.[1];
  return fromHello ?? profile.header.name.trim().split(/\s+/)[0] ?? "";
}

// Собирает страницу из данных: шапка → актуальное → разделы-записки.
// На десктопе колонка лежит как лист бумаги на «столе» темы,
// на мобильном — обычная страница во весь экран.
export function Profile({ profile }: { profile: ProfileData }) {
  return (
    <ThemeScope theme={profile.theme} className="min-h-screen sm:py-12 sm:px-6">
      <main className="paper relative w-full max-w-[440px] mx-auto min-h-screen sm:min-h-0 pb-14 overflow-x-clip sm:rounded-[2.2rem] sm:overflow-hidden sm:shadow-[0_30px_80px_-20px_rgba(20,15,10,0.45)]">
        <ProfileHeader header={profile.header} doors={profile.doors} />

        <Stories highlights={profile.highlights} />

        <Divider />

        <div className="px-5 space-y-11">
          {profile.blocks.map((block, i) => (
            <BlockRenderer key={i} block={block} doors={profile.doors} owner={ownerName(profile)} />
          ))}
        </div>

        <p className="hand hand-md flex items-center justify-center gap-1.5 text-sub mt-12">
          страничка сделана на Ryadom
          <Sprig className="w-4 h-4 text-sage" />
        </p>
      </main>
    </ThemeScope>
  );
}
