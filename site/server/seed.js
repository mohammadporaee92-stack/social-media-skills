import { db, get, run } from './db.js';

export function seed() {
  if (get('SELECT COUNT(*) c FROM ai_tools').c > 0) return;
  const ins = (t, o) => {
    const k = Object.keys(o);
    return Number(run(`INSERT INTO ${t} (${k.join(',')}) VALUES (${k.map(() => '?').join(',')})`, ...k.map((x) => o[x])).lastInsertRowid);
  };
  const cats = (table, list, type) => Object.fromEntries(list.map(([slug, name], i) => [slug, ins(table, { ...(type ? { type } : {}), slug, name, sort: i })]));

  run(`INSERT INTO users (email,name) VALUES ('hello@example.com','محمد پورایی')`);

  const S = {
    site_title: 'محمد پورایی | آموزش کاربردی هوش مصنوعی و اتوماسیون',
    site_description: 'ابزارهای هوش مصنوعی، پرامپت‌های کاربردی، آموزش اتوماسیون و تجربه‌های واقعی استفاده از AI به زبان ساده.',
    site_url: '', portrait_url: '/mohammad.jpg', contact_email: 'hello@example.com',
    telegram_cta_url: 'https://t.me/', courses_enabled: '0', consulting_enabled: '0', services_enabled: '0', products_enabled: '0',
  };
  for (const [k, v] of Object.entries(S)) run('INSERT INTO site_settings VALUES (?,?)', k, v);

  [['instagram', 'Instagram', 'https://instagram.com/mohammad_por_ai'], ['linkedin', 'LinkedIn', 'https://linkedin.com/'], ['github', 'GitHub', 'https://github.com/'], ['telegram', 'Telegram', 'https://t.me/']]
    .forEach(([platform, label, url], i) => ins('social_links', { platform, label, url, sort: i }));

  const tc = cats('tool_categories', [['text', 'تولید متن'], ['image', 'تولید تصویر'], ['video', 'تولید ویدئو'], ['audio', 'تولید صدا'], ['research', 'تحقیق و جستجو'], ['coding', 'برنامه‌نویسی'], ['slides', 'ارائه و پاورپوینت'], ['content', 'تولید محتوا'], ['automation', 'اتوماسیون'], ['agents', 'AI Agents'], ['productivity', 'بهره‌وری'], ['business', 'کسب‌وکار']]);
  const pc = cats('prompt_categories', [['content', 'تولید محتوا'], ['instagram', 'اینستاگرام'], ['business', 'کسب‌وکار'], ['education', 'آموزش'], ['research', 'تحقیق'], ['coding', 'برنامه‌نویسی'], ['design', 'طراحی'], ['imagery', 'تصویرسازی'], ['productivity', 'بهره‌وری'], ['engineering', 'مهندسی'], ['analysis', 'تحلیل'], ['automation', 'اتوماسیون']]);
  const ac = cats('categories', [['ai', 'هوش مصنوعی'], ['tools', 'ابزارها'], ['prompt', 'پرامپت'], ['automation', 'اتوماسیون'], ['agent', 'AI Agent'], ['content', 'تولید محتوا'], ['engineering', 'مهندسی + AI'], ['experience', 'تجربه‌های من']], 'article');
  const prc = cats('categories', [['ai-automation', 'AI Automation'], ['content-automation', 'Content Automation'], ['agents', 'AI Agents'], ['engineering-ai', 'Engineering AI'], ['social-automation', 'Social Media Automation'], ['rag', 'RAG'], ['experimental', 'Experimental']], 'project');
  const rc = cats('categories', [['cheatsheet', 'AI Cheat Sheet'], ['prompts', 'مجموعه پرامپت'], ['template', 'قالب اتوماسیون'], ['checklist', 'چک‌لیست'], ['guide', 'راهنمای PDF'], ['workflow', 'قالب Workflow']], 'resource');

  const T = (slug, name, cat, desc, pricing, best, diff, url, feat) => ins('ai_tools', { slug, name, category_id: tc[cat], description: desc, pricing, best_for: best, difficulty: diff, website_url: url, featured: feat ? 1 : 0 });
  T('chatgpt', 'ChatGPT', 'text', 'دستیار گفتگوی همه‌منظوره برای نوشتن، خلاصه‌سازی، ایده‌پردازی و تحلیل.', 'freemium', 'نوشتن و ایده‌پردازی روزمره', 'مبتدی', 'https://chatgpt.com', 1);
  T('claude', 'Claude', 'text', 'مدل هوش مصنوعی قوی در نوشتن بلند، تحلیل سند و کار با کد.', 'freemium', 'تحلیل اسناد و متن‌های طولانی', 'مبتدی', 'https://claude.ai', 1);
  T('gemini', 'Gemini', 'text', 'دستیار هوش مصنوعی گوگل با اتصال به سرویس‌های گوگل.', 'freemium', 'کار با Gmail و Google Docs', 'مبتدی', 'https://gemini.google.com', 0);
  T('perplexity', 'Perplexity', 'research', 'موتور جستجوی مبتنی بر AI که پاسخ را همراه با منبع می‌دهد.', 'freemium', 'تحقیق سریع با منبع', 'مبتدی', 'https://www.perplexity.ai', 1);
  T('notebooklm', 'NotebookLM', 'research', 'فایل‌ها و منابعت را بارگذاری کن و درباره‌شان سؤال بپرس.', 'freemium', 'مطالعه و خلاصه‌سازی منابع', 'مبتدی', 'https://notebooklm.google.com', 0);
  T('midjourney', 'Midjourney', 'image', 'ساخت تصویر هنری و طراحی بصری از روی توضیح متنی.', 'paid', 'تصویرسازی و ایده‌های بصری', 'متوسط', 'https://www.midjourney.com', 0);
  T('runway', 'Runway', 'video', 'ابزار تولید و ویرایش ویدئو با هوش مصنوعی.', 'freemium', 'ساخت کلیپ کوتاه', 'متوسط', 'https://runwayml.com', 0);
  T('elevenlabs', 'ElevenLabs', 'audio', 'تبدیل متن به صدا با کیفیت طبیعی.', 'freemium', 'صداگذاری و پادکست', 'مبتدی', 'https://elevenlabs.io', 0);
  T('cursor', 'Cursor', 'coding', 'ویرایشگر کد با دستیار هوش مصنوعی داخلی.', 'freemium', 'ساخت پروژه با کمک AI', 'متوسط', 'https://cursor.com', 1);
  T('gamma', 'Gamma', 'slides', 'ساخت ارائه و اسلاید از روی یک ایده یا متن.', 'freemium', 'ساخت سریع پاورپوینت', 'مبتدی', 'https://gamma.app', 0);
  T('n8n', 'n8n', 'automation', 'پلتفرم ساخت Workflow و اتصال ابزارها با امکان اتصال به LLMها.', 'freemium', 'ساخت اتوماسیون و Agent', 'پیشرفته', 'https://n8n.io', 1);
  T('canva', 'Canva', 'content', 'طراحی پست و کاروسل همراه با ابزارهای هوش مصنوعی.', 'freemium', 'طراحی محتوای شبکه اجتماعی', 'مبتدی', 'https://www.canva.com', 0);

  const P = (slug, cat, title, summary, models, body, how_to, pro, feat) => ins('prompts', { slug, category_id: pc[cat], title, summary, models, body, how_to, pro_version: pro, featured: feat ? 1 : 0 });
  P('weekly-content-plan', 'instagram', 'برنامه محتوایی هفتگی برای اینستاگرام', 'یک برنامه هفت‌روزه محتوا برای صفحه‌ای در حوزه مشخص.', 'ChatGPT, Claude, Gemini',
    'تو یک استراتژیست محتوا هستی. برای یک صفحه اینستاگرام در حوزه [حوزه] و مخاطب [مخاطب] یک برنامه محتوایی ۷ روزه بنویس.\nبرای هر روز این موارد را بده:\n- فرمت (ریل، کاروسل یا استوری)\n- موضوع\n- هوک ابتدایی\n- ایده کلی محتوا\n- دعوت به اقدام\nلحن: ساده، دوستانه و بدون اغراق.',
    'عبارت‌های داخل کروشه را با اطلاعات خودت جایگزین کن. اگر خروجی کلی بود، مثال‌های واقعی از کار خودت اضافه کن.',
    'بعد از دریافت برنامه، بنویس: «برای دو ایده اول، متن کامل کاروسل را اسلاید به اسلاید بنویس.»', 1);
  P('email-summarizer', 'productivity', 'خلاصه‌ساز ایمیل‌های اداری', 'ایمیل‌های طولانی را به نکات و اقدام‌های لازم تبدیل می‌کند.', 'ChatGPT, Claude',
    'متن ایمیل زیر را بخوان و خروجی را در سه بخش بده:\n۱. خلاصه در دو جمله\n۲. اقدام‌هایی که از من خواسته شده\n۳. پیش‌نویس کوتاه و مؤدبانه پاسخ\n\nایمیل:\n[متن ایمیل]',
    'اطلاعات حساس یا محرمانه سازمانی را قبل از ارسال حذف کن.', 'می‌توانی لحن پاسخ را مشخص کنی: رسمی، دوستانه یا کوتاه.', 1);
  P('learn-any-topic', 'education', 'یادگیری یک موضوع از صفر', 'مسیر یادگیری مرحله‌ای برای هر موضوع تازه.', 'ChatGPT, Claude, Gemini',
    'می‌خواهم موضوع [موضوع] را از صفر یاد بگیرم. سطح فعلی من: [سطح].\nیک مسیر یادگیری ۴ هفته‌ای بساز که برای هر هفته هدف، مفاهیم کلیدی، یک تمرین عملی و یک معیار سنجش پیشرفت داشته باشد.',
    'سطح و زمانی که در روز داری را دقیق بنویس.', 'در پایان از مدل بخواه هر هفته از تو آزمون کوتاه بگیرد.', 0);
  P('technical-doc-review', 'engineering', 'بررسی اولیه یک سند فنی', 'ساختار، ابهام‌ها و موارد ناقص یک سند فنی را بررسی می‌کند.', 'Claude, ChatGPT',
    'تو یک مهندس باتجربه هستی. سند فنی زیر را بررسی کن و بنویس:\n- هدف سند و مخاطب آن\n- ابهام‌ها یا موارد ناقص\n- ناهماهنگی‌های احتمالی\n- سؤال‌هایی که باید از نویسنده پرسید\nفقط از اطلاعات خود سند استفاده کن و حدس نزن.\n\nسند:\n[متن سند]',
    'خروجی فقط بررسی اولیه است و جایگزین تأیید مهندس مسئول نیست.', '', 1);
  P('automation-idea-finder', 'automation', 'پیدا کردن کارهای قابل اتوماسیون', 'کارهای تکراری روزانه را برای اتوماسیون اولویت‌بندی می‌کند.', 'ChatGPT, Claude',
    'این فهرست کارهای تکراری من است:\n[فهرست کارها]\nبرای هر کار مشخص کن: چقدر قابل اتوماسیون است، چه ابزارهایی لازم است، ریسک چیست. در پایان سه کار را برای شروع پیشنهاد بده.',
    'کارها را با جزئیات بنویس: چه چیزی ورودی است و چه چیزی خروجی.', 'از مدل بخواه برای کار اول یک Workflow قدم‌به‌قدم در n8n طراحی کند.', 0);
  P('product-image-prompt', 'imagery', 'پرامپت تصویرسازی محصول', 'ساخت پرامپت دقیق برای ابزارهای تولید تصویر.', 'Midjourney, ChatGPT',
    'یک پرامپت انگلیسی برای ساخت تصویر از [موضوع] بنویس. سبک: [سبک]، نورپردازی: [نور]، ترکیب‌بندی: [زاویه]، پس‌زمینه: ساده و تمیز.',
    'ابتدا خروجی را در ابزار تصویرساز آزمایش و بعد جزئیات را اصلاح کن.', '', 0);

  const A = (slug, cat, title, excerpt, body, mins, feat) => ins('articles', { slug, category_id: ac[cat], title, seo_title: `${title} | محمد پورایی`, meta_description: excerpt, excerpt, body, read_minutes: mins, author_id: 1, is_sample: 1, featured: feat ? 1 : 0, created_at: '2026-09-20 10:00:00' });
  A('where-to-start-with-ai', 'ai', 'از کجا باید یادگیری هوش مصنوعی را شروع کرد؟', 'مسیر ساده برای کسی که تازه وارد دنیای AI شده و نمی‌خواهد در اصطلاحات گم شود.',
    'هوش مصنوعی فقط برای برنامه‌نویس‌ها نیست. برای شروع لازم نیست کد بنویسی؛ فقط باید یاد بگیری چطور خوب سؤال بپرسی و نتیجه را بسنجی.\n\n## قدم اول: یک ابزار را خوب یاد بگیر\nبه‌جای امتحان ده ابزار، یک دستیار گفتگو انتخاب کن و یک هفته هر روز برای یک کار واقعی از آن استفاده کن.\n\n## قدم دوم: پرامپت‌نویسی\nپرامپت خوب سه چیز دارد:\n- نقش و هدف مشخص\n- زمینه و اطلاعات کافی\n- قالب خروجی مورد انتظار\n\n## قدم سوم: نتیجه را بررسی کن\nمدل‌ها ممکن است اشتباه کنند. همیشه اطلاعات مهم را با منبع معتبر کنترل کن.\n\n## قدم چهارم: کارهای تکراری را شناسایی کن\nوقتی با ابزارها راحت شدی، کارهای تکراری‌ات را فهرست کن؛ این‌ها نامزد اتوماسیون هستند.', 5, 1);
  A('prompt-writing-basics', 'prompt', 'پرامپت‌نویسی؛ سه اصل ساده که نتیجه را عوض می‌کند', 'سه اصل پایه برای نوشتن پرامپت‌هایی که خروجی دقیق‌تری می‌دهند.',
    'کیفیت خروجی هوش مصنوعی تا حد زیادی به کیفیت ورودی بستگی دارد.\n\n## ۱. نقش بده\nبه مدل بگو چه نقشی دارد؛ مثلاً «تو یک مشاور محتوا هستی».\n\n## ۲. زمینه بده\nمخاطب، هدف و محدودیت‌ها را بنویس.\n\n## ۳. قالب خروجی را بگو\nمثلاً جدول، فهرست شماره‌دار یا متن کوتاه.\n\nبعد از دریافت پاسخ، اصلاح بخواه؛ گفتگو با مدل یک فرایند تکراری است.', 4, 1);
  A('what-is-ai-automation', 'automation', 'اتوماسیون با هوش مصنوعی یعنی چه؟', 'توضیح ساده Workflow، Webhook و Agent با مثال‌های روزمره.',
    'اتوماسیون یعنی یک کار تکراری را یک بار طراحی کنی و بعد سیستم آن را انجام بدهد.\n\n## چند مثال\n- دسته‌بندی ایمیل‌ها و پیش‌نویس پاسخ\n- تبدیل یک ایده به چند قالب محتوا\n- جمع‌آوری و خلاصه‌سازی اطلاعات\n\n## اجزای اصلی\n- Trigger: چیزی که شروع می‌کند، مثل یک ایمیل جدید یا یک Webhook\n- LLM: مدلی که متن را می‌فهمد و تولید می‌کند\n- Workflow: زنجیره مراحل که ابزارها را به هم وصل می‌کند\n\nابزارهایی مثل n8n این اتصال‌ها را بدون کدنویسی سنگین ممکن می‌کنند.', 6, 0);

  const Pj = (slug, cat, name, problem, solution, tech, result, status, feat) => ins('projects', { slug, category_id: prc[cat], name, problem, solution, tech, result, status, is_sample: 1, featured: feat ? 1 : 0 });
  Pj('content-repurposing-flow', 'content-automation', 'تبدیل خودکار یک ایده به چند قالب محتوا', 'تولید دستی نسخه‌های مختلف یک محتوا برای هر پلتفرم زمان‌بر است.', 'یک Workflow که ایده را می‌گیرد و پیش‌نویس کاروسل، کپشن و اسکریپت ریل می‌سازد.', 'n8n, LLM, Webhook', 'نمونه — نتیجه واقعی پس از ثبت پروژه اضافه می‌شود.', 'نمونه / در حال برنامه‌ریزی', 1);
  Pj('technical-docs-rag', 'rag', 'جستجوی هوشمند در اسناد فنی (RAG)', 'پیدا کردن اطلاعات در میان اسناد فنی حجیم زمان زیادی می‌گیرد.', 'سامانه‌ای که روی اسناد پرسش می‌پذیرد و پاسخ را همراه با ارجاع به سند می‌دهد.', 'RAG, Vector DB, LLM', 'نمونه — نتیجه واقعی پس از ثبت پروژه اضافه می‌شود.', 'نمونه / آزمایشی', 1);
  Pj('inbox-agent', 'agents', 'AI Agent برای پردازش ایمیل', 'مرتب کردن و پاسخ به ایمیل‌های تکراری وقت زیادی می‌گیرد.', 'یک Agent که ایمیل را دسته‌بندی و برای تأیید انسان پیش‌نویس پاسخ آماده می‌کند.', 'AI Agent, API, n8n', 'نمونه — نتیجه واقعی پس از ثبت پروژه اضافه می‌شود.', 'نمونه / در حال برنامه‌ریزی', 0);
  Pj('social-scheduler', 'social-automation', 'زمان‌بندی هوشمند محتوای شبکه‌های اجتماعی', 'هماهنگی تولید و انتشار محتوا بین چند پلتفرم پراکنده است.', 'یک جریان کاری که محتوای تأییدشده را در زمان مناسب برای انتشار آماده می‌کند.', 'Workflow, API', 'نمونه — نتیجه واقعی پس از ثبت پروژه اضافه می‌شود.', 'نمونه / آزمایشی', 0);

  const R = (slug, cat, title, description, feat) => ins('resources', { slug, category_id: rc[cat], title, description, is_sample: 1, featured: feat ? 1 : 0, file_url: '' });
  R('prompt-starter-pack', 'prompts', 'بسته پرامپت‌های شروع', 'مجموعه‌ای از پرامپت‌های پایه برای کارهای روزمره.', 1);
  R('ai-tools-cheatsheet', 'cheatsheet', 'برگه تقلب ابزارهای AI', 'کدام ابزار برای کدام کار؟ یک نگاه سریع.', 1);
  R('automation-checklist', 'checklist', 'چک‌لیست انتخاب کار برای اتوماسیون', 'پیش از اتوماسیون، این سؤال‌ها را از خودت بپرس.', 0);
  R('workflow-template', 'workflow', 'قالب Workflow ساده', 'یک قالب شروع برای ساخت اولین جریان کاری.', 0);

  [['reel', 'ریل: AI در یک دقیقه'], ['carousel', 'کاروسل: ۵ پرامپت کاربردی'], ['tutorial', 'آموزش: شروع با اتوماسیون']].forEach(([kind, title], i) =>
    ins('instagram_posts', { title, kind, url: 'https://instagram.com/mohammad_por_ai', is_sample: 1, sort: i }));

  ins('courses', { slug: 'ai-for-everyone', title: 'هوش مصنوعی برای همه', description: 'دوره مقدماتی کاربردی (پیش‌نویس).', status: 'به‌زودی', published: 0 });
}
