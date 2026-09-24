// ====== Edit bagian ini saja untuk mengganti isi ucapan ======
const CONFIG = {
  name: 'Syifa',
  message: [
    'Kita emang baru kenal.',
    'Katanya nama Syifa artinya penyembuh.',
    'Pantesan hariku langsung terasa lebih baik sejak kenal kamu.',
    'Maaf ya, gombalannya receh 😄',
  ],
  youtubeId: 'nyuo9-OjNNg', // ID video YouTube (bagian setelah v= di link); '' kalau tidak pakai lagu
  musicStart: 0,            // mulai dari detik ke berapa (misal 45 untuk langsung ke reff)
  volume: 60,               // 0 sampai 100
  question: 'Boleh kenalan lebih jauh?',
  yesText: 'Boleh 😊',
  noTexts: [
    'Nggak',
    'Yakin?',
    'Baru kenal udah ditolak 🥺',
    'Sekali aja deh',
    'Aku traktir es krim',
    'Please 🥺',
    'Klik yang satunya aja 👉',
  ],
  result: [
    'Yeay, makasih ya Syifa! 😊',
    'Semoga ngobrolnya lebih seru dari gombalan tadi.',
    'Salam kenal ya!',
  ],
};
// =============================================================

const $ = (id) => document.getElementById(id);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const greeting = $('greeting');
const message = $('message');
const question = $('question');
const actions = $('actions');
const yes = $('yes');
const no = $('no');
const result = $('result');

const cover = $('cover');
const openBtn = $('open');
const music = $('music');

$('coverText').textContent = `Ada pesan buat ${CONFIG.name}`;
$('coverHint').textContent = CONFIG.youtubeId ? 'Nyalakan suaranya ya 🔊' : '';
greeting.textContent = `Hai, ${CONFIG.name} 💌`;
question.textContent = CONFIG.question;
yes.textContent = CONFIG.yesText;
no.textContent = CONFIG.noTexts[0];

// ---------- typewriter ----------
// Teks yang belum diketik tetap disimpan (tak terlihat) supaya tinggi kartu tidak loncat.
function typeText(el, text, speed = 45) {
  return new Promise((resolve) => {
    const chars = Array.from(text);
    const typed = document.createElement('span');
    const rest = document.createElement('span');
    rest.className = 'rest';
    el.replaceChildren(typed, rest);

    if (reduceMotion) {
      typed.textContent = text;
      return resolve();
    }

    let i = 0;
    const tick = () => {
      i++;
      typed.textContent = chars.slice(0, i).join('');
      rest.textContent = chars.slice(i).join('');
      if (i >= chars.length) return resolve();
      const pause = /[.,?!\n]/.test(chars[i - 1]) ? speed * 6 : speed;
      setTimeout(tick, pause);
    };
    rest.textContent = text;
    tick();
  });
}

async function intro() {
  await typeText(message, CONFIG.message.join('\n'));
  question.classList.add('show');
  actions.classList.add('show');
}

// ---------- tombol "Nggak" yang kabur ----------
let dodges = 0;
let lastDodge = 0;

function dodge(event) {
  if (event && event.type === 'click') event.preventDefault();

  const now = Date.now();
  if (now - lastDodge < 200) return; // pointerdown + focus + click bisa datang beruntun
  lastDodge = now;

  const start = no.getBoundingClientRect();
  if (!no.classList.contains('floating')) {
    // pindah ke <body>: backdrop-filter pada kartu membuat position:fixed relatif ke kartu, bukan layar
    document.body.appendChild(no);
    no.style.left = `${start.left}px`;
    no.style.top = `${start.top}px`;
    no.classList.add('floating');
    void no.offsetWidth; // paksa reflow supaya lompatan pertama teranimasi
  }

  dodges++;
  no.textContent = CONFIG.noTexts[Math.min(dodges, CONFIG.noTexts.length - 1)];

  const pad = 12;
  const nw = no.offsetWidth;
  const nh = no.offsetHeight;
  const maxX = Math.max(pad, window.innerWidth - nw - pad);
  const maxY = Math.max(pad, window.innerHeight - nh - pad);
  const yesRect = yes.getBoundingClientRect();

  let x = pad;
  let y = pad;
  for (let i = 0; i < 25; i++) {
    x = pad + Math.random() * (maxX - pad);
    y = pad + Math.random() * (maxY - pad);
    const overlapsYes =
      x < yesRect.right + 16 && x + nw > yesRect.left - 16 &&
      y < yesRect.bottom + 16 && y + nh > yesRect.top - 16;
    const farEnough = Math.hypot(x - start.left, y - start.top) > 120;
    if (!overlapsYes && farEnough) break;
  }
  no.style.left = `${x}px`;
  no.style.top = `${y}px`;

  // tombol "Iya" makin besar tiap "Nggak" kabur
  yes.style.transform = `scale(${Math.min(1 + dodges * 0.08, 1.6)})`;
}

['pointerenter', 'pointerdown', 'focus', 'click'].forEach((type) => no.addEventListener(type, dodge));

window.addEventListener('resize', () => {
  if (no.classList.contains('floating')) {
    lastDodge = 0;
    dodge();
  }
});

// ---------- tombol "Iya" ----------
yes.addEventListener('click', async () => {
  const rect = yes.getBoundingClientRect();
  question.remove();
  actions.remove();
  no.remove();

  burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  [350, 800, 1300].forEach((delay) =>
    setTimeout(() => burst(Math.random() * window.innerWidth, window.innerHeight * (0.3 + Math.random() * 0.3)), delay)
  );

  await typeText(result, CONFIG.result.join('\n'), 55);
});

// ---------- confetti hati ----------
const canvas = $('confetti');
const ctx = canvas.getContext('2d');
const SYMBOLS = ['💗', '💖', '💕', '✨', '🌸'];
let particles = [];
let running = false;

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function burst(x, y) {
  if (reduceMotion) return;
  for (let i = 0; i < 60; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 10;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      size: 16 + Math.random() * 16,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.2,
      life: 1,
      symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    });
  }
  if (!running) {
    running = true;
    requestAnimationFrame(animate);
  }
}

function animate() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles = particles.filter((p) => p.life > 0 && p.y < window.innerHeight + 40);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const p of particles) {
    p.vy += 0.25;
    p.vx *= 0.99;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.life -= 0.006;

    ctx.save();
    ctx.globalAlpha = Math.max(p.life, 0);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.font = `${p.size}px serif`;
    ctx.fillText(p.symbol, 0, 0);
    ctx.restore();
  }

  if (particles.length) {
    requestAnimationFrame(animate);
  } else {
    running = false;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

// ---------- hati melayang di latar ----------
function floatHearts() {
  if (reduceMotion) return;
  const container = $('hearts');
  for (let i = 0; i < 18; i++) {
    const heart = document.createElement('span');
    heart.className = 'heart';
    heart.textContent = i % 3 === 0 ? '💕' : '💗';
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${14 + Math.random() * 22}px`;
    heart.style.animationDuration = `${8 + Math.random() * 8}s`;
    heart.style.animationDelay = `${Math.random() * 10}s`;
    container.appendChild(heart);
  }
}

// ---------- lagu (pemutar YouTube tersembunyi) ----------
// Pemutar dimuat sejak halaman dibuka, lalu diputar saat tombol "Buka" diklik,
// karena browser hanya mengizinkan suara setelah ada klik dari pengunjung.
let player = null;
let playerReady = false;
let opened = false;

function loadYouTube() {
  if (!CONFIG.youtubeId) return;

  window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player('ytPlayer', {
      width: 200,
      height: 200,
      videoId: CONFIG.youtubeId,
      playerVars: { controls: 0, playsinline: 1, rel: 0, start: CONFIG.musicStart },
      events: {
        onReady: () => {
          playerReady = true;
          player.setVolume(CONFIG.volume);
          music.hidden = false;
          if (opened) player.playVideo();
        },
        onStateChange: (e) => {
          // ulang dari musicStart, bukan dari detik 0
          if (e.data === YT.PlayerState.ENDED) {
            player.seekTo(CONFIG.musicStart, true);
            player.playVideo();
          }
          const playing = e.data === YT.PlayerState.PLAYING || e.data === YT.PlayerState.BUFFERING;
          music.textContent = playing ? '🔊' : '🔇';
        },
      },
    });
  };

  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

music.addEventListener('click', () => {
  if (!playerReady) return;
  if (player.getPlayerState() === YT.PlayerState.PLAYING) player.pauseVideo();
  else player.playVideo();
});

// ---------- mulai ----------
openBtn.addEventListener('click', () => {
  opened = true;
  cover.classList.add('hide');
  if (playerReady) player.playVideo();
  intro();
}, { once: true });

loadYouTube();
floatHearts();
