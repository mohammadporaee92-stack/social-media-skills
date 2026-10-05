import { Router } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { all, get, run, settings } from './db.js';
import { e, slugify, dateFa } from './lib.js';

export const admin = Router();
const SECRET = process.env.SESSION_SECRET || 'dev';
const PASS = process.env.ADMIN_PASSWORD || 'admin-change-me';
const token = () => createHmac('sha256', SECRET).update('admin:' + PASS).digest('hex');
const cookie = (req) => Object.fromEntries((req.headers.cookie || '').split(/;\s*/).map((c) => c.split('=')));
const authed = (req) => { const t = cookie(req).adm || ''; return t.length === token().length && timingSafeEqual(Buffer.from(t), Buffer.from(token())); };

const PRICING = [['free', 'رایگان'], ['freemium', 'Freemium'], ['paid', 'پولی']];
const f = (name, label, type = 'text', extra = {}) => ({ name, label, type, ...extra });
const ref = (name, label, table, where = '') => f(name, label, 'ref', { table, where });
const ENT = {
  articles: { label: 'مقالات', cols: ['title', 'cat_name', 'created_at'], flags: ['published', 'featured'], join: ['categories', 'category_id'], fields: [f('title', 'عنوان'), f('slug', 'Slug (خالی = خودکار)'), ref('category_id', 'دسته', 'categories', "type='article'"), f('seo_title', 'SEO Title'), f('meta_description', 'Meta Description', 'textarea'), f('excerpt', 'خلاصه', 'textarea'), f('body', 'متن (## برای تیتر، - برای لیست)', 'textarea', { rows: 14 }), f('image_url', 'آدرس تصویر شاخص', 'url'), f('read_minutes', 'زمان مطالعه (دقیقه)', 'number'), f('is_sample', 'نمونه/Placeholder', 'bool')], defaults: { author_id: 1 } },
  ai_tools: { label: 'ابزارهای AI', cols: ['name', 'cat_name', 'pricing'], flags: ['published', 'featured'], join: ['tool_categories', 'category_id'], fields: [f('name', 'نام'), f('slug', 'Slug'), ref('category_id', 'دسته', 'tool_categories'), f('description', 'توضیح', 'textarea'), f('pricing', 'قیمت', 'select', { options: PRICING }), f('best_for', 'بهترین کاربرد'), f('difficulty', 'سطح', 'select', { options: [['مبتدی', 'مبتدی'], ['متوسط', 'متوسط'], ['پیشرفته', 'پیشرفته']] }), f('website_url', 'لینک وب‌سایت', 'url'), f('tutorial_url', 'لینک آموزش', 'url'), f('logo_url', 'آدرس لوگو', 'url')] },
  prompts: { label: 'پرامپت‌ها', cols: ['title', 'cat_name'], flags: ['published', 'featured'], join: ['prompt_categories', 'category_id'], fields: [f('title', 'عنوان'), f('slug', 'Slug'), ref('category_id', 'دسته', 'prompt_categories'), f('summary', 'توضیح کوتاه', 'textarea'), f('models', 'بهترین مدل‌ها'), f('body', 'پرامپت کامل', 'textarea', { rows: 10 }), f('how_to', 'چطور استفاده کنم؟', 'textarea'), f('pro_version', 'نسخه حرفه‌ای', 'textarea')] },
  projects: { label: 'پروژه‌ها', cols: ['name', 'cat_name', 'status'], flags: ['published', 'featured'], join: ['categories', 'category_id'], fields: [f('name', 'نام'), f('slug', 'Slug'), ref('category_id', 'دسته', 'categories', "type='project'"), f('problem', 'مسئله', 'textarea'), f('solution', 'راه‌حل', 'textarea'), f('tech', 'تکنولوژی'), f('image_url', 'تصویر', 'url'), f('result', 'نتیجه', 'textarea'), f('status', 'وضعیت'), f('repo_url', 'GitHub', 'url'), f('demo_url', 'دمو', 'url'), f('is_sample', 'نمونه/Placeholder', 'bool')] },
  resources: { label: 'منابع', cols: ['title', 'cat_name'], flags: ['published', 'featured'], join: ['categories', 'category_id'], fields: [f('title', 'عنوان'), f('slug', 'Slug'), ref('category_id', 'دسته', 'categories', "type='resource'"), f('description', 'توضیح', 'textarea'), f('image_url', 'تصویر پیش‌نمایش', 'url'), f('file_url', 'لینک فایل دانلود', 'url'), f('is_sample', 'نمونه/Placeholder', 'bool')] },
  courses: { label: 'دوره‌ها', cols: ['title', 'status'], flags: ['published', 'featured'], fields: [f('title', 'عنوان'), f('slug', 'Slug'), f('description', 'توضیح', 'textarea'), f('image_url', 'تصویر', 'url'), f('price_text', 'قیمت'), f('status', 'وضعیت')] },
  instagram_posts: { label: 'کارت‌های اینستاگرام', cols: ['title', 'kind'], flags: ['published', 'featured'], fields: [f('title', 'عنوان'), f('kind', 'نوع', 'select', { options: [['reel', 'Reel'], ['carousel', 'Carousel'], ['tutorial', 'Tutorial']] }), f('url', 'لینک پست', 'url'), f('image_url', 'تصویر', 'url'), f('sort', 'ترتیب', 'number'), f('is_sample', 'نمونه/Placeholder', 'bool')] },
  social_links: { label: 'شبکه‌های اجتماعی', cols: ['label', 'url'], flags: ['published'], fields: [f('platform', 'پلتفرم (instagram, linkedin, github, telegram)'), f('label', 'برچسب'), f('url', 'لینک', 'url'), f('sort', 'ترتیب', 'number')] },
  categories: { label: 'دسته‌ها (مقاله/پروژه/منبع)', cols: ['type', 'name'], fields: [f('type', 'نوع', 'select', { options: [['article', 'مقاله'], ['project', 'پروژه'], ['resource', 'منبع']] }), f('slug', 'Slug'), f('name', 'نام'), f('sort', 'ترتیب', 'number')] },
  tool_categories: { label: 'دسته‌های ابزار', cols: ['name', 'slug'], fields: [f('slug', 'Slug'), f('name', 'نام'), f('sort', 'ترتیب', 'number')] },
  prompt_categories: { label: 'دسته‌های پرامپت', cols: ['name', 'slug'], fields: [f('slug', 'Slug'), f('name', 'نام'), f('sort', 'ترتیب', 'number')] },
  newsletter_subscribers: { label: 'مشترکین خبرنامه', cols: ['name', 'email', 'created_at'], readonly: true, fields: [] },
  contact_messages: { label: 'پیام‌های تماس', cols: ['name', 'email', 'subject', 'message', 'created_at'], readonly: true, fields: [] },
};
const SETTINGS = [['site_title', 'عنوان سایت'], ['site_description', 'توضیح سایت (SEO)'], ['site_url', 'آدرس اصلی سایت (برای canonical/sitemap)'], ['portrait_url', 'آدرس عکس پرتره'], ['contact_email', 'ایمیل تماس'], ['telegram_cta_url', 'لینک عضویت کانال تلگرام'], ['courses_enabled', 'فعال‌سازی /courses (۰ یا ۱)'], ['consulting_enabled', 'فعال‌سازی /consulting (۰ یا ۱)'], ['services_enabled', 'فعال‌سازی /services (۰ یا ۱)'], ['products_enabled', 'فعال‌سازی /products (۰ یا ۱)']];

const shell = (body, title = 'پنل مدیریت') => `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${e(title)}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vazirmatn@33.0.3/Vazirmatn-font-face.css"><link rel="stylesheet" href="/style.css"></head><body class="adm"><div class="adm-wrap">
<aside class="adm-side"><a href="/admin" class="logo"><span class="logo-mark">AI</span><span>پنل مدیریت</span></a>${Object.entries(ENT).map(([k, v]) => `<a href="/admin/${k}">${v.label}</a>`).join('')}<a href="/admin/settings">تنظیمات سایت</a><a href="/" target="_blank">مشاهده سایت ↗</a><form method="post" action="/admin/logout"><button class="btn btn-sm btn-ghost">خروج</button></form></aside>
<section class="adm-main">${body}</section></div></body></html>`;

admin.get('/login', (req, res) => res.send(`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>ورود</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vazirmatn@33.0.3/Vazirmatn-font-face.css"><link rel="stylesheet" href="/style.css"></head><body><main class="page wrap narrow"><h1>ورود به پنل</h1><form method="post" class="form card"><label>رمز عبور<input type="password" name="password" dir="ltr" required autofocus></label>${req.query.err ? '<p class="err">رمز اشتباه است.</p>' : ''}<button class="btn">ورود</button></form></main></body></html>`));
admin.post('/login', (req, res) => {
  if (req.body.password === PASS) { res.setHeader('Set-Cookie', `adm=${token()}; HttpOnly; Path=/admin; SameSite=Lax; Max-Age=604800`); return res.redirect('/admin'); }
  res.redirect('/admin/login?err=1');
});
admin.use((req, res, next) => (authed(req) ? next() : res.redirect('/admin/login')));
admin.post('/logout', (req, res) => { res.setHeader('Set-Cookie', 'adm=; Path=/admin; Max-Age=0'); res.redirect('/admin/login'); });

admin.get('/', (req, res) => res.send(shell(`<h1>داشبورد</h1><div class="grid g3">${Object.entries(ENT).map(([k, v]) => `<a class="card" href="/admin/${k}"><h3>${v.label}</h3><p class="muted">${get(`SELECT COUNT(*) c FROM ${k}`).c} مورد</p></a>`).join('')}</div>`)));

admin.get('/settings', (req, res) => {
  const S = settings();
  res.send(shell(`<h1>تنظیمات سایت</h1><form method="post" class="form">${SETTINGS.map(([k, l]) => `<label>${l}<input name="${k}" value="${e(S[k] ?? '')}" dir="auto"></label>`).join('')}<button class="btn">ذخیره</button></form>`));
});
admin.post('/settings', (req, res) => {
  for (const [k] of SETTINGS) if (k in req.body) run('INSERT INTO site_settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', k, req.body[k]);
  res.redirect('/admin/settings');
});

const ent = (req, res, next) => { req.E = ENT[req.params.ent]; req.T = req.params.ent; return req.E ? next() : res.status(404).send(shell('<p>یافت نشد</p>')); };
admin.get('/:ent', ent, (req, res) => {
  const { E, T } = req; const j = E.join;
  const rows = all(`SELECT t.*${j ? ', c.name cat_name' : ''} FROM ${T} t ${j ? `LEFT JOIN ${j[0]} c ON c.id=t.${j[1]}` : ''} ORDER BY t.id DESC`);
  const tog = (r, fl) => `<form method="post" action="/admin/${T}/${r.id}/toggle/${fl}"><button class="pill ${r[fl] ? 'on' : ''}">${{ published: r.published ? 'منتشر' : 'پیش‌نویس', featured: r.featured ? '★ ویژه' : '☆' }[fl]}</button></form>`;
  res.send(shell(`<div class="adm-head"><h1>${E.label}</h1>${E.readonly ? '' : `<a class="btn btn-sm" href="/admin/${T}/new">+ جدید</a>`}</div>
<div class="tbl-wrap"><table><thead><tr>${E.cols.map((c) => `<th>${c}</th>`).join('')}${(E.flags || []).map(() => '<th></th>').join('')}<th></th></tr></thead><tbody>${rows.map((r) => `<tr>${E.cols.map((c) => `<td>${e(c === 'created_at' ? dateFa(r[c]) : String(r[c] ?? '').slice(0, 80))}</td>`).join('')}${(E.flags || []).map((fl) => `<td>${tog(r, fl)}</td>`).join('')}<td class="row-act">${E.readonly ? '' : `<a href="/admin/${T}/${r.id}">ویرایش</a>`}<form method="post" action="/admin/${T}/${r.id}/delete" onsubmit="return confirm('حذف شود؟')"><button class="link-danger">حذف</button></form></td></tr>`).join('') || '<tr><td colspan="9">موردی نیست.</td></tr>'}</tbody></table></div>`));
});
const formPage = (req, res, row = {}) => {
  const { E, T } = req;
  const input = (fl) => {
    const v = row[fl.name] ?? '';
    if (fl.type === 'textarea') return `<textarea name="${fl.name}" rows="${fl.rows || 3}">${e(v)}</textarea>`;
    if (fl.type === 'bool') return `<input type="checkbox" name="${fl.name}" ${v ? 'checked' : ''}>`;
    if (fl.type === 'select') return `<select name="${fl.name}">${fl.options.map(([o, l]) => `<option value="${o}" ${v === o ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
    if (fl.type === 'ref') return `<select name="${fl.name}"><option value="">—</option>${all(`SELECT id,name FROM ${fl.table} ${fl.where ? 'WHERE ' + fl.where : ''}`).map((o) => `<option value="${o.id}" ${v === o.id ? 'selected' : ''}>${e(o.name)}</option>`).join('')}</select>`;
    return `<input name="${fl.name}" type="${fl.type === 'number' ? 'number' : 'text'}" value="${e(v)}" dir="auto">`;
  };
  res.send(shell(`<h1>${row.id ? 'ویرایش' : 'جدید'}: ${E.label}</h1><form method="post" class="form">${E.fields.map((fl) => `<label class="${fl.type === 'bool' ? 'chk' : ''}">${fl.label}${input(fl)}</label>`).join('')}${E.flags ? `<label class="chk">منتشر شود<input type="checkbox" name="published" ${row.published !== 0 ? 'checked' : ''}></label><label class="chk">ویژه (صفحه اصلی)<input type="checkbox" name="featured" ${row.featured ? 'checked' : ''}></label>` : ''}<div class="actions"><button class="btn">ذخیره</button><a class="btn btn-ghost" href="/admin/${T}">انصراف</a></div></form>`));
};
admin.get('/:ent/new', ent, (req, res) => formPage(req, res, {}));
admin.get('/:ent/:id', ent, (req, res) => { const r = get(`SELECT * FROM ${req.T} WHERE id=?`, req.params.id); return r ? formPage(req, res, r) : res.redirect(`/admin/${req.T}`); });
const save = (req, res) => {
  const { E, T } = req; const b = req.body; const vals = {};
  for (const fl of E.fields) vals[fl.name] = fl.type === 'bool' ? (b[fl.name] ? 1 : 0) : fl.type === 'number' ? Number(b[fl.name] || 0) : fl.type === 'ref' ? (b[fl.name] ? Number(b[fl.name]) : null) : String(b[fl.name] ?? '');
  if ('slug' in vals && !vals.slug) vals.slug = slugify(b.title || b.name || '');
  if (E.flags) { vals.published = b.published ? 1 : 0; if (E.flags.includes('featured')) vals.featured = b.featured ? 1 : 0; }
  if (E.defaults && !req.params.id) Object.assign(vals, E.defaults);
  const k = Object.keys(vals);
  try {
    if (req.params.id) run(`UPDATE ${T} SET ${k.map((x) => `${x}=?`).join(',')} WHERE id=?`, ...k.map((x) => vals[x]), req.params.id);
    else run(`INSERT INTO ${T} (${k.join(',')}) VALUES (${k.map(() => '?').join(',')})`, ...k.map((x) => vals[x]));
  } catch (err) { return res.status(400).send(shell(`<p class="err">خطا: ${e(err.message)} (احتمالاً Slug تکراری است)</p><a class="btn" href="javascript:history.back()">بازگشت</a>`)); }
  res.redirect(`/admin/${T}`);
};
admin.post('/:ent/new', ent, save);
admin.post('/:ent/:id/delete', ent, (req, res) => { run(`DELETE FROM ${req.T} WHERE id=?`, req.params.id); res.redirect(`/admin/${req.T}`); });
admin.post('/:ent/:id/toggle/:field', ent, (req, res) => {
  if (req.E.flags?.includes(req.params.field)) run(`UPDATE ${req.T} SET ${req.params.field}=1-COALESCE(${req.params.field},0) WHERE id=?`, req.params.id);
  res.redirect(`/admin/${req.T}`);
});
admin.post('/:ent/:id', ent, save);
