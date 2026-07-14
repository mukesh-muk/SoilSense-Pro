/* =========================================================
   Hero — 3D parallax borehole scene + live drilling depth readout
   ========================================================= */
const heroVisual = document.getElementById('heroVisual');
const boreholeScene = document.getElementById('boreholeScene');

if (heroVisual && boreholeScene && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  heroVisual.addEventListener('mousemove', (e) => {
    const rect = heroVisual.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    boreholeScene.style.transform = `rotateY(${px*6}deg) rotateX(${-py*6}deg) scale(1.03)`;
  });
  heroVisual.addEventListener('mouseleave', () => {
    boreholeScene.style.transform = 'rotateY(0) rotateX(0) scale(1)';
  });
}

/* Live simulated depth readout, synced loosely with the CSS drill-bit bob animation */
const depthReadout = document.getElementById('depthReadout');
const rigStatus = document.getElementById('rigStatus');
if (depthReadout) {
  let depth = 0, dir = 1;
  setInterval(() => {
    depth += dir * 0.35;
    if (depth > 14.8) dir = -1;
    if (depth < 0.2) { dir = 1; }
    depthReadout.textContent = `Depth: ${depth.toFixed(1)} m`;
  }, 220);
}

/* Ambient rising dust particles inside the borehole shaft */
if (boreholeScene) {
  const spawnParticle = () => {
    const p = document.createElement('div');
    p.className = 'dust-particle';
    p.style.left = (48 + Math.random()*4) + '%';
    p.style.bottom = '10%';
    p.style.animationDuration = (2.5 + Math.random()*2) + 's';
    boreholeScene.appendChild(p);
    setTimeout(() => p.remove(), 4500);
  };
  setInterval(spawnParticle, 500);
}
