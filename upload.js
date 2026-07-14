/* =========================================================
   Upload Soil Report — best-effort client-side extraction
   PDF (pdf.js) / Excel & CSV (SheetJS) / Image (Tesseract OCR)
   Everything runs in-browser; nothing is uploaded to a server.
   ========================================================= */
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const uploadFileList = document.getElementById('uploadFileList');
const uploadResult = document.getElementById('uploadResult');

if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
dropzone.addEventListener('drop', (e) => {
  e.preventDefault(); dropzone.classList.remove('dragover');
  if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', () => { if (fileInput.files.length) handleFile(fileInput.files[0]); });

function addFileRow(name, statusText){
  uploadFileList.innerHTML = '';
  const row = document.createElement('div');
  row.className = 'upload-file-row';
  row.innerHTML = `<span>📎 ${name}</span><span id="fileStatus">${statusText}</span>`;
  const bar = document.createElement('div');
  bar.className = 'upload-progress';
  bar.innerHTML = '<div class="upload-progress-bar" id="uploadBar"></div>';
  uploadFileList.appendChild(row);
  uploadFileList.appendChild(bar);
}
function setProgress(pct, statusText){
  const bar = document.getElementById('uploadBar');
  const status = document.getElementById('fileStatus');
  if (bar) bar.style.width = pct + '%';
  if (status && statusText) status.textContent = statusText;
}

async function handleFile(file){
  const ext = file.name.split('.').pop().toLowerCase();
  addFileRow(file.name, 'Reading…');
  uploadResult.innerHTML = `<div style="text-align:center;color:var(--text-mute);padding:40px 20px;">⏳<p style="margin-top:10px;font-size:13.5px;">Extracting text…</p></div>`;

  try {
    let text = '';
    if (ext === 'pdf') {
      text = await extractPdfText(file);
    } else if (['xlsx','xls','csv'].includes(ext)) {
      text = await extractExcelText(file);
    } else if (['jpg','jpeg','png'].includes(ext)) {
      text = await extractImageText(file);
    } else {
      toast('Unsupported file type.', 'warn'); return;
    }
    setProgress(100, 'Done');
    const parsed = parseSoilValues(text);
    renderExtraction(file.name, parsed, text);
    if (window.trackActivity) window.trackActivity('uploads', `Uploaded &amp; analysed: ${file.name}`);
  } catch (err){
    console.error('Upload extraction error:', err);
    setProgress(0, 'Failed');
    uploadResult.innerHTML = `<div style="text-align:center;color:var(--text-mute);padding:30px 20px;">⚠️<p style="margin-top:10px;font-size:13.5px;">Could not extract text automatically (library may need an internet connection). You can still enter values manually below.</p></div>`;
    renderManualForm(file.name);
  }
}

function extractPdfText(file){
  return new Promise((resolve, reject) => {
    if (typeof pdfjsLib === 'undefined') { reject(new Error('pdf.js not loaded')); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setProgress(20, 'Parsing PDF…');
        const pdf = await pdfjsLib.getDocument({data:new Uint8Array(reader.result)}).promise;
        let text = '';
        for (let i=1; i<=pdf.numPages; i++){
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(it => it.str).join(' ') + '\n';
          setProgress(20 + (60*i/pdf.numPages), `Parsing page ${i}/${pdf.numPages}…`);
        }
        resolve(text);
      } catch(e){ reject(e); }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
function extractExcelText(file){
  return new Promise((resolve, reject) => {
    if (typeof XLSX === 'undefined') { reject(new Error('SheetJS not loaded')); return; }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setProgress(40, 'Parsing spreadsheet…');
        const wb = XLSX.read(reader.result, {type:'array'});
        let text = '';
        wb.SheetNames.forEach(name => { text += XLSX.utils.sheet_to_csv(wb.Sheets[name]) + '\n'; });
        resolve(text);
      } catch(e){ reject(e); }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
function extractImageText(file){
  return new Promise((resolve, reject) => {
    if (typeof Tesseract === 'undefined') { reject(new Error('Tesseract.js not loaded')); return; }
    setProgress(10, 'Running OCR…');
    Tesseract.recognize(file, 'eng', {
      logger: m => { if (m.status === 'recognizing text') setProgress(10 + m.progress*85, `OCR ${(m.progress*100).toFixed(0)}%…`); }
    }).then(({data:{text}}) => resolve(text)).catch(reject);
  });
}

/* ---------- Heuristic regex extraction ---------- */
function parseSoilValues(text){
  const t = text.replace(/\s+/g,' ');
  const num = (re) => { const m = t.match(re); return m ? parseFloat(m[1]) : null; };

  const sbc = num(/(?:SBC|safe\s*bearing\s*capacity)[^\d]{0,15}(\d+(?:\.\d+)?)/i);
  const density = num(/(?:density)[^\d]{0,15}(\d+(?:\.\d+)?)/i);
  const moisture = num(/(?:moisture\s*content|w\s*=)[^\d]{0,10}(\d+(?:\.\d+)?)\s*%/i);

  let soilType = null;
  const typeKeywords = ['Black Cotton','Red Soil','Red Loam','Alluvial','Laterite','Coastal Sandy','Sandy','Clay','Silt','Gravel','Hilly'];
  for (const kw of typeKeywords){ if (new RegExp(kw,'i').test(t)) { soilType = kw; break; } }

  return { sbc, density, moisture, soilType, rawFound: !!(sbc||density||moisture||soilType) };
}

function riskLevel(sbc){
  if (sbc === null) return {label:'Unknown', cls:'risk-moderate'};
  if (sbc >= 150) return {label:'Low Risk', cls:'risk-low'};
  if (sbc >= 80) return {label:'Moderate Risk', cls:'risk-moderate'};
  return {label:'High Risk', cls:'risk-high'};
}
function foundationForSbc(sbc){
  if (sbc === null) return 'Insufficient data — provide SBC or soil type for a recommendation.';
  if (sbc >= 150) return 'Isolated / spread RCC footing likely sufficient.';
  if (sbc >= 80) return 'Combined footing or raft foundation recommended; verify with bore log.';
  return 'Pile or raft foundation with ground improvement likely required.';
}

function renderExtraction(filename, p, rawText){
  const risk = riskLevel(p.sbc);
  window.lastUploadResult = p;
  uploadResult.innerHTML = `
    <h4 style="margin-bottom:16px;">Extracted Summary — ${filename}</h4>
    <div class="ai-out-item" style="padding:10px 0;border-bottom:1px solid var(--border);"><b style="font-size:11px;color:var(--emerald-400);text-transform:uppercase;">Detected Soil Type</b><div>${p.soilType || 'Not detected — please confirm manually'}</div></div>
    <div class="ai-out-item" style="padding:10px 0;border-bottom:1px solid var(--border);"><b style="font-size:11px;color:var(--emerald-400);text-transform:uppercase;">Safe Bearing Capacity</b><div>${p.sbc ? p.sbc+' kN/m²' : 'Not detected'}</div></div>
    <div class="ai-out-item" style="padding:10px 0;border-bottom:1px solid var(--border);"><b style="font-size:11px;color:var(--emerald-400);text-transform:uppercase;">Density</b><div>${p.density ? p.density+' kg/m³' : 'Not detected'}</div></div>
    <div class="ai-out-item" style="padding:10px 0;border-bottom:1px solid var(--border);"><b style="font-size:11px;color:var(--emerald-400);text-transform:uppercase;">Moisture Content</b><div>${p.moisture ? p.moisture+'%' : 'Not detected'}</div></div>
    <div class="ai-out-item" style="padding:10px 0;border-bottom:1px solid var(--border);"><b style="font-size:11px;color:var(--emerald-400);text-transform:uppercase;">Foundation Suggestion</b><div>${foundationForSbc(p.sbc)}</div></div>
    <div style="margin:14px 0;"><span class="risk-badge ${risk.cls}">${risk.label}</span></div>
    ${!p.rawFound ? '<div class="warn-line" style="color:var(--warn);font-size:12.5px;">⚠ Automatic extraction found limited data — please verify against the source document, or use manual entry below.</div>' : ''}
    <button class="btn btn-clay" style="width:100%;justify-content:center;margin-top:16px;" onclick="downloadUploadPdf('${filename.replace(/'/g,"\\'")}')">📄 Download Summary PDF</button>
    ${renderManualFormInline(p)}
  `;
}
function renderManualFormInline(p){
  return `
    <details style="margin-top:18px;">
      <summary style="cursor:pointer;font-size:12.5px;color:var(--text-mute);">Adjust / enter values manually</summary>
      <div class="form-row" style="margin-top:12px;"><label>SBC (kN/m²)</label><input type="number" id="manSbc" value="${p.sbc||''}"></div>
      <div class="form-row"><label>Density (kg/m³)</label><input type="number" id="manDensity" value="${p.density||''}"></div>
      <div class="form-row"><label>Moisture (%)</label><input type="number" id="manMoisture" value="${p.moisture||''}"></div>
      <button class="btn btn-outline btn-sm" onclick="applyManualUpload()">Update Summary</button>
    </details>`;
}
function renderManualForm(filename){
  uploadResult.innerHTML = `<h4 style="margin-bottom:14px;">Manual Entry — ${filename}</h4>${renderManualFormInline({sbc:null,density:null,moisture:null})}`;
}
window.applyManualUpload = function(){
  const p = {
    sbc: parseFloat(document.getElementById('manSbc').value) || null,
    density: parseFloat(document.getElementById('manDensity').value) || null,
    moisture: parseFloat(document.getElementById('manMoisture').value) || null,
    soilType: window.lastUploadResult ? window.lastUploadResult.soilType : null,
    rawFound: true
  };
  renderExtraction('Manual Entry', p, '');
};
window.downloadUploadPdf = function(filename){
  if (window.generateUploadPdf) window.generateUploadPdf(filename, window.lastUploadResult || {});
};
