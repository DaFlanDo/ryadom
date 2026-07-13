// ════════════════════════════════════════════════════════════
//  Слой данных над таблицей psychologists.
//  Профиль хранится как jsonb; здесь — типобезопасный мост к Profile.
// ════════════════════════════════════════════════════════════
import "server-only";
import type { Profile } from "@/lib/types";
import { supabaseAdmin } from "@/lib/supabase/server";

// Пустой профиль ({}) считаем «ещё не заполнен» → фронт покажет онбординг.
function isEmptyProfile(p: unknown): boolean {
  return !p || typeof p !== "object" || Object.keys(p as object).length === 0;
}

// Публичная страница ryadom.app/<handle>.
export async function getProfileByHandle(handle: string): Promise<Profile | null> {
  const { data, error } = await supabaseAdmin()
    .from("psychologists")
    .select("profile")
    .eq("handle", handle)
    .maybeSingle();

  if (error) throw error;
  if (!data || isEmptyProfile(data.profile)) return null;
  return data.profile as Profile;
}

// Профиль владельца (по сессии). null — если строки нет или профиль пуст.
export async function getOwnerRow(
  psychId: string
): Promise<{ handle: string; profile: Profile | null }> {
  const { data, error } = await supabaseAdmin()
    .from("psychologists")
    .select("handle, profile")
    .eq("id", psychId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return { handle: "", profile: null };
  return {
    handle: data.handle,
    profile: isEmptyProfile(data.profile) ? null : (data.profile as Profile),
  };
}

export async function saveOwnerProfile(psychId: string, profile: Profile): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("psychologists")
    .update({ profile, updated_at: new Date().toISOString() })
    .eq("id", psychId);

  if (error) throw error;
}

// Dev-логин: upsert по handle, вернуть id. Новому — профиль остаётся '{}'.
export async function ensurePsychologist(handle: string): Promise<string> {
  const db = supabaseAdmin();

  const { data: existing, error: selErr } = await db
    .from("psychologists")
    .select("id")
    .eq("handle", handle)
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing) return existing.id as string;

  const { data: created, error: insErr } = await db
    .from("psychologists")
    .insert({ handle })
    .select("id")
    .single();
  if (insErr) throw insErr;
  return created.id as string;
}
