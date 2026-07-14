/* =========================================================
   Calculators UI — category tabs + searchable card grid + active panel
   ========================================================= */
const calcCatTabs = document.getElementById('calcCatTabs');
const calcListGrid = document.getElementById('calcListGrid');
const calcActivePanel = document.getElementById('calcActivePanel');
const calcSearch = document.getElementById('calcSearch');

let activeCalcCat = 'all';

const allTab = document.createElement('button');
allTab.className = 'calc-cat-tab active';
allTab.textContent = 'All';
allTab.addEventListener('click', () => selectCat('all', allTab));
calcCatTabs.appendChild(allTab);

CALC_CATEGORIES.forEach(cat => {
  const tab = document.createElement('button');
  tab.className = 'calc-cat-tab';
  tab.textContent = cat.name;
  tab.addEventListener('click', () => selectCat(cat.id, tab));
  calcCatTabs.appendChild(tab);
});
function selectCat(catId, tabEl){
  activeCalcCat = catId;
  document.querySelectorAll('.calc-cat-tab').forEach(t => t.classList.remove('active'));
  tabEl.classList.add('active');
  renderCalcList();
}
function catName(catId){
  const c = CALC_CATEGORIES.find(x => x.id === catId);
  return c ? c.name : catId;
}

function renderCalcList(){
  const q = calcSearch.value.trim().toLowerCase();
  calcListGrid.innerHTML = '';
  CALCULATORS.filter(c => (activeCalcCat==='all' || c.cat===activeCalcCat) && (!q || c.name.toLowerCase().includes(q)))
    .forEach(c => {
      const card = document.createElement('div');
      card.className = 'glass calc-card-mini';
      card.innerHTML = `<h5>${c.name}</h5><span>${catName(c.cat)}</span>`;
      card.addEventListener('click', () => openCalc(c.id));
      calcListGrid.appendChild(card); makeReveal(card);
    });
}
calcSearch.addEventListener('input', renderCalcList);
renderCalcList();

function openCalc(id){
  const c = CALCULATORS.find(x => x.id === id);
  calcActivePanel.classList.add('show');
  calcActivePanel.innerHTML = `
    <div class="glass calc-io">
      <h4 style="margin-bottom:4px;">${c.name}</h4>
      <div style="font-size:12px;color:var(--text-mute);margin-bottom:16px;">${catName(c.cat)}</div>
      ${c.fields.map(f => `<div class="form-row"><label>${f.label}</label><input type="number" step="any" id="fld-${c.id}-${f.id}" value="${f.val}"></div>`).join('')}
      <button class="btn btn-primary btn-sm" id="runCalcBtn">Calculate</button>
    </div>
    <div class="glass calc-result">
      <div style="font-size:12px;color:var(--text-mute);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">Result</div>
      <div class="big" id="calcResultVal">—</div>
      <div class="unit" id="calcResultUnit"></div>
      <div class="formula">${c.formula}</div>
    </div>`;
  document.getElementById('runCalcBtn').addEventListener('click', () => runCalc(c));
  calcActivePanel.scrollIntoView({behavior:'smooth', block:'center'});
  runCalc(c);
}
function runCalc(c){
  const values = {};
  c.fields.forEach(f => values[f.id] = parseFloat(document.getElementById(`fld-${c.id}-${f.id}`).value) || 0);
  const result = c.compute(values);
  document.getElementById('calcResultVal').textContent = result;
  document.getElementById('calcResultUnit').textContent = c.unit;
  if (window.trackActivity) window.trackActivity('calcs', `Calculated: ${c.name} = ${result} ${c.unit}`);
}

