// ryadom.app/try — «Попробовать без регистрации»: своя песочница
// с демо-страницей и сразу в редактор. Это GET, чтобы ссылку можно было
// дать из портфолио и README; на сайте ведём сюда обычным <a>, без prefetch.
import { NextResponse } from "next/server";
import { createSandbox, demoEnabled } from "@/lib/demo";
import { setSessionCookie } from "@/lib/session";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { serverError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const to = (path: string) => NextResponse.redirect(new URL(path, req.url), 303);
  if (!demoEnabled()) return to("/edit");
  // Песочница — строка в БД без регистрации: не даём наплодить их с одного адреса
  if (!rateLimit(`try:${clientIp(req)}`, 5, 10 * 60_000)) return to("/demo");

  try {
    const { id } = await createSandbox();
    await setSessionCookie(id);
    return to("/edit");
  } catch (e) {
    return serverError(e);
  }
}
