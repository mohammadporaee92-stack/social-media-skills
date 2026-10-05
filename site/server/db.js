import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const path = process.env.DB_PATH || './data/app.db';
mkdirSync(dirname(path), { recursive: true });
export const db = new DatabaseSync(path);
db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');

const clean = (p) => p.map((v) => (v === undefined ? null : v));
export const all = (sql, ...p) => db.prepare(sql).all(...clean(p));
export const get = (sql, ...p) => db.prepare(sql).get(...clean(p));
export const run = (sql, ...p) => db.prepare(sql).run(...clean(p));

const common = `featured INTEGER DEFAULT 0, published INTEGER DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP`;
db.exec(`
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE, name TEXT, role TEXT DEFAULT 'admin', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, type TEXT NOT NULL, slug TEXT NOT NULL, name TEXT NOT NULL, sort INTEGER DEFAULT 0, UNIQUE(type, slug));
CREATE TABLE IF NOT EXISTS tool_categories (id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, sort INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS prompt_categories (id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, sort INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS ai_tools (id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, description TEXT, category_id INTEGER REFERENCES tool_categories(id) ON DELETE SET NULL, pricing TEXT DEFAULT 'freemium', best_for TEXT, difficulty TEXT DEFAULT 'مبتدی', website_url TEXT, tutorial_url TEXT, logo_url TEXT, ${common});
CREATE TABLE IF NOT EXISTS prompts (id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, summary TEXT, category_id INTEGER REFERENCES prompt_categories(id) ON DELETE SET NULL, models TEXT, body TEXT, how_to TEXT, pro_version TEXT, ${common});
CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL, problem TEXT, solution TEXT, tech TEXT, image_url TEXT, result TEXT, status TEXT DEFAULT 'در حال ساخت', repo_url TEXT, demo_url TEXT, is_sample INTEGER DEFAULT 0, ${common});
CREATE TABLE IF NOT EXISTS resources (id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, description TEXT, image_url TEXT, category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL, file_url TEXT, is_sample INTEGER DEFAULT 0, ${common});
CREATE TABLE IF NOT EXISTS articles (id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, seo_title TEXT, meta_description TEXT, excerpt TEXT, body TEXT, image_url TEXT, author_id INTEGER REFERENCES users(id) ON DELETE SET NULL, category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL, read_minutes INTEGER DEFAULT 3, is_sample INTEGER DEFAULT 0, ${common});
CREATE TABLE IF NOT EXISTS courses (id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, description TEXT, image_url TEXT, price_text TEXT, status TEXT DEFAULT 'به‌زودی', ${common});
CREATE TABLE IF NOT EXISTS instagram_posts (id INTEGER PRIMARY KEY, title TEXT NOT NULL, kind TEXT DEFAULT 'reel', url TEXT, image_url TEXT, is_sample INTEGER DEFAULT 0, sort INTEGER DEFAULT 0, ${common});
CREATE TABLE IF NOT EXISTS social_links (id INTEGER PRIMARY KEY, platform TEXT NOT NULL, label TEXT, url TEXT, sort INTEGER DEFAULT 0, published INTEGER DEFAULT 1, featured INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS newsletter_subscribers (id INTEGER PRIMARY KEY, name TEXT, email TEXT UNIQUE, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS contact_messages (id INTEGER PRIMARY KEY, name TEXT, email TEXT, subject TEXT, message TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT);
`);

export const setting = (k, d = '') => get('SELECT value FROM site_settings WHERE key=?', k)?.value ?? d;
export const settings = () => Object.fromEntries(all('SELECT key,value FROM site_settings').map((r) => [r.key, r.value]));
