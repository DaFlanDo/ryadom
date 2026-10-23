import { describe, expect, it } from "vitest";
import { SESSION_TTL, signSession, verifySession } from "@/lib/session";

const KEY = "k".repeat(64);
const ID = "3f1c2a8e-5b7d-4e0a-9c11-2b3d4e5f6a7b";

describe("сессия", () => {
  it("подписанное значение проверяется и возвращает id", () => {
    expect(verifySession(signSession(ID, KEY), KEY)).toBe(ID);
  });

  it("подменённый id не проходит", () => {
    const [, expires, sig] = signSession(ID, KEY).split(".");
    expect(verifySession(`другой-id.${expires}.${sig}`, KEY)).toBeNull();
  });

  it("продлить срок, не зная секрета, нельзя", () => {
    const [id, , sig] = signSession(ID, KEY).split(".");
    expect(verifySession(`${id}.9999999999.${sig}`, KEY)).toBeNull();
  });

  it("чужой секрет не подходит", () => {
    expect(verifySession(signSession(ID, KEY), "x".repeat(64))).toBeNull();
  });

  it("истёкшая сессия не проходит", () => {
    const issued = 1_700_000_000;
    const value = signSession(ID, KEY, issued);
    expect(verifySession(value, KEY, issued + SESSION_TTL - 1)).toBe(ID);
    expect(verifySession(value, KEY, issued + SESSION_TTL + 1)).toBeNull();
  });

  it("старый формат без срока и мусор отклоняются", () => {
    for (const bad of ["", "abc", `${ID}.deadbeef`, "a.b.c.d"]) {
      expect(verifySession(bad, KEY)).toBeNull();
    }
  });
});
