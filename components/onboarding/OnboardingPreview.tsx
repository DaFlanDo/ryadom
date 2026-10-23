"use client";

import { useEffect, useRef, useState } from "react";
import type { OnboardingAnswers } from "@/lib/onboarding";
import { buildDraftProfile } from "@/lib/onboarding";
import { ProfileHeader } from "@/components/ProfileHeader";
import { BlockRenderer } from "@/components/blocks";
import { ThemeScope } from "@/components/ThemeScope";

// Живой фрагмент настоящей страницы: тот же ProfileHeader/BlockRenderer,
// что и в готовом профиле, только в режиме просмотра и без интерактива.
// Заполняется сам по мере ответов — ничего жать не нужно.
export function OnboardingPreview({
  answers,
  focus,
  compact = false,
}: {
  answers: OnboardingAnswers;
  focus?: string;
  compact?: boolean;
}) {
  const profile = buildDraftProfile(answers);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Момент с фото: когда пустой шаблон сменяется лицом — мягкое «дыхание».
  const prevAvatar = useRef(answers.avatar);
  const [glow, setGlow] = useState(false);
  useEffect(() => {
    if (!prevAvatar.current && answers.avatar) {
      setGlow(true);
      const id = setTimeout(() => setGlow(false), 1400);
      prevAvatar.current = answers.avatar;
      return () => clearTimeout(id);
    }
    prevAvatar.current = answers.avatar;
  }, [answers.avatar]);

  // Подвести превью к той части страницы, которую сейчас собираем:
  // reveal — целиком сверху; темы/цена — к блокам; иначе — к «аватар + имя».
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // 112 ≈ верх аватара при обложке h-44 (176px − выступ 56px − небольшой запас)
    const top =
      focus === "reveal" ? 0 : focus === "topics" || focus === "price" ? el.scrollHeight : focus === "note" ? 330 : 112;
    el.scrollTo({ top, behavior: "smooth" });
  }, [focus, answers.topics.length, answers.price, answers.note]);

  return (
    <div className={`px-5 ${compact ? "pt-2" : "pt-3"}`}>
      <ThemeScope
        theme={answers.theme}
        className={`paper relative mx-auto max-w-[300px] rounded-[1.6rem] border border-ink/[0.06] overflow-hidden shadow-cozy-lg ${
          glow ? "breathe" : ""
        }`}
      >
        <div
          ref={scrollRef}
          className={`overflow-hidden pointer-events-none no-scrollbar transition-[max-height] duration-300 ${
            compact ? "max-h-[16vh]" : "max-h-[30vh]"
          }`}
        >
          <ProfileHeader header={profile.header} doors={profile.doors} />
          {profile.blocks.length > 0 && (
            <div className="px-4 pb-5 space-y-3.5">
              {profile.blocks.map((block, i) => (
                <div key={i} className="rise">
                  <BlockRenderer block={block} doors={profile.doors} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* маска снизу — «страница продолжается» */}
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-bg via-bg/80 to-transparent" />
      </ThemeScope>

      {!compact && (
        <p className="text-center text-[11px] text-sage mt-2">
          Так выглядит твоя страница прямо сейчас
        </p>
      )}
    </div>
  );
}
