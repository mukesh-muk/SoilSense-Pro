/* =========================================================
   Interactive GIS Map (stylized — relative positions only)
   Reuses window.openDistrictModal() from database.js
   ========================================================= */
const mapCanvas = document.getElementById('mapCanvas');
const mapSide = document.getElementById('mapSide');

const MAP_TYPE_COLOR = {
  'Red Soil':'#B5502F', 'Black Cotton':'#2B2A28', 'Alluvial':'#8C7355',
  'Laterite':'#9C4A2E', 'Coastal Sandy':'#34C1A0', 'Hilly':'#5C4530'
};
function mapBaseType(soilType){
  for (const key of Object.keys(MAP_TYPE_COLOR)) if (soilType.includes(key)) return key;
  return 'Red Soil';
}

if (mapCanvas) {
  DISTRICTS.forEach(d => {
    const dot = document.createElement('div');
    dot.className = 'map-dot';
    dot.style.left = d.x + '%';
    dot.style.top = d.y + '%';
    dot.style.background = MAP_TYPE_COLOR[mapBaseType(d.soilType)];
    dot.setAttribute('role','button');
    dot.setAttribute('aria-label', d.name);
    dot.innerHTML = `<span class="map-dot-label">${d.name}</span>`;
    dot.addEventListener('click', () => {
      document.querySelectorAll('.map-dot').forEach(x => x.classList.remove('active'));
      dot.classList.add('active');
      renderMapSide(d);
    });
    mapCanvas.appendChild(dot);
  });
  const note = document.createElement('div');
  note.className = 'map-note';
  note.textContent = 'Stylized relative-position map — not a survey-grade boundary map.';
  mapCanvas.appendChild(note);
}

let mapChartInstances = [];
function renderMapSide(d){
  mapChartInstances.forEach(c => c.destroy()); mapChartInstances = [];
  mapSide.innerHTML = `
    <h3 style="font-size:19px;margin-bottom:2px;">${d.name}</h3>
    <div style="color:var(--clay-400);font-weight:600;font-size:13px;margin-bottom:16px;">${d.soilType}</div>
    <div class="mrow"><b>Soil Color</b><span>${d.soilColor}</span></div>
    <div class="mrow"><b>Density</b><span>${d.density}</span></div>
    <div class="mrow"><b>SBC</b><span>${d.sbc}</span></div>
    <div class="mrow"><b>Moisture</b><span>${d.moisture}</span></div>
    <div class="mrow"><b>Groundwater</b><span>${d.groundwater}</span></div>
    <div class="mrow"><b>Foundation</b><span>${d.foundation}</span></div>
    <div class="mchart-row" style="margin-top:16px;">
      <div class="glass mchart-box"><h5>SBC (kN/m²)</h5><canvas id="mapSbcChart" height="120"></canvas></div>
      <div class="glass mchart-box"><h5>Density (kg/m³)</h5><canvas id="mapDensityChart" height="120"></canvas></div>
    </div>
    <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:18px;" onclick="openDistrictModal(DISTRICTS.find(x=>x.name==='${d.name.replace(/'/g,"\\'")}'))">View Full Report →</button>
  `;
  if (typeof Chart !== 'undefined') {
    try {
      const sbcM = window.getDistrictSbcMid(d), densM = window.getDistrictDensityMid(d);
      const cc = (typeof chartColors === 'function') ? chartColors() : {text:'#9DC2B4', grid:'rgba(255,255,255,.08)'};
      mapChartInstances.push(new Chart(document.getElementById('mapSbcChart'), {
        type:'bar', data:{labels:['Low','Typical','High'], datasets:[{data:[sbcM*0.7, sbcM, sbcM*1.3], backgroundColor:'#17A673', borderRadius:5}]},
        options:{plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true, ticks:{color:cc.text}, grid:{color:cc.grid}}, x:{ticks:{color:cc.text}, grid:{display:false}}}}
      }));
      mapChartInstances.push(new Chart(document.getElementById('mapDensityChart'), {
        type:'bar', data:{labels:['Low','Typical','High'], datasets:[{data:[densM*0.92, densM, densM*1.08], backgroundColor:'#C1793D', borderRadius:5}]},
        options:{plugins:{legend:{display:false}}, scales:{y:{beginAtZero:false, ticks:{color:cc.text}, grid:{color:cc.grid}}, x:{ticks:{color:cc.text}, grid:{display:false}}}}
      }));
    } catch(err){ console.error('Map chart error:', err); }
  }
}
