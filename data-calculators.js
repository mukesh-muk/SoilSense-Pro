/* =========================================================
   SoilSense Pro — Calculator Definitions
   Each calculator: id, category, name, fields[], formula (display string),
   compute(values) -> result, unit
   All formulas are standard geotechnical / construction engineering
   relations (IS code practice). Values are illustrative defaults.
   ========================================================= */

const CALC_CATEGORIES = [
  { id:'index', name:'Index Properties' },
  { id:'classification', name:'Classification & Compaction' },
  { id:'permeability', name:'Permeability & Seepage' },
  { id:'bearing', name:'Bearing Capacity & Foundation' },
  { id:'earthworks', name:'Earthworks & Retaining' },
  { id:'materials', name:'Construction Materials & Cost' },
  { id:'utility', name:'Unit Converter' }
];

const CALCULATORS = [
  /* ---------------- INDEX PROPERTIES ---------------- */
  { id:'soilDensity', cat:'index', name:'Soil Density (Bulk)', formula:'ρ = M / V',
    fields:[{id:'mass',label:'Mass of Soil (kg)',val:2.6},{id:'vol',label:'Volume of Soil (m³)',val:0.0015}],
    compute:v=>(v.mass/v.vol).toFixed(1), unit:'kg/m³' },

  { id:'dryDensity', cat:'index', name:'Dry Density', formula:'γd = γ / (1 + w/100)',
    fields:[{id:'bulk',label:'Bulk Density (kg/m³)',val:1850},{id:'w',label:'Moisture Content w (%)',val:12}],
    compute:v=>(v.bulk/(1+v.w/100)).toFixed(1), unit:'kg/m³' },

  { id:'moistureContent', cat:'index', name:'Moisture Content', formula:'w = (Wwet − Wdry) / Wdry × 100',
    fields:[{id:'wet',label:'Wet Sample Mass (g)',val:220},{id:'dry',label:'Dry Sample Mass (g)',val:190}],
    compute:v=>(((v.wet-v.dry)/v.dry)*100).toFixed(2), unit:'%' },

  { id:'voidRatio', cat:'index', name:'Void Ratio', formula:'e = Vv / Vs',
    fields:[{id:'vv',label:'Volume of Voids (m³)',val:0.00045},{id:'vs',label:'Volume of Solids (m³)',val:0.00105}],
    compute:v=>(v.vv/v.vs).toFixed(3), unit:'(ratio)' },

  { id:'porosity', cat:'index', name:'Porosity', formula:'n = Vv / V × 100',
    fields:[{id:'vv',label:'Volume of Voids (m³)',val:0.00045},{id:'v',label:'Total Volume (m³)',val:0.0015}],
    compute:v=>((v.vv/v.v)*100).toFixed(2), unit:'%' },

  { id:'degreeSaturation', cat:'index', name:'Degree of Saturation', formula:'S = Vw / Vv × 100',
    fields:[{id:'vw',label:'Volume of Water (m³)',val:0.0003},{id:'vv',label:'Volume of Voids (m³)',val:0.00045}],
    compute:v=>((v.vw/v.vv)*100).toFixed(2), unit:'%' },

  { id:'specificGravity', cat:'index', name:'Specific Gravity of Soil Solids', formula:'G = Ws / (Vs × γw)',
    fields:[{id:'ws',label:'Weight of Solids (N)',val:20.5},{id:'vs',label:'Volume of Solids (m³)',val:0.00105},{id:'gw',label:'Unit Weight of Water (N/m³)',val:9810}],
    compute:v=>((v.ws/(v.vs*v.gw))).toFixed(2), unit:'(G)' },

  { id:'relativeDensity', cat:'index', name:'Relative Density', formula:'Dr = (emax − e) / (emax − emin) × 100',
    fields:[{id:'emax',label:'Max Void Ratio',val:0.85},{id:'emin',label:'Min Void Ratio',val:0.42},{id:'e',label:'In-situ Void Ratio',val:0.60}],
    compute:v=>(((v.emax-v.e)/(v.emax-v.emin))*100).toFixed(1), unit:'%' },

  { id:'unitWeight', cat:'index', name:'Unit Weight', formula:'γ = W / V',
    fields:[{id:'w',label:'Weight of Sample (N)',val:26},{id:'v',label:'Volume of Sample (m³)',val:0.0015}],
    compute:v=>(v.w/v.v).toFixed(1), unit:'N/m³' },

  { id:'bulkUnitWeightSub', cat:'index', name:'Submerged Unit Weight', formula:'γ\' = γsat − γw',
    fields:[{id:'gsat',label:'Saturated Unit Weight (kN/m³)',val:19.5},{id:'gw',label:'Unit Weight of Water (kN/m³)',val:9.81}],
    compute:v=>(v.gsat-v.gw).toFixed(2), unit:'kN/m³' },

  { id:'liquidityIndex', cat:'index', name:'Liquidity Index', formula:'LI = (w − PL) / (LL − PL)',
    fields:[{id:'w',label:'Natural Moisture Content (%)',val:28},{id:'pl',label:'Plastic Limit (%)',val:20},{id:'ll',label:'Liquid Limit (%)',val:45}],
    compute:v=>(((v.w-v.pl)/(v.ll-v.pl))).toFixed(2), unit:'(LI)' },

  /* ---------------- CLASSIFICATION & COMPACTION ---------------- */
  { id:'atterberg', cat:'classification', name:'Plasticity Index (Atterberg)', formula:'PI = LL − PL',
    fields:[{id:'ll',label:'Liquid Limit (%)',val:45},{id:'pl',label:'Plastic Limit (%)',val:20}],
    compute:v=>(v.ll-v.pl).toFixed(1), unit:'%' },

  { id:'shrinkageLimit', cat:'classification', name:'Shrinkage Limit (approx.)', formula:'SL ≈ PL − PI/3 (approx. field estimate)',
    fields:[{id:'pl',label:'Plastic Limit (%)',val:20},{id:'pi',label:'Plasticity Index (%)',val:25}],
    compute:v=>(v.pl-(v.pi/3)).toFixed(1), unit:'%' },

  { id:'sieveAnalysis', cat:'classification', name:'Percentage Passing (Sieve)', formula:'% Passing = (Cumulative Mass Passing / Total Mass) × 100',
    fields:[{id:'passing',label:'Cumulative Mass Passing (g)',val:340},{id:'total',label:'Total Sample Mass (g)',val:500}],
    compute:v=>((v.passing/v.total)*100).toFixed(1), unit:'%' },

  { id:'fineness', cat:'classification', name:'Uniformity Coefficient (Cu)', formula:'Cu = D60 / D10',
    fields:[{id:'d60',label:'D60 (mm)',val:0.85},{id:'d10',label:'D10 (mm)',val:0.12}],
    compute:v=>(v.d60/v.d10).toFixed(2), unit:'(Cu)' },

  { id:'coeffCurvature', cat:'classification', name:'Coefficient of Curvature (Cc)', formula:'Cc = D30² / (D10 × D60)',
    fields:[{id:'d30',label:'D30 (mm)',val:0.35},{id:'d10',label:'D10 (mm)',val:0.12},{id:'d60',label:'D60 (mm)',val:0.85}],
    compute:v=>((v.d30*v.d30)/(v.d10*v.d60)).toFixed(2), unit:'(Cc)' },

  { id:'hydrometer', cat:'classification', name:'Hydrometer — Particle Diameter (Stokes)', formula:'D = √(18ηL / (γs−γw) t) — simplified',
    fields:[{id:'l',label:'Effective Depth L (cm)',val:10},{id:'t',label:'Elapsed Time t (min)',val:30}],
    compute:v=>(Math.sqrt((30*v.l)/v.t)*0.01).toFixed(4), unit:'mm (approx.)' },

  { id:'compactionPct', cat:'classification', name:'Compaction Percentage', formula:'% Compaction = (γd field / γd max) × 100',
    fields:[{id:'field',label:'Field Dry Density (kg/m³)',val:1780},{id:'max',label:'Max Dry Density — Proctor (kg/m³)',val:1900}],
    compute:v=>((v.field/v.max)*100).toFixed(1), unit:'%' },

  { id:'omc', cat:'classification', name:'Optimum Moisture Check (Zero Air Voids)', formula:'γd(zav) = γw / (w + 1/G)',
    fields:[{id:'w',label:'Moisture Content (decimal)',val:0.15},{id:'g',label:'Specific Gravity G',val:2.65},{id:'gw',label:'Unit Weight of Water (kN/m³)',val:9.81}],
    compute:v=>(v.gw/(v.w+1/v.g)).toFixed(2), unit:'kN/m³' },

  /* ---------------- PERMEABILITY & SEEPAGE ---------------- */
  { id:'darcyFlow', cat:'permeability', name:'Darcy Flow Rate', formula:'Q = k × i × A',
    fields:[{id:'k',label:'Permeability k (m/s)',val:0.0002},{id:'i',label:'Hydraulic Gradient i',val:0.5},{id:'a',label:'Cross-section Area (m²)',val:2}],
    compute:v=>(v.k*v.i*v.a).toExponential(3), unit:'m³/s' },

  { id:'permeabilityConstHead', cat:'permeability', name:'Permeability — Constant Head', formula:'k = QL / (Aht)',
    fields:[{id:'q',label:'Quantity of Water Q (m³)',val:0.002},{id:'l',label:'Sample Length L (m)',val:0.1},{id:'a',label:'Area A (m²)',val:0.005},{id:'h',label:'Head h (m)',val:0.4},{id:'t',label:'Time t (s)',val:120}],
    compute:v=>((v.q*v.l)/(v.a*v.h*v.t)).toExponential(3), unit:'m/s' },

  { id:'permeabilityFallHead', cat:'permeability', name:'Permeability — Falling Head', formula:'k = (a·L / A·t) × ln(h1/h2)',
    fields:[{id:'a',label:'Standpipe Area a (m²)',val:0.0001},{id:'l',label:'Sample Length L (m)',val:0.1},{id:'A',label:'Sample Area A (m²)',val:0.005},{id:'t',label:'Time t (s)',val:180},{id:'h1',label:'Initial Head h1 (m)',val:1.2},{id:'h2',label:'Final Head h2 (m)',val:0.6}],
    compute:v=>(((v.a*v.l)/(v.A*v.t))*Math.log(v.h1/v.h2)).toExponential(3), unit:'m/s' },

  { id:'seepageVelocity', cat:'permeability', name:'Seepage Velocity', formula:'vs = v / n',
    fields:[{id:'v',label:'Discharge Velocity v (m/s)',val:0.0001},{id:'n',label:'Porosity n (decimal)',val:0.4}],
    compute:v=>(v.v/v.n).toExponential(3), unit:'m/s' },

  /* ---------------- BEARING CAPACITY & FOUNDATION ---------------- */
  { id:'terzaghi', cat:'bearing', name:'Terzaghi Bearing Capacity (Strip)', formula:'qu = cNc + γDfNq + 0.5γBNγ',
    fields:[{id:'c',label:'Cohesion c (kN/m²)',val:15},{id:'nc',label:'Nc factor',val:37.2},{id:'gamma',label:'Unit Weight γ (kN/m³)',val:18},{id:'df',label:'Depth of Footing Df (m)',val:1.5},{id:'nq',label:'Nq factor',val:22.5},{id:'b',label:'Footing Width B (m)',val:1.5},{id:'ng',label:'Nγ factor',val:19.7}],
    compute:v=>(v.c*v.nc + v.gamma*v.df*v.nq + 0.5*v.gamma*v.b*v.ng).toFixed(1), unit:'kN/m²' },

  { id:'meyerhof', cat:'bearing', name:'Meyerhof SBC (simplified, cohesionless)', formula:'qu = 0.5γBNγ·sc·dc + γDfNq·sq·dq',
    fields:[{id:'gamma',label:'Unit Weight γ (kN/m³)',val:18},{id:'b',label:'Width B (m)',val:1.5},{id:'ng',label:'Nγ factor',val:15.7},{id:'df',label:'Depth Df (m)',val:1.2},{id:'nq',label:'Nq factor',val:16.4}],
    compute:v=>(0.5*v.gamma*v.b*v.ng + v.gamma*v.df*v.nq).toFixed(1), unit:'kN/m²' },

  { id:'hansen', cat:'bearing', name:'Hansen SBC (simplified)', formula:'qu = cNc·sc·dc + qNq·sq·dq + 0.5γBNγ·sγ',
    fields:[{id:'c',label:'Cohesion c (kN/m²)',val:10},{id:'nc',label:'Nc factor',val:5.14},{id:'q',label:'Overburden q (kN/m²)',val:27},{id:'nq',label:'Nq factor',val:1.0},{id:'gamma',label:'Unit Weight γ (kN/m³)',val:18},{id:'b',label:'Width B (m)',val:1.5},{id:'ng',label:'Nγ factor',val:0.0}],
    compute:v=>(v.c*v.nc + v.q*v.nq + 0.5*v.gamma*v.b*v.ng).toFixed(1), unit:'kN/m²' },

  { id:'sbcFromSPT', cat:'bearing', name:'SBC from SPT N-value (approx. IS 6403)', formula:'qu(kN/m²) ≈ 12 × N (approx., cohesionless, shallow footing)',
    fields:[{id:'n',label:'SPT N-value',val:15}],
    compute:v=>(12*v.n).toFixed(0), unit:'kN/m²' },

  { id:'foundationPressure', cat:'bearing', name:'Foundation (Contact) Pressure', formula:'q = P / A',
    fields:[{id:'p',label:'Total Load P (kN)',val:650},{id:'a',label:'Footing Area A (m²)',val:2.25}],
    compute:v=>(v.p/v.a).toFixed(1), unit:'kN/m²' },

  { id:'footingSize', cat:'bearing', name:'Isolated Footing Size', formula:'A = Load / SBC',
    fields:[{id:'load',label:'Column Load (kN)',val:600},{id:'sbc',label:'Safe Bearing Capacity (kN/m²)',val:150}],
    compute:v=>Math.sqrt(v.load/v.sbc).toFixed(2), unit:'m (square side)' },

  { id:'settlement', cat:'bearing', name:'Immediate Settlement (elastic)', formula:'Si = qB(1−μ²)If / Es',
    fields:[{id:'q',label:'Net Pressure q (kN/m²)',val:150},{id:'b',label:'Width B (m)',val:2},{id:'mu',label:'Poisson\'s Ratio μ',val:0.3},{id:'if',label:'Influence Factor If',val:0.85},{id:'es',label:'Modulus of Elasticity Es (kN/m²)',val:15000}],
    compute:v=>((v.q*v.b*(1-v.mu*v.mu)*v.if/v.es)*1000).toFixed(2), unit:'mm' },

  { id:'consolidationSettlement', cat:'bearing', name:'Consolidation Settlement', formula:'Sc = (Cc·H / (1+e0)) × log10((σ0+Δσ)/σ0)',
    fields:[{id:'cc',label:'Compression Index Cc',val:0.3},{id:'h',label:'Layer Thickness H (m)',val:3},{id:'e0',label:'Initial Void Ratio e0',val:0.9},{id:'s0',label:'Initial Effective Stress σ0 (kN/m²)',val:80},{id:'ds',label:'Stress Increase Δσ (kN/m²)',val:40}],
    compute:v=>((v.cc*v.h/(1+v.e0))*Math.log10((v.s0+v.ds)/v.s0)*1000).toFixed(1), unit:'mm' },

  { id:'pileCapacity', cat:'bearing', name:'Pile Capacity (Static, simplified)', formula:'Qu = Qp + Qs = Ap·qp + As·fs',
    fields:[{id:'ap',label:'Pile Tip Area Ap (m²)',val:0.0707},{id:'qp',label:'Unit Tip Resistance qp (kN/m²)',val:1200},{id:'as',label:'Shaft Area As (m²)',val:9.42},{id:'fs',label:'Unit Skin Friction fs (kN/m²)',val:35}],
    compute:v=>(v.ap*v.qp + v.as*v.fs).toFixed(1), unit:'kN' },

  { id:'raftFoundation', cat:'bearing', name:'Raft Foundation — Required Area', formula:'A = Total Building Load / Net SBC',
    fields:[{id:'load',label:'Total Building Load (kN)',val:9000},{id:'sbc',label:'Net Safe Bearing Capacity (kN/m²)',val:120}],
    compute:v=>(v.load/v.sbc).toFixed(1), unit:'m²' },

  { id:'footingDesignSteel', cat:'bearing', name:'Footing Flexure Steel (approx.)', formula:'Ast ≈ Mu / (0.87 fy d (1 − Ast fy/(fck b d)))  — simplified As = Mu/(0.87 fy × 0.9d)',
    fields:[{id:'mu',label:'Design Moment Mu (kN·m)',val:45},{id:'fy',label:'Steel Grade fy (N/mm²)',val:415},{id:'d',label:'Effective Depth d (mm)',val:350}],
    compute:v=>((v.mu*1e6)/(0.87*v.fy*0.9*v.d)).toFixed(0), unit:'mm² (per m width)' },

  /* ---------------- EARTHWORKS & RETAINING ---------------- */
  { id:'earthPressureActive', cat:'earthworks', name:'Active Earth Pressure (Rankine)', formula:'Pa = 0.5 Ka γ H²  (Ka = (1−sinφ)/(1+sinφ))',
    fields:[{id:'gamma',label:'Unit Weight γ (kN/m³)',val:18},{id:'h',label:'Wall Height H (m)',val:4},{id:'phi',label:'Friction Angle φ (°)',val:30}],
    compute:v=>{const ka=(1-Math.sin(v.phi*Math.PI/180))/(1+Math.sin(v.phi*Math.PI/180)); return (0.5*ka*v.gamma*v.h*v.h).toFixed(1);}, unit:'kN/m (run)' },

  { id:'earthPressurePassive', cat:'earthworks', name:'Passive Earth Pressure (Rankine)', formula:'Pp = 0.5 Kp γ H²  (Kp = (1+sinφ)/(1−sinφ))',
    fields:[{id:'gamma',label:'Unit Weight γ (kN/m³)',val:18},{id:'h',label:'Wall Height H (m)',val:4},{id:'phi',label:'Friction Angle φ (°)',val:30}],
    compute:v=>{const kp=(1+Math.sin(v.phi*Math.PI/180))/(1-Math.sin(v.phi*Math.PI/180)); return (0.5*kp*v.gamma*v.h*v.h).toFixed(1);}, unit:'kN/m (run)' },

  { id:'retainingWallStability', cat:'earthworks', name:'Retaining Wall — Factor of Safety (Overturning)', formula:'FoS = Resisting Moment / Overturning Moment',
    fields:[{id:'mr',label:'Resisting Moment (kN·m)',val:180},{id:'mo',label:'Overturning Moment (kN·m)',val:65}],
    compute:v=>(v.mr/v.mo).toFixed(2), unit:'(FoS, >1.5 typically required)' },

  { id:'slopeStability', cat:'earthworks', name:'Infinite Slope Stability (Factor of Safety)', formula:'FoS = (c + γH cos²β tanφ) / (γH sinβ cosβ)',
    fields:[{id:'c',label:'Cohesion c (kN/m²)',val:10},{id:'gamma',label:'Unit Weight γ (kN/m³)',val:18},{id:'h',label:'Slope Depth H (m)',val:3},{id:'beta',label:'Slope Angle β (°)',val:25},{id:'phi',label:'Friction Angle φ (°)',val:28}],
    compute:v=>{const b=v.beta*Math.PI/180, p=v.phi*Math.PI/180; const num=v.c+v.gamma*v.h*Math.cos(b)*Math.cos(b)*Math.tan(p); const den=v.gamma*v.h*Math.sin(b)*Math.cos(b); return (num/den).toFixed(2);}, unit:'(FoS)' },

  { id:'excavationVolume', cat:'earthworks', name:'Excavation Volume', formula:'V = L × W × D',
    fields:[{id:'l',label:'Length (m)',val:12},{id:'w',label:'Width (m)',val:9},{id:'d',label:'Depth (m)',val:1.5}],
    compute:v=>(v.l*v.w*v.d).toFixed(2), unit:'m³' },

  { id:'fillVolume', cat:'earthworks', name:'Fill Volume (with compaction factor)', formula:'Vfill = Vcut × Shrinkage Factor',
    fields:[{id:'vcut',label:'Cut Volume (m³)',val:200},{id:'sf',label:'Shrinkage Factor',val:0.9}],
    compute:v=>(v.vcut*v.sf).toFixed(1), unit:'m³' },

  { id:'earthworkCutFill', cat:'earthworks', name:'Net Earthwork (Cut − Fill)', formula:'Net = Cut − Fill',
    fields:[{id:'cut',label:'Cut Volume (m³)',val:420},{id:'fill',label:'Fill Volume (m³)',val:310}],
    compute:v=>(v.cut-v.fill).toFixed(1), unit:'m³ (+cut / −fill)' },

  /* ---------------- MATERIALS & COST ---------------- */
  { id:'pccQuantity', cat:'materials', name:'PCC Quantity (1:4:8 approx.)', formula:'Cement:Sand:Aggregate ratio applied to volume',
    fields:[{id:'vol',label:'PCC Volume (m³)',val:5}],
    compute:v=>{const dry=v.vol*1.54; const cement=(dry*1/13).toFixed(2); return cement;}, unit:'m³ cement (approx., of total dry vol.)' },

  { id:'concreteVolume', cat:'materials', name:'Concrete Volume', formula:'V = L × W × H',
    fields:[{id:'l',label:'Length (m)',val:5},{id:'w',label:'Width (m)',val:0.3},{id:'h',label:'Height (m)',val:0.45}],
    compute:v=>(v.l*v.w*v.h).toFixed(3), unit:'m³' },

  { id:'steelWeight', cat:'materials', name:'Steel Bar Weight', formula:'W = (D² / 162) × L  (D in mm, L in m)',
    fields:[{id:'d',label:'Bar Diameter D (mm)',val:12},{id:'l',label:'Total Length (m)',val:100}],
    compute:v=>(((v.d*v.d)/162)*v.l).toFixed(1), unit:'kg' },

  { id:'brickCalculator', cat:'materials', name:'Brick Calculator (per m³ wall)', formula:'Bricks = Wall Volume / (Brick Volume + Mortar allowance)',
    fields:[{id:'vol',label:'Wall Volume (m³)',val:10},{id:'brickVol',label:'Brick+Mortar Unit Volume (m³)',val:0.002}],
    compute:v=>Math.round(v.vol/v.brickVol), unit:'bricks (approx.)' },

  { id:'sandCalculator', cat:'materials', name:'Sand Quantity (for mortar 1:6)', formula:'Sand = Dry Volume × (6/7)',
    fields:[{id:'dryvol',label:'Dry Mortar Volume (m³)',val:2}],
    compute:v=>(v.dryvol*6/7).toFixed(2), unit:'m³' },

  { id:'cementCalculator', cat:'materials', name:'Cement Bags (M20 approx.)', formula:'Cement (kg) = Dry Vol × ratio × 1440; Bags = kg/50',
    fields:[{id:'vol',label:'Concrete Volume (m³)',val:1},{id:'ratio',label:'Cement Ratio (e.g. 1/5.5)',val:0.182}],
    compute:v=>(((v.vol*1.54*v.ratio*1440)/50)).toFixed(1), unit:'bags' },

  { id:'aggregateCalculator', cat:'materials', name:'Coarse Aggregate Quantity (M20 approx.)', formula:'Aggregate = Dry Vol × (3/5.5)',
    fields:[{id:'vol',label:'Concrete Volume (m³)',val:1}],
    compute:v=>((v.vol*1.54)*(3/5.5)).toFixed(2), unit:'m³' },

  { id:'waterRequirement', cat:'materials', name:'Water Requirement (W/C ratio)', formula:'Water = Cement Weight × W/C ratio',
    fields:[{id:'cementKg',label:'Cement Weight (kg)',val:300},{id:'wc',label:'Water-Cement Ratio',val:0.45}],
    compute:v=>(v.cementKg*v.wc).toFixed(1), unit:'litres' },

  { id:'constructionCost', cat:'materials', name:'Approx. Construction Cost', formula:'Cost = Built-up Area × Rate/sqft',
    fields:[{id:'area',label:'Built-up Area (sq.ft)',val:1500},{id:'rate',label:'Rate (₹/sq.ft)',val:1900}],
    compute:v=>(v.area*v.rate).toLocaleString('en-IN'), unit:'₹ (indicative)' },

  { id:'materialEstimator', cat:'materials', name:'Plaster Material (12mm, 1:6)', formula:'Volume = Area × Thickness; apply mix ratio',
    fields:[{id:'area',label:'Plaster Area (m²)',val:100},{id:'thick',label:'Thickness (m)',val:0.012}],
    compute:v=>((v.area*v.thick*1.3)).toFixed(2), unit:'m³ (wet+dry allowance)' },

  { id:'footingConcreteCost', cat:'materials', name:'Footing Concrete Cost (approx.)', formula:'Cost = Volume × Rate/m³',
    fields:[{id:'vol',label:'Concrete Volume (m³)',val:3},{id:'rate',label:'Rate (₹/m³)',val:6500}],
    compute:v=>(v.vol*v.rate).toLocaleString('en-IN'), unit:'₹ (indicative)' },

  /* ---------------- UNIT CONVERTER ---------------- */
  { id:'kNm2_to_kgcm2', cat:'utility', name:'kN/m² → kg/cm²', formula:'kg/cm² = kN/m² × 0.0102',
    fields:[{id:'v',label:'Value (kN/m²)',val:150}], compute:v=>(v.v*0.0102).toFixed(3), unit:'kg/cm²' },

  { id:'kgcm2_to_kNm2', cat:'utility', name:'kg/cm² → kN/m²', formula:'kN/m² = kg/cm² × 98.0665',
    fields:[{id:'v',label:'Value (kg/cm²)',val:1.5}], compute:v=>(v.v*98.0665).toFixed(1), unit:'kN/m²' },

  { id:'m_to_ft', cat:'utility', name:'Metres → Feet', formula:'ft = m × 3.28084',
    fields:[{id:'v',label:'Value (m)',val:10}], compute:v=>(v.v*3.28084).toFixed(2), unit:'ft' },

  { id:'sqm_to_sqft', cat:'utility', name:'Sq.m → Sq.ft', formula:'sqft = sqm × 10.7639',
    fields:[{id:'v',label:'Value (m²)',val:100}], compute:v=>(v.v*10.7639).toFixed(1), unit:'sq.ft' },

  { id:'cum_to_cft', cat:'utility', name:'Cu.m → Cu.ft', formula:'cft = cum × 35.3147',
    fields:[{id:'v',label:'Value (m³)',val:10}], compute:v=>(v.v*35.3147).toFixed(1), unit:'cu.ft' },

  { id:'kg_to_kN', cat:'utility', name:'kg (force) → kN', formula:'kN = kg × 0.00981',
    fields:[{id:'v',label:'Value (kg)',val:5000}], compute:v=>(v.v*0.00981).toFixed(2), unit:'kN' }
];
