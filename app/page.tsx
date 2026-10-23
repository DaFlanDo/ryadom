import Link from "next/link";

// Главная: что это и зачем, пример готовой страницы и вход в конструктор.
// Пример — обычный профиль /demo (без пароля, изменить его нельзя).

const STEPS = [
  {
    title: "Ответьте на пару вопросов",
    text: "Имя, подход, с чем работаете, формат и цена — из ответов сразу собирается страница.",
  },
  {
    title: "Поправьте прямо на странице",
    text: "Кликнули по тексту — редактируете. Блоки можно добавлять, переставлять и убирать.",
  },
  {
    title: "Отправьте ссылку клиенту",
    text: "Короткий адрес и красивое превью в мессенджере. Кнопки ведут в запись и в Telegram.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="max-w-[440px] mx-auto px-5 pt-6 pb-16">
        <div className="relative h-52 rounded-3xl overflow-hidden shadow-cozy-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/onboarding/intro.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-deep/70 via-deep/10 to-transparent" />
          <p className="absolute left-5 bottom-4 font-serif text-white text-[2.4rem] leading-none">Ryadom</p>
        </div>

        <h1 className="font-serif text-[2rem] leading-tight text-ink mt-7">
          Одна тёплая страница вместо визитки, сайта и хаотичного Instagram
        </h1>
        <p className="text-ink/75 text-[15px] leading-relaxed mt-3">
          Конструктор личной страницы для психологов и помогающих специалистов: о себе, подход,
          услуги и цены, отзывы и заметная кнопка «записаться».
        </p>

        <div className="flex gap-2.5 mt-6">
          <Link
            href="/edit"
            className="flex-1 text-center bg-moss text-white py-3.5 rounded-xl font-semibold text-[14px] shadow-md shadow-moss/25 hover:bg-mossd transition-colors"
          >
            Создать страницу
          </Link>
          <Link
            href="/demo"
            className="flex-1 text-center bg-card border border-ink/10 text-ink py-3.5 rounded-xl font-semibold text-[14px] hover:border-moss/40 transition-colors"
          >
            Посмотреть пример
          </Link>
        </div>

        <ol className="mt-10 space-y-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="bg-card rounded-2xl p-5 border border-ink/5 shadow-cozy flex gap-4">
              <span className="font-serif text-[1.8rem] leading-none text-clay">{i + 1}</span>
              <div>
                <p className="font-medium text-ink text-[15px]">{s.title}</p>
                <p className="text-sub text-[14px] leading-relaxed mt-1">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="text-[12px] text-sub/80 text-center mt-10">
          Пет-проект ·{" "}
          <a href="https://github.com/DaFlanDo/ryadom" className="underline underline-offset-2 hover:text-ink">
            код на GitHub
          </a>
        </p>
      </div>
    </main>
  );
}
