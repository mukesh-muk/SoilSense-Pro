/* =========================================================
   Dashboard — session counters & activity log (localStorage only)
   Exposes: window.trackActivity(key, message)
   ========================================================= */
const DASH_KEYS = ['reports','calcs','ai','saved','uploads'];
function loadDashCounts(){
  try { return JSON.parse(localStorage.getItem('ss_dash_counts')) || {}; }
  catch(e){ return {}; }
}
function saveDashCounts(counts){ localStorage.setItem('ss_dash_counts', JSON.stringify(counts)); }
function loadActivity(){
  try { return JSON.parse(localStorage.getItem('ss_activity')) || []; }
  catch(e){ return []; }
}
function saveActivity(list){ localStorage.setItem('ss_activity', JSON.stringify(list.slice(0,20))); }

function renderDashCounts(){
  const counts = loadDashCounts();
  document.querySelectorAll('[data-dash]').forEach(el => {
    const key = el.dataset.dash;
    const target = counts[key] || 0;
    let cur = 0; const step = Math.max(1, Math.ceil(target/20));
    const t = setInterval(() => { cur += step; if (cur >= target){ cur = target; clearInterval(t); } el.textContent = cur; }, 30);
  });
}
function renderActivityLog(){
  const list = loadActivity();
  const log = document.getElementById('activityLog');
  if (!list.length){ log.innerHTML = '<div class="activity-empty">No activity yet — try the AI Assistant or a calculator.</div>'; return; }
  log.innerHTML = list.map(item => `<div class="activity-row"><span>${item.msg}</span><span style="color:var(--text-mute);font-size:11.5px;">${new Date(item.time).toLocaleTimeString()}</span></div>`).join('');
}

window.trackActivity = function(key, message){
  const counts = loadDashCounts();
  counts[key] = (counts[key]||0) + 1;
  saveDashCounts(counts);
  const list = loadActivity();
  list.unshift({msg:message, time:Date.now()});
  saveActivity(list);
  renderDashCounts();
  renderActivityLog();
};

/* ---------- Save Project (simple localStorage bookmark) ---------- */
window.saveProject = function(name, data){
  const key = 'ss_saved_projects';
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem(key)) || []; } catch(e){}
  saved.unshift({name, data, time:Date.now()});
  localStorage.setItem(key, JSON.stringify(saved.slice(0,10)));
  window.trackActivity('saved', `Saved project: ${name}`);
};

renderDashCounts();
renderActivityLog();
