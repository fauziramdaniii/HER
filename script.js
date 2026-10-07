// ====== Edit bagian ini saja untuk mengganti isi pesan ======
const CONFIG = {
  // Tiap item tampil satu per satu seperti bubble chat.
  messages: [
    'this is my last message to you.',
    'i think i\'m finally accepting that whatever was starting between us isn\'t going to happen.',
    'i hope my distance brings you peace. i can tell something changed, and i don\'t want to be someone you have to avoid, so i\'m stepping back now.',
    'thank you for everything. for the short time we had, and for reminding me how it feels to really look forward to someone.',
    'i want you to know that i tried. i was honest about how i felt, and i would have kept showing up if you\'d let me. but sometimes things just don\'t turn out the way we hope.',
    'we only met three times. at the concert, the day we ran into each other while cycling, and our one date.',
    'it wasn\'t much, but it meant more to me than i expected. something changed after that date, and i still don\'t know why. maybe i never will.',
    'my chapter with you ends here, but i still wish you nothing but the best. if i said or did anything that hurt you or made you uncomfortable, i\'m sorry.',
    'i hope you find what you\'re looking for. i hope you\'ll be happy.',
    'i think a part of me will still wonder what could have been. you were only in my life for a little while, but you left a mark.',
    'but it\'s time for me to let you go. i\'ll miss talking to you. i guess this is me trying to move on.',
    'not hearing from you hurts more than i thought it would. but that\'s how i know what i felt was real.',
  ],

  closing: 'even though you won\'t be in my life anymore, i\'m glad our paths crossed, even if only for a little while.', // tampil setelah bubble terakhir
  signOff: 'with love,\nFauzi Ramdani', // tanda tangan di bawah kalimat penutup

  youtubeId: 'XZfyyk0_Yqs', // ID video YouTube (bagian setelah v= di link); '' kalau tidak pakai lagu
  musicStart: 0,            // mulai dari detik ke berapa
  volume: 50,               // 0 sampai 100
};
// =============================================================

const $ = (id) => document.getElementById(id);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const stage = $('stage');
const bubble = $('bubble');
const counter = $('counter');
const progress = $('progress');
const prevBtn = $('prev');
const nextBtn = $('next');
const tapLeft = $('tapLeft');
const tapRight = $('tapRight');
const signature = $('signature');
const music = $('music');

// ---------- progress dots ----------
CONFIG.messages.forEach(() => {
  const dot = document.createElement('span');
  progress.appendChild(dot);
});

let index = 0;

function render() {
  const total = CONFIG.messages.length;
  counter.textContent = `${index + 1}/${total}`;
  prevBtn.disabled = index === 0;
  nextBtn.disabled = false;

  [...progress.children].forEach((dot, i) => dot.classList.toggle('done', i <= index));

  bubble.classList.remove('show');
  // reflow supaya transisi masuk terulang tiap ganti pesan
  void bubble.offsetWidth;
  bubble.textContent = CONFIG.messages[index];
  requestAnimationFrame(() => bubble.classList.add('show'));
}

function go(delta) {
  const total = CONFIG.messages.length;
  const nextIndex = index + delta;

  if (nextIndex >= total) {
    finish();
    return;
  }
  if (nextIndex < 0) return;

  index = nextIndex;
  render();
}

function finish() {
  stage.hidden = true;
  const closingEl = document.createElement('p');
  closingEl.className = 'closing';
  closingEl.textContent = CONFIG.closing;
  const signOffEl = document.createElement('p');
  signOffEl.className = 'sign-off';
  signOffEl.textContent = CONFIG.signOff;
  signature.replaceChildren(closingEl, signOffEl);
  signature.classList.add('show');
}

prevBtn.addEventListener('click', () => go(-1));
nextBtn.addEventListener('click', () => go(1));
tapLeft.addEventListener('click', () => go(-1));
tapRight.addEventListener('click', () => go(1));

document.addEventListener('keydown', (e) => {
  if (stage.hidden) return;
  if (e.key === 'ArrowRight' || e.key === ' ') go(1);
  if (e.key === 'ArrowLeft') go(-1);
});

// swipe kiri/kanan untuk HP
let touchX = null;
stage.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
stage.addEventListener('touchend', (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  touchX = null;
}, { passive: true });

// ---------- lagu (pemutar YouTube tersembunyi) ----------
// Pemutar dimuat sejak halaman dibuka. Suara baru dinyalakan begitu ada
// klik/tap pertama dari pengunjung, karena browser memblokir suara otomatis.
let player = null;
let playerReady = false;
let interacted = false;

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
          // mulai diam-diam (muted selalu diizinkan browser tanpa klik),
          // baru di-unmute begitu ada klik dari pengunjung
          player.mute();
          player.playVideo();
          if (interacted) unmuteMusic();
        },
        onStateChange: (e) => {
          // ulang dari musicStart, bukan dari detik 0
          if (e.data === YT.PlayerState.ENDED) {
            player.seekTo(CONFIG.musicStart, true);
            player.playVideo();
          }
          const playing = (e.data === YT.PlayerState.PLAYING || e.data === YT.PlayerState.BUFFERING) && !player.isMuted();
          music.textContent = playing ? '🔊' : '🔇';
        },
        onError: (e) => {
          console.warn('YouTube player error', e.data);
        },
      },
    });
  };

  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

function unmuteMusic() {
  if (!playerReady) return;
  player.unMute();
  player.playVideo();
  music.textContent = '🔊';
}

music.addEventListener('click', () => {
  if (!playerReady) return;
  if (player.getPlayerState() === YT.PlayerState.PLAYING && !player.isMuted()) player.pauseVideo();
  else unmuteMusic();
});

// ---------- mulai ----------
function markInteracted() {
  if (interacted) return;
  interacted = true;
  unmuteMusic();
}
document.addEventListener('click', markInteracted, { once: true });
document.addEventListener('touchend', markInteracted, { once: true });
document.addEventListener('keydown', markInteracted, { once: true });

render();
loadYouTube();
