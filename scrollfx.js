/* =========================================================
   Scroll FX — reveal animations, counters, progress bar, back-to-top
   Shared: makeReveal()
   ========================================================= */

/* ---------- LOADER ---------- */
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('hide'), 500);
});
document.getElementById('yr').textContent = new Date().getFullYear();

/* ---------- SCROLL REVEAL ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObserver.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
function makeReveal(el){ el.classList.add('reveal'); revealObserver.observe(el); }

/* ---------- ANIMATED COUNTERS ---------- */
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; const target = +el.dataset.count; const suffix = el.dataset.suffix || '';
    let cur = 0; const step = Math.max(1, Math.ceil(target/50));
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { cur = target; clearInterval(t); }
      el.textContent = cur + suffix;
    }, 24);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(c => counterObserver.observe(c));

/* ---------- SCROLL PROGRESS BAR ---------- */
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  scrollProgress.style.width = pct + '%';
});

/* ---------- BACK TO TOP ---------- */
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => backToTop.classList.toggle('show', window.scrollY > 600));
backToTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
