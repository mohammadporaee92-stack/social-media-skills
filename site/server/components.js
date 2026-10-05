import { e, fa, dateFa, icon, sampleBadge } from './lib.js';

const PRICE = { free: 'رایگان', freemium: 'Freemium', paid: 'پولی' };
export const sectionHead = (title, sub, link) => `<div class="sec-head"><div><h2>${e(title)}</h2>${sub ? `<p class="muted">${e(sub)}</p>` : ''}</div>${link ? `<a class="more" href="${link[0]}">${e(link[1])} ←</a>` : ''}</div>`;
export const empty = (t = 'موردی پیدا نشد.') => `<div class="empty"><div class="empty-ico">∅</div><p>${e(t)}</p></div>`;
const fav = (kind, id) => `<button class="fav" data-fav="${kind}:${id}" aria-label="ذخیره" title="ذخیره">♡</button>`;

export const toolCard = (t) => `<article class="card tool">
<div class="tool-top"><div class="tool-logo">${t.logo_url ? `<img src="${e(t.logo_url)}" alt="" loading="lazy" width="44" height="44">` : e(t.name.slice(0, 1))}</div>
<div><h3 dir="auto">${e(t.name)}</h3><span class="muted sm">${e(t.cat_name || '')}</span></div><span class="badge ${t.pricing}">${PRICE[t.pricing] || e(t.pricing)}</span>${fav('tool', t.id)}</div>
<p>${e(t.description)}</p>
<ul class="meta"><li><b>بهترین کاربرد:</b> ${e(t.best_for)}</li><li><b>سطح:</b> ${e(t.difficulty)}</li></ul>
<div class="actions">${t.website_url ? `<a class="btn btn-sm" href="${e(t.website_url)}" target="_blank" rel="noopener">وب‌سایت</a>` : ''}${t.tutorial_url ? `<a class="btn btn-sm btn-ghost" href="${e(t.tutorial_url)}">آموزش</a>` : ''}</div></article>`;

export const promptCard = (p) => `<article class="card"><div class="tool-top"><span class="badge">${e(p.cat_name || '')}</span>${fav('prompt', p.id)}</div>
<h3><a href="/prompts/${encodeURIComponent(p.slug)}">${e(p.title)}</a></h3><p class="muted">${e(p.summary)}</p>
<p class="sm muted">مناسب: <span dir="ltr">${e(p.models)}</span></p><a class="more" href="/prompts/${encodeURIComponent(p.slug)}">مشاهده پرامپت ←</a></article>`;

const art = (kind) => `<div class="thumb ${kind || ''}" aria-hidden="true"><svg viewBox="0 0 120 60"><g stroke="currentColor" fill="none" stroke-width=".8"><path d="M10 45 40 20 70 38 108 12"/><circle cx="10" cy="45" r="3"/><circle cx="40" cy="20" r="3"/><circle cx="70" cy="38" r="3"/><circle cx="108" cy="12" r="3"/></g></svg></div>`;
export const projectCard = (p) => `<article class="card project">${p.image_url ? `<img class="thumb" src="${e(p.image_url)}" alt="" loading="lazy">` : art()}
<div class="tool-top"><span class="badge">${e(p.cat_name || '')}</span>${sampleBadge(p)}</div><h3>${e(p.name)}</h3>
<dl class="dl"><dt>مسئله</dt><dd>${e(p.problem)}</dd><dt>راه‌حل</dt><dd>${e(p.solution)}</dd><dt>تکنولوژی</dt><dd dir="ltr" class="tech">${e(p.tech)}</dd><dt>نتیجه</dt><dd>${e(p.result)}</dd></dl>
<div class="actions"><span class="badge status">${e(p.status)}</span>${p.repo_url ? `<a class="btn btn-sm btn-ghost" href="${e(p.repo_url)}" target="_blank" rel="noopener">GitHub</a>` : ''}${p.demo_url ? `<a class="btn btn-sm" href="${e(p.demo_url)}" target="_blank" rel="noopener">دمو</a>` : ''}</div></article>`;

export const articleCard = (a) => `<article class="card article">${a.image_url ? `<img class="thumb" src="${e(a.image_url)}" alt="" loading="lazy">` : art('alt')}
<div class="tool-top"><span class="badge">${e(a.cat_name || '')}</span>${sampleBadge(a)}</div><h3><a href="/blog/${encodeURIComponent(a.slug)}">${e(a.title)}</a></h3><p class="muted">${e(a.excerpt)}</p>
<p class="sm muted">${dateFa(a.created_at)} · ${fa(a.read_minutes)} دقیقه مطالعه</p></article>`;

export const resourceCard = (r) => `<article class="card">${r.image_url ? `<img class="thumb" src="${e(r.image_url)}" alt="" loading="lazy">` : art()}
<div class="tool-top"><span class="badge">${e(r.cat_name || '')}</span>${sampleBadge(r)}</div><h3>${e(r.title)}</h3><p class="muted">${e(r.description)}</p>
${r.file_url ? `<a class="btn btn-sm" href="${e(r.file_url)}" download>دانلود</a>` : '<span class="btn btn-sm btn-ghost disabled" aria-disabled="true">به‌زودی</span>'}</article>`;

const KIND = { reel: 'Reel', carousel: 'Carousel', tutorial: 'Tutorial' };
export const igCard = (p) => `<a class="card ig" href="${e(p.url || '#')}" target="_blank" rel="noopener">${p.image_url ? `<img class="thumb" src="${e(p.image_url)}" alt="" loading="lazy">` : art()}
<div class="tool-top"><span class="badge">${KIND[p.kind] || e(p.kind)}</span>${sampleBadge(p)}</div><h3>${e(p.title)}</h3></a>`;

export const newsletter = (S, tg) => `<section class="section" id="newsletter"><div class="wrap"><div class="cta-box"><div><h2>از AI عقب نمان.</h2><p class="muted">ابزارهای کاربردی، پرامپت‌ها و آموزش‌های مهم را بدون شلوغ‌کاری برایت می‌فرستم.</p>
<a class="btn btn-ghost" href="${e(tg)}" target="_blank" rel="noopener">${icon('telegram')} عضویت در کانال</a></div>
<form method="post" action="/newsletter" class="form"><input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true"><label>نام<input name="name" required autocomplete="name"></label><label>ایمیل<input name="email" type="email" required dir="ltr" autocomplete="email"></label><button class="btn">عضو می‌شوم</button></form></div></div></section>`;

export const chips = (items, active, href) => `<div class="chips" role="list"><a role="listitem" href="${href('')}" class="${!active ? 'on' : ''}">همه</a>${items.map((c) => `<a role="listitem" href="${href(c.slug)}" class="${active === c.slug ? 'on' : ''}">${e(c.name)}</a>`).join('')}</div>`;
export const searchBox = (ph, q, hidden = '') => `<form class="search" method="get" role="search">${hidden}<input name="q" value="${e(q || '')}" placeholder="${e(ph)}" aria-label="${e(ph)}"><button class="btn btn-sm">جستجو</button></form>`;
