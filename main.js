// ---------- Packages ----------
const PACKAGES = {
  home: {
    note: 'ราคารวมติดตั้งบนหลังคาเมทัลชีตหรือกระเบื้องลอนคู่ ราคาสำหรับหลังคาประเภทอื่นวิศวกรจะประเมินหลังสำรวจหน้างาน',
    items: [
      { name: 'ชุดบ้าน 5 kWp', badge: 'ออนกริด 1 เฟส', t: 2.2, img: 'home-5kwp',
        fit: 'บ้านที่ค่าไฟ 3,000–5,000 บาทต่อเดือน มีคนอยู่บ้านช่วงกลางวัน',
        specs: [['แผง N-type 580W', '9 แผง'], ['ผลิตไฟเฉลี่ย', '550 หน่วย/เดือน'], ['ประหยัดได้', '~2,300 บาท/เดือน'], ['รับประกันแผง', '30 ปี']],
        price: '159,000' },
      { name: 'ชุดบ้านไฮบริด 10 kWp', badge: 'ไฮบริด + แบตเตอรี่ 10 kWh', t: 5, img: 'home-hybrid-10kwp',
        fit: 'บ้านที่ใช้ไฟช่วงเย็นถึงกลางคืนสูง หรืออยู่ในพื้นที่ไฟตกบ่อย',
        specs: [['แผง N-type 580W', '18 แผง'], ['ผลิตไฟเฉลี่ย', '1,100 หน่วย/เดือน'], ['ประหยัดได้', '~4,600 บาท/เดือน'], ['รับประกันแบตเตอรี่', '10 ปี']],
        price: '389,000' },
      { name: 'ชุดธุรกิจ 30 kWp', badge: 'ออนกริด 3 เฟส', t: 8.2, img: 'business-30kwp',
        fit: 'ร้านค้า คลินิก และสำนักงานที่เปิดทำการช่วงกลางวัน',
        specs: [['แผง N-type 580W', '52 แผง'], ['ผลิตไฟเฉลี่ย', '3,300 หน่วย/เดือน'], ['ประหยัดได้', '~13,900 บาท/เดือน'], ['รับประกันอินเวอร์เตอร์', '10 ปี']],
        price: '690,000' },
    ],
  },
  factory: {
    note: 'สำหรับระบบตั้งแต่ 500 kWp ขึ้นไป มีทางเลือกสัญญาซื้อขายไฟ (PPA) ที่ไม่ต้องลงทุนเอง โดยจ่ายเฉพาะค่าไฟในอัตราที่ต่ำกว่าการไฟฟ้า',
    items: [
      { name: 'ชุดโรงงาน 100 kWp', badge: 'ออนกริด 3 เฟส', t: 1.2, img: 'factory-100kwp',
        fit: 'โรงงานขนาดเล็กและโกดังสินค้าที่เดินเครื่องช่วงกลางวัน',
        specs: [['แผง N-type 580W', '172 แผง'], ['ผลิตไฟเฉลี่ย', '11,000 หน่วย/เดือน'], ['ประหยัดได้', '~48,400 บาท/เดือน'], ['คืนทุนประมาณ', '3.5 ปี']],
        price: '2,050,000' },
      { name: 'ชุดโรงงาน 300 kWp', badge: 'ออนกริด พร้อมระบบกันย้อน', t: 4.2, img: 'factory-300kwp',
        fit: 'โรงงานที่ใช้ไฟต่อเนื่องสองกะ และอาคารพาณิชย์ขนาดกลาง',
        specs: [['แผง N-type 580W', '518 แผง'], ['ผลิตไฟเฉลี่ย', '33,000 หน่วย/เดือน'], ['ประหยัดได้', '~145,000 บาท/เดือน'], ['คืนทุนประมาณ', '3.2 ปี']],
        price: '5,550,000' },
      { name: 'ชุดโรงงาน 1 MWp', badge: 'ลงทุนเองหรือ PPA', t: 7.4, img: 'factory-1mwp',
        fit: 'นิคมอุตสาหกรรมและโรงงานขนาดใหญ่ที่ต้องการลดคาร์บอนตามเป้าองค์กร',
        specs: [['แผง N-type 580W', '1,724 แผง'], ['ผลิตไฟเฉลี่ย', '110,000 หน่วย/เดือน'], ['ประหยัดได้', '~484,000 บาท/เดือน'], ['ลดคาร์บอน', '~660 ตัน/ปี']],
        price: '16,900,000' },
    ],
  },
};

const pkGrid = document.getElementById('pk-grid');
const pkNote = document.getElementById('pk-note');

function renderPackages(seg) {
  const data = PACKAGES[seg];
  pkGrid.innerHTML = data.items.map((p) => `
    <article class="pk">
      <div class="pk-media media-frame" data-img="Media/packages/${p.img}.jpg" data-alt="${p.name}">
        <video src="Media/hero.mp4#t=${p.t}" muted loop playsinline preload="metadata" aria-hidden="true"></video>
        <span class="pk-badge">${p.badge}</span>
      </div>
      <h4>${p.name}</h4>
      <p class="pk-fit">${p.fit}</p>
      <dl class="pk-specs">
        ${p.specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
      </dl>
      <div class="pk-price"><span>ราคาเริ่มต้นรวมติดตั้ง</span><strong>${p.price} บาท</strong></div>
      <a class="pk-more" href="#contact">ขอรายละเอียดแพ็กเกจ <svg width="10" height="10"><use href="#i-arrow"/></svg></a>
    </article>`).join('');
  pkNote.textContent = data.note;
  pkGrid.querySelectorAll('.media-frame').forEach(initFrame);
}

// ---------- Media frames ----------
// Every photo/video frame shows a vector fallback (styles.css: .media-frame) until
// its media arrives. Final images go at the frame's data-img path (Media/packages/…,
// Media/reviews/…) and are listed in Media/images.json; only listed files are
// requested, so slots without a photo yet never produce a 404.
const availableImages = fetch('Media/images.json')
  .then((r) => (r.ok ? r.json() : []))
  .then((list) => new Set(list))
  .catch(() => new Set());

function initFrame(frame) {
  const video = frame.querySelector('video');
  if (video && video.readyState < 2) {
    frame.classList.add('is-loading');
    video.addEventListener('loadeddata', () => frame.classList.remove('is-loading'), { once: true });
    video.addEventListener('error', () => frame.classList.remove('is-loading'), { once: true });
  }
  const src = frame.dataset.img;
  if (!src) return;
  availableImages.then((list) => {
    if (!list.has(src) || !frame.isConnected) return;
    const img = document.createElement('img');
    img.className = 'frame-img';
    img.alt = frame.dataset.alt || '';
    img.decoding = 'async';
    img.addEventListener('load', () => { frame.prepend(img); frame.classList.add('has-img'); }, { once: true });
    img.src = src;
  });
}

// ---------- Calculator ----------
// Thailand averages: ~110 kWh per kWp per month, 0.5%/yr panel degradation,
// grid emission factor ~0.5 kgCO2/kWh.
const YIELD = 110;
const DEGRADE = 0.005;
const PROFILES = {
  home: {
    bill: { min: 1500, max: 30000, step: 500, value: 4500 },
    day: 50, tariff: 4.2,
    round: 0.5, minKw: 3, maxKw: 50,
    costPerKw: (kw) => (kw <= 5 ? 32000 : kw <= 10 ? 28000 : kw <= 20 ? 25000 : 23000),
  },
  factory: {
    bill: { min: 30000, max: 2000000, step: 10000, value: 250000 },
    day: 70, tariff: 4.4,
    round: 5, minKw: 30, maxKw: 1000,
    costPerKw: (kw) => (kw <= 100 ? 21000 : kw <= 300 ? 19000 : kw <= 600 ? 18000 : 17000),
  },
};

const $ = (id) => document.getElementById(id);
const bill = $('bill');
const day = $('day');
const tariff = $('tariff');
const fmt = (n, d = 0) => n.toLocaleString('th-TH', { minimumFractionDigits: d, maximumFractionDigits: d });
let calcSeg = 'home';

function money(n) {
  if (n >= 1e6) return `${fmt(n / 1e6, 2)}<small>ล้านบาท</small>`;
  return `${fmt(Math.round(n / 100) * 100)}<small>บาท</small>`;
}

function setFill(input) {
  const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
  input.style.setProperty('--fill', `${pct}%`);
}

function loadProfile(seg) {
  calcSeg = seg;
  const p = PROFILES[seg];
  Object.assign(bill, { min: p.bill.min, max: p.bill.max, step: p.bill.step });
  bill.value = p.bill.value;
  day.value = p.day;
  tariff.value = p.tariff.toFixed(2);
  calculate();
}

function calculate() {
  const p = PROFILES[calcSeg];
  const b = +bill.value;
  const share = +day.value / 100;
  const rate = Math.max(+tariff.value || p.tariff, 1);

  const units = b / rate;
  const dayUnits = units * share;
  let kw = Math.round(dayUnits / YIELD / p.round) * p.round;
  kw = Math.min(Math.max(kw, p.minKw), p.maxKw);

  const cost = kw * p.costPerKw(kw);
  const usedUnits = Math.min(kw * YIELD, dayUnits);
  const monthly = usedUnits * rate;
  const yearly = monthly * 12;

  // cumulative cash flow per year
  const flow = [];
  let cum = -cost;
  let payback = null;
  for (let y = 1; y <= 25; y++) {
    const s = yearly * Math.pow(1 - DEGRADE, y - 1);
    const prev = cum;
    cum += s;
    if (payback === null && cum >= 0) payback = y - 1 + -prev / s;
    flow.push(cum);
  }

  bill.setAttribute('aria-valuetext', `${fmt(b)} บาท`);
  $('bill-out').innerHTML = `${fmt(b)}<small>บาท</small>`;
  $('day-out').innerHTML = `${day.value}<small>%</small>`;
  const pb = $('o-payback');
  if (payback === null) {
    pb._v = undefined;
    pb.textContent = 'มากกว่า 25';
  } else {
    if (pb._v === undefined) pb._v = payback;
    tween(pb, payback, (v) => fmt(v, 1));
  }
  tween($('o-size'), kw, (v) => `${fmt(v, kw % 1 ? 1 : 0)}<small>kWp</small>`, true);
  tween($('o-cost'), cost, money, true);
  tween($('o-month'), monthly, money, true);
  tween($('o-life'), Math.max(flow[24], 0), money, true);
  setFill(bill);
  setFill(day);
  drawBars(flow);
}

const bars = $('bars');
bars.innerHTML = Array.from({ length: 25 }, () => '<div class="bar"><i></i></div>').join('');

function drawBars(flow) {
  const max = Math.max(...flow, 0);
  const min = Math.min(...flow, 0);
  const span = max - min || 1;
  const zero = (max / span) * 100; // % from top where 0 sits
  bars.style.setProperty('--zero', `${zero}%`);
  [...bars.children].forEach((el, i) => {
    const v = flow[i];
    const h = (Math.abs(v) / span) * 100;
    const bar = el.firstElementChild;
    bar.style.height = `${Math.max(h, 1)}%`;
    bar.style.top = v >= 0 ? `${zero - h}%` : `${zero}%`;
    el.classList.toggle('pos', v >= 0);
  });
}

[bill, day, tariff].forEach((el) => el.addEventListener('input', calculate));

// Numbers glide to their new value instead of jumping (and simply land under reduced motion).
const motionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => motionMQ.matches;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

function tween(el, to, render, html = false, ms = 520) {
  const from = el._v ?? to;
  el._v = to;
  cancelAnimationFrame(el._raf);
  clearTimeout(el._settle);
  const paint = (v) => { if (html) el.innerHTML = render(v); else el.textContent = render(v); };
  if (from === to || document.hidden || reduced()) return paint(to);
  // rAF pauses in background tabs; make sure the final value always lands.
  el._settle = setTimeout(() => paint(to), ms + 60);
  const t0 = performance.now();
  const step = (now) => {
    const k = Math.min((now - t0) / ms, 1);
    paint(from + (to - from) * easeOut(k));
    if (k < 1) el._raf = requestAnimationFrame(step);
  };
  el._raf = requestAnimationFrame(step);
}

// ---------- Sliding indicators ----------
function placeThumb(thumb, target) {
  if (!thumb || !target) return;
  thumb.style.width = `${target.offsetWidth}px`;
  thumb.style.transform = `translateX(${target.offsetLeft}px)`;
}

// ---------- Segmented toggles ----------
document.querySelectorAll('.seg').forEach((seg) => {
  const thumb = document.createElement('span');
  thumb.className = 'seg-thumb';
  thumb.setAttribute('aria-hidden', 'true');
  seg.prepend(thumb);
  seg._sync = () => placeThumb(thumb, seg.querySelector('[aria-pressed="true"]'));

  seg.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn || btn.getAttribute('aria-pressed') === 'true') return;
    seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    seg._sync();
    if (seg.dataset.seg === 'pk') swapPackages(btn.dataset.val);
    else loadProfile(btn.dataset.val);
  });
});

function swapPackages(val) {
  if (reduced()) return renderPackages(val);
  pkGrid.classList.add('is-swapping');
  setTimeout(() => {
    renderPackages(val);
    const cards = [...pkGrid.children];
    cards.forEach((c, i) => { c.style.transitionDelay = `${i * 70}ms`; });
    requestAnimationFrame(() => requestAnimationFrame(() => pkGrid.classList.remove('is-swapping')));
    setTimeout(() => cards.forEach((c) => { c.style.transitionDelay = ''; }), 800);
  }, 320);
}

// Package clips play while hovered.
pkGrid.addEventListener('mouseover', (e) => {
  const v = e.target.closest('.pk')?.querySelector('video');
  if (v && v.paused) v.play().catch(() => {});
});
pkGrid.addEventListener('mouseout', (e) => {
  const card = e.target.closest('.pk');
  if (card && !card.contains(e.relatedTarget)) card.querySelector('video')?.pause();
});

// ---------- Benefits accordion ----------
document.querySelectorAll('.benefit button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const open = !item.classList.contains('is-open');
    document.querySelectorAll('.benefit').forEach((b) => {
      b.classList.remove('is-open');
      b.querySelector('button').setAttribute('aria-expanded', 'false');
    });
    if (open) {
      item.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// ---------- Background video: autoplay, one shared pause control ----------
// The hero and impact clips follow one preference: the visitor's last pause/play
// choice, starting paused when the OS asks for reduced motion. Each clip only
// plays while it is on screen and the tab is visible.
const hero = document.querySelector('.hero');
const heroVideo = document.querySelector('.hero-video');
const impactVideo = document.querySelector('.impact-video');
const videoToggles = [...document.querySelectorAll('.video-toggle')];
const onScreen = new Map([[heroVideo, true], [impactVideo, false]]);
let videosPaused = reduced();

heroVideo.muted = true; // required for autoplay in every browser
impactVideo.muted = true;
// The impact clip drifts in slow motion; defaultPlaybackRate survives a reload of the source.
impactVideo.defaultPlaybackRate = 0.6;
impactVideo.playbackRate = 0.6;
// Paused visitors see a still frame, so fetch enough of the clip to paint it.
if (videosPaused) impactVideo.preload = 'auto';

function syncVideos() {
  onScreen.forEach((visible, v) => {
    if (visible && !videosPaused && !document.hidden) v.play().catch(() => {});
    else v.pause();
  });
  videoToggles.forEach((btn) => {
    btn.setAttribute('aria-pressed', String(videosPaused));
    btn.setAttribute('aria-label', videosPaused ? 'เล่นวิดีโอพื้นหลัง' : 'หยุดวิดีโอพื้นหลัง');
  });
}

videoToggles.forEach((btn) => btn.addEventListener('click', () => {
  videosPaused = !videosPaused;
  syncVideos();
}));

const videoView = new IntersectionObserver((entries) => {
  entries.forEach((e) => onScreen.set(e.target, e.isIntersecting));
  syncVideos();
}, { threshold: 0.2 });
onScreen.forEach((_, v) => videoView.observe(v));

heroVideo.addEventListener('canplay', syncVideos, { once: true });
impactVideo.addEventListener('loadedmetadata', () => { impactVideo.playbackRate = 0.6; });
// Some browsers hold autoplay until the first interaction (e.g. battery saver).
['pointerdown', 'keydown', 'scroll'].forEach((ev) => window.addEventListener(ev, syncVideos, { once: true, passive: true }));
document.addEventListener('visibilitychange', syncVideos);
motionMQ.addEventListener('change', () => { videosPaused = reduced(); syncVideos(); });
syncVideos();

// ---------- Nav: sticks after the hero, highlights the section in view ----------
const nav = document.querySelector('.nav');
const navThumb = document.querySelector('.nav-thumb');
const navLinks = [...document.querySelectorAll('.nav-links a')];

function syncNavThumb() {
  placeThumb(navThumb, navLinks.find((a) => a.getAttribute('aria-current') === 'page'));
}

// ---------- Theme ----------
// index.html sets <html data-theme> before paint. A stored choice wins; with no
// stored choice the page follows the OS setting, including live changes.
const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const themeColor = document.querySelector('meta[name="theme-color"]');
const darkMQ = window.matchMedia('(prefers-color-scheme: dark)');

function storedTheme() {
  try {
    const t = localStorage.getItem('theme');
    return t === 'light' || t === 'dark' ? t : null;
  } catch { return null; }
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeToggle.setAttribute('aria-checked', String(theme === 'dark'));
  themeColor.setAttribute('content', getComputedStyle(root).getPropertyValue('--paper').trim());
}

themeToggle.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('theme', next); } catch { /* private mode: still switches for this visit */ }
  applyTheme(next);
});
darkMQ.addEventListener('change', (e) => { if (!storedTheme()) applyTheme(e.matches ? 'dark' : 'light'); });
applyTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');

// Below 1024px the links collapse behind a menu button.
const menuBtn = document.querySelector('.menu-btn');
const menuMQ = window.matchMedia('(max-width: 1024px)');

function setMenu(open) {
  nav.classList.toggle('is-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'ปิดเมนู' : 'เปิดเมนู');
}
menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
navLinks.forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || !nav.classList.contains('is-open')) return;
  setMenu(false);
  menuBtn.focus();
});
document.addEventListener('click', (e) => {
  if (nav.classList.contains('is-open') && !nav.contains(e.target)) setMenu(false);
});
menuMQ.addEventListener('change', () => setMenu(false));

let stuck = false;
window.addEventListener('scroll', () => {
  const shouldStick = window.scrollY > hero.offsetHeight * 0.55;
  if (shouldStick !== stuck) {
    stuck = shouldStick;
    nav.classList.toggle('is-stuck', stuck);
    syncNavThumb();
  }
}, { passive: true });

const spy = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const id = `#${e.target.id}`;
    navLinks.forEach((a) => {
      if (a.getAttribute('href') === id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    syncNavThumb();
  });
}, { rootMargin: '-45% 0px -50% 0px' });
navLinks.forEach((a) => {
  const sec = document.querySelector(a.getAttribute('href'));
  if (sec) spy.observe(sec);
});

// ---------- Hero load sequence ----------
// Wait for Anuphan so the headline doesn't reflow mid-animation (capped at 700ms).
Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 700))]).then(() => {
  // Not rAF: it never fires in background tabs, which would leave the hero invisible.
  void hero.offsetWidth;
  hero.classList.add('is-ready');
  document.querySelectorAll('.seg').forEach((s) => s._sync());
  syncNavThumb();
  // Once the entrance is over, drop the hooks so hover/press respond without entrance delays.
  setTimeout(() => hero.querySelectorAll('[data-in]').forEach((el) => {
    el.removeAttribute('data-in');
    el.style.removeProperty('--d');
  }), 1700);
});

// ---------- Scroll reveal ----------
const REVEAL_GROUPS = [
  '.impact-head', '.stats',
  '.packages .split-left', '.pk-head', '.pk-grid', '.benefits',
  '.calc-top', '.calc-inputs', '.calc-out',
  '.reviews .split-left', '.rv-grid',
  '.foot-cta', '.foot-card',
];
const SINGLE_REVEALS = ['.impact-panel', '.rv-feature', '.pk-note'];

function markReveal(el, delay) {
  el.classList.add('reveal');
  el.style.setProperty('--d', `${delay}ms`);
  // Hand control back to each element's own transitions once it has arrived.
  const done = (e) => {
    if (e.target !== el || e.propertyName !== 'opacity') return;
    el.classList.remove('reveal', 'is-in');
    el.style.removeProperty('--d');
    el.removeEventListener('transitionend', done);
  };
  el.addEventListener('transitionend', done);
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    reveal(entry.target);
  });
}, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

const pendingReveals = new Set();
function reveal(box) {
  if (!pendingReveals.delete(box)) return;
  revealObserver.unobserve(box);
  (box._items || [box]).forEach((el) => el.classList.add('is-in'));
  box.dispatchEvent(new CustomEvent('revealed'));
}
function watchReveal(box) {
  pendingReveals.add(box);
  revealObserver.observe(box);
}
// Short blocks at the very bottom may never cross the trigger line: show them once the page bottoms out.
window.addEventListener('scroll', () => {
  if (!pendingReveals.size) return;
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
    [...pendingReveals].forEach(reveal);
  }
}, { passive: true });

REVEAL_GROUPS.forEach((sel) => {
  const box = document.querySelector(sel);
  if (!box) return;
  box._items = [...box.children];
  // Light stagger, capped so long groups don't trail in.
  box._items.forEach((el, i) => markReveal(el, Math.min(i, 3) * 60));
  watchReveal(box);
});
SINGLE_REVEALS.forEach((sel) => {
  const el = document.querySelector(sel);
  if (!el) return;
  markReveal(el, 0);
  watchReveal(el);
});

// Wordmark: split into letters that rise in sequence.
const wordmark = document.querySelector('.wordmark');
wordmark.innerHTML = [...wordmark.textContent].map((ch, i) =>
  `<span class="ch" style="--d:${i * 40}ms">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
watchReveal(wordmark);

// Impact stats count up when they arrive.
document.querySelector('.stats').addEventListener('revealed', () => {
  document.querySelectorAll('[data-count]').forEach((el, i) => {
    const to = +el.dataset.count;
    el._v = 0;
    el.textContent = '0';
    setTimeout(() => tween(el, to, (v) => fmt(Math.round(v)), false, 1200), reduced() ? 0 : 150 + i * 70);
  });
}, { once: true });

window.addEventListener('resize', () => {
  document.querySelectorAll('.seg').forEach((s) => s._sync());
  syncNavThumb();
});

document.querySelectorAll('.avatar[data-img], .impact-panel').forEach(initFrame);
renderPackages('home');
loadProfile('home');
