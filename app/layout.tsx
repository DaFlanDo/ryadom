import type { Metadata } from "next";
import { Bad_Script, Caveat, Cormorant_Garamond, Inter, Marck_Script, Neucha, PT_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

// Почерки тем: «Записка», «Тетрадь», «Гербарий», «Вечер»
const caveat = Caveat({ subsets: ["latin", "cyrillic"], weight: ["500", "600"], variable: "--font-caveat" });
const badScript = Bad_Script({ subsets: ["latin", "cyrillic"], weight: "400", variable: "--font-badscript" });
const marck = Marck_Script({ subsets: ["latin", "cyrillic"], weight: "400", variable: "--font-marck" });
const neucha = Neucha({ subsets: ["latin", "cyrillic"], weight: "400", variable: "--font-neucha" });
const ptSerif = PT_Serif({ subsets: ["latin", "cyrillic"], weight: ["400", "700"], variable: "--font-ptserif" });

const fontVars = [inter, cormorant, caveat, badScript, marck, neucha, ptSerif].map((f) => f.variable).join(" ");

export const metadata: Metadata = {
  // абсолютные ссылки на картинки превью; на Vercel без переменной Next возьмёт адрес проекта сам
  ...(process.env.NEXT_PUBLIC_SITE_URL ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL) } : {}),
  title: "Ryadom — страница для психолога",
  description:
    "Конструктор тёплой личной страницы для психологов: о себе, подход, услуги и кнопка «записаться».",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={fontVars}>
      <body className="font-sans antialiased selection:bg-moss/20">{children}</body>
    </html>
  );
}
