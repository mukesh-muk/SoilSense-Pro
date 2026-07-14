/* =========================================================
   Static content sections built from small local data arrays
   ========================================================= */

/* ---------- FEATURES ---------- */
const FEATURES = [
  {icon:'🧭', en:'Soil Classification', ta:'மண் வகைப்பாடு', d:'Identify soil family from field characteristics.'},
  {icon:'⚖️', en:'Soil Density Calculator', ta:'மண் அடர்த்தி', d:'Bulk, dry and unit weight calculations.'},
  {icon:'🏗️', en:'Bearing Capacity Calculator', ta:'தாங்கும் திறன்', d:'Terzaghi / Meyerhof / Hansen SBC estimation.'},
  {icon:'💧', en:'Moisture Content Calculator', ta:'ஈரப்பதம்', d:'Water content from wet/dry sample mass.'},
  {icon:'🛞', en:'Compaction Calculator', ta:'கம்பாக்‌ஷன்', d:'Proctor compaction percentage check.'},
  {icon:'📐', en:'Atterberg Limits', ta:'ஆட்டர்பர்க் வரம்புகள்', d:'Liquid, plastic & shrinkage limit reference.'},
  {icon:'🔬', en:'Grain Size Analysis', ta:'துகள் அளவு பகுப்பாய்வு', d:'Particle size distribution classification.'},
  {icon:'🕳️', en:'Sieve &amp; Hydrometer Analysis', ta:'சல்லடை பகுப்பாய்வு', d:'Percentage passing and fine particle sizing.'},
  {icon:'🏛️', en:'Foundation Selection', ta:'அஸ்திவார தேர்வு', d:'Match soil type to the right foundation.'},
  {icon:'🗺️', en:'Interactive GIS Map', ta:'வரைபடம்', d:'Click any district for its full soil profile.'}
];
const featureGrid = document.getElementById('featureGrid');
FEATURES.forEach((f) => {
  const el = document.createElement('div');
  el.className = 'glass feat-card';
  el.innerHTML = `<div class="feat-icon">${f.icon}</div><h4><span data-en="${f.en}" data-ta-text="${f.ta}">${f.en}</span></h4><p>${f.d}</p>`;
  el.addEventListener('click', () => document.getElementById('calculators').scrollIntoView({behavior:'smooth'}));
  featureGrid.appendChild(el); makeReveal(el);
});

/* ---------- SOIL TYPES QUICK REFERENCE ---------- */
const soilTypeGrid = document.getElementById('soilTypeGrid');
SOIL_TYPES.forEach(st => {
  const el = document.createElement('div');
  el.className = 'glass st-card';
  el.innerHTML = `
    <div class="st-swatch" style="background:${st.color}"></div>
    <div class="st-body">
      <h4>${st.name}</h4>
      <p>${st.characteristics}</p>
      <div class="st-meta">
        <div><b>SBC:</b> ${st.sbc}</div>
        <div><b>Foundation:</b> ${st.foundation}</div>
        <div><b>Precaution:</b> ${st.precaution}</div>
      </div>
    </div>`;
  soilTypeGrid.appendChild(el); makeReveal(el);
});

/* ---------- SOIL TESTING PRIMER ---------- */
const TESTS = [
  {icon:'🧪', t:'Standard Penetration Test (SPT)', d:'In-situ field test giving N-value used to correlate soil strength and bearing capacity with depth.'},
  {icon:'⚙️', t:'Plate Load Test', d:'Field test applying incremental load on a plate to directly estimate safe bearing capacity.'},
  {icon:'💧', t:'Moisture Content Test', d:'Oven-drying method (IS 2720 Part 2) to determine water content of a soil sample.'},
  {icon:'📏', t:'Sieve Analysis', d:'Mechanical sieving (IS 2720 Part 4) to classify soil by particle size distribution.'},
  {icon:'🔷', t:'Atterberg Limits Test', d:'Determines liquid limit, plastic limit and plasticity index — key for clay behaviour.'},
  {icon:'🪨', t:'Proctor Compaction Test', d:'Establishes maximum dry density and optimum moisture content for fill compaction.'},
  {icon:'🌊', t:'Permeability Test', d:'Constant/falling head tests (IS 2720 Part 17) to determine coefficient of permeability.'},
  {icon:'⚗️', t:'Hydrometer Analysis', d:'Determines fine (silt/clay) particle size distribution using sedimentation.'}
];
const testingGrid = document.getElementById('testingGrid');
TESTS.forEach(t => {
  const el = document.createElement('div');
  el.className = 'glass testing-card';
  el.innerHTML = `<div class="ticon">${t.icon}</div><div><h4>${t.t}</h4><p>${t.d}</p></div>`;
  testingGrid.appendChild(el); makeReveal(el);
});

/* ---------- FAQ ---------- */
const FAQS = [
  {q:'Is the district soil data lab-tested?', a:'No. It is compiled from published soil-survey literature (NBSS&LUP, TNAU, TN Geography records) and general IS-code practice. Treat it as an indicative starting point only.'},
  {q:'Is the map geographically accurate?', a:'No — it is a stylized map with correct relative district positions, not survey-grade boundaries. Use the Soil Database for authoritative per-district data.'},
  {q:'Can I use the AI Assistant\'s answer for real construction?', a:'The AI Assistant is rule-based, not a trained AI model. It gives preliminary guidance only — a licensed geotechnical engineer must confirm findings with a site-specific investigation.'},
  {q:'How accurate is the Upload &amp; Extract feature?', a:'PDF/Excel text extraction is generally reliable; image OCR accuracy varies with scan quality. Always review and correct extracted values before relying on them.'},
  {q:'Does the platform support Tamil?', a:'Yes — use the EN / TA toggle in the header to switch the interface language.'},
  {q:'Is my data stored anywhere?', a:'All calculations, uploads and dashboard counts run and stay in your browser only (localStorage). Nothing is uploaded to a server.'}
];
const faqList = document.getElementById('faqList');
FAQS.forEach(f => {
  const el = document.createElement('div');
  el.className = 'faq-item';
  el.innerHTML = `<div class="faq-q">${f.q}<span class="chev">+</span></div><div class="faq-a">${f.a}</div>`;
  el.addEventListener('click', () => el.classList.toggle('open'));
  faqList.appendChild(el); makeReveal(el);
});

/* ---------- TESTIMONIALS (illustrative sample use-cases) ---------- */
const TESTIS = [
  {who:'Site Engineer', ctx:'Residential contractor, Coimbatore', q:'Used to quickly cross-check indicative SBC before recommending a footing type to a client.', i:'SE'},
  {who:'Civil Engineering Student', ctx:'Anna University affiliate college', q:'Handy reference for Atterberg limits and soil classification while studying for geotechnical exams.', i:'ST'},
  {who:'Freelance Estimator', ctx:'Small builders, Madurai region', q:'Excavation volume and concrete calculators speed up quick site estimates.', i:'FE'}
];
const testiGrid = document.getElementById('testiGrid');
TESTIS.forEach(t => {
  const el = document.createElement('div');
  el.className = 'glass testi-card';
  el.innerHTML = `<p>"${t.q}"</p><div class="testi-who"><div class="testi-avatar">${t.i}</div><div><b>${t.who}</b><span>${t.ctx}</span></div></div>`;
  testiGrid.appendChild(el); makeReveal(el);
});
