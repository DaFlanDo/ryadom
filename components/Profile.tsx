import type { Profile as ProfileData } from "@/lib/types";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Stories } from "@/components/Stories";
import { BlockRenderer } from "@/components/blocks";

// Собирает профиль из данных: шапка → актуальные → лента блоков.
// Это «движок рендера» — порт renderProfile() из прототипа.
export function Profile({ profile }: { profile: ProfileData }) {
  return (
    <main className="max-w-[440px] mx-auto bg-bg relative min-h-screen pb-16 overflow-x-clip sm:my-6 sm:rounded-[2.2rem] sm:overflow-hidden sm:shadow-[0_30px_80px_-20px_rgba(31,42,28,0.35)]">
      <ProfileHeader header={profile.header} doors={profile.doors} />

      <Stories highlights={profile.highlights} />

      <div className="px-4 space-y-3.5">
        {profile.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} doors={profile.doors} />
        ))}
      </div>

      <p className="text-center text-[12px] text-sage/80 mt-8">
        Профиль на Ryadom
      </p>
    </main>
  );
}
