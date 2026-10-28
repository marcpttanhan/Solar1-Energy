// Generates the route pages (/residential, /commercial, /projects, /locations/nakhon-pathom)
// as static HTML, so search engines see the full content without running JavaScript.
//
// Content comes from the built-in defaults in js/content.js (the same data the homepage
// renders: packages, portfolio, figures, contact). Re-run after changing that content:
//   node .claude/gen-pages.js
// Edits made only in the admin panel (Supabase) do not reach these pages until the
// defaults are updated to match and this script is run again.
//
// The inline theme script is copied byte-for-byte from index.html, so the CSP hash in
// vercel.json stays valid (check with: node .claude/csp-hash.js residential/index.html).
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://solar1-energy.vercel.app';
// Draft: crawlers ignore the pages while the UI is polished. When they go live, set this to
// false, re-run, and add the four URLs back to sitemap.xml.
const DRAFT = true;

// ---------- data ----------
const ctx = { window: {}, console, URL };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/content.js'), 'utf8'), ctx);
const C = ctx.window.SolarContent;
const D = C.defaults();
const packages = C.normalize('packages', D.packages);
const projects = C.normalize('projects', D.projects);
const contact = C.normalize('contact', D.contact);

const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').replace(/\r\n/g, '\n');
const THEME = index.match(/  <script>\n[\s\S]*?<\/script>\n/)[0];
const BUSINESS_LD = index.match(/  <script type="application\/ld\+json">\n[\s\S]*?<\/script>\n/)[0];
// Icon sprite, social pills and the HQ map card are copied from the homepage.
const SPRITE = index.match(/<svg width="0" height="0"[\s\S]*?<\/svg>\n/)[0];
const SOCIAL = index.match(/<ul class="social" id="foot-social"[\s\S]*?<\/ul>/)[0].replace(' id="foot-social"', '');
const MAP_CARD = index.match(/      <div class="foot-map">\n[\s\S]*?\n      <\/div>\n(?=      <div class="foot-legal">)/)[0];
const MAPS_URL = index.match(/"hasMap": "([^"]+)"/)[1];
const MAP_EMBED = MAP_CARD.match(/<iframe[^>]*><\/iframe>/)[0];

// ---------- helpers (formatting mirrors main.js) ----------
const esc = C.esc;
const num = (n, max = 2) => n.toLocaleString('th-TH', { maximumFractionDigits: max });
const kwParts = (kw) => (kw >= 1000 ? [num(kw / 1000), 'MW'] : [num(kw), 'kW']);
const savingText = (p) => `${p.savingUpTo ? 'สูงสุด ' : ''}${num(p.saving, 0)} บาท/เดือน`;
const phones = contact.phone.split(',').map((p) => p.trim()).filter(Boolean);
const tel = (p) => `tel:${p.replace(/[^\d+]/g, '')}`;
const LINE_URL = C.lineUrl(contact.lineId);
const ARROW = '<span class="btn-ico"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 9 9 3M4 3h5v5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
const ARROW_SM = '<svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 9 9 3M4 3h5v5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const missing = [];
const asset = (rel) => { if (!fs.existsSync(path.join(ROOT, rel))) missing.push(rel); return `/${rel}`; };

const CAT = { industry: 'โรงงานและฟาร์ม', business: 'อาคารธุรกิจ', home: 'บ้านพักอาศัย' };
const byCat = (cat) => projects.items.filter((p) => p.category === cat);
const featured = projects.items.find((p) => p.featured);

// ---------- building blocks ----------
const SIZES = {
  hero: '(max-width: 1024px) calc(100vw - 32px), 620px',
  pj: '(max-width: 639px) calc(100vw - 32px), (max-width: 1024px) calc(50vw - 40px), (max-width: 1100px) calc(33vw - 32px), 320px',
  feature: '(max-width: 767px) calc(100vw - 48px), 720px',
  pk: '(max-width: 639px) calc(100vw - 32px), (max-width: 1100px) calc(50vw - 40px), 430px',
};

function projectImg(p, sizes, { eager = false } = {}) {
  const base = p.image.replace(/\.webp$/, '');
  const [k, unit] = kwParts(p.kw);
  const alt = esc(`ระบบโซลาร์ ${k} ${unit} ของ${p.name} ${p.location}`);
  asset(p.image);
  return `<img class="frame-img" src="${asset(`${base}-800.webp`)}" srcset="${asset(`${base}-480.webp`)} 480w, /${base}-800.webp 800w" sizes="${sizes}" width="800" height="600" alt="${alt}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

function pjCard(p) {
  const [k, unit] = kwParts(p.kw);
  return `
        <article class="pj">
          <div class="pj-media media-frame">${projectImg(p, SIZES.pj)}</div>
          <h3 class="pj-name">${esc(p.name)}</h3>
          <p class="pj-loc">${esc(p.location)}</p>
          <dl class="pj-specs">
            <div><dt>ขนาดระบบ</dt><dd>${k} ${unit}</dd></div>${p.saving ? `
            <div><dt>ลดค่าไฟ</dt><dd>${savingText(p)}</dd></div>` : ''}${p.year ? `
            <div><dt>ติดตั้งปี</dt><dd>${p.year}</dd></div>` : ''}
          </dl>
        </article>`;
}
const pjGrid = (items) => `
      <div class="pj-grid pj-grid--wide">${items.map(pjCard).join('')}
      </div>`;

function pjFeature(f) {
  const [k, unit] = kwParts(f.kw);
  const big = f.saving >= 1e6;
  return `
      <article class="pj-feature">
        <div class="pj-feature-media media-frame">${projectImg(f, SIZES.feature)}</div>
        <div class="pj-feature-body">
          <div>
            <p class="kicker">โครงการเด่น</p>
            <h3>${esc(f.name)}</h3>
            <p class="pj-loc">${esc(f.location)}${f.year ? `<br>ติดตั้งแล้วเสร็จปี ${f.year}` : ''}</p>
          </div>
          <div class="pj-feature-stats">
            <div><strong>${k}<small>${unit}</small></strong><span>ขนาดระบบ</span></div>
            <div><strong>${big ? num(f.saving / 1e6) : num(f.saving, 0)}<small>${big ? 'ล้านบาท' : 'บาท'}</small></strong><span>ค่าไฟที่ลด${f.savingUpTo ? 'ได้สูงสุด' : 'ได้'}ต่อเดือน</span></div>
          </div>
        </div>
      </article>`;
}

function pkCard(p) {
  const media = p.slot
    ? `<img class="frame-img" src="${asset(`Media/packages/${p.slot}-800.webp`)}" srcset="${asset(`Media/packages/${p.slot}-640.webp`)} 640w, /Media/packages/${p.slot}-800.webp 800w" sizes="${SIZES.pk}" width="640" height="480" alt="${esc(p.name)}" loading="lazy" decoding="async">`
    : '';
  return `
        <article class="pk">
          <div class="pk-media media-frame">${media}${p.badge ? `<span class="pk-badge">${esc(p.badge)}</span>` : ''}</div>
          <h3 class="pk-name">${esc(p.name)}</h3>
          ${p.fit ? `<p class="pk-fit">${esc(p.fit)}</p>` : ''}
          <dl class="pk-specs">${p.specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
          ${p.price ? `<div class="pk-price"><span>ราคาเริ่มต้นรวมติดตั้ง</span><strong>${num(p.price, 0)} บาท</strong></div>` : ''}
          <a class="pk-more" href="#contact">ขอรายละเอียดแพ็กเกจ ${ARROW_SM}</a>
        </article>`;
}

const stats = (list) => `
    <div class="pg-stats">${list.map(([v, small, label]) => `
      <div class="pg-stat"><strong>${v}${small ? `<small>${small}</small>` : ''}</strong><span>${label}</span></div>`).join('')}
    </div>`;

const head = (kicker, title, lede, id) => `
    <div class="pg-head"${id ? ` id="${id}"` : ''}>
      <p class="kicker">${kicker}</p>
      <h2 class="h2">${title}</h2>${lede ? `
      <p class="lede">${lede}</p>` : ''}
    </div>`;

const cards = (list) => `
    <ul class="pg-cards">${list.map(([t, p]) => `
      <li class="pg-card"><h3>${t}</h3><p>${p}</p></li>`).join('')}
    </ul>`;

const clientsWall = () => `
      <div class="logo-wall">
        <h3 class="logo-wall-title">ลูกค้าองค์กรบางส่วน</h3>
        <ul class="logos">${projects.clients.map((c) => `
          <li><img src="${asset(c.logo)}" width="${c.w}" height="${c.h}" alt="${esc(c.name)}" title="${esc(c.name)}" loading="lazy" decoding="async"></li>`).join('')}
        </ul>
      </div>`;

const brandsWall = () => {
  const block = index.match(/      <div class="logo-wall">\n        <h3 class="logo-wall-title">อุปกรณ์และมาตรฐาน[\s\S]*?<\/p>\n      <\/div>\n/)[0];
  return '\n' + block.replace(/src="(Media\/[^"]+)"/g, (_, rel) => `src="${asset(rel)}"`).replace(/\n$/, '');
};

const award = () => `
      <figure class="award">
        <img src="${asset('Media/awards/solaredge-award-of-excellence.webp')}" width="245" height="361" loading="lazy" decoding="async" alt="ถ้วยรางวัล SolarEdge Award of Excellence ที่มอบให้ Solar 1 Energy">
        <figcaption>
          <strong>SolarEdge Award of Excellence</strong>
          <span>รางวัลจาก SolarEdge ประเทศไทย มอบให้ผู้ติดตั้งที่มีจำนวนโครงการ SolarEdge มากที่สุดในประเทศ</span>
        </figcaption>
      </figure>`;

// Copy shared with the homepage (index.html packages and benefits sections).
const PK_LEDE = 'ทุกแพ็กเกจเป็นราคาแบบ Turnkey ใช้แผงระดับ Tier 1 จาก Q CELLS หรือ JinkoSolar คู่กับอินเวอร์เตอร์และ Optimizer ของ SolarEdge รวมค่าสำรวจ งานติดตั้ง เอกสารขออนุญาต และการลงนามรับรองโครงสร้างโดยวิศวกร';
const BENEFITS = [
  ['ค่าไฟลดลงตั้งแต่รอบบิลแรก', 'อาคารใช้ไฟที่ผลิตได้ช่วงกลางวันได้ทันที จึงซื้อไฟจากการไฟฟ้าน้อยลงตั้งแต่วันแรกที่ระบบเริ่มทำงาน'],
  ['ล็อกต้นทุนค่าไฟได้ยาว 25 ปี', 'ลงทุนครั้งเดียว ต้นทุนไฟจากหลังคาคงที่ตลอดอายุแผง ไม่ว่าค่า Ft จะปรับขึ้นอีกกี่ครั้ง'],
  ['ระบบทำงานอัตโนมัติ ติดตามผ่านแอปได้', 'ไม่ต้องเปิดปิดเอง ระบบแจ้งเตือนเมื่อผลิตไฟได้ต่ำกว่าปกติ และทีมบริการของเราเข้าตรวจเช็กและล้างแผงตามรอบที่กำหนด'],
];
const STEPS = [
  // Same four EPC phases as the homepage (index.html #process): Engineering, Procurement, Construction, Delivery.
  ['ออกแบบทางวิศวกรรม', 'วิศวกรสำรวจหลังคาและระบบไฟฟ้า วิเคราะห์บิลค่าไฟย้อนหลัง ออกแบบผังแผงและระบบไฟฟ้า และวิศวกรโยธาลงนามรับรองโครงสร้าง'],
  ['จัดหาอุปกรณ์และขออนุญาต', 'จัดหาแผง Tier 1 คู่กับอินเวอร์เตอร์และ Optimizer ของ SolarEdge และยื่นขออนุญาตขนานไฟกับการไฟฟ้าส่วนภูมิภาค (PEA) หรือการไฟฟ้านครหลวง (MEA) รวมอยู่ในราคาแพ็กเกจ'],
  ['ติดตั้งหน้างาน', 'ทีมช่างของเราติดตั้งเองทั้งหมด ไม่จ้างช่วง ตามแบบที่วิศวกรลงนามรับรองและข้อกำหนดการเชื่อมต่อของการไฟฟ้า'],
  ['ทดสอบและส่งมอบ', 'ทดสอบระบบก่อนจ่ายไฟ แล้วส่งมอบพร้อมแอปติดตามการผลิตไฟและแผนบำรุงรักษา'],
];
const steps = () => `
    <ol class="pg-steps">${STEPS.map(([t, p]) => `
      <li><h3>${t}</h3><p>${p}</p></li>`).join('')}
    </ol>`;

const ROUTES = {
  residential: ['ติดตั้งโซลาร์เซลล์บ้านพักอาศัย', 'แพ็กเกจบ้าน 5 kWp และไฮบริด 10 kWp พร้อมผลงานบ้านจริง'],
  commercial: ['ติดตั้งโซลาร์เซลล์โรงงานและธุรกิจ', 'ระบบ 30 kWp ถึง 1 MWp ทางเลือก PPA และผลงานโรงงาน'],
  projects: ['ผลงานการติดตั้งทั้งหมด', `${projects.items.length} โครงการ บ้าน ธุรกิจ และโรงงานทั่วประเทศ`],
  'locations/nakhon-pathom': ['รับติดตั้งโซลาร์เซลล์ นครปฐม', 'สำนักงานใหญ่สามพราน ใกล้เซ็นทรัล ศาลายา'],
};
const related = (self) => `
  <section class="pg-section" aria-labelledby="related-title">
    <h2 class="pg-sub" id="related-title">บริการและข้อมูลอื่น</h2>
    <ul class="pg-links">${Object.entries(ROUTES).filter(([r]) => r !== self).map(([r, [t, d]]) => `
      <li><a href="/${r}"><div><strong>${t}</strong><br><span>${d}</span></div>${ARROW}</a></li>`).join('')}
      <li><a href="/#calculator"><div><strong>คำนวณความคุ้มค่า</strong><br><span>ประเมินขนาดระบบ งบลงทุน และระยะเวลาคืนทุนจากบิลค่าไฟของคุณ</span></div>${ARROW}</a></li>
    </ul>
  </section>`;

function hero({ crumbs, kicker, title, lede, image }) {
  const trail = [['หน้าแรก', '/'], ...crumbs];
  return `
  <div class="pg-hero">
    <div>
      <nav class="crumbs" aria-label="เส้นทาง">${trail.map(([t, h], i) => (i === trail.length - 1
        ? `<span aria-current="page">${t}</span>`
        : h ? `<a href="${h}">${t}</a>` : `<span>${t}</span>`)).join('<span aria-hidden="true">/</span>')}</nav>
      <p class="kicker"><span class="dot"></span>${kicker}</p>
      <h1 class="pg-title">${title}</h1>
      <p class="lede">${lede}</p>
      <div class="pg-cta">
        <a class="btn btn--orange" href="${tel(phones[0])}">นัดสำรวจหน้างาน ${ARROW}</a>
        <a class="btn btn--ink" href="${LINE_URL}" target="_blank" rel="noopener noreferrer">LINE ${esc(contact.lineId)} ${ARROW}</a>
      </div>
    </div>
    <div class="pg-hero-media media-frame">${projectImg(image, SIZES.hero, { eager: true })}</div>
  </div>`;
}

const footer = ({ map = true } = {}) => `
<footer class="foot-shell" id="contact">
  <div class="foot">
    <div class="foot-cta">
      <h2 class="h2"><span>เปลี่ยนหลังคา</span> <span>ให้เป็นโรงไฟฟ้า</span> <br><span>ที่คืนทุนได้จริง</span></h2>
      <div class="foot-cta-actions">
        <a class="btn btn--orange" href="${tel(phones[0])}">นัดสำรวจหน้างาน ${ARROW}</a>
        <a class="btn btn--line" href="${LINE_URL}" target="_blank" rel="noopener noreferrer"><span class="btn-ico"><svg aria-hidden="true"><use href="#i-line-brand"/></svg></span>แชตทาง LINE</a>
      </div>
    </div>

    <div class="foot-card">
      <div class="foot-brand">
        <img src="${asset('Media/logo-footer.webp')}" width="212" height="192" loading="lazy" decoding="async" alt="Solar 1 Energy">
        <p>ผู้รับเหมา EPC ด้านโซลาร์เซลล์ ออกแบบ จัดหาอุปกรณ์ และติดตั้งแบบ Turnkey สำหรับบ้านพักอาศัย ธุรกิจ และโรงงานอุตสาหกรรมทั่วประเทศไทย</p>
        ${SOCIAL}
      </div>
      <div class="foot-col">
        <h3>เมนู</h3>
        <ul><li><a href="/">หน้าแรก</a></li><li><a href="/#impact">เกี่ยวกับเรา</a></li><li><a href="/#packages">แพ็กเกจ</a></li><li><a href="/#calculator">คำนวณความคุ้มค่า</a></li><li><a href="/projects">ผลงาน</a></li></ul>
      </div>
      <div class="foot-col">
        <h3>บริการ</h3>
        <ul><li><a href="/residential">โซลาร์เซลล์บ้านพักอาศัย</a></li><li><a href="/commercial">โซลาร์เซลล์โรงงานและธุรกิจ</a></li><li><a href="/commercial#ppa">สัญญาซื้อขายไฟ (PPA)</a></li><li><a href="/locations/nakhon-pathom">ติดตั้งโซลาร์เซลล์ นครปฐม</a></li></ul>
      </div>
      <div class="foot-col">
        <h3>สำนักงานใหญ่</h3>
        <ul>${contact.addressLines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
      </div>
      <div class="foot-col">
        <h3>ติดต่อ</h3>
        <ul>${phones.map((p) => `<li><a href="${tel(p)}">${esc(p)}</a></li>`).join('')}<li><a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></li><li>${esc(contact.hours)}</li></ul>
      </div>
${map ? MAP_CARD : ''}      <div class="foot-legal"><span>© 2569 Solar 1 Energy สงวนลิขสิทธิ์</span><span>สำนักงานใหญ่ นครปฐม — ให้บริการครอบคลุมทั่วประเทศไทย</span></div>
    </div>

    <div class="wordmark" aria-hidden="true">Solar 1</div>
  </div>
</footer>`;

// ---------- structured data ----------
const ld = (obj) => `  <script type="application/ld+json">\n  ${JSON.stringify(obj, null, 2).replace(/\n/g, '\n  ')}\n  </script>\n`;
const breadcrumbs = (trail) => ld({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [['หน้าแรก', `${SITE}/`], ...trail].map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, ...(item ? { item } : {}) })),
});
const PROVIDER = { '@type': 'HomeAndConstructionBusiness', '@id': `${SITE}/#business`, name: 'Solar 1 Energy', url: `${SITE}/` };
const service = (name, description, url, areaServed) => ld({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name, description, url,
  serviceType: 'ติดตั้งระบบโซลาร์เซลล์',
  provider: PROVIDER,
  areaServed,
});

// ---------- page shell ----------
function page({ route, title, desc, image, jsonld, body }) {
  const url = `${SITE}/${route}`;
  return `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
${DRAFT ? '  <meta name="robots" content="noindex, nofollow">\n' : ''}  <meta name="theme-color" content="#F3F5F7">
  <link rel="canonical" href="${url}">
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="preload" href="/Font/Anuphan/Anuphan-VariableFont_wght.ttf" as="font" type="font/ttf" crossorigin>
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Solar 1 Energy">
  <meta property="og:locale" content="th_TH">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${SITE}/Media/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
${jsonld}${THEME}  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/pages.css">
</head>
<body>
${SPRITE}<a class="skip-link" href="#content">ข้ามไปยังเนื้อหา</a>
<header class="wrap pg-top">
  <a class="pg-logo" href="/" aria-label="Solar 1 Energy หน้าแรก"><picture><source srcset="/Media/logo-mark.webp" type="image/webp"><img src="${asset('Media/logo-mark.png')}" width="160" height="144" alt="Solar 1 Energy"></picture></a>
  <a class="btn btn--orange" href="${tel(phones[0])}">โทร ${esc(phones[0])} ${ARROW}</a>
</header>
<main id="content" class="wrap" tabindex="-1">
${body}
</main>
${footer({ map: route !== 'locations/nakhon-pathom' })}
</body>
</html>
`;
}

// ---------- pages ----------
const homeItems = byCat('home');
const industryItems = byCat('industry');
const businessItems = byCat('business');
const bizPackages = [packages.home.items.find((p) => p.kwp === 30), ...packages.factory.items].filter(Boolean);
const homePackages = packages.home.items.filter((p) => p.kwp < 30);
const maxHomeSaving = Math.max(...homeItems.map((p) => p.saving));
const NEARBY = ['นครปฐม', 'กรุงเทพฯ', 'นนทบุรี', 'ปทุมธานี', 'ราชบุรี', 'สมุทรสาคร', 'สุพรรณบุรี'];
const nearbyItems = projects.items
  .filter((p) => NEARBY.some((prov) => p.location.includes(prov)))
  .sort((a, b) => Number(b.location.includes('นครปฐม')) - Number(a.location.includes('นครปฐม')));
const stat = projects.stats;
const statRow = (s) => [num(s.value), esc(s.small.trim()), esc(s.label)];

const PAGES = [
  {
    route: 'residential',
    title: 'ติดตั้งโซลาร์เซลล์บ้านพักอาศัย แพ็กเกจและผลงานจริง | Solar 1 Energy',
    desc: 'ติดตั้งโซลาร์เซลล์บ้าน แพ็กเกจ 5 kWp และไฮบริด 10 kWp พร้อมแบตเตอรี่ แผง Tier 1 จาก Q CELLS หรือ JinkoSolar คู่กับ SolarEdge ติดตั้งให้บ้านพักอาศัยแล้วกว่า 100 หลัง โดยทีมวิศวกร Solar 1 Energy',
    jsonld: () => breadcrumbs([['ติดตั้งโซลาร์เซลล์บ้านพักอาศัย', `${SITE}/residential`]])
      + service('ติดตั้งโซลาร์เซลล์บ้านพักอาศัย', 'ออกแบบและติดตั้งระบบโซลาร์เซลล์สำหรับบ้านพักอาศัย ออนกริดและไฮบริดพร้อมแบตเตอรี่', `${SITE}/residential`, { '@type': 'Country', name: 'Thailand' }),
    body: () => `${hero({
      crumbs: [['ติดตั้งโซลาร์เซลล์บ้าน']],
      kicker: 'บ้านพักอาศัย',
      title: 'ติดตั้งโซลาร์เซลล์<br>บ้านพักอาศัย',
      lede: 'ทีมวิศวกรของเราออกแบบระบบให้พอดีกับการใช้ไฟของบ้านคุณ ดูแลตั้งแต่สำรวจหลังคา คำนวณโครงสร้าง ยื่นขออนุญาตกับการไฟฟ้า จนถึงบำรุงรักษาหลังติดตั้ง และติดตามการผลิตไฟได้แบบเรียลไทม์ผ่านแอป',
      image: projects.items.find((p) => p.image.includes('home-thonburi')),
    })}
${stats([statRow(stat[1]), statRow(stat[0]), [`${num(maxHomeSaving, 0)}`, 'บาท', 'ค่าไฟต่อเดือนที่ลดได้สูงสุดจากผลงานบ้านของเรา']])}

  <section class="pg-section" aria-labelledby="pk-title">
${head('แพ็กเกจ', '<span id="pk-title">แพ็กเกจโซลาร์เซลล์สำหรับบ้าน</span>', PK_LEDE)}
    <div class="pk-grid">${homePackages.map(pkCard).join('')}
      <div class="pg-pk-cta">
        <div>
          <h3>ไม่แน่ใจว่าบ้านคุณควรติดกี่ kWp</h3>
          <p>ใส่ค่าไฟเฉลี่ยต่อเดือนและสัดส่วนการใช้ไฟช่วงกลางวัน ระบบจะประเมินขนาดที่เหมาะสม งบลงทุน และระยะเวลาคืนทุนเบื้องต้นให้ทันที</p>
        </div>
        <a class="btn btn--ink" href="/#calculator">คำนวณความคุ้มค่า ${ARROW}</a>
      </div>
    </div>
    <p class="pg-note">${esc(packages.home.note)}</p>
  </section>

  <section class="pg-section" aria-labelledby="benefit-title">
${head('สิ่งที่ได้จากระบบของเรา', '<span id="benefit-title">ทำไมบ้านควรติดโซลาร์เซลล์</span>')}
${cards(BENEFITS)}
  </section>

  <section class="pg-section" aria-labelledby="step-title">
${head('ขั้นตอนการทำงาน', '<span id="step-title">ตั้งแต่สำรวจจนระบบเดินเครื่อง</span>', 'ทีมสถาปนิกและวิศวกรของเราดูแลทุกขั้นตอนเอง ไม่จ้างช่วง')}
${steps()}
  </section>

  <section class="pg-section" aria-labelledby="work-title">
${head('ผลงานติดตั้ง', `<span id="work-title">ผลงานบ้านพักอาศัย ${homeItems.length} หลัง</span>`, 'ตัวอย่างระบบที่ติดตั้งให้บ้านพักอาศัยในกรุงเทพฯ ปริมณฑล และต่างจังหวัด ตัวเลขค่าไฟที่ลดได้มาจากข้อมูลของแต่ละบ้าน (ไม่เปิดเผยชื่อเจ้าของบ้าน)')}
${pjGrid(homeItems)}
${brandsWall()}
  </section>
${related('residential')}`,
  },
  {
    route: 'commercial',
    title: 'ติดตั้งโซลาร์เซลล์โรงงานและธุรกิจ 30 kWp ถึง 1 MWp และ PPA | Solar 1 Energy',
    desc: 'ติดตั้งโซลาร์เซลล์โรงงาน ฟาร์ม อาคาร และธุรกิจ ตั้งแต่ 30 kWp ถึง 1 MWp ทางเลือกสัญญาซื้อขายไฟ (PPA) ผลงานจริงถึง 3.5 MW ลดค่าไฟได้ 1.75 ล้านบาทต่อเดือน โดย Solar 1 Energy',
    jsonld: () => breadcrumbs([['ติดตั้งโซลาร์เซลล์โรงงานและธุรกิจ', `${SITE}/commercial`]])
      + service('ติดตั้งโซลาร์เซลล์โรงงานและธุรกิจ', 'ออกแบบและติดตั้งระบบโซลาร์เซลล์สำหรับโรงงาน ฟาร์ม และอาคารธุรกิจ ตั้งแต่ 30 kWp ถึงระดับเมกะวัตต์ พร้อมทางเลือกสัญญาซื้อขายไฟ (PPA)', `${SITE}/commercial`, { '@type': 'Country', name: 'Thailand' }),
    body: () => `${hero({
      crumbs: [['ติดตั้งโซลาร์เซลล์โรงงานและธุรกิจ']],
      kicker: 'โรงงานและธุรกิจ',
      title: 'ติดตั้งโซลาร์เซลล์<br>โรงงานและธุรกิจ',
      lede: 'ลดค่าไฟช่วงกลางวันของโรงงาน ฟาร์ม อาคารสำนักงาน และร้านค้า ด้วยระบบที่ออกแบบตามการใช้ไฟจริง ใช้แผง Tier 1 คู่กับอินเวอร์เตอร์และ Optimizer ของ SolarEdge พร้อมดูแลเอกสารขออนุญาตและบำรุงรักษาตลอดอายุระบบ',
      image: projects.items.find((p) => p.image.includes('kvs-fresh-products-1mw')),
    })}
${stats([statRow(stat[2]), statRow(stat[3]), [String(industryItems.length + businessItems.length), 'โครงการ', 'โรงงาน ฟาร์ม และอาคารธุรกิจในผลงานของเรา']])}

  <section class="pg-section" aria-labelledby="pk-title">
${head('แพ็กเกจ', '<span id="pk-title">ระบบสำหรับธุรกิจ โรงงาน และอาคาร</span>', PK_LEDE)}
    <div class="pk-grid pk-grid--4">${bizPackages.map(pkCard).join('')}
    </div>
    <p class="pg-note" id="ppa">${esc(packages.factory.note)}</p>
  </section>

  <section class="pg-section" aria-labelledby="roi-title">
${head('ความคุ้มค่า', '<span id="roi-title">คืนทุนเร็ว เพราะธุรกิจใช้ไฟช่วงกลางวัน</span>', 'อาคารใช้ไฟที่ผลิตได้ช่วงกลางวันได้ทันที โรงงานและสำนักงานที่เดินเครื่องช่วงกลางวันจึงลดหน่วยที่ต้องซื้อจากการไฟฟ้าได้มาก และคืนทุนได้เร็วกว่าบ้านพักอาศัย')}
${cards([
  ['คืนทุนประมาณ 3.2–3.5 ปี', 'ตัวอย่างจากแพ็กเกจโรงงาน 100 kWp และ 300 kWp ที่ผลิตไฟเฉลี่ย 11,000 และ 33,000 หน่วยต่อเดือน ระยะเวลาคืนทุนจริงขึ้นอยู่กับค่าไฟต่อหน่วยและสัดส่วนการใช้ไฟกลางวัน'],
  BENEFITS[1],
  ['ไม่ต้องลงทุนเองด้วยสัญญา PPA', esc(packages.factory.note)],
])}
    <p class="pg-note">ตัวเลขนี้ประเมินเบื้องต้นจากค่าเฉลี่ยการผลิตไฟฟ้าของระบบโซลาร์ในประเทศไทย ราคาและผลตอบแทนจริงขึ้นอยู่กับสภาพหลังคา ทิศทางแผง และระบบไฟฟ้าในอาคาร ซึ่งวิศวกรจะยืนยันหลังสำรวจหน้างาน <a href="/#calculator">ลองคำนวณจากบิลค่าไฟของคุณ</a></p>
  </section>

  <section class="pg-section" aria-labelledby="work-title">
${head('ผลงานติดตั้ง', '<span id="work-title">ผลงานโรงงานและธุรกิจ</span>', 'ตัวเลขค่าไฟที่ลดได้มาจากข้อมูลของแต่ละโครงการ')}
${pjFeature(featured)}
    <h3 class="pg-sub">${CAT.industry}<small>${industryItems.length} โครงการ</small></h3>
${pjGrid(industryItems.filter((p) => p !== featured))}
    <h3 class="pg-sub">${CAT.business}<small>${businessItems.length} โครงการ</small></h3>
${pjGrid(businessItems)}
${clientsWall()}
${brandsWall()}
  </section>
${related('commercial')}`,
  },
  {
    route: 'projects',
    title: `ผลงานติดตั้งโซลาร์เซลล์ ${projects.items.length} โครงการ บ้าน ธุรกิจ และโรงงาน | Solar 1 Energy`,
    desc: `รวมผลงานติดตั้งโซลาร์เซลล์ของ Solar 1 Energy ${projects.items.length} โครงการทั่วประเทศ ตั้งแต่บ้านพักอาศัยถึงโรงงาน 3.5 MW พร้อมขนาดระบบ ค่าไฟที่ลดได้ และปีที่ติดตั้ง`,
    jsonld: () => breadcrumbs([['ผลงานการติดตั้ง', `${SITE}/projects`]]),
    body: () => `${hero({
      crumbs: [['ผลงานการติดตั้ง']],
      kicker: 'ผลงาน',
      title: 'ผลงานการติดตั้ง<br>โซลาร์เซลล์ทั่วประเทศ',
      lede: `ตัวอย่างระบบที่ทีมของเราออกแบบและติดตั้ง ${projects.items.length} โครงการ ตั้งแต่บ้านพักอาศัยไปจนถึงโรงงานขนาด 3.5 เมกะวัตต์ ตัวเลขค่าไฟที่ลดได้มาจากข้อมูลของแต่ละโครงการ`,
      image: projects.items.find((p) => p.image.includes('srisuda-farm')),
    })}
${stats(stat.map(statRow))}
    <nav class="pg-jump" aria-label="หมวดผลงาน">${['industry', 'business', 'home'].map((c) => `<a href="#${c}">${CAT[c]} <small>${byCat(c).length}</small></a>`).join('')}</nav>

  <section class="pg-section" aria-labelledby="feature-title">
    <h2 class="pg-sub" id="feature-title">โครงการที่ใหญ่ที่สุดของเรา</h2>
${pjFeature(featured)}
${award()}
  </section>
${['industry', 'business', 'home'].map((c) => `
  <section class="pg-section" id="${c}" aria-labelledby="${c}-title">
${head('ผลงาน', `<span id="${c}-title">${CAT[c]}</span>`, `${byCat(c).length} โครงการ`)}
${pjGrid(byCat(c).filter((p) => p !== featured))}
  </section>`).join('')}

  <section class="pg-section" aria-labelledby="clients-title">
    <h2 class="pg-sub" id="clients-title">ลูกค้าและอุปกรณ์ที่เราเลือกใช้</h2>
${clientsWall()}
${brandsWall()}
  </section>
${related('projects')}`,
  },
  {
    route: 'locations/nakhon-pathom',
    title: 'รับติดตั้งโซลาร์เซลล์ นครปฐม สำนักงานใหญ่สามพราน | Solar 1 Energy',
    desc: 'รับติดตั้งโซลาร์เซลล์ในนครปฐม บ้าน ธุรกิจ และโรงงาน โดย Solar 1 Energy สำนักงานใหญ่ 81/22 หมู่ 2 ต.บางเตย อ.สามพราน ใกล้เซ็นทรัล ศาลายา โทร 082-416-9619',
    jsonld: () => BUSINESS_LD + breadcrumbs([['พื้นที่ให้บริการ', null], ['นครปฐม', `${SITE}/locations/nakhon-pathom`]])
      + service('ติดตั้งโซลาร์เซลล์ นครปฐม', 'ออกแบบและติดตั้งระบบโซลาร์เซลล์สำหรับบ้าน ธุรกิจ และโรงงานในจังหวัดนครปฐม จากสำนักงานใหญ่ที่อำเภอสามพราน', `${SITE}/locations/nakhon-pathom`, { '@type': 'AdministrativeArea', name: 'Nakhon Pathom' }),
    body: () => `${hero({
      crumbs: [['พื้นที่ให้บริการ'], ['นครปฐม']],
      kicker: 'พื้นที่ให้บริการ',
      title: 'รับติดตั้งโซลาร์เซลล์<br>นครปฐม',
      lede: 'สำนักงานใหญ่ของเราอยู่ที่อำเภอสามพราน ใกล้เซ็นทรัล ศาลายา ทีมวิศวกรจึงเข้าสำรวจหน้างานในนครปฐมและจังหวัดใกล้เคียงได้สะดวก และดูแลระบบหลังติดตั้งได้ใกล้ชิด ทั้งบ้านพักอาศัย ธุรกิจ และโรงงาน',
      image: projects.items.find((p) => p.image.includes('home-krisda-nakhon')),
    })}

  <section class="pg-section" aria-labelledby="hq-title">
${head('สำนักงานใหญ่', '<span id="hq-title">ติดต่อทีมงานในนครปฐม</span>')}
    <div class="pg-hq">
      <div class="pg-hq-card">
        <h3>ที่อยู่</h3>
        <address>${contact.addressLines.slice(0, 4).map(esc).join('<br>')}</address>
        <dl>
          <div><dt>เวลาทำการ</dt><dd>${esc(contact.hours)}</dd></div>
          <div><dt>พื้นที่ให้บริการ</dt><dd>นครปฐมและทั่วประเทศ</dd></div>
        </dl>
        <a class="btn btn--ink pg-directions" href="${MAPS_URL}" target="_blank" rel="noopener noreferrer">นำทางด้วย Google Maps ${ARROW}</a>
      </div>
      <div class="pg-hq-card">
        <h3>ช่องทางติดต่อ</h3>
        <ul class="pg-contact">${phones.map((p) => `
          <li><a href="${tel(p)}"><span>โทร</span><strong>${esc(p)}</strong>${ARROW}</a></li>`).join('')}
          <li><a href="${LINE_URL}" target="_blank" rel="noopener noreferrer"><span>LINE</span><strong>${esc(contact.lineId)}</strong>${ARROW}</a></li>${contact.facebook ? `
          <li><a href="${esc(contact.facebook)}" target="_blank" rel="noopener noreferrer"><span>Facebook</span><strong>Solar 1 Energy</strong>${ARROW}</a></li>` : ''}
          <li><a href="mailto:${esc(contact.email)}"><span>อีเมล</span><strong>${esc(contact.email)}</strong>${ARROW}</a></li>${contact.tiktok ? `
          <li><a href="${esc(contact.tiktok)}" target="_blank" rel="noopener noreferrer"><span>TikTok</span><strong>${esc(contact.tiktok.replace(/^https:\/\/www\.tiktok\.com\//, ''))}</strong>${ARROW}</a></li>` : ''}
        </ul>
      </div>
    </div>
    <div class="pg-map media-frame">
      ${MAP_EMBED}
    </div>
  </section>

  <section class="pg-section" aria-labelledby="area-title">
${head('พื้นที่ให้บริการ', '<span id="area-title">นครปฐมและจังหวัดใกล้เคียง</span>', 'จากสำนักงานใหญ่ที่สามพราน ทีมของเราเดินทางถึงนครปฐม กรุงเทพฯ นนทบุรี ปทุมธานี และราชบุรีได้สะดวก และให้บริการติดตั้งทั่วประเทศ')}
    <ul class="pg-chips"><li class="is-home">นครปฐม (สำนักงานใหญ่)</li><li>กรุงเทพฯ</li><li>นนทบุรี</li><li>ปทุมธานี</li><li>ราชบุรี</li><li>และทั่วประเทศ</li></ul>
  </section>

  <section class="pg-section" aria-labelledby="pk-title">
${head('บริการ', '<span id="pk-title">ระบบโซลาร์สำหรับบ้าน ธุรกิจ และโรงงาน</span>', PK_LEDE)}
    <ul class="pg-links">
      <li><a href="/residential"><div><strong>บ้านพักอาศัย</strong><br><span>${homePackages.map((p) => esc(p.name)).join(' และ')} ราคาเริ่มต้น ${num(Math.min(...homePackages.map((p) => p.price)), 0)} บาท รวมติดตั้ง</span></div>${ARROW}</a></li>
      <li><a href="/commercial"><div><strong>ธุรกิจและโรงงาน</strong><br><span>ระบบ 30 kWp ถึง 1 MWp และทางเลือกสัญญาซื้อขายไฟ (PPA)</span></div>${ARROW}</a></li>
      <li><a href="/#calculator"><div><strong>คำนวณความคุ้มค่า</strong><br><span>ประเมินขนาดระบบ งบลงทุน และระยะเวลาคืนทุนจากบิลค่าไฟของคุณ</span></div>${ARROW}</a></li>
    </ul>
  </section>

  <section class="pg-section" aria-labelledby="step-title">
${head('ขั้นตอนการทำงาน', '<span id="step-title">ตั้งแต่สำรวจจนระบบเดินเครื่อง</span>')}
${steps()}
  </section>

  <section class="pg-section" aria-labelledby="work-title">
${head('ผลงานใกล้คุณ', `<span id="work-title">ผลงานในนครปฐมและจังหวัดใกล้เคียง</span>`, `${nearbyItems.length} โครงการในนครปฐม กรุงเทพฯ นนทบุรี ปทุมธานี ราชบุรี สมุทรสาคร และสุพรรณบุรี`)}
${pjGrid(nearbyItems)}
  </section>
${related('locations/nakhon-pathom')}`,
  },
];

for (const p of PAGES) {
  const html = page({ route: p.route, title: p.title, desc: p.desc, jsonld: p.jsonld(), body: p.body() });
  const out = path.join(ROOT, p.route, 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  console.log(`wrote /${p.route} (${Math.round(Buffer.byteLength(html) / 1024)} KB)`);
}
if (missing.length) { console.error('missing assets:\n  ' + [...new Set(missing)].join('\n  ')); process.exit(1); }
