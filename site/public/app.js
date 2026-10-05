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
// 3D neural network (vanilla canvas, perspective projection)
(() => {
  const cv = $('#ai3d'); if (!cv) return;
  const ctx = cv.getContext('2d'), still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const N = innerWidth < 700 ? 48 : 95, pts = [];
  for (let i = 0; i < N; i++) { const u = Math.random() * 2 - 1, t = Math.random() * 6.283, r = Math.sqrt(1 - u * u) * (0.55 + Math.random() * 0.45); pts.push([r * Math.cos(t), u * (0.55 + Math.random() * 0.45), r * Math.sin(t)]); }
  let w, h, dpr, mx = 0, my = 0, a = 0, run = true;
  const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size(); addEventListener('resize', size);
  addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
  function draw() {
    ctx.clearRect(0, 0, w, h);
    const R = Math.min(w * 0.5, h * 0.62), cx = w > 800 ? w * 0.3 : w * 0.5, cy = h * 0.5;
    const ay = a + mx * 0.8, ax = 0.35 + my * 0.5, cyw = Math.cos(ay), syw = Math.sin(ay), cxw = Math.cos(ax), sxw = Math.sin(ax);
    const P = pts.map(([x, y, z]) => { const x1 = x * cyw + z * syw, z1 = -x * syw + z * cyw, y1 = y * cxw - z1 * sxw, z2 = y * sxw + z1 * cxw, s = 2.6 / (2.6 + z2); return [cx + x1 * R * s, cy + y1 * R * s, z2, s]; });
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      const A = pts[i], B = pts[j], d = Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]);
      if (d < 0.6) { ctx.strokeStyle = `rgba(0,229,255,${(1 - d / 0.6) * 0.32 * (0.5 + (P[i][3] + P[j][3]) / 2 * 0.5)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(P[i][0], P[i][1]); ctx.lineTo(P[j][0], P[j][1]); ctx.stroke(); }
    }
    for (const [x, y, z, s] of P) { ctx.fillStyle = `rgba(0,${180 + 49 * (1 - z) / 2 | 0},255,${Math.min(1, 0.35 + s * 0.45)})`; ctx.beginPath(); ctx.arc(x, y, 1.2 + s * 1.8, 0, 6.283); ctx.fill(); }
    a += 0.0035;
  }
  const loop = () => { if (run) draw(); requestAnimationFrame(loop); };
  new IntersectionObserver(([e]) => (run = e.isIntersecting)).observe(cv);
  still ? draw() : loop();
})();
// card tilt + portrait parallax (pointer devices only)
if (matchMedia('(hover:hover)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.addEventListener('pointermove', (ev) => {
    const c = ev.target.closest?.('.card');
    if (c) { const r = c.getBoundingClientRect(); c.style.setProperty('--ry', ((ev.clientX - r.left) / r.width - 0.5) * 8 + 'deg'); c.style.setProperty('--rx', (0.5 - (ev.clientY - r.top) / r.height) * 8 + 'deg'); }
    const p = $('.portrait');
    if (p) { p.style.setProperty('--py', (ev.clientX / innerWidth - 0.5) * 14 + 'deg'); p.style.setProperty('--px', (0.5 - ev.clientY / innerHeight) * 10 + 'deg'); }
  }, { passive: true });
  document.addEventListener('pointerout', (ev) => { const c = ev.target.closest?.('.card'); if (c) { c.style.removeProperty('--rx'); c.style.removeProperty('--ry'); } });
}
