// Демо-песочницы: адреса try-*, вход по /try, правила для регистрации.
import { beforeEach, describe, expect, it, vi } from "vitest";

const jar = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { value: jar.get(name) } : undefined),
    set: (name: string, value: string) => jar.set(name, value),
    delete: (name: string) => jar.delete(name),
  }),
}));

const created: { id: string; handle: string; profile: unknown }[] = [];
const cleanups: { prefix: string; cutoff: Date }[] = [];
vi.mock("@/lib/profiles", () => ({
  createSandboxAccount: async (handle: string, profile: unknown) => {
    const id = `sb-${created.length + 1}`;
    created.push({ id, handle, profile });
    return id;
  },
  deleteSandboxesBefore: async (prefix: string, cutoff: Date) => {
    cleanups.push({ prefix, cutoff });
    return 0;
  },
  getOwnerRow: async (id: string) => ({ handle: created.find((r) => r.id === id)?.handle ?? "", profile: null }),
}));

process.env.SESSION_SECRET = "x".repeat(32);
const { GET: tryDemo } = await import("@/app/try/route");
const { GET: me } = await import("@/app/api/auth/me/route");
const { handleError, isSandboxHandle } = await import("@/lib/handles");

let ip = 0;
const tryReq = () =>
  new Request("http://localhost/try", { headers: { "x-forwarded-for": `10.1.0.${ip}` } });

beforeEach(() => {
  jar.clear();
  created.length = 0;
  cleanups.length = 0;
  ip += 1;
  delete process.env.DEMO_SANDBOX;
});

describe("/try", () => {
  it("создаёт песочницу с демо-страницей, входит и ведёт в редактор", async () => {
    const res = await tryDemo(tryReq());
    expect(res.status).toBe(303);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/edit");

    expect(created).toHaveLength(1);
    expect(isSandboxHandle(created[0].handle)).toBe(true);
    expect((created[0].profile as { blocks: unknown[] }).blocks.length).toBeGreaterThan(0);

    const who = await me();
    expect(await who.json()).toEqual({ handle: created[0].handle });
  });

  it("перед созданием убирает песочницы старше суток", async () => {
    const before = Date.now();
    await tryDemo(tryReq());
    expect(cleanups[0].prefix).toBe("try-");
    const age = before - cleanups[0].cutoff.getTime();
    expect(age).toBeGreaterThanOrEqual(24 * 60 * 60 * 1000 - 1000);
  });

  it("у каждого посетителя своя песочница", async () => {
    await tryDemo(tryReq());
    await tryDemo(tryReq());
    expect(new Set(created.map((r) => r.handle)).size).toBe(2);
  });

  it("ограничивает число песочниц с одного адреса", async () => {
    const codes = [];
    for (let i = 0; i < 6; i++) {
      const res = await tryDemo(tryReq());
      codes.push(new URL(res.headers.get("location")!).pathname);
    }
    expect(created).toHaveLength(5);
    expect(codes.at(-1)).toBe("/demo");
  });

  it("DEMO_SANDBOX=0 выключает песочницы", async () => {
    process.env.DEMO_SANDBOX = "0";
    const res = await tryDemo(tryReq());
    expect(new URL(res.headers.get("location")!).pathname).toBe("/edit");
    expect(created).toHaveLength(0);
  });
});

describe("адреса песочниц", () => {
  it("нельзя занять при регистрации", () => {
    expect(handleError("try-anna")).not.toBeNull();
    expect(handleError("try")).not.toBeNull();
    expect(handleError("tryanna")).toBeNull();
  });
});
