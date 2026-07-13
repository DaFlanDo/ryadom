// ════════════════════════════════════════════════════════════
//  Серверный клиент Supabase (service-role).
//  ТОЛЬКО для серверного кода: route handlers, server components.
//  service-role минует RLS — поэтому ключ никогда не уходит на клиент
//  (нет префикса NEXT_PUBLIC_). Владение данными проверяем сами в роутах.
// ════════════════════════════════════════════════════════════
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const PROFILE_BUCKET = "profile-images";

let client: SupabaseClient | null = null;

// Ленивый синглтон: без ключей не падаем при импорте (важно для сборки),
// а только при первом реальном обращении — с понятной ошибкой.
export function supabaseAdmin(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase не настроен: задайте NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY в .env.local (см. .env.example)."
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
