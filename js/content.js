// Site content: built-in defaults, Supabase loading and validation.
// Shared by the public site (main.js) and the admin panel (js/admin.js).
//
// Content lives in public.site_content as one JSON document per section
// (hero, packages, roi, contact). Anything missing or malformed falls back
// to the defaults below, so the site always renders.
(function () {
  'use strict';

  // ---------- defaults (mirror the static HTML) ----------

  const DEFAULTS = {
    hero: {
      tag: 'ให้บริการติดตั้งโซลาร์เซลล์ทั่วประเทศ',
      lines: ['เปลี่ยนหลังคา', 'ให้เป็นโรงไฟฟ้า', 'ที่คืนทุนได้จริง'],
      subtitle: 'Solar One Energy ออกแบบและติดตั้งระบบโซลาร์เซลล์สำหรับบ้าน ธุรกิจ และโรงงานทั่วประเทศไทย ทีมวิศวกรจากสำนักงานใหญ่ที่นครปฐมดูแลตั้งแต่สำรวจหลังคา คำนวณโครงสร้าง ยื่นขออนุญาตกับการไฟฟ้า จนถึงบำรุงรักษาหลังติดตั้ง',
      ctaPrimary: 'คำนวณความคุ้มค่า',
      ctaSecondary: 'ดูแพ็กเกจ',
      videoUrl: 'Media/hero.mp4',
      posterUrl: 'Media/hero-poster.jpg',
    },

    packages: {
      home: {
        note: 'ราคารวมติดตั้งบนหลังคาเมทัลชีตหรือกระเบื้องลอนคู่ ราคาสำหรับหลังคาประเภทอื่นวิศวกรจะประเมินหลังสำรวจหน้างาน',
        items: [
          { name: 'ชุดบ้าน 5 kWp', kwp: 5, badge: 'ออนกริด 1 เฟส', t: 2.2, slot: 'home-5kwp', image: '',
            fit: 'บ้านที่ค่าไฟ 3,000–5,000 บาทต่อเดือน มีคนอยู่บ้านช่วงกลางวัน',
            specs: [['แผง N-type 580W', '9 แผง'], ['ผลิตไฟเฉลี่ย', '550 หน่วย/เดือน'], ['ประหยัดได้', '~2,300 บาท/เดือน'], ['รับประกันแผง', '30 ปี']],
            price: 159000 },
          { name: 'ชุดบ้านไฮบริด 10 kWp', kwp: 10, badge: 'ไฮบริด + แบตเตอรี่ 10 kWh', t: 5, slot: 'home-hybrid-10kwp', image: '',
            fit: 'บ้านที่ใช้ไฟช่วงเย็นถึงกลางคืนสูง หรืออยู่ในพื้นที่ไฟตกบ่อย',
            specs: [['แผง N-type 580W', '18 แผง'], ['ผลิตไฟเฉลี่ย', '1,100 หน่วย/เดือน'], ['ประหยัดได้', '~4,600 บาท/เดือน'], ['รับประกันแบตเตอรี่', '10 ปี']],
            price: 389000 },
          { name: 'ชุดธุรกิจ 30 kWp', kwp: 30, badge: 'ออนกริด 3 เฟส', t: 8.2, slot: 'business-30kwp', image: '',
            fit: 'ร้านค้า คลินิก และสำนักงานที่เปิดทำการช่วงกลางวัน',
            specs: [['แผง N-type 580W', '52 แผง'], ['ผลิตไฟเฉลี่ย', '3,300 หน่วย/เดือน'], ['ประหยัดได้', '~13,900 บาท/เดือน'], ['รับประกันอินเวอร์เตอร์', '10 ปี']],
            price: 690000 },
        ],
      },
      factory: {
        note: 'สำหรับระบบตั้งแต่ 500 kWp ขึ้นไป มีทางเลือกสัญญาซื้อขายไฟ (PPA) ที่ไม่ต้องลงทุนเอง โดยจ่ายเฉพาะค่าไฟในอัตราที่ต่ำกว่าการไฟฟ้า',
        items: [
          { name: 'ชุดโรงงาน 100 kWp', kwp: 100, badge: 'ออนกริด 3 เฟส', t: 1.2, slot: 'factory-100kwp', image: '',
            fit: 'โรงงานขนาดเล็กและโกดังสินค้าที่เดินเครื่องช่วงกลางวัน',
            specs: [['แผง N-type 580W', '172 แผง'], ['ผลิตไฟเฉลี่ย', '11,000 หน่วย/เดือน'], ['ประหยัดได้', '~48,400 บาท/เดือน'], ['คืนทุนประมาณ', '3.5 ปี']],
            price: 2050000 },
          { name: 'ชุดโรงงาน 300 kWp', kwp: 300, badge: 'ออนกริด พร้อมระบบกันย้อน', t: 4.2, slot: 'factory-300kwp', image: '',
            fit: 'โรงงานที่ใช้ไฟต่อเนื่องสองกะ และอาคารพาณิชย์ขนาดกลาง',
            specs: [['แผง N-type 580W', '518 แผง'], ['ผลิตไฟเฉลี่ย', '33,000 หน่วย/เดือน'], ['ประหยัดได้', '~145,000 บาท/เดือน'], ['คืนทุนประมาณ', '3.2 ปี']],
            price: 5550000 },
          { name: 'ชุดโรงงาน 1 MWp', kwp: 1000, badge: 'ลงทุนเองหรือ PPA', t: 7.4, slot: 'factory-1mwp', image: '',
            fit: 'นิคมอุตสาหกรรมและโรงงานขนาดใหญ่ที่ต้องการลดคาร์บอนตามเป้าองค์กร',
            specs: [['แผง N-type 580W', '1,724 แผง'], ['ผลิตไฟเฉลี่ย', '110,000 หน่วย/เดือน'], ['ประหยัดได้', '~484,000 บาท/เดือน'], ['ลดคาร์บอน', '~660 ตัน/ปี']],
            price: 16900000 },
        ],
      },
    },

    // Calculator inputs. Thailand averages: ~110 kWh per kWp per month,
    // 0.5%/yr panel degradation. Cost per kWp falls with system size (tiers).
    roi: {
      yield: 110,
      degradation: 0.005,
      home: {
        tariff: 4.2, day: 50,
        bill: { min: 1500, max: 30000, step: 500, value: 4500 },
        round: 0.5, minKw: 3, maxKw: 50,
        tiers: [{ upTo: 5, perKw: 32000 }, { upTo: 10, perKw: 28000 }, { upTo: 20, perKw: 25000 }, { upTo: null, perKw: 23000 }],
      },
      factory: {
        tariff: 4.4, day: 70,
        bill: { min: 30000, max: 2000000, step: 10000, value: 250000 },
        round: 5, minKw: 30, maxKw: 1000,
        tiers: [{ upTo: 100, perKw: 21000 }, { upTo: 300, perKw: 19000 }, { upTo: 600, perKw: 18000 }, { upTo: null, perKw: 17000 }],
      },
    },

    contact: {
      // Street address and phone come from the admin panel; until then the
      // footer shows only what is confirmed (no placeholder numbers).
      addressLines: ['อำเภอเมืองนครปฐม', 'จังหวัดนครปฐม 73000', 'ให้บริการติดตั้งทั่วประเทศ'],
      phone: '',
      email: 'contact@solar1energy.co.th',
      hours: 'จันทร์–เสาร์ 08:30–17:30 น.',
      lineId: '',
      facebook: '',
      instagram: '',
      youtube: '',
      tiktok: '',
    },
  };

  const SECTIONS = ['hero', 'packages', 'roi', 'contact'];
  const clone = (v) => JSON.parse(JSON.stringify(v));

  // ---------- small safety helpers ----------

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

  // Accepts https/http URLs and same-site relative paths ("Media/x.jpg").
  // Anything else (javascript:, data:, protocol-relative //host) is rejected.
  function safeUrl(value) {
    const s = String(value ?? '').trim();
    if (!s) return '';
    if (/^https?:\/\//i.test(s)) {
      try { return new URL(s).href; } catch { return ''; }
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(s) || s.startsWith('//') || s.includes('\\')) return '';
    return s.replace(/^\/+/, '');
  }

  const str = (v, fallback, max = 400) => (typeof v === 'string' ? v.trim().slice(0, max) : fallback);
  const num = (v, fallback, min = -Infinity, max = Infinity) => {
    const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v;
    return typeof n === 'number' && Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback;
  };

  // ---------- validation: always returns a complete, well-typed section ----------

  function normalizeHero(d) {
    const def = DEFAULTS.hero;
    d = d && typeof d === 'object' ? d : {};
    let lines = Array.isArray(d.lines) ? d.lines.map((l) => str(l, '', 80)).filter(Boolean) : [];
    if (lines.length > 3) lines = [lines[0], lines[1], lines.slice(2).join(' ')];
    const videoUrl = safeUrl(d.videoUrl) || def.videoUrl;
    return {
      tag: str(d.tag, def.tag, 80),
      lines: lines.length ? lines : clone(def.lines),
      subtitle: str(d.subtitle, def.subtitle, 600),
      ctaPrimary: str(d.ctaPrimary, def.ctaPrimary, 40) || def.ctaPrimary,
      ctaSecondary: str(d.ctaSecondary, def.ctaSecondary, 40) || def.ctaSecondary,
      videoUrl,
      // the bundled poster is a frame of the bundled clip, so it only applies to that clip
      posterUrl: safeUrl(d.posterUrl) || (videoUrl === def.videoUrl ? def.posterUrl : ''),
    };
  }

  function normalizePackage(p, i) {
    p = p && typeof p === 'object' ? p : {};
    const specs = Array.isArray(p.specs)
      ? p.specs.filter((s) => Array.isArray(s) && s.length >= 2)
          .map(([k, v]) => [str(k, '', 60), str(v, '', 60)])
          .filter(([k, v]) => k || v).slice(0, 8)
      : [];
    return {
      name: str(p.name, '', 80) || `แพ็กเกจ ${i + 1}`,
      kwp: num(p.kwp, 0, 0, 100000),
      badge: str(p.badge, '', 60),
      fit: str(p.fit, '', 240),
      specs,
      price: num(p.price, 0, 0, 1e10),
      image: safeUrl(p.image),
      slot: str(p.slot, '', 60).replace(/[^a-z0-9-]/gi, ''),
      t: num(p.t, (i * 2.7) % 9, 0, 600),
    };
  }

  function normalizePackages(d) {
    d = d && typeof d === 'object' ? d : {};
    const out = {};
    for (const seg of ['home', 'factory']) {
      const s = d[seg] && typeof d[seg] === 'object' ? d[seg] : null;
      if (!s) { out[seg] = clone(DEFAULTS.packages[seg]); continue; }
      const items = Array.isArray(s.items) ? s.items.slice(0, 12).map(normalizePackage) : [];
      out[seg] = {
        note: str(s.note, '', 400),
        items: items.length ? items : clone(DEFAULTS.packages[seg].items),
      };
    }
    return out;
  }

  function normalizeProfile(p, def) {
    p = p && typeof p === 'object' ? p : {};
    const b = p.bill && typeof p.bill === 'object' ? p.bill : {};
    const min = num(b.min, def.bill.min, 0, 1e9);
    const max = Math.max(num(b.max, def.bill.max, 0, 1e9), min + 1);
    let tiers = Array.isArray(p.tiers)
      ? p.tiers.map((t) => ({
          upTo: t && t.upTo !== null && t.upTo !== '' && t.upTo !== undefined ? num(t.upTo, null, 0, 1e6) : null,
          perKw: num(t && t.perKw, NaN, 1, 1e7),
        })).filter((t) => Number.isFinite(t.perKw)).slice(0, 8)
      : [];
    // ascending by size, with exactly one open-ended tier last
    tiers = tiers.filter((t) => t.upTo !== null).sort((a, b2) => a.upTo - b2.upTo)
      .concat(tiers.filter((t) => t.upTo === null).slice(-1));
    if (!tiers.length) tiers = clone(def.tiers);
    if (tiers[tiers.length - 1].upTo !== null) tiers.push({ upTo: null, perKw: tiers[tiers.length - 1].perKw });
    const minKw = num(p.minKw, def.minKw, 0, 1e6);
    return {
      tariff: num(p.tariff, def.tariff, 0.5, 50),
      day: Math.round(num(p.day, def.day, 20, 90) / 5) * 5,
      bill: { min, max, step: num(b.step, def.bill.step, 1, max), value: num(b.value, def.bill.value, min, max) },
      round: num(p.round, def.round, 0.1, 1000),
      minKw,
      maxKw: Math.max(num(p.maxKw, def.maxKw, 0, 1e6), minKw),
      tiers,
    };
  }

  function normalizeRoi(d) {
    d = d && typeof d === 'object' ? d : {};
    const def = DEFAULTS.roi;
    return {
      yield: num(d.yield, def.yield, 30, 250),
      degradation: num(d.degradation, def.degradation, 0, 0.05),
      home: normalizeProfile(d.home, def.home),
      factory: normalizeProfile(d.factory, def.factory),
    };
  }

  function normalizeContact(d) {
    d = d && typeof d === 'object' ? d : {};
    const def = DEFAULTS.contact;
    const lines = Array.isArray(d.addressLines) ? d.addressLines.map((l) => str(l, '', 120)).filter(Boolean).slice(0, 6) : null;
    return {
      addressLines: lines && lines.length ? lines : clone(def.addressLines),
      phone: str(d.phone, def.phone, 40),
      email: str(d.email, def.email, 120),
      hours: str(d.hours, def.hours, 80),
      lineId: str(d.lineId, def.lineId, 40),
      facebook: safeUrl(d.facebook),
      instagram: safeUrl(d.instagram),
      youtube: safeUrl(d.youtube),
      tiktok: safeUrl(d.tiktok),
    };
  }

  const NORMALIZE = { hero: normalizeHero, packages: normalizePackages, roi: normalizeRoi, contact: normalizeContact };

  // Complete content: remote sections where present and valid, defaults elsewhere.
  function resolve(remote) {
    const out = {};
    for (const key of SECTIONS) out[key] = NORMALIZE[key](remote && remote[key] ? remote[key] : DEFAULTS[key]);
    return out;
  }

  // ---------- Supabase (public read via REST; no client library needed) ----------

  function config() {
    const c = window.SOLAR1_SUPABASE || {};
    const url = typeof c.url === 'string' ? c.url.trim().replace(/\/+$/, '') : '';
    const anonKey = typeof c.anonKey === 'string' ? c.anonKey.trim() : '';
    const adminEmail = typeof c.adminEmail === 'string' ? c.adminEmail.trim() : '';
    return /^https:\/\/[^/]+$/.test(url) && anonKey ? { url, anonKey, adminEmail } : null;
  }

  // Resolves to { section: data } for every row, {} when nothing is stored.
  // Rejects on network/HTTP errors or after timeoutMs.
  async function fetchRemote(timeoutMs = 4000) {
    const cfg = config();
    if (!cfg) throw new Error('not-configured');
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      // Legacy anon keys are JWTs and may also go in Authorization; the newer
      // publishable keys (sb_publishable_…) are not JWTs and only work as apikey.
      const headers = { apikey: cfg.anonKey, Accept: 'application/json' };
      if (cfg.anonKey.startsWith('eyJ')) headers.Authorization = `Bearer ${cfg.anonKey}`;
      const res = await fetch(`${cfg.url}/rest/v1/site_content?select=key,data`, {
        headers,
        signal: ctrl.signal,
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rows = await res.json();
      const out = {};
      if (Array.isArray(rows)) rows.forEach((r) => { if (r && SECTIONS.includes(r.key)) out[r.key] = r.data; });
      return out;
    } finally {
      clearTimeout(timer);
    }
  }

  // Last good remote content, so repeat visits render it without waiting.
  const CACHE_KEY = 'solar1:content:v1';

  function readCache() {
    const cfg = config();
    if (!cfg) return null;
    try {
      const c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      return c && c.src === cfg.url && c.data && typeof c.data === 'object' ? c.data : null;
    } catch { return null; }
  }

  function writeCache(data) {
    const cfg = config();
    if (!cfg) return;
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ src: cfg.url, at: Date.now(), data })); } catch { /* storage full or blocked */ }
  }

  window.SolarContent = {
    SECTIONS,
    defaults: () => clone(DEFAULTS),
    normalize: (key, data) => NORMALIZE[key](data),
    resolve,
    config,
    fetchRemote,
    readCache,
    writeCache,
    esc,
    safeUrl,
  };
})();
