// Тип картинки по первым байтам файла, а не по Content-Type от клиента:
// заголовок можно подделать, сигнатуру формата — нет. SVG не принимаем
// вовсе: внутри него может быть скрипт.
export type ImageType = { mime: string; ext: string };

export function sniffImage(buf: Uint8Array): ImageType | null {
  const starts = (sig: number[], offset = 0) => sig.every((b, i) => buf[offset + i] === b);
  if (starts([0xff, 0xd8, 0xff])) return { mime: "image/jpeg", ext: "jpg" };
  if (starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mime: "image/png", ext: "png" };
  if (starts([0x47, 0x49, 0x46, 0x38])) return { mime: "image/gif", ext: "gif" };
  if (starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8)) {
    return { mime: "image/webp", ext: "webp" };
  }
  return null;
}
