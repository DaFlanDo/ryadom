import { describe, expect, it } from "vitest";
import { isSafeImage, linkHref } from "@/lib/urls";
import { sniffImage } from "@/lib/imageType";
import { handleError } from "@/lib/handles";

describe("ссылки кнопок", () => {
  it("рабочие ссылки остаются, опасные и пустые — нет", () => {
    expect(linkHref("https://t.me/anna")).toBe("https://t.me/anna");
    expect(linkHref("tg://resolve?domain=anna")).toBe("tg://resolve?domain=anna");
    expect(linkHref("mailto:a@b.ru")).toBe("mailto:a@b.ru");
    for (const bad of ["javascript:alert(1)", " JavaScript:alert(1)", "data:text/html,x", "#", "", undefined]) {
      expect(linkHref(bad)).toBeNull();
    }
  });

  it("картинки: только https и свои файлы", () => {
    expect(isSafeImage("/landscapes/landscape-01.jpg")).toBe(true);
    expect(isSafeImage("https://x.supabase.co/storage/v1/object/public/a.jpg")).toBe(true);
    expect(isSafeImage("//evil.com/a.jpg")).toBe(false);
    expect(isSafeImage("javascript:alert(1)")).toBe(false);
  });
});

describe("тип загруженного файла", () => {
  const bytes = (...b: number[]) => new Uint8Array([...b, ...new Array(16).fill(0)]);

  it("узнаёт JPEG, PNG, GIF и WebP по сигнатуре", () => {
    expect(sniffImage(bytes(0xff, 0xd8, 0xff, 0xe0))?.mime).toBe("image/jpeg");
    expect(sniffImage(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))?.mime).toBe("image/png");
    expect(sniffImage(bytes(0x47, 0x49, 0x46, 0x38, 0x39, 0x61))?.mime).toBe("image/gif");
    const webp = bytes(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50);
    expect(sniffImage(webp)?.mime).toBe("image/webp");
  });

  it("SVG и HTML не проходят, даже если клиент назвал их картинкой", () => {
    expect(sniffImage(new TextEncoder().encode("<svg onload=alert(1)>"))).toBeNull();
    expect(sniffImage(new TextEncoder().encode("<html><script>"))).toBeNull();
  });
});

describe("адрес страницы", () => {
  it("служебные слова и неверный формат заняты", () => {
    expect(handleError("edit")).not.toBeNull();
    expect(handleError("api")).not.toBeNull();
    expect(handleError("Анна")).not.toBeNull();
    expect(handleError("a")).not.toBeNull();
    expect(handleError("anna-psy")).toBeNull();
  });
});
