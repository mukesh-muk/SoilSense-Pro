/* =========================================================
   Report Generator — jsPDF, guarded against CDN load failure
   Exposes: window.generateDistrictPdf(d), window.generateUploadPdf(name,p)
   ========================================================= */
const rptDistrict = document.getElementById('rptDistrict');
if (rptDistrict && typeof populateDistrictSelect === 'function') populateDistrictSelect(rptDistrict);

function pdfHeader(doc, company, subtitle){
  doc.setFillColor(10,59,44); doc.rect(0,0,210,28,'F');
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(18);
  doc.text(company, 14, 17);
  doc.setFontSize(10); doc.setFont('helvetica','normal');
  doc.text(subtitle, 14, 24);
  doc.setTextColor(20,20,20);
}
function pdfSignatureBlock(doc, y){
  y = Math.max(y+16, 250);
  doc.setDrawColor(200,200,200); doc.line(14, y, 80, y);
  doc.setFontSize(9); doc.text('Engineer Signature', 14, y+5);
  doc.line(130, y, 196, y);
  doc.text('Date: ' + new Date().toLocaleDateString(), 130, y+5);
  doc.setFontSize(8); doc.setTextColor(140,140,140);
  doc.text('Preliminary reference only — not a substitute for a licensed geotechnical engineer\'s report.', 14, 290);
}
function chartToImage(canvasId, type, labels, data, colors){
  // renders a small offscreen chart and returns a base64 PNG for embedding in the PDF
  const holder = document.createElement('canvas');
  holder.width = 400; holder.height = 240; holder.id = canvasId;
  holder.style.display = 'none';
  document.body.appendChild(holder);
  const ch = new Chart(holder, {
    type, data:{labels, datasets:[{data, backgroundColor:colors, borderRadius:5, label:''}]},
    options:{ responsive:false, animation:false, plugins:{legend:{display:false}}, scales: type==='bar' ? {y:{beginAtZero:true}} : undefined }
  });
  const img = holder.toDataURL('image/png');
  ch.destroy(); holder.remove();
  return img;
}

document.getElementById('genReportBtn').addEventListener('click', () => {
  if (!window.jspdf) { toast('PDF library unavailable — needs an internet connection to load jsPDF.', 'warn'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const company = document.getElementById('rptCompany').value || 'SoilSense Pro';
  const project = document.getElementById('rptProject').value || 'Untitled Project';
  const client = document.getElementById('rptClient').value || 'N/A';
  const engineer = document.getElementById('rptEngineer').value || 'N/A';
  const districtName = rptDistrict ? rptDistrict.value : '';
  const d = districtName ? DISTRICTS.find(x => x.name === districtName) : null;
  const ai = window.lastAiResult;

  pdfHeader(doc, company, 'Soil Analysis & Foundation Recommendation Report');
  let y = 40;
  doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.text('Project Details', 14, y); y+=7;
  doc.setFont('helvetica','normal'); doc.setFontSize(10.5);
  [['Project Name', project], ['Client', client], ['Engineer', engineer], ['Date', new Date().toLocaleString()]].forEach(row=>{
    doc.text(row[0]+':', 14, y); doc.text(String(row[1]), 70, y); y+=6.5;
  });
  y += 6; doc.setDrawColor(193,121,61); doc.setLineWidth(0.6); doc.line(14, y, 196, y); y+=10;

  if (d){
    doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.text(`Soil Information — ${d.name}`, 14, y); y+=7;
    doc.setFont('helvetica','normal'); doc.setFontSize(10);
    [['Soil Type', d.soilType],['Soil Color', d.soilColor],['Density', d.density],['SBC', d.sbc],
     ['Moisture', d.moisture],['Groundwater', d.groundwater],['Foundation', d.foundation],
     ['Precaution', d.precaution],['Suitable Crops', d.crops],['Construction Notes', d.construction]].forEach(row=>{
      const lines = doc.splitTextToSize(String(row[1]), 110);
      doc.text(row[0]+':', 14, y); doc.text(lines, 70, y); y += 5.5*lines.length;
    });
    y += 4;
    if (typeof Chart !== 'undefined'){
      try {
        const sbcM = window.getDistrictSbcMid(d), densM = window.getDistrictDensityMid(d);
        const img1 = chartToImage('tmpc1','bar',['Low','Typical','High'],[sbcM*0.7,sbcM,sbcM*1.3],'#17A673');
        const img2 = chartToImage('tmpc2','bar',['Low','Typical','High'],[densM*0.92,densM,densM*1.08],'#C1793D');
        doc.text('SBC Chart (kN/m²)', 14, y+4); doc.addImage(img1,'PNG',14,y+6,85,45);
        doc.text('Density Chart (kg/m³)', 108, y+4); doc.addImage(img2,'PNG',108,y+6,85,45);
        y += 56;
      } catch(e){ console.error('Chart embed failed:', e); }
    }
  }

  if (ai){
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.text('Latest AI Assistant Recommendation', 14, y); y+=7;
    doc.setFont('helvetica','normal'); doc.setFontSize(9.5);
    const q = doc.splitTextToSize('Q: ' + ai.question, 180); doc.text(q, 14, y); y += 5.5*q.length + 2;
    const plainAnswer = ai.answer.replace(/<[^>]+>/g, ' ').replace(/\s+/g,' ').trim();
    const a = doc.splitTextToSize('A: ' + plainAnswer, 180); doc.text(a, 14, y); y += 5.5*a.length;
  }

  if (!d && !ai){
    doc.setFont('helvetica','italic'); doc.setFontSize(11); doc.setTextColor(120,120,120);
    doc.text('No district selected and no AI recommendation generated for this report.', 14, y); y+=8;
    doc.setTextColor(20,20,20);
  }

  pdfSignatureBlock(doc, y);
  doc.save((project.replace(/\s+/g,'_')||'SoilSense_Report') + '.pdf');
  if (window.trackActivity) window.trackActivity('reports', `PDF report generated: ${project}`);
  toast('PDF report downloaded.');
});
document.getElementById('printReportBtn').addEventListener('click', () => window.print());

/* ---------- Per-district quick download (from database.js / map.js) ---------- */
window.generateDistrictPdf = function(d){
  if (!window.jspdf) { toast('PDF library unavailable — needs an internet connection.', 'warn'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  pdfHeader(doc, 'SoilSense Pro', `District Soil Report — ${d.name}`);
  let y = 40;
  doc.setFont('helvetica','normal'); doc.setFontSize(10.5);
  [['Soil Type', d.soilType],['Soil Color', d.soilColor],['Density', d.density],['SBC', d.sbc],
   ['Moisture', d.moisture],['Groundwater', d.groundwater],['Foundation', d.foundation],
   ['Precaution', d.precaution],['Suitable Crops', d.crops],['Construction Notes', d.construction]].forEach(row=>{
    const lines = doc.splitTextToSize(String(row[1]), 120);
    doc.text(row[0]+':', 14, y); doc.text(lines, 65, y); y += 6*lines.length;
  });
  pdfSignatureBlock(doc, y);
  doc.save(`${d.name}_Soil_Report.pdf`);
  if (window.trackActivity) window.trackActivity('reports', `Downloaded district report: ${d.name}`);
};

/* ---------- Upload summary PDF (from upload.js) ---------- */
window.generateUploadPdf = function(filename, p){
  if (!window.jspdf) { toast('PDF library unavailable — needs an internet connection.', 'warn'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  pdfHeader(doc, 'SoilSense Pro', `Uploaded Report Summary — ${filename}`);
  let y = 40;
  doc.setFont('helvetica','normal'); doc.setFontSize(10.5);
  [['Detected Soil Type', p.soilType || 'Not detected'],
   ['SBC', p.sbc ? p.sbc+' kN/m²' : 'Not detected'],
   ['Density', p.density ? p.density+' kg/m³' : 'Not detected'],
   ['Moisture', p.moisture ? p.moisture+'%' : 'Not detected']].forEach(row=>{
    doc.text(row[0]+':', 14, y); doc.text(String(row[1]), 75, y); y += 7;
  });
  pdfSignatureBlock(doc, y);
  doc.save(`${filename.replace(/\.[^.]+$/,'')}_Summary.pdf`);
  if (window.trackActivity) window.trackActivity('reports', `Downloaded upload summary: ${filename}`);
};
