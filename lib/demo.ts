// ════════════════════════════════════════════════════════════
//  «Попробовать без регистрации»: каждый посетитель получает свою
//  песочницу — копию демо-страницы под адресом try-xxxxxx — и сразу
//  попадает в редактор. Через сутки песочница удаляется (при создании
//  следующих), так что ни cron, ни изменения схемы не нужны.
//  Выключить: DEMO_SANDBOX=0.
// ════════════════════════════════════════════════════════════
import "server-only";
import { randomBytes } from "crypto";
import demoProfile from "@/supabase/demo-profile.json";
import { parseProfile } from "@/lib/profileSchema";
import { createSandboxAccount, deleteSandboxesBefore } from "@/lib/profiles";
import { SANDBOX_PREFIX } from "@/lib/handles";

export const SANDBOX_TTL_MS = 24 * 60 * 60 * 1000;

export const demoEnabled = () => process.env.DEMO_SANDBOX !== "0";

export async function createSandbox(now = new Date()): Promise<{ id: string; handle: string }> {
  // Заодно убираем просроченные — песочницы живут сутки
  await deleteSandboxesBefore(SANDBOX_PREFIX, new Date(now.getTime() - SANDBOX_TTL_MS));

  const parsed = parseProfile(demoProfile);
  if (!parsed.ok) throw new Error(`demo-profile.json не прошёл схему: ${parsed.error}`);

  const handle = SANDBOX_PREFIX + randomBytes(4).toString("hex");
  const id = await createSandboxAccount(handle, parsed.profile);
  return { id, handle };
}
