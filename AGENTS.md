# Notes
- `skills/` is an unrelated markdown skills collection. The website lives in `site/` (Node 22, Express, built-in `node:sqlite`, server-rendered, no build step).
- Run: `docker compose -f docker-compose.base44.yml up -d`. SQLite DB is in the `appdata` volume (`/data/app.db`), seeded on first start from `site/server/seed.js` (placeholder Persian content; `is_sample` rows show a «نمونه» badge).
- `node --watch` may not notice bind-mount edits: run `docker compose -f docker-compose.base44.yml restart web` after server changes (CSS/client JS are static, just reload).
- Admin: `/admin`, password from `ADMIN_PASSWORD` (dev default in `.env.base44-defaults`). Entities are configured in `site/server/admin.js`.
- Monetization pages (/courses, /consulting, /services, /products) are noindex "coming soon" until `*_enabled=1` in admin settings.
