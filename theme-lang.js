/* =========================================================
   Theme + Language + Toasts
   Shared globals: root, toast(), setLang(), applyLangTexts()
   ========================================================= */
const root = document.documentElement;

/* ---------- THEME ---------- */
const themeToggle = document.getElementById('themeToggle');
function applyTheme(t){
  root.setAttribute('data-theme', t);
  themeToggle.textContent = t === 'dark' ? '🌙' : '☀️';
  localStorage.setItem('ss_theme', t);
  if (window.refreshChartTheme) window.refreshChartTheme();
}
applyTheme(localStorage.getItem('ss_theme') || 'dark');
themeToggle.addEventListener('click', () => {
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

/* ---------- LANGUAGE ---------- */
let currentLang = localStorage.getItem('ss_lang') || 'en';
function applyLangTexts(){
  document.querySelectorAll('[data-en][data-ta-text]').forEach(el => {
    const val = currentLang === 'ta' ? el.dataset.taText : el.dataset.en;
    if (val !== undefined && val !== '') el.textContent = val;
  });
}
function setLang(l){
  currentLang = l;
  root.setAttribute('lang', l);
  document.getElementById('btnEN').classList.toggle('active', l==='en');
  document.getElementById('btnTA').classList.toggle('active', l==='ta');
  localStorage.setItem('ss_lang', l);
  const mm = document.getElementById('mobileMenu');
  if (mm) mm.classList.remove('open');
  applyLangTexts();
}
document.getElementById('btnEN').addEventListener('click', () => setLang('en'));
document.getElementById('btnTA').addEventListener('click', () => setLang('ta'));
root.setAttribute('lang', currentLang);
document.getElementById('btnEN').classList.toggle('active', currentLang==='en');
document.getElementById('btnTA').classList.toggle('active', currentLang==='ta');

/* ---------- TOASTS ---------- */
function toast(msg, type='ok'){
  const wrap = document.getElementById('toastWrap');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = (type==='ok' ? '✅ ' : '⚠️ ') + msg;
  wrap.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform='translateX(30px)'; setTimeout(()=>el.remove(), 350); }, 3400);
}
