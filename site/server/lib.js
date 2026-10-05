import { all, settings } from './db.js';

export const e = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const fa = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
export const dateFa = (d) => (d ? new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'long' }).format(new Date(String(d).replace(' ', 'T') + 'Z')) : '');
export const slugify = (s) => String(s).trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'item-' + Date.now();
export const md = (s = '') => String(s).split(/\n\n+/).map((b) => {
  b = b.trim();
  if (b.startsWith('## ')) return `<h2>${e(b.slice(3))}</h2>`;
  if (b.startsWith('- ')) return `<ul>${b.split('\n').map((l) => `<li>${e(l.replace(/^- /, ''))}</li>`).join('')}</ul>`;
  return b ? `<p>${e(b)}</p>` : '';
}).join('');

export const ICON = {
  instagram: '<path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5.5-2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>',
  linkedin: '<path d="M4 4h4v4H4zM4 10h4v10H4zM10 10h4v1.5c.8-1.2 2-1.8 3.5-1.8 3 0 3.5 2 3.5 4.5V20h-4v-5c0-1.200-.4-2-1.500-2s-1.500.8-1.500 2v5h-4z"/>',
  github: '<path d="M12 2a10 10 0 0 0-3.200 19.500c.5.1.7-.2.7-.5v-1.800c-2.800.6-3.400-1.200-3.400-1.200-.5-1.200-1.100-1.500-1.100-1.500-.9-.6.1-.6.1-.6 1 .1 1.500 1 1.500 1 .9 1.500 2.300 1.100 2.900.8.1-.7.4-1.100.6-1.400-2.200-.3-4.500-1.100-4.500-5 0-1.100.4-2 1-2.700-.1-.3-.4-1.300.1-2.700 0 0 .8-.3 2.700 1a9.400 9.400 0 0 1 5 0c1.900-1.300 2.700-1 2.700-1 .5 1.400.2 2.400.1 2.700.6.700 1 1.600 1 2.700 0 3.900-2.300 4.700-4.500 5 .4.300.7.900.7 1.800V21c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/>',
  telegram: '<path d="M21 4 3 11l5 2 2 6 3-4 5 4zM8 13l9-6-7 8z"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.500 0l3-3a4 4 0 0 0-5.500-5.500l-1 1M14 10a4 4 0 0 0-5.500 0l-3 3a4 4 0 0 0 5.500 5.500l1-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
};
export const icon = (n) => `<svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${ICON[n] || ICON.link}</svg>`;

export const NAV = [['/', 'خانه'], ['/start', 'شروع'], ['/tools', 'ابزارهای AI'], ['/prompts', 'پرامپت‌ها'], ['/automation', 'اتوماسیون'], ['/projects', 'پروژه‌ها'], ['/blog', 'مقالات'], ['/about', 'درباره من']];
export const socials = () => all('SELECT * FROM social_links WHERE published=1 ORDER BY sort');
export const social = (p) => all('SELECT url FROM social_links WHERE platform=? AND published=1', p)[0]?.url || '#';

export const crumbs = (list) => `<nav class="crumbs" aria-label="مسیر"><a href="/">خانه</a>${list.map(([l, h]) => ` <span>‹</span> ${h ? `<a href="${h}">${e(l)}</a>` : `<span aria-current="page">${e(l)}</span>`}`).join('')}</nav>`;
export const sampleBadge = (r) => (r.is_sample ? '<span class="badge sample">نمونه</span>' : '');

export function render(req, res, o) {
  const S = settings();
  const origin = S.site_url || `${req.headers['x-forwarded-proto'] || req.protocol}://${req.headers.host}`;
  const canonical = origin + (o.path || req.path);
  const title = o.title ? `${o.title} | محمد پورایی` : S.site_title;
  const desc = o.desc || S.site_description;
  const img = o.image || `${origin}/og.svg`;
  const ld = [{ '@context': 'https://schema.org', '@type': 'Person', name: 'محمد پورایی', alternateName: 'Mohammad Poraee', url: origin, sameAs: socials().map((s) => s.url) }, ...(o.ld || [])];
  const msg = { subscribed: 'عضویت شما ثبت شد. ممنون!', sent: 'پیام شما ارسال شد. ممنون!', invalid: 'لطفاً اطلاعات را درست وارد کنید.' }[req.query.msg];
  const soc = socials();
  const html = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${e(title)}</title><meta name="description" content="${e(desc)}"><link rel="canonical" href="${e(canonical)}">
<meta name="theme-color" content="#050A12"><meta property="og:type" content="${o.ogType || 'website'}"><meta property="og:locale" content="fa_IR"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(desc)}"><meta property="og:url" content="${e(canonical)}"><meta property="og:image" content="${e(img)}"><meta name="twitter:card" content="summary_large_image">
${o.noindex ? '<meta name="robots" content="noindex">' : ''}
<link rel="icon" href="/og.svg"><link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vazirmatn@33.0.3/Vazirmatn-font-face.css"><link rel="stylesheet" href="/style.css">
${ld.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('')}</head>
<body>${o.progress ? '<div id="progress"></div>' : ''}
<header class="nav"><div class="wrap nav-in"><a class="logo" href="/"><span class="logo-mark">AI</span><span>محمد پورایی</span></a>
<nav class="menu" id="menu" aria-label="منوی اصلی">${NAV.map(([h, l]) => `<a href="${h}"${(h === '/' ? req.path === '/' : req.path.startsWith(h)) ? ' class="on"' : ''}>${l}</a>`).join('')}<a class="btn btn-sm menu-cta" href="/start">شروع یادگیری</a></nav>
<form class="nav-search" action="/search" role="search"><input name="q" placeholder="دنبال چی می‌گردی؟" aria-label="جستجو"></form>
<button class="burger" id="burger" aria-label="منو" aria-expanded="false"><span></span><span></span><span></span></button></div></header>
${msg ? `<div class="toast" role="status">${msg}</div>` : ''}
<main>${o.body}</main>
<footer class="footer"><div class="wrap"><div class="foot-top"><div><div class="logo"><span class="logo-mark">AI</span><span>محمد پورایی</span></div><p class="muted">محمد پورایی | آموزش کاربردی هوش مصنوعی و اتوماسیون</p>
<div class="soc">${soc.map((s) => `<a href="${e(s.url)}" target="_blank" rel="noopener" aria-label="${e(s.label)}">${icon(s.platform)}</a>`).join('')}</div></div>
<nav class="foot-links" aria-label="فوتر">${[['/about', 'درباره من'], ['/contact', 'تماس'], ['/tools', 'ابزارها'], ['/prompts', 'پرامپت‌ها'], ['/blog', 'مقالات'], ['/privacy', 'حریم خصوصی']].map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}</nav></div>
<div class="copy">© Mohammad Poraee</div></div></footer>
<button id="totop" aria-label="بازگشت به بالا" hidden>↑</button><script src="/app.js" defer></script></body></html>`;
  res.status(o.status || 200).send(html);
}
