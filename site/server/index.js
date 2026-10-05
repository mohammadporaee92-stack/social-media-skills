import express from 'express';
import { seed } from './seed.js';
import { pub } from './public.js';
import { admin } from './admin.js';
import { render } from './lib.js';

seed();
const app = express();
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(express.static('public', { maxAge: '1h' }));
app.use('/admin', admin);
app.use(pub);
app.use((req, res) => render(req, res, { status: 404, title: 'صفحه پیدا نشد', noindex: true, body: `<section class="page wrap center nf"><div class="nf-code">۴۰۴</div><h1>این صفحه را حتی هوش مصنوعی هم پیدا نکرد!</h1><a class="btn btn-lg" href="/">برگشت به خانه</a></section>` }));
app.use((err, req, res, next) => { console.error(err); res.status(500).send('خطای سرور'); });
app.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('listening'));
