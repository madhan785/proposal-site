// ============================================================
// SETUP / LOADER
// ============================================================
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
    [initFloatingHearts, initPetals, initFireflyDecor, initLanterns].forEach(fn => {
      try{ fn(); } catch(err){ console.error(fn.name + ' failed:', err); }
    });
  }, 1200);
});

// safety net: if the load event already fired before this script ran
// (rare, but possible with some VS Code preview tools), hide the loader anyway
if (document.readyState === 'complete'){
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
  }, 1200);
}

const pages = Array.from(document.querySelectorAll('.page'));
let isTransitioning = false;

function goToPage(pageNumber){
  try{
    if (isTransitioning) return;
    const current = document.querySelector('.page.active');
    const next = document.getElementById('page-' + pageNumber);
    if (!next || next === current) return;
    isTransitioning = true;

    if (current){
      // keep 'active' (so display:flex holds) while the fade-out animation plays
      current.classList.remove('entering');
      current.classList.add('leaving');
    }

    const delay = current ? 700 : 0;
    setTimeout(() => {
      try{
        if (current){
          current.classList.remove('active', 'leaving');
        }
        next.classList.add('active', 'entering');
        setTimeout(() => next.classList.remove('entering'), 1150);
        runPageEnterEffects(pageNumber);
      } finally {
        isTransitioning = false;
      }
    }, delay);
  } catch(err){
    console.error('goToPage error:', err);
    isTransitioning = false;
  }
}

// ============================================================
// SOUND TOGGLE (drop your own file at assets/music.mp3)
// ============================================================
const soundBtn = document.getElementById('sound-toggle');
const bgMusic = document.getElementById('bg-music');
let soundOn = false;
soundBtn.addEventListener('click', () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? '🔊' : '🔇';
  if (soundOn){
    bgMusic.volume = 0.5;
    bgMusic.play().catch(() => {
      // no audio file present yet — fails silently
    });
  } else {
    bgMusic.pause();
  }
});

// ============================================================
// PAGE 1 — ENVELOPE
// ============================================================
const envelope = document.getElementById('envelope');
const openHeartBtn = document.getElementById('open-heart-btn');
openHeartBtn.addEventListener('click', () => {
  envelope.classList.add('open');
  spawnHeartBurst(window.innerWidth / 2, window.innerHeight / 2 - 60, 24);
  if (soundOn) bgMusic.play().catch(() => {});
  setTimeout(() => goToPage(2), 1400);
});

// ============================================================
// PAGE 2 — THE DODGING NO BUTTON + YES BUTTON GROWTH
// ============================================================
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const buttonRow = document.getElementById('proposal-buttons');
const dodgeMessage = document.getElementById('dodge-message');
let yesScale = 1;
let noBtnPos = { left: null, top: null };

const dodgeLines = [
  "Not this one 😄",
  "You deserve only YES ❤️",
  "Nice try 😂",
  "You can't escape destiny 💕",
  "Love already chose us ❤️"
];

function growYesButton(){
  yesScale = Math.min(yesScale + 0.06, 1.6);
  yesBtn.style.transform = `scale(${yesScale})`;
  yesBtn.style.boxShadow = `0 8px ${30 + yesScale * 20}px rgba(255,92,138,${0.4 + yesScale * 0.1})`;
}
const yesGrowInterval = setInterval(() => {
  if (document.getElementById('page-2').classList.contains('active')) growYesButton();
}, 900);

function dodgeNoButton(){
  try{
    const rowRect = buttonRow.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    const maxLeft = rowRect.width - btnRect.width;
    const maxTop = 90 - btnRect.height;

    const newLeft = Math.random() * Math.max(maxLeft, 40) - 40;
    const newTop = (Math.random() - 0.5) * Math.max(maxTop, 60);
    const rotation = (Math.random() - 0.5) * 60;
    const shrink = 0.6 + Math.random() * 0.3;

    noBtn.style.position = 'relative';
    noBtn.style.left = newLeft + 'px';
    noBtn.style.top = newTop + 'px';
    noBtn.style.transform = `rotate(${rotation}deg) scale(${shrink})`;

    dodgeMessage.textContent = dodgeLines[Math.floor(Math.random() * dodgeLines.length)];
  } catch(err){
    console.error('dodgeNoButton error:', err);
  }
}

// desktop: dodge on hover / mouse proximity
noBtn.addEventListener('mouseenter', dodgeNoButton);
noBtn.addEventListener('pointermove', () => { if (Math.random() > 0.7) dodgeNoButton(); });
// mobile: dodge on touchstart before tap registers
noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); dodgeNoButton(); }, { passive: false });
// safety net: if somehow clicked, still dodge instead of "succeeding"
noBtn.addEventListener('click', (e) => { e.preventDefault(); dodgeNoButton(); });

yesBtn.addEventListener('click', () => {
  clearInterval(yesGrowInterval);
  playExplosion();
});

function playExplosion(){
  spawnHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 60);
  fireConfetti();
  document.getElementById('page-2').style.transition = 'background 1.2s ease';
  setTimeout(() => goToPage(3), 1900);
}

// ============================================================
// GENERIC "NEXT" BUTTONS
// ============================================================
document.querySelectorAll('.next-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const pageEl = e.target.closest('.page');
    const num = parseInt(pageEl.dataset.page, 10);
    goToPage(num + 1);
  });
});

// ============================================================
// PAGE ENTER EFFECTS (typewriters, per-page setup)
// ============================================================
function runPageEnterEffects(pageNumber){
  if (pageNumber === 3) runTypewriter(document.querySelector('#page-3 .typewriter'), 45);
  if (pageNumber === 7) runTypewriterSlow(document.querySelector('#page-7 .typewriter-slow'));
  if (pageNumber === 9) runFinale();
}

// simple line-by-line typewriter for the Chennai chapter
function runTypewriter(el, speed){
  if (!el || el.dataset.done) return;
  const lines = el.dataset.lines.split('|');
  el.innerHTML = '';
  let lineIndex = 0;

  function typeLine(){
    if (lineIndex >= lines.length){ el.dataset.done = 'true'; return; }
    const p = document.createElement('p');
    p.style.opacity = '1';
    el.appendChild(p);
    const text = lines[lineIndex];
    let charIndex = 0;
    const timer = setInterval(() => {
      p.textContent += text[charIndex];
      charIndex++;
      if (charIndex >= text.length){
        clearInterval(timer);
        lineIndex++;
        setTimeout(typeLine, 500);
      }
    }, speed);
  }
  typeLine();
}

// slower, one-line-at-a-time reveal for the galaxy chapter (fade, not char-typing)
function runTypewriterSlow(el){
  if (!el || el.dataset.done) return;
  const lines = el.dataset.lines.split('|');
  el.innerHTML = '';
  lines.forEach((line, i) => {
    const p = document.createElement('p');
    p.textContent = line;
    p.style.opacity = '0';
    p.style.animation = `fade-up 1s cubic-bezier(.22,1,.36,1) forwards`;
    p.style.animationDelay = (i * 1.4) + 's';
    el.appendChild(p);
  });
  el.dataset.done = 'true';
}

// ============================================================
// FINALE SEQUENCE (page 9)
// ============================================================
function runFinale(){
  const container = document.getElementById('finale-lines');
  if (container.dataset.done) return;
  const lines = [
    "You became my favourite hello…",
    "and my hardest goodbye.",
    "You are my peace.",
    "You are my happiness.",
    "You are my home.",
    "No matter how much time passes…",
    "my heart will always choose you.",
    "I don't know what tomorrow brings…",
    "but I know…",
    "I want every tomorrow to have you in it."
  ];
  container.innerHTML = '';
  lines.forEach((line, i) => {
    const p = document.createElement('p');
    p.textContent = line;
    p.style.animationDelay = (1.5 + i * 1.1) + 's';
    container.appendChild(p);
  });
  container.dataset.done = 'true';

  const finalAsk = document.getElementById('final-ask');
  const signature = document.getElementById('signature');
  const askDelay = 1.5 + lines.length * 1.1 + 0.6;
  finalAsk.style.animation = `fade-up 1.2s cubic-bezier(.22,1,.36,1) forwards`;
  finalAsk.style.animationDelay = askDelay + 's';
  signature.style.animation = `fade-up 1.2s cubic-bezier(.22,1,.36,1) forwards`;
  signature.style.animationDelay = (askDelay + 1.6) + 's';

  fireConfetti();
  setTimeout(fireConfetti, (askDelay + 1.6) * 1000);
  runFireworks();
}

// ============================================================
// FLOATING HEARTS BACKGROUND (page 2)
// ============================================================
function initFloatingHearts(){
  const layer = document.querySelector('.floating-hearts-bg');
  if (!layer) return;
  const emojis = ['❤️','💕','🌹','💗'];
  setInterval(() => {
    if (!document.getElementById('page-2').classList.contains('active')) return;
    const span = document.createElement('span');
    span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    span.style.left = Math.random() * 100 + '%';
    span.style.animationDuration = (6 + Math.random() * 6) + 's';
    span.style.fontSize = (1 + Math.random() * 1.4) + 'rem';
    layer.appendChild(span);
    setTimeout(() => span.remove(), 13000);
  }, 500);
}

// ============================================================
// PETALS (used on pages 4 and 8)
// ============================================================
function initPetals(){
  const layers = document.querySelectorAll('.petals-layer');
  if (!layers.length) return;
  setInterval(() => {
    layers.forEach(layer => {
      const pageEl = layer.closest('.page');
      if (!pageEl.classList.contains('active')) return;
      const span = document.createElement('span');
      span.textContent = Math.random() > 0.5 ? '🌸' : '🌺';
      span.style.left = Math.random() * 100 + '%';
      span.style.animationDuration = (5 + Math.random() * 5) + 's';
      layer.appendChild(span);
      setTimeout(() => span.remove(), 10000);
    });
  }, 400);
}

// ============================================================
// FIREFLY DECOR (page 8, static ambient dots)
// ============================================================
function initFireflyDecor(){
  const layer = document.querySelector('.fireflies-decor');
  if (!layer) return;
  for (let i = 0; i < 18; i++){
    const span = document.createElement('span');
    span.style.left = Math.random() * 100 + '%';
    span.style.top = Math.random() * 100 + '%';
    span.style.animationDelay = (Math.random() * 6) + 's';
    layer.appendChild(span);
  }
}

// ============================================================
// LANTERNS (page 6)
// ============================================================
function initLanterns(){
  const layer = document.querySelector('.lanterns');
  if (!layer) return;
  for (let i = 0; i < 8; i++){
    const span = document.createElement('span');
    span.textContent = '🏮';
    span.style.left = (10 + i * 11) + '%';
    span.style.top = (10 + Math.random() * 20) + '%';
    span.style.animationDelay = (Math.random() * 4) + 's';
    layer.appendChild(span);
  }
}

// ============================================================
// FIREFLY CURSOR TRAIL (signature element — every page)
// ============================================================
const fireflyCanvas = document.getElementById('firefly-canvas');
const fctx = fireflyCanvas.getContext('2d');
let fw = fireflyCanvas.width = window.innerWidth;
let fh = fireflyCanvas.height = window.innerHeight;
window.addEventListener('resize', () => {
  fw = fireflyCanvas.width = window.innerWidth;
  fh = fireflyCanvas.height = window.innerHeight;
});

let mouseX = fw / 2, mouseY = fh / 2;
let fireflyParticles = [];
window.addEventListener('pointermove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  if (Math.random() > 0.5){
    fireflyParticles.push({
      x: mouseX + (Math.random() - 0.5) * 12,
      y: mouseY + (Math.random() - 0.5) * 12,
      life: 1,
      r: 1.5 + Math.random() * 2
    });
  }
});

function animateFireflies(){
  fctx.clearRect(0, 0, fw, fh);
  fireflyParticles.forEach(p => {
    p.life -= 0.015;
    p.y -= 0.3;
    fctx.beginPath();
    fctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    fctx.fillStyle = `rgba(232,184,109,${Math.max(p.life, 0) * 0.8})`;
    fctx.shadowColor = 'rgba(232,184,109,0.8)';
    fctx.shadowBlur = 8;
    fctx.fill();
  });
  fireflyParticles = fireflyParticles.filter(p => p.life > 0);
  requestAnimationFrame(animateFireflies);
}
animateFireflies();

// ============================================================
// HEART BURST (envelope open + YES explosion)
// ============================================================
function spawnHeartBurst(x, y, count){
  const layer = document.createElement('div');
  layer.style.position = 'fixed';
  layer.style.inset = '0';
  layer.style.pointerEvents = 'none';
  layer.style.zIndex = '150';
  document.body.appendChild(layer);

  for (let i = 0; i < count; i++){
    const heart = document.createElement('span');
    heart.textContent = '❤️';
    heart.style.position = 'absolute';
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    heart.style.fontSize = (1 + Math.random() * 1.5) + 'rem';
    heart.style.opacity = '1';
    const angle = Math.random() * Math.PI * 2;
    const distance = 100 + Math.random() * 250;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    heart.style.transition = `transform 1.4s cubic-bezier(.22,1,.36,1), opacity 1.4s ease`;
    layer.appendChild(heart);
    requestAnimationFrame(() => {
      heart.style.transform = `translate(${dx}px, ${dy}px) rotate(${(Math.random() - 0.5) * 180}deg)`;
      heart.style.opacity = '0';
    });
  }
  setTimeout(() => layer.remove(), 1600);
}

// ============================================================
// CONFETTI (lightweight canvas confetti, no external library)
// ============================================================
function fireConfetti(){
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.zIndex = '160';
  canvas.style.pointerEvents = 'none';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const colors = ['#ff8a65', '#e8b86d', '#f7c6d9', '#ff5c8a', '#fff8f0'];
  const pieces = Array.from({ length: 140 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.5,
    w: 6 + Math.random() * 6,
    h: 10 + Math.random() * 6,
    speed: 2 + Math.random() * 4,
    drift: (Math.random() - 0.5) * 2,
    rot: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 10,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));

  let frame = 0;
  function animate(){
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y += p.speed;
      p.x += p.drift;
      p.rot += p.rotSpeed;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (frame < 220){
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }
  animate();
}

// ============================================================
// FIREWORKS (finale page)
// ============================================================
function runFireworks(){
  const canvas = document.getElementById('finale-canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  let particles = [];

  function launchFirework(){
    const x = canvas.width * (0.2 + Math.random() * 0.6);
    const y = canvas.height * (0.2 + Math.random() * 0.35);
    const colors = ['#ff8a65', '#e8b86d', '#f7c6d9', '#ff5c8a'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 40; i++){
      const angle = (Math.PI * 2 * i) / 40;
      const speed = 2 + Math.random() * 3;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color
      });
    }
  }

  let fireworkInterval = setInterval(() => {
    if (!document.getElementById('page-9').classList.contains('active')){
      clearInterval(fireworkInterval);
      return;
    }
    launchFirework();
  }, 1000);

  function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.03;
      p.life -= 0.012;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
    particles = particles.filter(p => p.life > 0);
    if (document.getElementById('page-9').classList.contains('active')){
      requestAnimationFrame(animate);
    }
  }
  launchFirework();
  animate();
}
