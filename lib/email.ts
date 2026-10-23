// Email для входа: в нижнем регистре, простая проверка формы.
export const normalizeEmail = (email: string) => email.trim().toLowerCase();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailError(email: string): string | null {
  if (email.length > 254 || !EMAIL_RE.test(email)) return "Проверьте email";
  return null;
}
