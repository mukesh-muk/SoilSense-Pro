/* =========================================================
   Dashboard Charts — guarded against Chart.js CDN failure
   Exposes: window.chartColors(), window.refreshChartTheme()
   ========================================================= */
function chartColors(){
  const dark = root.getAttribute('data-theme') !== 'light';
  return { grid: dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)', text: dark ? '#9DC2B4' : '#3A5A4C' };
}
window.chartColors = chartColors;

const dashChartInstances = [];
window.refreshChartTheme = function(){};

if (typeof Chart === 'undefined') {
  ['chartSbc','chartPie','chartLayers','chartMoisture'].forEach(id => {
    const canvas = document.getElementById(id);
    if (canvas) {
      const msg = document.createElement('p');
      msg.style.cssText = 'color:var(--text-mute);font-size:13px;text-align:center;padding:30px 10px;';
      msg.textContent = 'Chart unavailable — needs an internet connection to load Chart.js.';
      canvas.replaceWith(msg);
    }
  });
} else {
  try {
    const cc = chartColors();
    Chart.defaults.color = cc.text;
    Chart.defaults.borderColor = cc.grid;
    Chart.defaults.font.family = 'Inter';

    dashChartInstances.push(new Chart(document.getElementById('chartSbc'), {
      type:'bar',
      data:{ labels: SOIL_TYPES.map(s=>s.name.split(' /')[0].split(' Soil')[0]),
        datasets:[{ label:'Avg SBC (kN/m²)', data: SOIL_TYPES.map(s => { const m = s.sbc.match(/(\d+)\s*-\s*(\d+)/); return m ? (+m[1]+ +m[2])/2 : 100; }), backgroundColor:'#17A673', borderRadius:6 }]},
      options:{ plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}} }
    }));

    const typeCounts = {};
    DISTRICTS.forEach(d => { const base = d.soilType.split(' + ')[0]; typeCounts[base] = (typeCounts[base]||0)+1; });
    dashChartInstances.push(new Chart(document.getElementById('chartPie'), {
      type:'doughnut',
      data:{ labels:Object.keys(typeCounts), datasets:[{ data:Object.values(typeCounts), backgroundColor:['#C1793D','#2B2A28','#8C7355','#9C4A2E','#2ECC96','#5C4530'] }]},
      options:{ plugins:{legend:{position:'bottom', labels:{boxWidth:10, font:{size:11}}}} }
    }));

    dashChartInstances.push(new Chart(document.getElementById('chartLayers'), {
      type:'bar',
      data:{ labels:['Topsoil','Red Loam','Laterite','Weathered Rock','Hard Strata'],
        datasets:[{ label:'Layer Depth (m)', data:[0.5,1.2,1.8,1.0,3.5], backgroundColor:['#C1793D','#B5502F','#9C4A2E','#5C4530','#2B2A28'] }]},
      options:{ indexAxis:'y', plugins:{legend:{display:false}} }
    }));

    dashChartInstances.push(new Chart(document.getElementById('chartMoisture'), {
      type:'radar',
      data:{ labels: SOIL_TYPES.map(s=>s.name.split(' /')[0].split(' Soil')[0]),
        datasets:[{ label:'Moisture Sensitivity', data:[3,9,7,3,6,2], backgroundColor:'rgba(46,204,150,0.25)', borderColor:'#2ECC96' }]},
      options:{ plugins:{legend:{display:false}}, scales:{r:{beginAtZero:true, max:10}} }
    }));

    window.refreshChartTheme = function(){
      const c = chartColors();
      Chart.defaults.color = c.text;
      Chart.defaults.borderColor = c.grid;
      dashChartInstances.forEach(ch => {
        if (ch.options.scales){
          Object.values(ch.options.scales).forEach(sc => {
            if (sc.ticks) sc.ticks.color = c.text;
            if (sc.grid) sc.grid.color = c.grid;
            if (sc.pointLabels) sc.pointLabels.color = c.text;
            if (sc.angleLines) sc.angleLines.color = c.grid;
          });
        }
        if (ch.options.plugins && ch.options.plugins.legend && ch.options.plugins.legend.labels){
          ch.options.plugins.legend.labels.color = c.text;
        }
        ch.update();
      });
    };
  } catch(err){ console.error('Dashboard chart rendering failed:', err); }
}
