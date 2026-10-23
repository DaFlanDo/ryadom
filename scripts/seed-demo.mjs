// Демо-страница ryadom.app/demo из supabase/demo-profile.json.
// У демо-аккаунта нет пароля, поэтому войти и изменить его нельзя.
// Запуск: npm run seed:demo [note|notebook|herbarium|evening] (ключи берутся из .env).
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Нужны NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY");

const profile = JSON.parse(await readFile(new URL("../supabase/demo-profile.json", import.meta.url), "utf8"));
const theme = process.argv[2];
if (theme) {
  if (!["note", "notebook", "herbarium", "evening"].includes(theme)) throw new Error(`Неизвестная тема: ${theme}`);
  profile.theme = theme;
}
const db = createClient(url, key, { auth: { persistSession: false } });

const { error } = await db
  .from("psychologists")
  .upsert(
    { handle: "demo", profile, password_hash: null, updated_at: new Date().toISOString() },
    { onConflict: "handle" }
  );
if (error) throw error;
console.log(`Демо-профиль сохранён: /demo (тема ${profile.theme})`);
