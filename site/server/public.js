import { Router } from 'express';
import { all, get, run, settings } from './db.js';
import { e, fa, dateFa, md, icon, crumbs, render, social, socials, sampleBadge } from './lib.js';
import { toolCard, promptCard, projectCard, articleCard, resourceCard, igCard, newsletter, sectionHead, empty, chips, searchBox } from './components.js';

export const pub = Router();
const bc = (list) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: list.map(([n, h], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: h })) });
const TOOLS = 'SELECT t.*, c.name cat_name, c.slug cat_slug FROM ai_tools t LEFT JOIN tool_categories c ON c.id=t.category_id WHERE t.published=1';
const PROMPTS = 'SELECT p.*, c.name cat_name, c.slug cat_slug FROM prompts p LEFT JOIN prompt_categories c ON c.id=p.category_id WHERE p.published=1';
const PROJECTS = 'SELECT p.*, c.name cat_name, c.slug cat_slug FROM projects p LEFT JOIN categories c ON c.id=p.category_id WHERE p.published=1';
const ARTICLES = 'SELECT a.*, c.name cat_name, c.slug cat_slug FROM articles a LEFT JOIN categories c ON c.id=a.category_id WHERE a.published=1';
const RESOURCES = 'SELECT r.*, c.name cat_name, c.slug cat_slug FROM resources r LEFT JOIN categories c ON c.id=r.category_id WHERE r.published=1';
const like = (q) => `%${q}%`;
const hero = (S) => `<div class="portrait" aria-label="جای عکس محمد پورایی">
<svg class="net" viewBox="0 0 400 460" aria-hidden="true"><g stroke="#00E5FF" stroke-opacity=".35" fill="none"><path d="M30 80 120 40 230 90 360 50M30 80 70 220 20 340M360 50 380 190 330 330M70 220 200 250 380 190M20 340 140 420 330 330M120 40 200 250 140 420"/></g><g fill="#00E5FF"><circle cx="30" cy="80" r="4"/><circle cx="120" cy="40" r="4"/><circle cx="230" cy="90" r="4"/><circle cx="360" cy="50" r="4"/><circle cx="70" cy="220" r="4"/><circle cx="200" cy="250" r="3"/><circle cx="380" cy="190" r="4"/><circle cx="20" cy="340" r="4"/><circle cx="140" cy="420" r="4"/><circle cx="330" cy="330" r="4"/></g></svg>
<div class="frame">${S.portrait_url ? `<img src="${e(S.portrait_url)}" alt="محمد پورایی" width="360" height="440" fetchpriority="high">` : '<div class="ph"><span class="ph-ico">◎</span><b>جای عکس محمد</b><small>از پنل مدیریت ← تنظیمات، آدرس عکس را وارد کن</small></div>'}</div>
<span class="chip c1">AI Tools</span><span class="chip c2">Automation</span><span class="chip c3">Workflow</span></div>`;

pub.get('/', (req, res) => {
  const S = settings();
  const tools = all(`${TOOLS} AND t.featured=1 ORDER BY t.id LIMIT 6`);
  const prompts = all(`${PROMPTS} AND p.featured=1 ORDER BY p.id LIMIT 3`);
  const projects = all(`${PROJECTS} AND p.featured=1 ORDER BY p.id LIMIT 3`);
  const articles = all(`${ARTICLES} ORDER BY a.featured DESC, a.created_at DESC LIMIT 3`);
  const resources = all(`${RESOURCES} AND r.featured=1 ORDER BY r.id LIMIT 3`);
  const ig = all('SELECT * FROM instagram_posts WHERE published=1 ORDER BY sort LIMIT 3');
  const start = [['شروع با هوش مصنوعی', 'مفاهیم پایه بدون اصطلاحات پیچیده', 'شروع یادگیری', '/start', '١'], ['ابزارهای AI', 'بهترین ابزارها برای کارهای مختلف', 'مشاهده ابزارها', '/tools', '٢'], ['پرامپت‌های کاربردی', 'پرامپت‌هایی که می‌توانی مستقیماً استفاده کنی', 'مشاهده پرامپت‌ها', '/prompts', '٣'], ['اتوماسیون', 'کارهای تکراری را به هوش مصنوعی بسپار', 'یادگیری اتوماسیون', '/automation', '۴']];
  const strip = ['AI Tools', 'Prompt Engineering', 'Automation', 'AI Agents', 'کاربرد AI در کار و زندگی'];
  const body = `
<section class="hero"><canvas id="ai3d" aria-hidden="true"></canvas><div class="wrap hero-in"><div class="hero-text">
<span class="eyebrow">هوش مصنوعی، ساده و کاربردی</span>
<h1>هوش مصنوعی فقط برای برنامه‌نویس‌ها نیست.</h1>
<p class="lead">یاد بگیر چطور از AI برای کار، زندگی و ساخت اتوماسیون‌های واقعی استفاده کنی.</p>
<p class="muted">اینجا ابزارهای هوش مصنوعی، پرامپت‌های کاربردی، آموزش اتوماسیون و تجربه‌های واقعی استفاده از AI را به زبان ساده یاد می‌گیری.</p>
<div class="actions"><a class="btn btn-lg" href="/start">شروع یادگیری</a><a class="btn btn-lg btn-ghost" href="/tools">مشاهده ابزارهای AI</a></div>
<a class="ig-link" href="${e(social('instagram'))}" target="_blank" rel="noopener">${icon('instagram')} <span dir="ltr">@mohammad_por_ai</span></a></div>${hero(S)}</div></section>
<div class="ticker" aria-label="حوزه‌های تمرکز"><div class="ticker-track">${[...strip, ...strip, ...strip].map((s) => `<span>${e(s)}</span><i>•</i>`).join('')}</div></div>
<section class="section"><div class="wrap">${sectionHead('از کجا شروع کنم؟', 'اگر تازه وارد دنیای هوش مصنوعی شده‌ای، از اینجا شروع کن.')}
<div class="grid g4">${start.map(([t, d, c, h, n]) => `<a class="card start-card" href="${h}"><span class="num">${n}</span><h3>${t}</h3><p class="muted">${d}</p><span class="more">${c} ←</span></a>`).join('')}</div></div></section>
<section class="section alt"><div class="wrap">${sectionHead('ابزارهای منتخب AI', 'چند ابزار که ارزش شروع دارند.', ['/tools', 'همه ابزارها'])}<div class="grid g3">${tools.map(toolCard).join('') || empty()}</div></div></section>
<section class="section"><div class="wrap">${sectionHead('پرامپت‌های منتخب', 'آماده کپی و استفاده.', ['/prompts', 'کتابخانه پرامپت'])}<div class="grid g3">${prompts.map(promptCard).join('') || empty()}</div></div></section>
${automationBlock(true)}
<section class="section"><div class="wrap">${sectionHead('AI Lab | آزمایشگاه محمد', 'محمد فقط درباره AI حرف نمی‌زند؛ با آن چیز می‌سازد. (پروژه‌های زیر نمونه هستند.)', ['/projects', 'همه پروژه‌ها'])}<div class="grid g3">${projects.map(projectCard).join('') || empty()}</div></div></section>
${engineering()}
<section class="section"><div class="wrap">${sectionHead('یادداشت‌ها و آموزش‌ها', 'تازه‌ترین آموزش‌های ساده و کاربردی.', ['/blog', 'همه مقالات'])}<div class="grid g3">${articles.map(articleCard).join('') || empty()}</div></div></section>
<section class="section alt"><div class="wrap">${sectionHead('منابع رایگان', 'چک‌لیست، قالب و راهنما.', ['/resources', 'همه منابع'])}<div class="grid g3">${resources.map(resourceCard).join('') || empty()}</div></div></section>
<section class="section"><div class="wrap">${sectionHead('از اینستاگرام', 'محتوای آموزشی از @mohammad_por_ai')}<div class="grid g3">${ig.map(igCard).join('') || empty()}</div><p class="center"><a class="btn" href="${e(social('instagram'))}" target="_blank" rel="noopener">دنبال کردن در اینستاگرام</a></p></div></section>
<section class="section alt"><div class="wrap about-mini"><div><h2>سلام، من محمد پورایی هستم.</h2><p class="muted">مهندس برقی که به هوش مصنوعی و اتوماسیون علاقه‌مند شد؛ می‌خواهد فناوری را عمیق بفهمد و ساده توضیح بدهد.</p><a class="btn btn-ghost" href="/about">بیشتر درباره من</a></div></div></section>
${newsletter(S, S.telegram_cta_url)}`;
  render(req, res, { body, desc: S.site_description, ld: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'محمد پورایی', inLanguage: 'fa', potentialAction: { '@type': 'SearchAction', target: '/search?q={q}', 'query-input': 'required name=q' } }] });
});

function automationBlock(compact) {
  const ex = ['تولید خودکار محتوا', 'پاسخ خودکار به پیام‌ها', 'پردازش ایمیل', 'تحلیل اطلاعات', 'مدیریت شبکه‌های اجتماعی', 'ساخت AI Agent', 'اتصال چند ابزار به یکدیگر', 'ساخت Workflow'];
  return `<section class="section" id="automation"><div class="wrap auto">${!compact ? '' : ''}<div><span class="eyebrow">اتوماسیون با هوش مصنوعی</span><h2>کارهای تکراری را یک بار طراحی کن، بعد بسپار به سیستم.</h2>
<p class="muted">اتوماسیون یعنی چند ابزار را به هم وصل کنی تا یک کار تکراری، مثل پردازش ایمیل یا تولید پیش‌نویس محتوا، خودش انجام شود. یک LLM متن را می‌فهمد، یک Webhook یا API اطلاعات را جابه‌جا می‌کند، و یک Workflow (مثلاً در n8n) همه را به هم وصل می‌کند. همیشه یک انسان تصمیم نهایی را می‌گیرد.</p>
<div class="actions"><a class="btn" href="${compact ? '/projects?cat=ai-automation' : '/projects'}">مشاهده پروژه‌های اتوماسیون</a>${compact ? '<a class="btn btn-ghost" href="/automation">بیشتر بخوان</a>' : ''}</div>
<p class="tags" dir="ltr">${['n8n', 'APIs', 'AI Agents', 'LLMs', 'Webhooks'].map((t) => `<span>${t}</span>`).join('')}</p></div>
<ul class="ex">${ex.map((x, i) => `<li><span>${fa(i + 1)}</span>${x}</li>`).join('')}</ul></div></section>`;
}
function engineering() {
  const t = ['بررسی هوشمند مدارک مهندسی', 'RAG برای اسناد فنی', 'تحلیل اسناد', 'AI Agents در فرآیندهای مهندسی', 'اتوماسیون Workflowهای سازمانی'];
  return `<section class="section eng"><div class="wrap"><h2>وقتی مهندسی با هوش مصنوعی ترکیب می‌شود</h2><p class="lead2">پیش‌زمینه من مهندسی برق است و یکی از حوزه‌هایی که روی آن تمرکز می‌کنم، استفاده عملی از هوش مصنوعی در مسائل مهندسی و فرآیندهای واقعی سازمانی است.</p>
<div class="pills">${t.map((x) => `<span>${x}</span>`).join('')}</div></div></section>`;
}

pub.get('/start', (req, res) => {
  const steps = [['۱. با یک ابزار شروع کن', 'یک دستیار گفتگو را برای یک کار واقعی به‌کار بگیر.', '/tools', 'ابزارها'], ['۲. پرامپت‌نویسی را یاد بگیر', 'نقش، زمینه و قالب خروجی را مشخص کن.', '/prompts', 'پرامپت‌ها'], ['۳. کارهای تکراری را پیدا کن', 'فهرست کارهایی که هر هفته تکرار می‌شوند.', '/automation', 'اتوماسیون'], ['۴. بخوان و تمرین کن', 'آموزش‌های ساده و تجربه‌های واقعی.', '/blog', 'مقالات']];
  render(req, res, { title: 'شروع یادگیری هوش مصنوعی', desc: 'مسیر ساده شروع آموزش هوش مصنوعی: ابزار، پرامپت‌نویسی و اتوماسیون برای کار و زندگی.', body: `<section class="page wrap">${crumbs([['شروع']])}<h1>از کجا شروع کنم؟</h1><p class="lead2">اگر تازه وارد دنیای هوش مصنوعی شده‌ای، این چهار قدم کافی است.</p><div class="grid g2">${steps.map(([t, d, h, c]) => `<a class="card" href="${h}"><h3>${t}</h3><p class="muted">${d}</p><span class="more">${c} ←</span></a>`).join('')}</div></section>` });
});
pub.get('/automation', (req, res) => {
  const ps = all(`${PROJECTS} AND c.slug IN ('ai-automation','content-automation','social-automation','agents') ORDER BY p.id LIMIT 4`);
  render(req, res, { title: 'اتوماسیون با هوش مصنوعی', desc: 'یادگیری اتوماسیون با هوش مصنوعی: Workflow، AI Agent، n8n و مثال‌های کاربردی به زبان ساده.', body: `<div class="wrap">${crumbs([['اتوماسیون']])}</div>${automationBlock(false)}<section class="section"><div class="wrap">${sectionHead('پروژه‌های اتوماسیون')}<div class="grid g3">${ps.map(projectCard).join('') || empty()}</div></div></section>` });
});

pub.get('/tools', (req, res) => {
  const { q = '', cat = '', pricing = '' } = req.query;
  const cats = all('SELECT * FROM tool_categories ORDER BY sort');
  let sql = TOOLS; const p = [];
  if (cat) { sql += ' AND c.slug=?'; p.push(cat); }
  if (pricing) { sql += ' AND t.pricing=?'; p.push(pricing); }
  if (q) { sql += ' AND (t.name LIKE ? OR t.description LIKE ? OR t.best_for LIKE ?)'; p.push(like(q), like(q), like(q)); }
  const rows = all(sql + ' ORDER BY t.featured DESC, t.name', ...p);
  const h = (c) => `/tools?${new URLSearchParams({ ...(q && { q }), ...(c && { cat: c }), ...(pricing && { pricing }) })}`;
  render(req, res, { title: 'ابزارهای هوش مصنوعی', desc: 'بهترین ابزارهای AI را براساس کاری که می‌خواهی انجام بدهی پیدا کن: تولید متن، تصویر، ویدئو، اتوماسیون و بیشتر.', body: `<section class="page wrap">${crumbs([['ابزارهای AI']])}<h1>ابزارهای هوش مصنوعی</h1><p class="lead2">بهترین ابزارهای AI را براساس کاری که می‌خواهی انجام بدهی پیدا کن.</p>
${searchBox('نام ابزار یا کاری که می‌خواهی انجام بدهی جستجو کن...', q, `${cat ? `<input type="hidden" name="cat" value="${e(cat)}">` : ''}${pricing ? `<input type="hidden" name="pricing" value="${e(pricing)}">` : ''}`)}
${chips(cats, cat, h)}<div class="grid g3">${rows.map(toolCard).join('') || empty('ابزاری با این مشخصات پیدا نشد.')}</div></section>`, ld: [bc([['خانه', '/'], ['ابزارهای AI', '/tools']])] });
});

pub.get('/prompts', (req, res) => {
  const { q = '', cat = '' } = req.query;
  const cats = all('SELECT * FROM prompt_categories ORDER BY sort');
  let sql = PROMPTS; const p = [];
  if (cat) { sql += ' AND c.slug=?'; p.push(cat); }
  if (q) { sql += ' AND (p.title LIKE ? OR p.summary LIKE ? OR p.body LIKE ?)'; p.push(like(q), like(q), like(q)); }
  const rows = all(sql + ' ORDER BY p.featured DESC, p.id', ...p);
  render(req, res, { title: 'کتابخانه پرامپت', desc: 'پرامپت‌های آماده فارسی برای انجام سریع‌تر کارها با هوش مصنوعی؛ تولید محتوا، اینستاگرام، کسب‌وکار، آموزش و اتوماسیون.', body: `<section class="page wrap">${crumbs([['پرامپت‌ها']])}<h1>کتابخانه پرامپت</h1><p class="lead2">پرامپت‌های آماده برای انجام سریع‌تر کارها با هوش مصنوعی.</p>
${searchBox('جستجوی پرامپت...', q, cat ? `<input type="hidden" name="cat" value="${e(cat)}">` : '')}${chips(cats, cat, (c) => `/prompts?${new URLSearchParams({ ...(q && { q }), ...(c && { cat: c }) })}`)}<div class="grid g3">${rows.map(promptCard).join('') || empty('پرامپتی پیدا نشد.')}</div></section>` });
});
pub.get('/prompts/:slug', (req, res, next) => {
  const p = get(`${PROMPTS} AND p.slug=?`, req.params.slug);
  if (!p) return next();
  const rel = all(`${PROMPTS} AND p.id!=? AND p.category_id IS ? LIMIT 3`, p.id, p.category_id);
  render(req, res, { title: p.title, desc: p.summary, ld: [bc([['خانه', '/'], ['پرامپت‌ها', '/prompts'], [p.title, `/prompts/${p.slug}`]])], body: `<article class="page wrap narrow">${crumbs([['پرامپت‌ها', '/prompts'], [p.title]])}<span class="badge">${e(p.cat_name)}</span><h1>${e(p.title)}</h1><p class="lead2">${e(p.summary)}</p>
<p class="muted">بهترین مدل‌ها/ابزارها: <b dir="ltr">${e(p.models)}</b></p>
<div class="prompt-box"><pre id="pbody" dir="auto">${e(p.body)}</pre><button class="btn btn-lg" data-copy="#pbody">کپی پرامپت</button></div>
${p.how_to ? `<h2>چطور از این پرامپت استفاده کنم؟</h2><p>${e(p.how_to)}</p>` : ''}
${p.pro_version ? `<h2>نسخه حرفه‌ای</h2><div class="prompt-box"><pre id="ppro" dir="auto">${e(p.pro_version)}</pre><button class="btn btn-sm btn-ghost" data-copy="#ppro">کپی</button></div>` : ''}
${rel.length ? `<h2>پرامپت‌های مرتبط</h2><div class="grid g3">${rel.map(promptCard).join('')}</div>` : ''}</article>` });
});

pub.get('/projects', (req, res) => {
  const { cat = '' } = req.query;
  const cats = all("SELECT * FROM categories WHERE type='project' ORDER BY sort");
  const rows = all(`${PROJECTS}${cat ? ' AND c.slug=?' : ''} ORDER BY p.featured DESC, p.id`, ...(cat ? [cat] : []));
  render(req, res, { title: 'AI Lab | آزمایشگاه محمد', desc: 'پروژه‌های اتوماسیون، AI Agent و RAG که محمد پورایی با هوش مصنوعی می‌سازد.', body: `<section class="page wrap">${crumbs([['پروژه‌ها']])}<h1>AI Lab | آزمایشگاه محمد</h1><p class="lead2">محمد فقط درباره AI حرف نمی‌زند؛ با آن چیز می‌سازد. پروژه‌های دارای برچسب «نمونه» فعلاً محتوای جایگزین هستند.</p>${chips(cats, cat, (c) => `/projects${c ? '?cat=' + c : ''}`)}<div class="grid g3">${rows.map(projectCard).join('') || empty()}</div></section>` });
});

pub.get('/blog', (req, res) => {
  const { cat = '', q = '' } = req.query;
  const cats = all("SELECT * FROM categories WHERE type='article' ORDER BY sort");
  const rows = all(`${ARTICLES}${cat ? ' AND c.slug=?' : ''}${q ? ' AND (a.title LIKE ? OR a.excerpt LIKE ?)' : ''} ORDER BY a.created_at DESC`, ...(cat ? [cat] : []), ...(q ? [like(q), like(q)] : []));
  render(req, res, { title: 'یادداشت‌ها و آموزش‌ها', desc: 'مقالات و آموزش‌های ساده درباره هوش مصنوعی، پرامپت‌نویسی، اتوماسیون و AI Agent.', body: `<section class="page wrap">${crumbs([['مقالات']])}<h1>یادداشت‌ها و آموزش‌ها</h1>${searchBox('جستجو در مقالات...', q, cat ? `<input type="hidden" name="cat" value="${e(cat)}">` : '')}${chips(cats, cat, (c) => `/blog${c ? '?cat=' + c : ''}`)}<div class="grid g3">${rows.map(articleCard).join('') || empty('مقاله‌ای پیدا نشد.')}</div></section>` });
});
pub.get('/blog/:slug', (req, res, next) => {
  const a = get(`${ARTICLES} AND a.slug=?`, req.params.slug);
  if (!a) return next();
  const author = get('SELECT name FROM users WHERE id=?', a.author_id)?.name || 'محمد پورایی';
  const rel = all(`${ARTICLES} AND a.id!=? AND a.category_id IS ? ORDER BY a.created_at DESC LIMIT 3`, a.id, a.category_id);
  const url = `${req.protocol}://${req.headers.host}/blog/${encodeURIComponent(a.slug)}`;
  const sh = (u) => `target="_blank" rel="noopener" href="${u}"`;
  render(req, res, { title: a.seo_title || a.title, desc: a.meta_description || a.excerpt, ogType: 'article', progress: true, image: a.image_url || undefined,
    ld: [bc([['خانه', '/'], ['مقالات', '/blog'], [a.title, `/blog/${a.slug}`]]), { '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.excerpt, inLanguage: 'fa', datePublished: a.created_at, author: { '@type': 'Person', name: author } }],
    body: `<article class="page wrap narrow">${crumbs([['مقالات', '/blog'], [a.title]])}<span class="badge">${e(a.cat_name)}</span> ${sampleBadge(a)}<h1>${e(a.title)}</h1><p class="muted">${e(author)} · ${dateFa(a.created_at)} · ${fa(a.read_minutes)} دقیقه مطالعه</p>
${a.image_url ? `<img class="hero-img" src="${e(a.image_url)}" alt="${e(a.title)}" fetchpriority="high">` : ''}<div class="prose">${md(a.body)}</div>
<div class="share"><b>اشتراک‌گذاری:</b> <a ${sh(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(a.title)}`)}>Telegram</a> <a ${sh(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`)}>X</a> <a ${sh(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`)}>LinkedIn</a> <a ${sh(`https://wa.me/?text=${encodeURIComponent(a.title + ' ' + url)}`)}>WhatsApp</a> <button class="btn btn-sm btn-ghost" data-copy-text="${e(url)}">کپی لینک</button></div>
${rel.length ? `<h2>مطالب مرتبط</h2><div class="grid g3">${rel.map(articleCard).join('')}</div>` : ''}</article>` });
});

pub.get('/resources', (req, res) => {
  const { cat = '' } = req.query;
  const cats = all("SELECT * FROM categories WHERE type='resource' ORDER BY sort");
  const rows = all(`${RESOURCES}${cat ? ' AND c.slug=?' : ''} ORDER BY r.featured DESC, r.id`, ...(cat ? [cat] : []));
  render(req, res, { title: 'منابع رایگان', desc: 'چیت‌شیت، مجموعه پرامپت، قالب اتوماسیون و چک‌لیست رایگان هوش مصنوعی.', body: `<section class="page wrap">${crumbs([['منابع رایگان']])}<h1>منابع رایگان</h1><p class="lead2">دکمه دانلود بعد از ثبت لینک فایل در پنل مدیریت فعال می‌شود.</p>${chips(cats, cat, (c) => `/resources${c ? '?cat=' + c : ''}`)}<div class="grid g3">${rows.map(resourceCard).join('') || empty()}</div></section>` });
});

pub.get('/about', (req, res) => {
  const S = settings();
  render(req, res, { title: 'درباره محمد پورایی', desc: 'محمد پورایی، مهندس برق علاقه‌مند به هوش مصنوعی، اتوماسیون و AI Agent که تجربه‌های کاربردی‌اش را به زبان ساده به اشتراک می‌گذارد.', body: `<section class="page wrap narrow">${crumbs([['درباره من']])}<h1>سلام، من محمد پورایی هستم.</h1>
<div class="prose"><p>مهندس برق هستم و در صنعت نفت و گاز تجربه کار دارم. مسیر حرفه‌ای‌ام مرا به هوش مصنوعی، اتوماسیون و AI Agentها رساند.</p><p>دوست دارم فناوری را عمیق بفهمم، اما ساده توضیح بدهم. ابزارهای AI، سیستم‌های اتوماسیون و Workflowهای کاربردی را آزمایش می‌کنم و آنچه واقعاً جواب می‌دهد را به اشتراک می‌گذارم.</p></div>
<blockquote>هدف من این نیست که فقط درباره AI حرف بزنم؛ می‌خواهم نشان بدهم چطور می‌شود واقعاً از آن استفاده کرد.</blockquote>
<ul class="pills col"><li>پیشینه مهندسی برق</li><li>تجربه در صنعت نفت و گاز</li><li>علاقه به هوش مصنوعی</li><li>اتوماسیون و AI Agent</li><li>آزمایش عملی و اشتراک دانش</li></ul>
<h2>ارتباط با من</h2><div class="soc big">${socials().map((s) => `<a href="${e(s.url)}" target="_blank" rel="noopener">${icon(s.platform)} ${e(s.label)}</a>`).join('')}</div></section>${newsletter(S, S.telegram_cta_url)}` });
});

pub.get('/contact', (req, res) => {
  const S = settings();
  const reasons = ['همکاری', 'آموزش', 'پروژه', 'اتوماسیون', 'پیشنهاد همکاری تجاری', 'دعوت به رویداد یا پادکست'];
  render(req, res, { title: 'تماس با محمد پورایی', desc: 'برای همکاری، آموزش، پروژه‌های اتوماسیون یا دعوت به رویداد با محمد پورایی در ارتباط باش.', body: `<section class="page wrap narrow">${crumbs([['تماس']])}<h1>با من در ارتباط باش</h1><div class="pills">${reasons.map((r) => `<span>${r}</span>`).join('')}</div>
<form method="post" action="/contact" class="form card"><input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true"><label>نام<input name="name" required></label><label>ایمیل<input name="email" type="email" dir="ltr" required></label>
<label>موضوع<select name="subject">${reasons.map((r) => `<option>${r}</option>`).join('')}</select></label><label>پیام<textarea name="message" rows="5" required></textarea></label><button class="btn btn-lg">ارسال پیام</button></form>
<div class="soc big">${socials().map((s) => `<a href="${e(s.url)}" target="_blank" rel="noopener">${icon(s.platform)} ${e(s.label)}</a>`).join('')}</div></section>` });
});

pub.get('/privacy', (req, res) => render(req, res, { title: 'حریم خصوصی', desc: 'سیاست حریم خصوصی وب‌سایت محمد پورایی.', body: `<section class="page wrap narrow">${crumbs([['حریم خصوصی']])}<h1>حریم خصوصی</h1><div class="prose"><p>نام و ایمیلی که در فرم‌های خبرنامه و تماس وارد می‌کنید فقط برای ارتباط با شما ذخیره می‌شود و با شخص ثالث به اشتراک گذاشته نمی‌شود.</p><p>این متن یک نسخه اولیه است و پیش از انتشار نهایی باید بازبینی شود.</p></div></section>` }));

// monetization foundation pages (hidden until enabled in admin settings)
const FUT = { courses: ['دوره‌ها', 'آموزش‌های ساختاریافته هوش مصنوعی و اتوماسیون.'], consulting: ['مشاوره', 'مشاوره هوش مصنوعی و طراحی Workflow برای افراد و سازمان‌ها.'], services: ['خدمات اتوماسیون با AI', 'طراحی اتوماسیون، Workflow، AI Agent و راه‌حل‌های مهندسی با هوش مصنوعی.'], products: ['محصولات دیجیتال', 'قالب‌ها و محصولات دیجیتال آماده.'] };
for (const [k, [t, d]] of Object.entries(FUT)) {
  pub.get('/' + k, (req, res) => {
    const S = settings(); const on = S[k + '_enabled'] === '1';
    const items = k === 'courses' ? all('SELECT * FROM courses WHERE published=1') : [];
    render(req, res, { title: t, desc: d, noindex: !on, body: `<section class="page wrap narrow">${crumbs([[t]])}<h1>${t}</h1><p class="lead2">${d}</p>
${on && items.length ? `<div class="grid g2">${items.map((c) => `<div class="card"><h3>${e(c.title)}</h3><p class="muted">${e(c.description)}</p><span class="badge">${e(c.status)}</span> ${e(c.price_text || '')}</div>`).join('')}</div>` : '<div class="empty"><div class="empty-ico">⏳</div><p>این بخش به‌زودی فعال می‌شود. برای اطلاع، در خبرنامه عضو شو.</p><a class="btn" href="/#newsletter">عضویت در خبرنامه</a></div>'}</section>` });
  });
}

pub.get('/search', (req, res) => {
  const q = String(req.query.q || '').trim(); const l = like(q);
  const r = q ? {
    tools: all(`${TOOLS} AND (t.name LIKE ? OR t.description LIKE ? OR t.best_for LIKE ?) LIMIT 12`, l, l, l),
    prompts: all(`${PROMPTS} AND (p.title LIKE ? OR p.summary LIKE ? OR p.body LIKE ?) LIMIT 12`, l, l, l),
    articles: all(`${ARTICLES} AND (a.title LIKE ? OR a.excerpt LIKE ? OR a.body LIKE ?) LIMIT 12`, l, l, l),
    projects: all(`${PROJECTS} AND (p.name LIKE ? OR p.problem LIKE ? OR p.solution LIKE ? OR p.tech LIKE ?) LIMIT 12`, l, l, l, l),
    resources: all(`${RESOURCES} AND (r.title LIKE ? OR r.description LIKE ?) LIMIT 12`, l, l),
  } : {};
  const sec = (t, a, f) => (a?.length ? `<h2>${t}</h2><div class="grid g3">${a.map(f).join('')}</div>` : '');
  const total = Object.values(r).reduce((n, a) => n + a.length, 0);
  render(req, res, { title: q ? `جستجو: ${q}` : 'جستجو', desc: 'جستجو در ابزارها، پرامپت‌ها، مقالات، پروژه‌ها و منابع.', noindex: true, body: `<section class="page wrap">${crumbs([['جستجو']])}<h1>جستجو</h1>${searchBox('دنبال چی می‌گردی؟', q)}
${q && !total ? empty('نتیجه‌ای پیدا نشد. عبارت دیگری را امتحان کن.') : ''}${sec('ابزارها', r.tools, toolCard)}${sec('پرامپت‌ها', r.prompts, promptCard)}${sec('مقالات', r.articles, articleCard)}${sec('پروژه‌ها', r.projects, projectCard)}${sec('منابع', r.resources, resourceCard)}</section>` });
});

const back = (req, msg) => { const ref = new URL(req.headers.referer || '/', 'http://x'); return `${ref.pathname}?msg=${msg}${msg === 'subscribed' ? '#newsletter' : ''}`; };
const okEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || '') && s.length < 200;
pub.post('/newsletter', (req, res) => {
  const { name, email, website } = req.body;
  if (website) return res.redirect(back(req, 'subscribed'));
  if (!okEmail(email)) return res.redirect(back(req, 'invalid'));
  run('INSERT OR IGNORE INTO newsletter_subscribers (name,email) VALUES (?,?)', String(name || '').slice(0, 100), email.toLowerCase());
  res.redirect(back(req, 'subscribed'));
});
pub.post('/contact', (req, res) => {
  const { name, email, subject, message, website } = req.body;
  if (website) return res.redirect('/contact?msg=sent');
  if (!okEmail(email) || !message || !name) return res.redirect('/contact?msg=invalid');
  run('INSERT INTO contact_messages (name,email,subject,message) VALUES (?,?,?,?)', String(name).slice(0, 100), email, String(subject || '').slice(0, 100), String(message).slice(0, 5000));
  res.redirect('/contact?msg=sent');
});

pub.get('/robots.txt', (req, res) => res.type('text/plain').send(`User-agent: *\nDisallow: /admin\nDisallow: /search\nSitemap: ${settings().site_url || `${req.protocol}://${req.headers.host}`}/sitemap.xml\n`));
pub.get('/sitemap.xml', (req, res) => {
  const o = settings().site_url || `${req.protocol}://${req.headers.host}`;
  const urls = ['/', '/start', '/tools', '/prompts', '/automation', '/projects', '/blog', '/resources', '/about', '/contact', '/privacy',
    ...all('SELECT slug FROM prompts WHERE published=1').map((r) => '/prompts/' + encodeURIComponent(r.slug)),
    ...all('SELECT slug FROM articles WHERE published=1').map((r) => '/blog/' + encodeURIComponent(r.slug))];
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${o}${u}</loc></url>`).join('')}</urlset>`);
});
