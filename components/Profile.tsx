import type { Profile as ProfileData } from "@/lib/types";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Stories } from "@/components/Stories";
import { BlockRenderer } from "@/components/blocks";
import { ThemeScope } from "@/components/ThemeScope";
import { Sprig } from "@/components/doodles";

// Собирает профиль из данных: шапка → актуальные → лента блоков.
// Это «движок рендера» — порт renderProfile() из прототипа.
// На десктопе колонка подаётся как «телефон» на уютном фоне,
// на мобильном — обычная страница во весь экран.
export function Profile({ profile }: { profile: ProfileData }) {
  return (
    <ThemeScope theme={profile.theme} className="min-h-screen sm:py-12 sm:px-6 sm:flex sm:flex-col sm:items-center">
      {/* тёплые пятна фона — только на десктопе, чтобы колонка не висела в пустоте */}
      <div
        aria-hidden
        className="hidden sm:block fixed -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-clay/15 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden
        className="hidden sm:block fixed -bottom-40 -right-28 w-[34rem] h-[34rem] rounded-full bg-moss/15 blur-3xl pointer-events-none"
      />

      <main className="relative w-full max-w-[440px] mx-auto bg-bg min-h-screen sm:min-h-0 pb-16 overflow-x-clip sm:rounded-[2.2rem] sm:overflow-hidden sm:ring-1 sm:ring-ink/10 sm:shadow-[0_30px_80px_-20px_rgba(31,42,28,0.35)]">
        <ProfileHeader header={profile.header} doors={profile.doors} />

        <Stories highlights={profile.highlights} />

        <div className="px-4 space-y-5">
          {profile.blocks.map((block, i) => (
            <BlockRenderer key={i} block={block} doors={profile.doors} />
          ))}
        </div>

        <p className="flex items-center justify-center gap-1.5 text-[12px] text-sub/70 mt-10">
          <Sprig className="w-4 h-4 text-sage" />
          Профиль на Ryadom
        </p>
      </main>

      <p className="hidden sm:flex relative items-baseline gap-2 mt-7 text-sub text-[13px]">
        <span className="font-serif text-[19px] text-ink">Ryadom</span>
        <span aria-hidden className="text-sage">·</span>
        страница-визитка психолога
      </p>
    </ThemeScope>
  );
}
