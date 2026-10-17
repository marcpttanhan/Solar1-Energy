// ---------- Content ----------
// Defaults from js/content.js; Supabase content (if configured) replaces them
// section by section once loaded. See applyContent() near the end of this file.
let content = SolarContent.resolve(null);
const { esc } = SolarContent;

// ---------- Packages ----------
const pkGrid = document.getElementById('pk-grid');
const pkNote = document.getElementById('pk-note');

let pkSeg = 'home';

// Every value is escaped: package text can come from the admin panel.
function renderPackages(seg) {
  pkSeg = seg;
  const data = content.packages[seg];
  pkGrid.innerHTML = data.items.map((p) => {
    // An admin-supplied image URL loads directly; built-in slots wait for Media/images.json.
    const img = p.image ? `data-img-src="${esc(p.image)}"` : p.slot ? `data-img="Media/packages/${esc(p.slot)}.jpg"` : '';
    return `
    <article class="pk">
      <div class="pk-media media-frame" ${img} data-alt="${esc(p.name)}">
        <video src="Media/hero.mp4#t=${p.t}" muted loop playsinline webkit-playsinline preload="metadata" disablepictureinpicture aria-hidden="true"></video>
        ${p.badge ? `<span class="pk-badge">${esc(p.badge)}</span>` : ''}
      </div>
      <h4>${esc(p.name)}</h4>
      ${p.fit ? `<p class="pk-fit">${esc(p.fit)}</p>` : ''}
      ${p.specs.length ? `<dl class="pk-specs">${p.specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
      ${p.price ? `<div class="pk-price"><span>ราคาเริ่มต้นรวมติดตั้ง</span><strong>${fmt(p.price)} บาท</strong></div>` : ''}
      <a class="pk-more" href="#contact">ขอรายละเอียดแพ็กเกจ <svg width="10" height="10"><use href="#i-arrow"/></svg></a>
    </article>`;
  }).join('');
  pkNote.textContent = data.note;
  pkNote.hidden = !data.note;
  pkGrid.querySelectorAll('.media-frame').forEach(initFrame);
}

// ---------- Projects (portfolio) ----------
// content.projects.items: the first featured item gets the large card, the rest
// fill the grid, filtered by category and shown PJ_PAGE at a time.
const pjFeature = document.getElementById('pj-feature');
const pjGrid = document.getElementById('pj-grid');
const pjCount = document.getElementById('pj-count');
const pjMore = document.getElementById('pj-more');
const pjClients = document.getElementById('pj-clients');
const PJ_PAGE = 6;
let pjFilter = 'all';
let pjExpanded = false;

const num = (n, max = 2) => n.toLocaleString('th-TH', { maximumFractionDigits: max });
const kwParts = (kw) => (kw >= 1000 ? [num(kw / 1000), 'MW'] : [num(kw), 'kW']);
const savingText = (p) => `${p.savingUpTo ? 'สูงสุด ' : ''}${num(p.saving, 0)} บาท/เดือน`;

// A failed responsive candidate falls back to the original file once; a photo
// that still fails is dropped, leaving the frame's line drawing.
function guardImage(img) {
  img.addEventListener('error', () => {
    if (img.srcset && img.dataset.full) {
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      img.src = img.dataset.full;
      return;
    }
    img.remove();
  });
}
function dropBrokenImages(root) { root.querySelectorAll('img').forEach(guardImage); }

// Built-in portfolio photos ship as 4:3 crops at 480 and 800 px (Media/projects/<name>-480.webp,
// -800.webp) next to the full-size original; anything else (admin URLs) loads as given.
const PJ_SIZES = '(max-width: 639px) calc(100vw - 32px), (max-width: 1024px) calc(50vw - 40px), 280px';
const PJ_FEATURE_SIZES = '(max-width: 767px) calc(100vw - 48px), (max-width: 1100px) 55vw, 440px';
const hasVariants = (src) => /^Media\/projects\/[\w-]+\.webp$/.test(src) && !/-(480|800)\.webp$/.test(src);

function projectImg(p, sizes = PJ_SIZES) {
  if (!p.image) return '';
  const [k, unit] = kwParts(p.kw);
  const alt = esc(`ระบบโซลาร์ ${k} ${unit} ของ${p.name} ${p.location}`);
  if (!hasVariants(p.image)) return `<img class="frame-img" src="${esc(p.image)}" alt="${alt}" loading="lazy" decoding="async">`;
  const base = p.image.slice(0, -5);
  return `<img class="frame-img" src="${base}-800.webp" srcset="${base}-480.webp 480w, ${base}-800.webp 800w" sizes="${sizes}" width="800" height="600" data-full="${esc(p.image)}" alt="${alt}" loading="lazy" decoding="async">`;
}

function renderFeature() {
  const f = content.projects.items.find((p) => p.featured);
  pjFeature.hidden = !f;
  if (!f) return null;
  const [k, unit] = kwParts(f.kw);
  const big = f.saving >= 1e6;
  pjFeature.innerHTML = `
    <div class="pj-feature-media media-frame">${projectImg(f, PJ_FEATURE_SIZES)}</div>
    <div class="pj-feature-body">
      <div>
        <p class="kicker">โครงการเด่น</p>
        <h3>${esc(f.name)}</h3>
        <p class="pj-loc">${esc(f.location)}${f.year ? `<br>ติดตั้งแล้วเสร็จปี ${f.year}` : ''}</p>
      </div>
      <div class="pj-feature-stats">
        <div><strong>${k}<small>${unit}</small></strong><span>ขนาดระบบ</span></div>
        ${f.saving ? `<div><strong>${big ? num(f.saving / 1e6) : num(f.saving, 0)}<small>${big ? 'ล้านบาท' : 'บาท'}</small></strong><span>ค่าไฟที่ลด${f.savingUpTo ? 'ได้สูงสุด' : 'ได้'}ต่อเดือน</span></div>` : ''}
      </div>
    </div>`;
  dropBrokenImages(pjFeature);
  return f;
}

function renderProjects() {
  const featured = renderFeature();
  const list = content.projects.items.filter((p) => p !== featured && (pjFilter === 'all' || p.category === pjFilter));
  const shown = pjExpanded ? list : list.slice(0, PJ_PAGE);
  pjGrid.innerHTML = shown.map((p) => {
    const [k, unit] = kwParts(p.kw);
    return `
    <article class="pj">
      <div class="pj-media media-frame">${projectImg(p)}</div>
      <h3 class="pj-name">${esc(p.name)}</h3>
      <p class="pj-loc">${esc(p.location)}</p>
      <dl class="pj-specs">
        <div><dt>ขนาดระบบ</dt><dd>${k} ${unit}</dd></div>
        ${p.saving ? `<div><dt>ลดค่าไฟ</dt><dd>${savingText(p)}</dd></div>` : ''}
        ${p.year ? `<div><dt>ติดตั้งปี</dt><dd>${p.year}</dd></div>` : ''}
      </dl>
    </article>`;
  }).join('');
  dropBrokenImages(pjGrid);
  pjCount.textContent = list.length ? `แสดง ${shown.length} จาก ${list.length} โครงการ` : 'ยังไม่มีผลงานในหมวดนี้';
  pjMore.hidden = list.length <= PJ_PAGE;
  pjMore.textContent = pjExpanded ? 'แสดงน้อยลง' : `ดูผลงานทั้งหมด ${list.length} โครงการ`;
  pjMore.setAttribute('aria-expanded', String(pjExpanded));
}

function renderClients() {
  const { clients } = content.projects;
  pjClients.innerHTML = clients.map((c) =>
    `<li><img src="${esc(c.logo)}"${c.w && c.h ? ` width="${c.w}" height="${c.h}"` : ''} alt="${esc(c.name)}" title="${esc(c.name)}" loading="lazy" decoding="async"></li>`).join('');
  pjClients.querySelectorAll('img').forEach((img) => img.addEventListener('error', () => img.parentElement.remove(), { once: true }));
  document.getElementById('pj-clients-wall').hidden = !clients.length;
}

pjMore.addEventListener('click', () => {
  pjExpanded = !pjExpanded;
  renderProjects();
  // Collapsing from far down the list: bring the grid back into view.
  if (!pjExpanded && pjGrid.getBoundingClientRect().top < 0) pjGrid.scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' });
});

function filterProjects(val) {
  pjFilter = val;
  pjExpanded = false;
  if (reduced()) return renderProjects();
  pjGrid.classList.add('is-swapping');
  setTimeout(() => {
    renderProjects();
    requestAnimationFrame(() => requestAnimationFrame(() => pjGrid.classList.remove('is-swapping')));
  }, 220);
}

// ---------- About-us figures ----------
const decimalsOf = (v) => (String(v).split('.')[1] || '').length;
let statsCounted = false;

function applyStats(stats) {
  document.querySelectorAll('.stat').forEach((el, i) => {
    const s = stats[i];
    if (!s) return;
    const n = el.querySelector('[data-count]');
    n.dataset.count = s.value;
    n._v = s.value;
    if (statsCounted) n.textContent = fmt(s.value, decimalsOf(s.value));
    const small = el.querySelector('.stat-num small');
    small.textContent = s.small;
    small.hidden = !s.small;
    el.querySelector('.stat-label').textContent = s.label;
  });
}

// ---------- Media frames ----------
// Every photo/video frame shows a vector fallback (styles.css: .media-frame) until
// its media arrives. Package photos go at the frame's data-img path (Media/packages/…)
// and are listed in Media/images.json; only listed files are requested, so slots
// without a photo yet never produce a 404.
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
  // The image goes into the frame straight away so the browser can lazy-load it;
  // until it arrives the frame's line drawing shows through. Package slots also
  // have 4:3 WebPs at 640 and 800 px (Media/packages/<slot>-640.webp, -800.webp)
  // for the card size; the full JPEG is only the fallback.
  const placeImage = (src) => {
    // A package photo replaces the card's drone clip outright (no clip on hover);
    // the frame shows its loading sweep until the photo arrives.
    const clip = frame.closest('.pk') && frame.querySelector('video');
    if (clip) {
      clip.pause();
      clip.removeAttribute('src');
      clip.load(); // stop fetching the clip
      clip.remove();
      frame.classList.add('is-loading');
    }
    const img = document.createElement('img');
    img.className = 'frame-img';
    img.alt = frame.dataset.alt || '';
    img.loading = 'lazy';
    img.decoding = 'async';
    const slot = /^Media\/packages\/[\w-]+\.jpg$/.test(src) ? src.slice(0, -4) : '';
    if (slot) {
      img.width = 640;
      img.height = 480;
      img.dataset.full = src;
      img.sizes = '(max-width: 639px) calc(100vw - 32px), (max-width: 1024px) calc(50vw - 40px), 280px';
      img.srcset = `${slot}-640.webp 640w, ${slot}-800.webp 800w`;
    }
    img.addEventListener('load', () => { frame.classList.add('has-img'); frame.classList.remove('is-loading'); }, { once: true });
    img.addEventListener('error', () => { if (!img.srcset) frame.classList.remove('is-loading'); });
    guardImage(img);
    img.src = slot ? `${slot}-640.webp` : src;
    frame.prepend(img);
  };
  if (frame.dataset.imgSrc) return placeImage(frame.dataset.imgSrc);
  const src = frame.dataset.img;
  if (!src) return;
  availableImages.then((list) => { if (list.has(src) && frame.isConnected) placeImage(src); });
}

// ---------- Calculator ----------
// Yield, degradation, tariffs and cost tiers come from content.roi (js/content.js
// defaults, or the admin panel). Cost per kWp is the first tier whose upTo covers
// the system size; the last tier is open-ended.
const costPerKw = (profile, kw) => (profile.tiers.find((t) => t.upTo === null || kw <= t.upTo) || profile.tiers[profile.tiers.length - 1]).perKw;

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
  const p = content.roi[seg];
  Object.assign(bill, { min: p.bill.min, max: p.bill.max, step: p.bill.step });
  bill.value = p.bill.value;
  day.value = p.day;
  tariff.value = p.tariff.toFixed(2);
  calculate();
}

function calculate() {
  const { yield: YIELD, degradation: DEGRADE } = content.roi;
  const p = content.roi[calcSeg];
  const b = +bill.value;
  const share = +day.value / 100;
  const rate = Math.max(+tariff.value || p.tariff, 1);

  const units = b / rate;
  const dayUnits = units * share;
  let kw = Math.round(dayUnits / YIELD / p.round) * p.round;
  kw = Math.min(Math.max(kw, p.minKw), p.maxKw);

  const cost = kw * costPerKw(p, kw);
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
    else if (seg.dataset.seg === 'pj') filterProjects(btn.dataset.val);
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
// choice (the pause button satisfies WCAG 2.2.2). Each clip only plays while it is
// on screen and the tab is visible.
const hero = document.querySelector('.hero');
const heroVideo = document.querySelector('.hero-video');
const impactVideo = document.querySelector('.impact-video');
const videoToggles = [...document.querySelectorAll('.video-toggle')];
const onScreen = new Map([[heroVideo, true], [impactVideo, false]]);
// Autoplay for everyone; only a browser that asks to save data starts paused.
const saveData = navigator.connection?.saveData === true;
let videosPaused = saveData;

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
// Some browsers block autoplay until the first interaction (iOS Low Power Mode,
// battery savers): keep retrying on interaction until the hero clip is playing.
// syncVideos swallows the play() rejection, so a refusal never breaks the page.
const PLAY_RETRY_EVENTS = ['pointerdown', 'touchend', 'click', 'keydown', 'scroll'];
PLAY_RETRY_EVENTS.forEach((ev) => window.addEventListener(ev, syncVideos, { passive: true }));
heroVideo.addEventListener('playing', () => PLAY_RETRY_EVENTS.forEach((ev) => window.removeEventListener(ev, syncVideos)), { once: true });
window.addEventListener('load', syncVideos, { once: true });
document.addEventListener('visibilitychange', syncVideos);
syncVideos();

// ---------- Nav: sticks after the hero, highlights the section in view ----------
const nav = document.querySelector('.nav');
const navThumb = document.querySelector('.nav-thumb');
const navLinks = [...document.querySelectorAll('.nav-links > a')];

function syncNavThumb() {
  placeThumb(navThumb, navLinks.find((a) => a.getAttribute('aria-current') === 'page'));
}

// ---------- Theme ----------
// index.html sets <html data-theme> before paint. A stored choice wins; with no
// stored choice the page follows the OS setting, including live changes.
const root = document.documentElement;
const themeToggles = [...document.querySelectorAll('.theme-toggle')];
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
  themeToggles.forEach((t) => t.setAttribute('aria-checked', String(theme === 'dark')));
  themeColor.setAttribute('content', getComputedStyle(root).getPropertyValue('--paper').trim());
}

themeToggles.forEach((t) => t.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('theme', next); } catch { /* private mode: still switches for this visit */ }
  applyTheme(next);
}));
darkMQ.addEventListener('change', (e) => { if (!storedTheme()) applyTheme(e.matches ? 'dark' : 'light'); });
applyTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');

// Below 640px (phones) the links collapse behind a menu button.
const menuBtn = document.querySelector('.menu-btn');
const menuMQ = window.matchMedia('(max-width: 639px)');

function setMenu(open) {
  nav.classList.toggle('is-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'ปิดเมนู' : 'เปิดเมนู');
}
menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
// Any link in the drawer (sections or the CTA) closes it.
document.querySelector('.nav-links').addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
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
// Wait for Anuphan (and, on a first visit, Supabase content) so the headline
// doesn't reflow or swap mid-animation. Capped so a slow network never blocks it.
// Assigned by the content boot at the end of this file; read in a microtask, after it has run.
let contentReady = Promise.resolve();
Promise.race([
  Promise.all([document.fonts.ready, Promise.resolve().then(() => contentReady)]),
  new Promise((r) => setTimeout(r, 900)),
]).then(() => {
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
  '.packages .split-left', '.pk-head', '.benefits',
  '.calc-top', '.calc-inputs', '.calc-out',
  '.projects .split-left',
  '.foot-cta', '.foot-card',
];
// Grids rendered later by JS (packages, portfolio) reveal as one block: their cards
// don't exist yet when this runs, and they are re-rendered on filter/content changes.
const SINGLE_REVEALS = ['.impact-panel', '.pk-grid', '.pk-note', '.pj-feature', '.pj-bar', '.pj-grid'];

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

// threshold 0: a block reveals as soon as its top crosses 90% of the viewport, so
// blocks taller than the screen (stacked cards on phones) can never miss the trigger.
const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    reveal(entry.target);
  });
}, { rootMargin: '0px 0px -10% 0px', threshold: 0 }) : null;

const pendingReveals = new Set();
function reveal(box) {
  if (!pendingReveals.delete(box)) return;
  revealObserver?.unobserve(box);
  (box._items || [box]).forEach((el) => el.classList.add('is-in'));
  box.dispatchEvent(new CustomEvent('revealed'));
}
function watchReveal(box) {
  pendingReveals.add(box);
  if (revealObserver) revealObserver.observe(box);
  else reveal(box); // no IntersectionObserver: show everything straight away
}
// Safety net, once per frame while scrolling: a fast fling can carry a short block past
// the viewport between two observer samples, so anything whose top has crossed the
// trigger line is revealed; and short blocks at the very bottom, which may never reach
// that line, show once the page bottoms out.
let revealSweep = 0;
window.addEventListener('scroll', () => {
  if (!pendingReveals.size || revealSweep) return;
  revealSweep = requestAnimationFrame(() => {
    revealSweep = 0;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    const line = window.innerHeight * 0.9;
    [...pendingReveals].forEach((box) => { if (atBottom || box.getBoundingClientRect().top < line) reveal(box); });
  });
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

// Impact stats count up when they arrive (keeping each figure's decimals, e.g. 3.5, 1.75).
document.querySelector('.stats').addEventListener('revealed', () => {
  statsCounted = true;
  document.querySelectorAll('[data-count]').forEach((el, i) => {
    const to = +el.dataset.count;
    const d = decimalsOf(el.dataset.count);
    el._v = 0;
    el.textContent = '0';
    setTimeout(() => tween(el, to, (v) => fmt(d ? v : Math.round(v), d), false, 1200), reduced() ? 0 : 150 + i * 70);
  });
}, { once: true });

window.addEventListener('resize', () => {
  document.querySelectorAll('.seg').forEach((s) => s._sync());
  syncNavThumb();
});

// ---------- Content: hero, contact, packages, calculator, projects ----------

function setText(sel, text) {
  document.querySelectorAll(sel).forEach((el) => { el.textContent = text; });
}

function applyHero(h) {
  setText('[data-c="hero.tag"]', h.tag);
  setText('[data-c="hero.subtitle"]', h.subtitle);
  setText('[data-c="hero.ctaPrimary"]', h.ctaPrimary);
  setText('[data-c="hero.ctaSecondary"]', h.ctaSecondary);
  document.querySelectorAll('.hero h1 .line').forEach((line, i) => {
    line.hidden = i >= h.lines.length;
    if (i < h.lines.length) line.firstElementChild.textContent = h.lines[i];
  });
  if (h.posterUrl) heroVideo.poster = h.posterUrl; else heroVideo.removeAttribute('poster');
  const want = new URL(h.videoUrl, document.baseURI).href;
  if ((heroVideo.currentSrc || heroVideo.querySelector('source')?.src) !== want) {
    heroVideo.querySelector('source')?.remove();
    heroVideo.src = h.videoUrl;
    heroVideo.load();
    heroVideo.addEventListener('canplay', syncVideos, { once: true });
  }
}

const telHref = (phone) => {
  const digits = phone.replace(/[^\d+]/g, '');
  return /^\+?\d{9,15}$/.test(digits) ? `tel:${digits}` : '';
};
// LINE official accounts start with "@"; personal IDs need the "~" form.
const lineHref = (id) => `https://line.me/R/ti/p/${id.startsWith('@') ? encodeURIComponent(id) : `~${encodeURIComponent(id)}`}`;
const phonesOf = (phone) => phone.split(',').map((p) => p.trim()).filter(Boolean);
const mailHref = (email) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? `mailto:${email}` : '');

function listItem(text, href) {
  const li = document.createElement('li');
  if (href) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }
    li.append(a);
  } else {
    li.textContent = text;
  }
  return li;
}

function applyContact(c) {
  document.getElementById('foot-address').replaceChildren(...c.addressLines.map((l) => listItem(l)));
  const items = [];
  phonesOf(c.phone).forEach((p) => items.push(listItem(p, telHref(p))));
  if (c.email) items.push(listItem(c.email, mailHref(c.email)));
  if (c.hours) items.push(listItem(c.hours));
  if (c.lineId) items.push(listItem(`LINE ${c.lineId}`, lineHref(c.lineId)));
  [['Facebook', c.facebook], ['Instagram', c.instagram], ['YouTube', c.youtube], ['TikTok', c.tiktok]]
    .forEach(([label, url]) => { if (url) items.push(listItem(label, url)); });
  document.getElementById('foot-contact').replaceChildren(...items);
  document.getElementById('foot-cta-btn').href = telHref(phonesOf(c.phone)[0] || '') || mailHref(c.email) || '#contact';
}

// Applies a complete content object. Sections that did not change are left
// alone, so a late Supabase response never resets what a visitor typed.
function applyContent(next, { force = false } = {}) {
  const prev = content;
  content = next;
  const changed = (k) => force || JSON.stringify(prev[k]) !== JSON.stringify(next[k]);
  if (changed('hero')) applyHero(next.hero);
  if (changed('contact')) applyContact(next.contact);
  if (changed('packages')) renderPackages(pkSeg);
  if (changed('roi')) loadProfile(calcSeg);
  if (changed('projects')) { applyStats(next.projects.stats); renderProjects(); renderClients(); }
}

document.querySelectorAll('.impact-panel').forEach(initFrame);

// First paint: last cached Supabase content (repeat visits) or the defaults.
const cached = SolarContent.readCache();
content = SolarContent.resolve(cached);
if (cached) { applyHero(content.hero); applyContact(content.contact); }
renderPackages('home');
loadProfile('home');
applyStats(content.projects.stats);
renderProjects();
renderClients();

// Then refresh from Supabase. Failures keep whatever is on screen.
contentReady = SolarContent.config()
  ? SolarContent.fetchRemote()
      .then((remote) => {
        SolarContent.writeCache(remote);
        applyContent(SolarContent.resolve(remote));
      })
      .catch((err) => { console.warn('[content] using built-in content:', err.message); })
  : Promise.resolve();
