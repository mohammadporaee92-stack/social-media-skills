const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const burger = $('#burger'), menu = $('#menu');
burger?.addEventListener('click', () => { const o = menu.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
const top = $('#totop'), prog = $('#progress');
addEventListener('scroll', () => {
  top.hidden = scrollY < 600;
  if (prog) { const h = document.documentElement.scrollHeight - innerHeight; prog.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%'; }
}, { passive: true });
top?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
async function copy(text, btn) {
  try { await navigator.clipboard.writeText(text); } catch { const t = document.createElement('textarea'); t.value = text; document.body.append(t); t.select(); document.execCommand('copy'); t.remove(); }
  const old = btn.textContent; btn.textContent = 'کپی شد ✓'; setTimeout(() => (btn.textContent = old), 1800);
}
document.addEventListener('click', (ev) => {
  const c = ev.target.closest('[data-copy]'); if (c) copy($(c.dataset.copy).textContent, c);
  const t = ev.target.closest('[data-copy-text]'); if (t) copy(t.dataset.copyText, t);
  const f = ev.target.closest('[data-fav]'); if (f) {
    const s = new Set(JSON.parse(localStorage.getItem('favs') || '[]')); const k = f.dataset.fav;
    s.has(k) ? s.delete(k) : s.add(k); localStorage.setItem('favs', JSON.stringify([...s])); mark();
  }
});
function mark() { const s = new Set(JSON.parse(localStorage.getItem('favs') || '[]')); $$('[data-fav]').forEach((b) => { const on = s.has(b.dataset.fav); b.textContent = on ? '♥' : '♡'; b.classList.toggle('on', on); }); }
mark();
setTimeout(() => $('.toast')?.remove(), 5000);
