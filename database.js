/* =========================================================
   Tamil Nadu District Soil Database
   Shared: window.getDistrictSbcMid(d), window.openDistrictModal()
   ========================================================= */
const districtGrid = document.getElementById('districtGrid');
const districtSearch = document.getElementById('districtSearch');
const soilFilter = document.getElementById('soilFilter');
const sortSelect = document.getElementById('sortSelect');
const compareBtn = document.getElementById('compareBtn');
let compareSelection = [];

const baseTypes = [...new Set(DISTRICTS.map(d => d.soilType.split(' + ')[0]))];
baseTypes.forEach(t => {
  const o = document.createElement('option'); o.value = t; o.textContent = t; soilFilter.appendChild(o);
});

function sbcMid(d){
  const m = d.sbc.match(/(\d+)\s*-\s*(\d+)/);
  return m ? (+m[1] + +m[2]) / 2 : 0;
}
function densityMid(d){
  const m = d.density.match(/(\d+)\s*-\s*(\d+)/);
  return m ? (+m[1] + +m[2]) / 2 : 0;
}
window.getDistrictSbcMid = sbcMid;
window.getDistrictDensityMid = densityMid;

function renderDistricts(){
  const q = districtSearch.value.trim().toLowerCase();
  const filt = soilFilter.value;
  const sortBy = sortSelect.value;
  districtGrid.innerHTML = '';
  let list = DISTRICTS.filter(d => {
    const matchesQ = !q || d.name.toLowerCase().includes(q) || d.soilType.toLowerCase().includes(q);
    const matchesF = !filt || d.soilType.startsWith(filt);
    return matchesQ && matchesF;
  });
  if (sortBy === 'sbc') list = [...list].sort((a,b) => sbcMid(b) - sbcMid(a));
  else if (sortBy === 'density') list = [...list].sort((a,b) => densityMid(b) - densityMid(a));
  else list = [...list].sort((a,b) => a.name.localeCompare(b.name));

  list.forEach(d => {
    const el = document.createElement('div');
    el.className = 'glass district-card';
    const checked = compareSelection.includes(d.name) ? 'checked' : '';
    el.innerHTML = `
      <input type="checkbox" class="dcompare-check" data-name="${d.name}" ${checked} title="Select to compare" aria-label="Compare ${d.name}">
      <div class="dname">${d.name}</div>
      <div class="dtype">${d.soilType}</div>
      <div class="dsbc">SBC: ${d.sbc}</div>`;
    el.addEventListener('click', (ev) => { if (ev.target.tagName !== 'INPUT') openDistrictModal(d); });
    el.querySelector('.dcompare-check').addEventListener('click', (ev) => {
      ev.stopPropagation();
      toggleCompare(d.name, ev.target.checked);
    });
    districtGrid.appendChild(el); makeReveal(el);
  });
}
function toggleCompare(name, checked){
  if (checked){
    if (compareSelection.length >= 2){ toast('You can compare only 2 districts at a time.', 'warn'); renderDistricts(); return; }
    compareSelection.push(name);
  } else {
    compareSelection = compareSelection.filter(n => n !== name);
  }
  compareBtn.textContent = `⚖ Compare Selected (${compareSelection.length}/2)`;
}
districtSearch.addEventListener('input', renderDistricts);
soilFilter.addEventListener('change', renderDistricts);
sortSelect.addEventListener('change', renderDistricts);
compareBtn.addEventListener('click', () => {
  if (compareSelection.length !== 2){ toast('Select exactly 2 districts to compare.', 'warn'); return; }
  const [a,b] = compareSelection.map(n => DISTRICTS.find(d => d.name === n));
  openCompareModal(a,b);
});
renderDistricts();

/* ---- Populate district <select> dropdowns used elsewhere ---- */
document.querySelectorAll('.district-select-target').forEach(()=>{}); // placeholder for future use
function populateDistrictSelect(sel){
  DISTRICTS.forEach(d => { const o = document.createElement('option'); o.value = d.name; o.textContent = d.name; sel.appendChild(o); });
}

/* ---- Modal ---- */
const modalOverlay = document.getElementById('districtModal');
const modalBox = document.getElementById('modalBox');
function closeModal(){ modalOverlay.classList.remove('open'); }
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

let modalChartInstances = [];
function destroyModalCharts(){ modalChartInstances.forEach(c => c.destroy()); modalChartInstances = []; }

function openDistrictModal(d){
  destroyModalCharts();
  modalBox.innerHTML = `
    <button class="modal-close" onclick="document.getElementById('districtModal').classList.remove('open')" aria-label="Close">✕</button>
    <h3>${d.name}</h3>
    <div class="mtag">${d.soilType}</div>
    <div class="mrow"><b>Soil Color</b><span>${d.soilColor}</span></div>
    <div class="mrow"><b>Characteristics</b><span>${d.characteristics}</span></div>
    <div class="mrow"><b>Soil Density</b><span>${d.density}</span></div>
    <div class="mrow"><b>Safe Bearing Capacity</b><span>${d.sbc}</span></div>
    <div class="mrow"><b>Moisture Content</b><span>${d.moisture}</span></div>
    <div class="mrow"><b>Groundwater Level</b><span>${d.groundwater}</span></div>
    <div class="mrow"><b>Suitable Foundation</b><span>${d.foundation}</span></div>
    <div class="mrow"><b>Key Precaution</b><span>${d.precaution}</span></div>
    <div class="mrow"><b>Suitable Crops</b><span>${d.crops}</span></div>
    <div class="mrow"><b>Construction Notes</b><span>${d.construction}</span></div>
    <div class="mchart-row">
      <div class="glass mchart-box"><h5>SBC Range (kN/m²)</h5><canvas id="modalSbcChart" height="140"></canvas></div>
      <div class="glass mchart-box"><h5>Density Range (kg/m³)</h5><canvas id="modalDensityChart" height="140"></canvas></div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px;">
      <button class="btn btn-primary" style="flex:1;justify-content:center;" onclick="useDistrictInAI('${d.name.replace(/'/g,"\\'")}')">Use in AI Assistant →</button>
      <button class="btn btn-clay" style="flex:1;justify-content:center;" onclick="downloadDistrictReport('${d.name.replace(/'/g,"\\'")}')">📄 Download Report</button>
    </div>
  `;
  modalOverlay.classList.add('open');
  if (typeof Chart !== 'undefined') {
    try {
      const sbcM = sbcMid(d); const densM = densityMid(d);
      const cc = (typeof chartColors === 'function') ? chartColors() : {text:'#9DC2B4', grid:'rgba(255,255,255,.08)'};
      modalChartInstances.push(new Chart(document.getElementById('modalSbcChart'), {
        type:'bar', data:{ labels:['Low','Typical','High'], datasets:[{ data:[sbcM*0.7, sbcM, sbcM*1.3], backgroundColor:'#17A673', borderRadius:5 }]},
        options:{ plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true, ticks:{color:cc.text}, grid:{color:cc.grid}}, x:{ticks:{color:cc.text}, grid:{display:false}}} }
      }));
      modalChartInstances.push(new Chart(document.getElementById('modalDensityChart'), {
        type:'bar', data:{ labels:['Low','Typical','High'], datasets:[{ data:[densM*0.92, densM, densM*1.08], backgroundColor:'#C1793D', borderRadius:5 }]},
        options:{ plugins:{legend:{display:false}}, scales:{y:{beginAtZero:false, ticks:{color:cc.text}, grid:{color:cc.grid}}, x:{ticks:{color:cc.text}, grid:{display:false}}} }
      }));
    } catch(err){ console.error('Modal chart error:', err); }
  }
}
function openCompareModal(a,b){
  destroyModalCharts();
  const rows = [
    ['Soil Type', a.soilType, b.soilType],
    ['Soil Color', a.soilColor, b.soilColor],
    ['Density', a.density, b.density],
    ['SBC', a.sbc, b.sbc],
    ['Moisture', a.moisture, b.moisture],
    ['Groundwater', a.groundwater, b.groundwater],
    ['Foundation', a.foundation, b.foundation],
    ['Precaution', a.precaution, b.precaution],
    ['Suitable Crops', a.crops, b.crops],
    ['Construction Notes', a.construction, b.construction]
  ];
  modalBox.innerHTML = `
    <button class="modal-close" onclick="document.getElementById('districtModal').classList.remove('open')" aria-label="Close">✕</button>
    <h3>${a.name} vs ${b.name}</h3>
    <div class="mtag">District Comparison</div>
    ${rows.map(r => `<div class="mrow" style="flex-direction:column;align-items:flex-start;gap:4px;"><b>${r[0]}</b><span style="text-align:left;"><b style="color:var(--emerald-400)">${a.name}:</b> ${r[1]}</span><span style="text-align:left;"><b style="color:var(--clay-400)">${b.name}:</b> ${r[2]}</span></div>`).join('')}
  `;
  modalOverlay.classList.add('open');
}
window.useDistrictInAI = function(name){
  closeModal();
  document.getElementById('ai-assistant').scrollIntoView({behavior:'smooth'});
  const sel = document.getElementById('aiCtxDistrict');
  if (sel) sel.value = name;
  if (window.chatSendPreset) window.chatSendPreset(`Give me a full soil summary and foundation recommendation for ${name} district.`);
};
window.downloadDistrictReport = function(name){
  const d = DISTRICTS.find(x => x.name === name);
  if (!d) return;
  if (window.generateDistrictPdf) window.generateDistrictPdf(d);
};
