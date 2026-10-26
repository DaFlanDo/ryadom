/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { stickerSrc } from "@/lib/stickers";
import { ThemeScope } from "@/components/ThemeScope";
import { Divider, HandCircle, Note, Polaroid } from "@/components/paper";
import { THEMES } from "@/lib/themes";

// Главная в теме «Записка»: не список функций, а кусочки настоящей
// страницы — полароид, цены, отзыв, диплом. Сразу видно, что это про
// человека целиком, а не про «ссылку в био». Пример — профиль /demo.

const AVATAR = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=70";
const DIPLOMA = "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=300&q=60";

const STEPS = [
  {
    title: "Ответьте на пару вопросов",
    text: "С чем работаете, как, сколько стоит — из ответов сразу появится черновик тёплым языком.",
  },
  {
    title: "Добавьте себя",
    text: "Фото кабинета, пару слов от руки, как пройдёт первая встреча — то, что не влезает в анкету.",
  },
  {
    title: "Отправьте ссылку",
    text: "ryadom.app/имя — в шапку профиля, в Telegram, в ответ на «а вы кто?».",
  },
];

export default function Home() {
  return (
    <ThemeScope theme="note" className="min-h-screen sm:py-10 sm:px-6">
      <main className="paper relative max-w-[440px] mx-auto min-h-screen sm:min-h-0 pb-12 overflow-x-clip sm:rounded-[2.2rem] sm:shadow-[0_30px_80px_-20px_rgba(20,15,10,0.45)]">
        <div className="px-6 pt-6 flex items-center justify-between">
          <span className="font-serif text-[26px] text-ink">Ryadom</span>
          <Link href="/edit" className="hand hand-lg text-sub hover:text-ink">
            войти
          </Link>
        </div>

        <div className="px-6 mt-8">
          <p className="hand hand-lg text-hand -rotate-2 origin-left">для психологов, которые устали от «ссылки в био»</p>
          <h1 className="font-serif text-[2.45rem] leading-[1.08] text-ink mt-3">
            Страница, после которой к вам{" "}
            <span className="bg-[linear-gradient(transparent_62%,rgba(185,120,91,.28)_62%,rgba(185,120,91,.28)_88%,transparent_88%)]">
              не страшно
            </span>{" "}
            прийти
          </h1>
          <p className="text-sub text-[15.5px] leading-relaxed mt-4">
            Клиенту и так тяжело решиться на первое сообщение. Пусть он увидит не прайс и дипломы, а вас: как вы
            говорите, где принимаете, что будет на первой встрече.
          </p>
        </div>

        {/* коллаж из кусочков настоящей страницы */}
        <div className="relative h-[470px] mt-6">
          <div className="absolute left-7 top-5 w-[200px]">
            <Polaroid src={AVATAR} caption="привет, я Катя" index={0} imgClassName="h-[218px]" />
          </div>
          <div className="absolute right-3.5 top-14 w-[172px]">
            <Note index={3} fix="center" pad="p-3.5">
              <p className="hand hand-lg text-ink">сколько стоит</p>
              <p className="flex items-end text-[12.5px] mt-1.5 text-ink">
                сессия <span className="leader" /> <b>3 500</b>
              </p>
              <p className="flex items-end text-[12.5px] mt-1 text-ink">
                5 встреч <span className="leader" />
                <b className="relative">
                  16 000
                  <HandCircle className="absolute -left-2 -top-1.5 w-[calc(100%+16px)] h-[calc(100%+10px)] text-clay" />
                </b>
              </p>
            </Note>
          </div>
          <div className="absolute left-[146px] top-[290px] w-[214px]">
            <Note index={4} tone="note2" fix={false} pad="p-3.5">
              <p className="font-serif italic text-[17px] leading-snug text-ink">
                «Здесь сначала просто написала — и это сняло весь страх»
              </p>
              <p className="hand hand-md text-ink mt-1">— Мария, 31</p>
            </Note>
          </div>
          <div className="absolute left-6 top-[318px] w-[104px]">
            <Polaroid src={DIPLOMA} caption="диплом" index={5} fix={false} imgClassName="h-[80px]" />
          </div>
          <img src={stickerSrc("hot-beverage")} alt="" className="sticker absolute left-[196px] top-[230px] w-14 h-14 -rotate-12" />
          <p className="hand hand-md text-hand absolute right-5 top-1 rotate-3">живые фото, а не сток ↙</p>
        </div>

        <div className="px-6 flex gap-2.5">
          <Link
            href="/edit"
            className="flex-1 text-center btn-shape bg-moss text-btn-ink py-3.5 font-semibold text-[15px] shadow-md shadow-moss/25 hover:bg-mossd transition-colors"
          >
            Создать страницу
          </Link>
          <Link
            href="/demo"
            className="flex-1 text-center btn-shape bg-card border border-ink/10 text-ink py-3.5 font-semibold text-[15px] hover:border-moss/40 transition-colors"
          >
            Посмотреть пример
          </Link>
        </div>
        <div className="px-6 mt-2.5">
          {/* Обычная ссылка, не <Link>: /try — обработчик, создающий песочницу, его нельзя
              дёргать клиентским переходом или prefetch'ем */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/try"
            className="block text-center btn-shape border-2 border-moss text-moss py-3.5 font-semibold text-[15px] hover:bg-moss/10 transition-colors"
          >
            Попробовать редактор без регистрации
          </a>
        </div>
        <p className="hand hand-md text-sub text-center mt-2.5">бесплатно · минут пять, прямо с телефона</p>

        <Divider />

        <div className="px-6">
          <p className="hand hand-xl text-ink mb-5">как это устроено</p>
          <div className="space-y-5">
            {STEPS.map((s, i) => (
              <div key={s.title} className={i === 1 ? "ml-3.5" : ""}>
                <Note index={i * 2} fix={i === 1 ? "right" : i === 2 ? "center" : "left"}>
                  <p className="hand hand-lg text-hand">{i + 1}.</p>
                  <p className="font-semibold text-[15px] text-ink">{s.title}</p>
                  <p className="text-[14px] text-sub leading-relaxed mt-1">{s.text}</p>
                  {i === 1 && (
                    <img src={stickerSrc("potted-plant")} alt="" className="sticker absolute -right-2 -bottom-4 w-11 h-11 rotate-6" />
                  )}
                </Note>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 mt-10">
          <p className="hand hand-xl text-ink mb-2">четыре настроения</p>
          <p className="text-[14px] text-sub leading-relaxed">
            «Записка», «Тетрадь», «Гербарий» и «Вечер»: бумага, почерк и то, чем всё прикреплено, — скотч, скрепки,
            сухие веточки или булавки. Поменять можно в любой момент.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-5">
            {THEMES.map((t, i) => (
              <ThemeScope key={t.id} theme={t.id} className="rounded-2xl overflow-hidden">
                <div className="paper px-3 pt-5 pb-4">
                  <Note index={i + 1} fix="center" pad="px-3 py-2.5">
                    <p className="hand hand-lg text-hand">{t.name}</p>
                    <p className="text-[11.5px] text-sub leading-snug">{t.mood}</p>
                  </Note>
                </div>
              </ThemeScope>
            ))}
          </div>
        </div>

        <p className="text-[12px] text-sub/80 text-center mt-8">
          Пет-проект ·{" "}
          <a href="https://github.com/DaFlanDo/ryadom" className="underline underline-offset-2 hover:text-ink">
            код на GitHub
          </a>
        </p>
      </main>
    </ThemeScope>
  );
}
