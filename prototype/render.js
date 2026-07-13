// ════════════════════════════════════════════════════════════
//  ProHelp · движок рендера   данные (data.js) → страница
//  BLOCKS[type] = функция, возвращающая HTML блока.
//  Добавить новый тип блока = добавить сюда одну функцию.
// ════════════════════════════════════════════════════════════

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => (
  { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));

// SVG телеграма (для кнопки «Написать»)
const TG = `<svg class="w-4 h-4 text-[#229ED9]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>`;

const sectionTitle = t => t ? `<h3 class="text-[12px] font-bold text-sage tracking-widest uppercase mb-3 px-1">${esc(t)}</h3>` : '';
const stars = n => '★'.repeat(n);

// ── Рендереры блоков ──
const BLOCKS = {

  statement: b => {
    const skin = b.color === 'moss' ? 'bg-moss text-white'
               : b.color === 'deep' ? 'bg-deep text-white'
               : b.color === 'soft' ? 'bg-soft text-ink'
               : 'bg-card text-ink border border-ink/5';
    return `<article class="${skin} rounded-2xl p-6 shadow-sm">
      <p class="font-serif text-[1.55rem] leading-snug mb-3">${esc(b.text)}</p>
      ${b.caption ? `<p class="opacity-70 text-[13px]">${esc(b.caption)}</p>` : ''}
    </article>`;
  },

  text: b => `<article class="bg-card rounded-2xl p-5 border border-ink/5 shadow-sm">
      ${b.title ? `<h3 class="text-[12px] font-bold text-sage tracking-widest uppercase mb-3">${esc(b.title)}</h3>` : ''}
      <p class="text-ink/80 text-[15px] leading-relaxed">${esc(b.body)}</p>
    </article>`,

  grid: b => `<section>${sectionTitle(b.title)}
      <div class="grid grid-cols-2 gap-3">
        ${b.items.map(it => `<div class="relative h-32 rounded-2xl overflow-hidden">
          <img src="${esc(it.img)}" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-deep/85 to-transparent"></div>
          <span class="absolute bottom-3 left-3 text-white font-semibold text-[15px]">${esc(it.label)}</span>
        </div>`).join('')}
      </div></section>`,

  video: b => `<section>${sectionTitle(b.title)}
      <article class="relative h-56 rounded-2xl overflow-hidden shadow-sm group cursor-pointer">
        <img src="${esc(b.img)}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-deep/30"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-16 h-16 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6 text-moss ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        ${b.caption ? `<p class="absolute bottom-4 left-4 right-4 text-white font-medium text-[15px] drop-shadow">${esc(b.caption)}</p>` : ''}
      </article></section>`,

  steps: b => `<section>${sectionTitle(b.title)}
      <div class="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 snap-x snap-mandatory pb-1">
        ${b.items.map(it => `<div class="snap-start shrink-0 w-44 bg-card rounded-2xl p-5 border border-ink/5 shadow-sm">
          <div class="text-moss font-serif text-3xl mb-2">${esc(it.n)}</div>
          <p class="font-semibold text-[15px] mb-1">${esc(it.title)}</p>
          <p class="text-sub text-[13px] leading-snug">${esc(it.text)}</p>
        </div>`).join('')}
      </div></section>`,

  education: b => `<section>${sectionTitle(b.title)}
      <article class="bg-card rounded-2xl p-5 border border-ink/5 shadow-sm mb-3">
        <ol class="relative border-l border-sage/40 ml-1 space-y-5">
          ${b.items.map(it => `<li class="pl-5 relative">
            <span class="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-moss"></span>
            <p class="text-[15px] font-semibold text-ink leading-tight">${esc(it.place)}</p>
            <p class="text-[13px] text-sub">${esc(it.detail)}</p>
          </li>`).join('')}
        </ol>
      </article>
      ${b.diplomas?.length ? `<div class="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        ${b.diplomas.map(src => `<img src="${esc(src)}" class="shrink-0 w-28 h-36 object-cover rounded-xl border border-ink/5 shadow-sm">`).join('')}
      </div>` : ''}
    </section>`,

  photo: b => `<article class="bg-card rounded-2xl overflow-hidden border border-ink/5 shadow-sm">
      <img src="${esc(b.img)}" class="w-full h-48 object-cover">
      ${b.caption ? `<div class="p-5"><p class="text-ink/80 text-[15px] leading-relaxed">${esc(b.caption)}</p></div>` : ''}
    </article>`,

  pricing: b => `<section>${sectionTitle(b.title)}
      <div class="grid grid-cols-2 gap-3">
        ${b.items.map(it => it.featured
          ? `<article class="bg-moss text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
               ${it.badge ? `<span class="absolute top-3 right-3 text-[10px] bg-white/20 px-2 py-0.5 rounded-full">${esc(it.badge)}</span>` : ''}
               <p class="text-[14px] font-semibold mb-1">${esc(it.name)}</p>
               <p class="font-serif text-3xl mb-1">${esc(it.price)}</p>
               <p class="text-[13px] text-white/70">${esc(it.note)}</p>
             </article>`
          : `<article class="bg-card rounded-2xl p-5 border border-ink/5 shadow-sm">
               <p class="text-[14px] font-semibold text-ink mb-1">${esc(it.name)}</p>
               <p class="font-serif text-3xl text-moss mb-1">${esc(it.price)}</p>
               <p class="text-[13px] text-sub">${esc(it.note)}</p>
             </article>`).join('')}
      </div></section>`,

  faq: b => `<section>${sectionTitle(b.title)}
      <div class="space-y-2">
        ${b.items.map(it => `<details class="group bg-card rounded-2xl border border-ink/5 shadow-sm overflow-hidden">
          <summary class="flex justify-between items-center p-4 cursor-pointer text-[15px] font-medium">${esc(it.q)} <span class="text-sage group-open:rotate-45 transition-transform text-lg">+</span></summary>
          <p class="px-4 pb-4 text-sub text-[14px] leading-relaxed">${esc(it.a)}</p>
        </details>`).join('')}
      </div></section>`,

  reviews: b => `<section>${sectionTitle(b.title)}
      <div class="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 snap-x snap-mandatory pb-1">
        ${b.items.map(it => `<article class="snap-start shrink-0 w-[78%] bg-soft rounded-2xl p-5">
          <p class="text-[11px] text-moss tracking-wider mb-3">${stars(it.stars)}</p>
          <p class="text-ink/85 text-[15px] leading-relaxed mb-4">${esc(it.text)}</p>
          <p class="text-[13px] font-semibold text-ink">${esc(it.author)}</p>
        </article>`).join('')}
      </div></section>`,

  meta: b => `<article class="bg-card rounded-2xl p-5 border border-ink/5 shadow-sm">
      <div class="grid grid-cols-3 gap-2 text-center">
        ${b.items.map((it,i) => `<div class="${i===1?'border-x border-ink/5':''}">
          <p class="font-serif text-2xl text-moss">${esc(it.value)}</p>
          <p class="text-[12px] text-sub">${esc(it.label)}</p>
        </div>`).join('')}
      </div></article>`,

  cta: b => `<article class="bg-deep text-white rounded-2xl p-6 text-center shadow-sm">
      <p class="font-serif text-[1.6rem] leading-snug mb-2">${esc(b.title)}</p>
      <p class="text-white/65 text-[14px] leading-relaxed mb-5">${esc(b.text)}</p>
      <div class="flex gap-2.5">
        <button class="flex-1 bg-moss text-white py-3 rounded-xl font-semibold text-[15px] hover:bg-mossd transition-colors">${esc(PROFILE.doors.book.label)}</button>
        <button class="flex-1 bg-white/10 backdrop-blur border border-white/15 text-white py-3 rounded-xl font-semibold text-[15px] hover:bg-white/20 transition-colors">${esc(PROFILE.doors.message.label)}</button>
      </div>
    </article>`,
};

// ── Шапка ──
function renderHeader(h) {
  return `<div class="h-36 relative overflow-hidden">
      <img src="${esc(h.cover)}" alt="" class="w-full h-full object-cover">
      <div class="absolute inset-0 bg-moss/55 mix-blend-multiply"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent"></div>
    </div>
    <div class="px-5 -mt-12 relative">
      <div class="flex items-end justify-between mb-3">
        <img src="${esc(h.avatar)}" alt="${esc(h.name)}" class="w-24 h-24 rounded-full object-cover ring-4 ring-bg shadow-lg">
        <span class="mb-1 flex items-center gap-1.5 text-[12px] text-sub bg-card/80 backdrop-blur px-3 py-1.5 rounded-full border border-ink/5">
          <span class="w-2 h-2 rounded-full bg-[#6FBF4F]"></span> ${esc(h.status)}
        </span>
      </div>
      <h1 class="font-serif text-[2rem] leading-none text-ink mb-0.5">${esc(h.name)}</h1>
      <p class="text-sub text-[14px] font-medium mb-3">${esc(h.role)}</p>
      <p class="text-ink/80 text-[15px] leading-relaxed mb-4">${esc(h.bio)}</p>
      <div class="flex items-center gap-2 text-[13px] text-sub mb-5">
        ${h.meta.map((m,i) => {
          const [first, ...rest] = m.split(' ');
          return `${i>0?'<span class="text-sage">·</span>':''}<span><span class="font-semibold text-ink">${esc(first)}</span>${rest.length?' '+esc(rest.join(' ')):''}</span>`;
        }).join(' ')}
      </div>
      <div class="flex gap-2.5">
        <button class="flex-1 bg-moss text-white py-3 rounded-xl font-semibold text-[15px] shadow-md shadow-moss/25 hover:bg-mossd transition-colors">${esc(PROFILE.doors.book.label)}</button>
        <button class="flex-1 bg-card border border-ink/10 text-ink py-3 rounded-xl font-semibold text-[15px] hover:border-moss/40 transition-colors flex items-center justify-center gap-2">${TG}${esc(PROFILE.doors.message.label)}</button>
      </div>
    </div>`;
}

// ── Актуальные (кружочки) ──
function renderHighlights(items) {
  return items.map((s,i) => `<button onclick="openStory(${i})" class="flex flex-col items-center gap-1.5 shrink-0 w-16">
      <div class="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-moss to-sage">
        ${s.cover
          ? `<img src="${esc(s.cover)}" class="w-full h-full rounded-full object-cover ring-2 ring-bg">`
          : `<div class="w-full h-full rounded-full bg-card ring-2 ring-bg flex items-center justify-center text-xl">${s.emoji||''}</div>`}
      </div>
      <span class="text-[11px] text-sub">${esc(s.title)}</span>
    </button>`).join('');
}

// ── Сборка страницы ──
function renderProfile(p) {
  document.getElementById('profile').innerHTML = renderHeader(p.header);
  document.getElementById('highlights').innerHTML = renderHighlights(p.highlights);
  document.getElementById('feed').innerHTML = p.blocks.map(b => {
    const fn = BLOCKS[b.type];
    return fn ? fn(b) : `<div class="bg-red-50 text-red-600 text-sm p-3 rounded-xl">неизвестный блок: ${esc(b.type)}</div>`;
  }).join('');
}

// ════════════════ Сторис-просмотрщик ════════════════
let cur = 0;
const storyBox = () => document.getElementById('story');
function renderBars() {
  document.getElementById('storyBars').innerHTML = PROFILE.highlights.map((_,i) =>
    `<div class="h-[3px] flex-1 rounded-full ${i<=cur?'bg-white':'bg-white/30'}"></div>`).join('');
}
function showStory() {
  const s = PROFILE.highlights[cur];
  const img = document.getElementById('storyImg');
  img.src = s.img; img.classList.remove('pop'); void img.offsetWidth; img.classList.add('pop');
  document.getElementById('storyTitle').textContent = s.title;
  document.getElementById('storyText').textContent = s.text;
  renderBars();
}
function openStory(i){ cur=i; storyBox().classList.remove('hidden'); storyBox().classList.add('flex'); showStory(); }
function closeStory(){ storyBox().classList.add('hidden'); storyBox().classList.remove('flex'); }
function nextStory(){ cur < PROFILE.highlights.length-1 ? (cur++, showStory()) : closeStory(); }
function prevStory(){ if(cur>0){ cur--; showStory(); } }
document.addEventListener('keydown', e => {
  if(storyBox().classList.contains('hidden')) return;
  if(e.key==='Escape') closeStory();
  if(e.key==='ArrowRight') nextStory();
  if(e.key==='ArrowLeft') prevStory();
});

// старт
renderProfile(PROFILE);
