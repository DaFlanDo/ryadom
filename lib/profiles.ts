// ════════════════════════════════════════════════════════════
//  Слой данных над таблицей psychologists.
//  Профиль хранится как jsonb; при чтении и записи он проходит через
//  схему из lib/profileSchema.ts — в БД не попадает и из неё не
//  рендерится ничего, что не похоже на Profile.
// ════════════════════════════════════════════════════════════
import "server-only";
import type { Profile } from "@/lib/types";
import { parseProfile } from "@/lib/profileSchema";
import { supabaseAdmin } from "@/lib/supabase/server";

// Пустой профиль ({}) считаем «ещё не заполнен» → фронт покажет онбординг.
function isEmptyProfile(p: unknown): boolean {
  return !p || typeof p !== "object" || Object.keys(p as object).length === 0;
}

function readProfile(raw: unknown, who: string): Profile | null {
  if (isEmptyProfile(raw)) return null;
  const parsed = parseProfile(raw);
  if (!parsed.ok) {
    console.error(`Профиль ${who} не прошёл проверку схемы: ${parsed.error}`);
    return null;
  }
  return parsed.profile;
}

// Публичная страница ryadom.app/<handle>.
export async function getProfileByHandle(handle: string): Promise<Profile | null> {
  const { data, error } = await supabaseAdmin()
    .from("psychologists")
    .select("profile")
    .eq("handle", handle)
    .maybeSingle();

  if (error) throw error;
  return data ? readProfile(data.profile, handle) : null;
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
  return { handle: data.handle, profile: readProfile(data.profile, data.handle) };
}

export async function saveOwnerProfile(psychId: string, profile: Profile): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("psychologists")
    .update({ profile, updated_at: new Date().toISOString() })
    .eq("id", psychId);

  if (error) throw error;
}

export async function findAccountByEmail(
  email: string
): Promise<{ id: string; handle: string; password_hash: string | null } | null> {
  const { data, error } = await supabaseAdmin()
    .from("psychologists")
    .select("id, handle, password_hash")
    .eq("email", email)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export class AccountTakenError extends Error {}

// Регистрация: новая строка с пустым профилем ('{}') → дальше онбординг.
export async function createAccount(email: string, handle: string, passwordHash: string): Promise<string> {
  const db = supabaseAdmin();
  for (const [column, value, message] of [
    ["email", email, "Этот email уже зарегистрирован"],
    ["handle", handle, "Этот адрес уже занят"],
  ] as const) {
    const { data, error } = await db.from("psychologists").select("id").eq(column, value).maybeSingle();
    if (error) throw error;
    if (data) throw new AccountTakenError(message);
  }

  const { data, error } = await db
    .from("psychologists")
    .insert({ email, handle, password_hash: passwordHash })
    .select("id")
    .single();
  // 23505 — гонка: адрес заняли между проверкой и вставкой
  if (error?.code === "23505") throw new AccountTakenError("Этот email или адрес уже занят");
  if (error) throw error;
  return data.id as string;
}
