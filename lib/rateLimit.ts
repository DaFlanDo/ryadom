// ════════════════════════════════════════════════════════════
//  Ограничение частоты запросов: скользящее окно в памяти процесса.
//  На Vercel у каждого инстанса функции своя память, так что это
//  защита от перебора с одного адреса, а не строгий глобальный лимит.
//  Для строгого лимита счётчики нужно вынести в Redis/БД.
// ════════════════════════════════════════════════════════════

const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number, at = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => t > at - windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(at);
  hits.set(key, recent);
  return true;
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}
