/* =========================================================
   Contact Form — client-side only (mailto), no backend
   ========================================================= */
document.getElementById('contactSendBtn').addEventListener('click', () => {
  const name = document.getElementById('cName').value.trim();
  const email = document.getElementById('cEmail').value.trim();
  const msg = document.getElementById('cMsg').value.trim();
  if (!name || !msg){ toast('Please fill your name and message.', 'warn'); return; }
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${msg}`);
  window.location.href = `mailto:?subject=SoilSense Pro Inquiry from ${encodeURIComponent(name)}&body=${body}`;
  toast('Opening your email app…');
});
