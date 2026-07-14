/* =========================================================
   AI Soil Assistant — rule-based chat (not a trained LLM)
   Exposes: window.chatSendPreset(text), window.lastAiResult
   ========================================================= */
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');
const aiCtxDistrict = document.getElementById('aiCtxDistrict');

if (aiCtxDistrict && typeof populateDistrictSelect === 'function') populateDistrictSelect(aiCtxDistrict);

const AI_SOIL_RULES = {
  'Red Soil / Red Loam': {sbcRange:[120,200], foundation:'Isolated / spread RCC footing', concrete:'M20', excavation:[0.9,1.2]},
  'Black Cotton Soil': {sbcRange:[50,100], foundation:'Under-reamed pile or raft foundation below the active zone', concrete:'M25 (check sulphate exposure)', excavation:[1.5,2.0]},
  'Alluvial Soil': {sbcRange:[50,150], foundation:'Raft / combined footing (pile if multi-storey)', concrete:'M20–M25', excavation:[1.2,1.8]},
  'Laterite Soil': {sbcRange:[100,180], foundation:'Isolated / spread footing on undisturbed strata', concrete:'M20', excavation:[1.0,1.5]},
  'Coastal Sandy / Saline Soil': {sbcRange:[50,100], foundation:'Pile / raft foundation with Sulphate Resistant Cement', concrete:'M25 with SRC', excavation:[1.5,2.2]},
  'Hilly / Forest Terrain': {sbcRange:[200,300], foundation:'Stepped / benched footing or rock anchoring', concrete:'M20', excavation:[0.6,1.0]}
};
function baseSoilKeyFromType(soilType){
  for (const k of Object.keys(AI_SOIL_RULES)) if (soilType.includes(k.split(' ')[0])) return k;
  return 'Red Soil / Red Loam';
}

function addMsg(html, who='bot'){
  const el = document.createElement('div');
  el.className = 'chat-msg ' + who;
  el.innerHTML = html;
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return el;
}
function showTyping(){
  const el = document.createElement('div');
  el.className = 'chat-typing';
  el.id = 'typingIndicator';
  el.innerHTML = '<span></span><span></span><span></span>';
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function hideTyping(){ const t = document.getElementById('typingIndicator'); if (t) t.remove(); }

/* ---------- Intent matching ---------- */
const INTENTS = [
  { name:'identify', kw:['identify','what soil','which soil','soil type','recognize soil','field test soil'] },
  { name:'foundation', kw:['foundation','footing','raft','pile','which foundation','what foundation'] },
  { name:'excavation', kw:['excavat','dig','digging','trench','water table','dewater'] },
  { name:'construction', kw:['construct','build','precaution','crack','waterproof','plinth'] },
  { name:'improvement', kw:['improve','stabiliz','stabilis','weak soil','expansive','swell','treat soil'] },
  { name:'calculation', kw:['calculate','compute','sbc for','bearing capacity of','how much concrete','how many bags','density of'] },
  { name:'greeting', kw:['hi','hello','hey','vanakkam'] }
];
function detectIntent(text){
  const t = text.toLowerCase();
  let best = null, bestScore = 0;
  INTENTS.forEach(intent => {
    const score = intent.kw.filter(k => t.includes(k)).length;
    if (score > bestScore){ bestScore = score; best = intent.name; }
  });
  return bestScore > 0 ? best : 'general';
}

function getContextDistrict(){
  const name = aiCtxDistrict ? aiCtxDistrict.value : '';
  return name ? DISTRICTS.find(d => d.name === name) : null;
}

function respondTo(text){
  const intent = detectIntent(text);
  const ctx = getContextDistrict();

  if (intent === 'greeting') {
    return `Vanakkam! 👋 I'm the SoilSense rule-based Soil Assistant. Ask me about soil identification, foundation choice, excavation, construction advice, soil improvement, or a quick engineering calculation${ctx? ` — I'll use <b>${ctx.name}</b> district context if relevant.`:'.'}`;
  }

  if (intent === 'identify') {
    return `<b>Field soil identification (quick guide):</b><ul>
      <li><b>Red Soil</b> — reddish colour, gritty, drains fast, crumbles when dry.</li>
      <li><b>Black Cotton Soil</b> — dark grey/black, sticky when wet, deep cracks when dry (shrink-swell).</li>
      <li><b>Alluvial Soil</b> — greyish-brown, fine-grained, found near river basins.</li>
      <li><b>Laterite Soil</b> — brick-red, porous, hardens on exposure to air.</li>
      <li><b>Coastal Sandy Soil</b> — light grey/tan, loose, poor water retention, saline.</li>
      <li><b>Hilly/Forest Soil</b> — dark brown, rocky, shallow topsoil over rock.</li>
    </ul>${ctx? `<br>${ctx.name} district is predominantly <b>${ctx.soilType}</b>.` : 'Tell me a district name and I can look up its soil type from the database.'}`;
  }

  if (intent === 'foundation') {
    if (ctx) {
      const key = baseSoilKeyFromType(ctx.soilType);
      const r = AI_SOIL_RULES[key];
      return `For <b>${ctx.name}</b> (${ctx.soilType}):<br><b>Recommended foundation:</b> ${r.foundation}<br><b>Indicative SBC:</b> ${r.sbcRange[0]}–${r.sbcRange[1]} kN/m²<br><b>Concrete grade:</b> ${r.concrete}<div class="warn-line">⚠ Always confirm with a site-specific geotechnical investigation.</div>`;
    }
    // try to detect soil type keyword directly in the question
    for (const key of Object.keys(AI_SOIL_RULES)) {
      const firstWord = key.split(' ')[0].toLowerCase();
      if (text.toLowerCase().includes(firstWord) && firstWord !== 'red') {
        const r = AI_SOIL_RULES[key];
        return `For <b>${key}</b>:<br><b>Recommended foundation:</b> ${r.foundation}<br><b>Indicative SBC:</b> ${r.sbcRange[0]}–${r.sbcRange[1]} kN/m²<br><b>Concrete grade:</b> ${r.concrete}<div class="warn-line">⚠ Always confirm with a site-specific geotechnical investigation.</div>`;
      }
    }
    if (text.toLowerCase().includes('black cotton')) {
      const r = AI_SOIL_RULES['Black Cotton Soil'];
      return `For <b>Black Cotton Soil</b>:<br><b>Recommended foundation:</b> ${r.foundation}<br><b>Indicative SBC:</b> ${r.sbcRange[0]}–${r.sbcRange[1]} kN/m²<div class="warn-line">⚠ Expansive soil — provide a plinth beam and keep tree roots away from the foundation.</div>`;
    }
    return `Foundation choice depends mainly on soil type and load. In general: firm soils (red loam, laterite) → isolated RCC footings; expansive/soft soils (black cotton, alluvial) → raft or pile; coastal/saline soils → pile/raft with SRC cement. Pick a district in the context dropdown, or tell me the soil type, for a specific answer.`;
  }

  if (intent === 'excavation') {
    const gw = ctx ? ctx.groundwater : null;
    let msg = `<b>Excavation guidance:</b><ul>
      <li>Always shore/strut trenches deeper than 1.5 m in loose soil.</li>
      <li>Keep excavated soil at least 1× depth away from the edge to avoid surcharge collapse.</li>
      <li>If groundwater is shallow, dewater continuously and consider a raft/pile foundation instead of deep open excavation.</li>
    </ul>`;
    if (ctx) msg += `<br><b>${ctx.name}</b> indicative groundwater level: <b>${gw}</b>.`;
    if (text.toLowerCase().includes('water table') || text.toLowerCase().includes('high water')) {
      msg += `<div class="warn-line">⚠ High water table detected in your question — dewatering (well-point or sump pumping) is essential before excavation, and waterproof the substructure.</div>`;
    }
    return msg;
  }

  if (intent === 'construction') {
    let msg = `<b>General construction precautions:</b><ul>
      <li>Remove loose topsoil/organic matter before founding.</li>
      <li>Match concrete grade and cement type to soil chemistry (sulphate/saline soils need SRC cement).</li>
      <li>Provide adequate curing and control joints to reduce cracking.</li>
    </ul>`;
    if (text.toLowerCase().includes('coastal') || (ctx && ctx.soilType.includes('Coastal'))) {
      msg += `<br><b>Coastal/saline soil specific:</b> Use Sulphate Resistant Cement, increase rebar cover for corrosion protection, and avoid untreated mild steel reinforcement exposure.`;
    }
    if (text.toLowerCase().includes('black cotton') || (ctx && ctx.soilType.includes('Black Cotton'))) {
      msg += `<br><b>Black cotton soil specific:</b> Provide a plinth beam, keep trees at least 1.5× their mature height away from the foundation, and avoid shallow footings.`;
    }
    return msg;
  }

  if (intent === 'improvement') {
    return `<b>Common soil improvement methods:</b><ul>
      <li><b>Compaction</b> — mechanical rolling/vibration to increase density (for loose sands/fills).</li>
      <li><b>Lime/Cement Stabilisation</b> — reduces plasticity and swelling in expansive clays (black cotton soil).</li>
      <li><b>Sand/Stone Columns</b> — improve bearing capacity and drainage in soft, saturated soils.</li>
      <li><b>Geotextiles/Geogrids</b> — reinforce weak subgrades under roads and slabs.</li>
      <li><b>Surcharge Preloading</b> — accelerates consolidation settlement before construction.</li>
    </ul>${ctx && ctx.soilType.includes('Black Cotton') ? `<br><b>${ctx.name}</b> has black cotton soil — lime/cement stabilisation is typically the most effective and economical option.` : ''}`;
  }

  if (intent === 'calculation') {
    const numMatch = text.match(/(\d+(\.\d+)?)/g);
    if (text.toLowerCase().includes('sbc') && text.toLowerCase().includes('load') && numMatch) {
      const load = parseFloat(numMatch[0]);
      const sbc = ctx ? window.getDistrictSbcMid(ctx) : 150;
      const area = load / sbc;
      if (window.trackActivity) window.trackActivity('calcs', `AI quick-calc: footing area for ${load} kN load`);
      return `Quick footing area estimate:<br><b>Load:</b> ${load} kN &nbsp; <b>SBC used:</b> ${sbc.toFixed(0)} kN/m²${ctx?` (${ctx.name})`:' (default)'}<br><b>Required Area (A = Load / SBC):</b> <b>${area.toFixed(2)} m²</b><br>Open the <a href="#calculators" style="color:var(--emerald-400);">Calculators</a> section for the full Footing Design tool.`;
    }
    return `I can run a quick calculation if you give me numbers — e.g. "Calculate SBC for a footing with 600 kN load". For full precision, use the <a href="#calculators" style="color:var(--emerald-400);">45 engineering calculators</a> section.`;
  }

  // general fallback
  return `I can help with soil identification, foundation suggestions, excavation advice, construction recommendations, soil improvement methods, or a quick engineering calculation. Try one of the quick topics on the left, or ask a specific question${ctx?` about ${ctx.name} district`:''}.`;
}

function sendChat(text){
  text = text.trim();
  if (!text) return;
  addMsg(text, 'user');
  chatInput.value = '';
  showTyping();
  const delay = 500 + Math.random()*500;
  setTimeout(() => {
    hideTyping();
    const reply = respondTo(text);
    addMsg(reply, 'bot');
    window.lastAiResult = { question:text, answer:reply, district: getContextDistrict() ? getContextDistrict().name : null, time:new Date() };
    if (window.trackActivity) window.trackActivity('ai', `AI Assistant: "${text.length>40?text.slice(0,40)+'…':text}"`);
  }, delay);
}
window.chatSendPreset = function(text){
  document.getElementById('ai-assistant').scrollIntoView({behavior:'smooth'});
  setTimeout(() => sendChat(text), 400);
};

chatSendBtn.addEventListener('click', () => sendChat(chatInput.value));
chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChat(chatInput.value); });
document.querySelectorAll('.ai-chip').forEach(chip => {
  chip.addEventListener('click', () => sendChat(chip.dataset.q));
});

/* welcome message */
addMsg(`Vanakkam! 👋 I'm the SoilSense rule-based Soil Assistant — not a live AI model, but I can give quick guidance on soil identification, foundations, excavation, construction advice, soil improvement and simple calculations. Pick a quick topic or type your question below.`, 'bot');
