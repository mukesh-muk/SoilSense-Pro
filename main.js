/* =========================================================
   Main — final cross-module wiring, runs after every other
   module has built its DOM content.
   ========================================================= */

/* ---------- Floating AI Assistant button ---------- */
document.getElementById('fabAi').addEventListener('click', () => {
  document.getElementById('ai-assistant').scrollIntoView({behavior:'smooth'});
});

/* ---------- Final language pass ----------
   All dynamic sections (features, soil types, testing, FAQ,
   testimonials, database, map, calculators) now exist —
   apply the saved language across everything. */
setLang(currentLang);
