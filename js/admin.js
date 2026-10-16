// Admin panel: sign in with Supabase Auth, edit site content, save to site_content.
//
// Access control is enforced by Supabase (row-level security in supabase_schema.sql):
// anyone can read content, only the admin account (adminEmail in supabase-config.js)
// can write it. This file only decides what to show; it is not the security boundary.
(function () {
  'use strict';

  const C = window.SolarContent;
  const app = document.getElementById('app');
  const toastBox = document.getElementById('toasts');
  const clone = (v) => JSON.parse(JSON.stringify(v));

  // ---------- tiny DOM builder ----------
  // h('button', { class: 'btn', onclick: fn, disabled: true }, 'text', childNode)
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k in el && typeof v !== 'string') el[k] = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children.flat()) {
      if (c === null || c === undefined || c === false) continue;
      el.append(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return el;
  }

  function toast(message, kind = 'ok') {
    const t = h('div', { class: `toast toast--${kind}` }, message);
    toastBox.append(t);
    setTimeout(() => { t.classList.add('is-leaving'); setTimeout(() => t.remove(), 300); }, kind === 'error' ? 6000 : 3200);
  }

  const fmt = (n, d = 0) => Number(n).toLocaleString('th-TH', { minimumFractionDigits: d, maximumFractionDigits: d });
  const when = (iso) => (iso ? new Date(iso).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : null);

  // ---------- screens ----------

  function brand() {
    return h('a', { class: 'brand', href: './', title: 'กลับหน้าเว็บไซต์' },
      h('img', { src: 'Media/logo-trim.png', alt: '' }),
      h('span', {}, 'Solar One Energy'));
  }

  function screen(...children) {
    app.replaceChildren(h('main', { class: 'screen' }, h('div', { class: 'panel' }, brand(), ...children)));
  }

  function showLoading(message = 'กำลังโหลด…') {
    screen(h('p', { class: 'muted loading' }, message));
  }

  function showFatal(message) {
    screen(
      h('h1', { class: 'title' }, 'เปิดหน้าผู้ดูแลไม่สำเร็จ'),
      h('p', { class: 'muted' }, message),
      h('div', { class: 'row' }, h('button', { class: 'btn', onclick: () => location.reload() }, 'ลองอีกครั้ง')),
    );
  }

  function showNotConfigured() {
    screen(
      h('h1', { class: 'title' }, 'ยังไม่ได้เชื่อมต่อ Supabase'),
      h('p', { class: 'muted' }, 'ตอนนี้เว็บไซต์ใช้ข้อมูลที่ติดมากับโค้ด หากต้องการแก้ไขเนื้อหาจากหน้านี้ ให้ตั้งค่าตามขั้นตอนด้านล่าง'),
      h('ol', { class: 'steps' },
        h('li', {}, 'รันไฟล์ ', h('code', {}, 'supabase_schema.sql'), ' ใน Supabase SQL Editor'),
        h('li', {}, 'สร้างบัญชีผู้ดูแลใน Authentication ด้วยอีเมลเดียวกับ ', h('code', {}, 'adminEmail'), ' ใน supabase-config.js'),
        h('li', {}, 'ใส่ Project URL และ anon key ในไฟล์ ', h('code', {}, 'supabase-config.js'), ' แล้ว push ขึ้น GitHub')),
    );
  }

  function showLogin(errorMessage) {
    const username = h('input', { type: 'text', name: 'username', autocomplete: 'username', autocapitalize: 'none', spellcheck: false, required: true, autofocus: true });
    const password = h('input', { type: 'password', name: 'password', autocomplete: 'current-password', required: true });
    const error = h('p', { class: 'form-error', role: 'alert', hidden: !errorMessage }, errorMessage || '');
    const submit = h('button', { class: 'btn btn--primary btn--wide', type: 'submit' }, 'เข้าสู่ระบบ');

    const form = h('form', {
      class: 'stack',
      onsubmit: async (e) => {
        e.preventDefault();
        submit.disabled = true;
        submit.textContent = 'กำลังตรวจสอบ…';
        error.hidden = true;
        const { error: err } = await sb.auth.signInWithPassword({ email: loginEmail(username.value), password: password.value });
        if (err) {
          error.textContent = loginMessage(err);
          error.hidden = false;
          submit.disabled = false;
          submit.textContent = 'เข้าสู่ระบบ';
          password.select();
        }
        // success: onAuthStateChange routes to the dashboard
      },
    },
      h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'ชื่อผู้ใช้'), username),
      h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'รหัสผ่าน'), password),
      error,
      submit,
    );

    screen(h('h1', { class: 'title' }, 'เข้าสู่ระบบผู้ดูแล'), form,
      h('a', { class: 'muted small back', href: './' }, 'กลับหน้าเว็บไซต์'));
  }

  // "admin" / "solar1" sign in as the configured admin account; a full email also works.
  function loginEmail(value) {
    const v = value.trim().toLowerCase();
    return ['admin', 'solar1'].includes(v) && cfg.adminEmail ? cfg.adminEmail : v;
  }

  function loginMessage(err) {
    if (err.status === 400) return 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
    if (err.status === 429) return 'ลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่';
    if (err.name === 'AuthRetryableFetchError' || /fetch/i.test(err.message)) return 'เชื่อมต่อ Supabase ไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่';
    return `เข้าสู่ระบบไม่สำเร็จ: ${err.message}`;
  }

  function showDenied(email) {
    screen(
      h('h1', { class: 'title' }, 'บัญชีนี้ไม่มีสิทธิ์ผู้ดูแล'),
      h('p', { class: 'muted' }, `เข้าสู่ระบบด้วย ${email} แล้ว แต่สิทธิ์แก้ไขเนื้อหามีเฉพาะบัญชีผู้ดูแล`),
      h('div', { class: 'row' }, h('button', { class: 'btn', onclick: () => sb.auth.signOut() }, 'ออกจากระบบ')),
    );
  }

  // ---------- boot ----------

  const cfg = C.config();
  if (!cfg) { showNotConfigured(); return; }
  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    showFatal('โหลดไลบรารี Supabase จาก CDN ไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตหรือตัวบล็อกสคริปต์ แล้วลองใหม่');
    return;
  }

  const sb = window.supabase.createClient(cfg.url, cfg.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: 'solar1-admin-auth' },
  });

  let userId = null;
  showLoading();
  // Supabase recommends not awaiting other calls inside this callback; defer instead.
  sb.auth.onAuthStateChange((_event, session) => { setTimeout(() => route(session), 0); });

  async function route(session) {
    const user = session && session.user;
    if (!user) {
      userId = null;
      showLogin();
      return;
    }
    if (user.id === userId) return; // token refresh for the same user
    userId = user.id;
    // The database only accepts writes from the admin account; mirror that here
    // so any other signed-in account gets a clear message instead of failed saves.
    if (cfg.adminEmail && (user.email || '').toLowerCase() !== cfg.adminEmail.toLowerCase()) {
      showDenied(user.email);
      return;
    }
    try {
      showLoading('กำลังโหลดเนื้อหา…');
      await loadContent();
      showDashboard(user);
    } catch (err) {
      userId = null;
      showFatal(describeError(err));
    }
  }

  function describeError(err) {
    if (!err) return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
    if (err.code === '42P01') return 'ไม่พบตารางในฐานข้อมูล กรุณารันไฟล์ supabase_schema.sql ใน Supabase SQL Editor ก่อน';
    if (err.code === '42501' || err.status === 401 || err.status === 403) return 'บัญชีนี้ไม่มีสิทธิ์ทำรายการนี้';
    if (err.code === 'PGRST301' || /jwt/i.test(err.message || '')) return 'เซสชันหมดอายุ กรุณาออกจากระบบแล้วเข้าใหม่';
    if (/fetch|network/i.test(err.message || '')) return 'เชื่อมต่อ Supabase ไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่';
    return err.message || String(err);
  }

  // ---------- content state ----------

  const SECTION_INFO = {
    hero: { title: 'ส่วนหัว (Hero)', desc: 'ข้อความ ปุ่ม และวิดีโอที่ผู้เข้าชมเห็นเป็นอย่างแรก' },
    packages: { title: 'แพ็กเกจ', desc: 'แพ็กเกจสำหรับบ้าน/ธุรกิจขนาดเล็ก และโรงงาน/อาคาร' },
    roi: { title: 'เครื่องคำนวณความคุ้มค่า', desc: 'ค่าไฟ ผลผลิตไฟ และต้นทุนต่อ kWp ที่ใช้คำนวณระยะคืนทุน' },
    contact: { title: 'ติดต่อและส่วนท้าย', desc: 'ที่อยู่ เบอร์โทร LINE และลิงก์โซเชียลในส่วนท้ายของหน้า' },
    projects: { title: 'ผลงานและตัวเลข', desc: 'ตัวเลขในส่วนเกี่ยวกับเรา ผลงานติดตั้ง และโลโก้ลูกค้า' },
  };

  const state = { saved: {}, draft: {}, meta: {}, section: 'hero', pkSeg: 'home', busy: false };

  async function loadContent() {
    const { data, error } = await sb.from('site_content').select('key,data,updated_at');
    if (error) throw error;
    const rows = {};
    (data || []).forEach((r) => { rows[r.key] = r; });
    const defaults = C.defaults();
    for (const key of C.SECTIONS) {
      state.saved[key] = C.normalize(key, rows[key] ? rows[key].data : defaults[key]);
      state.meta[key] = rows[key] ? rows[key].updated_at : null;
      state.draft[key] = clone(state.saved[key]);
    }
  }

  const isDirty = (key) => JSON.stringify(C.normalize(key, state.draft[key])) !== JSON.stringify(state.saved[key]);
  const anyDirty = () => C.SECTIONS.some(isDirty);

  window.addEventListener('beforeunload', (e) => {
    if (userId && anyDirty()) { e.preventDefault(); e.returnValue = ''; }
  });

  // ---------- dashboard ----------

  let ui = null; // references to live dashboard elements

  function showDashboard(user) {
    const tabs = C.SECTIONS.map((key) => h('button', {
      class: 'tab', type: 'button', role: 'tab', id: `tab-${key}`, 'aria-controls': 'editor',
      onclick: () => { state.section = key; renderEditor(); },
    },
      h('span', { class: 'tab-title' }, SECTION_INFO[key].title),
      h('span', { class: 'tab-meta' }),
      h('span', { class: 'dirty-dot', title: 'มีการแก้ไขที่ยังไม่บันทึก', hidden: true })));

    const editor = h('section', { class: 'editor', id: 'editor', role: 'tabpanel' });
    const status = h('p', { class: 'status muted small' });
    const discardBtn = h('button', { class: 'btn btn--ghost', type: 'button', onclick: discard }, 'ยกเลิกการแก้ไข');
    const resetBtn = h('button', { class: 'btn btn--ghost btn--danger', type: 'button', onclick: resetToDefaults }, 'คืนค่าเริ่มต้น');
    const saveBtn = h('button', { class: 'btn btn--primary', type: 'button', onclick: save }, 'บันทึก');

    app.replaceChildren(
      h('header', { class: 'topbar' },
        brand(),
        h('span', { class: 'topbar-title' }, 'จัดการเนื้อหา'),
        h('span', { class: 'spacer' }),
        h('span', { class: 'muted small user' }, user.email),
        h('a', { class: 'btn btn--ghost', href: './', target: '_blank', rel: 'noopener' }, 'ดูหน้าเว็บ'),
        h('button', {
          class: 'btn', type: 'button',
          onclick: () => {
            if (anyDirty() && !confirm('มีการแก้ไขที่ยังไม่บันทึก ออกจากระบบเลยหรือไม่?')) return;
            sb.auth.signOut();
          },
        }, 'ออกจากระบบ')),
      h('div', { class: 'layout' },
        h('nav', {
          class: 'tabs', role: 'tablist', 'aria-label': 'ส่วนของเว็บไซต์', 'aria-orientation': 'vertical',
          // arrow keys move between sections, as in any tab list
          onkeydown: (e) => {
            const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
            if (!step) return;
            e.preventDefault();
            const i = (C.SECTIONS.indexOf(state.section) + step + C.SECTIONS.length) % C.SECTIONS.length;
            state.section = C.SECTIONS[i];
            renderEditor();
            tabs[i].focus();
          },
        }, tabs),
        h('div', { class: 'editor-wrap' },
          editor,
          h('footer', { class: 'actionbar' }, status, h('span', { class: 'spacer' }), discardBtn, resetBtn, saveBtn))),
    );

    ui = { tabs, editor, status, discardBtn, resetBtn, saveBtn };
    renderEditor();
  }

  // Refresh tab badges and action buttons after any edit.
  function changed() {
    if (!ui) return;
    C.SECTIONS.forEach((key, i) => {
      const tab = ui.tabs[i];
      const selected = key === state.section;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      tab.querySelector('.dirty-dot').hidden = !isDirty(key);
      tab.querySelector('.tab-meta').textContent = state.meta[key] ? `อัปเดต ${when(state.meta[key])}` : 'ใช้ค่าเริ่มต้น';
    });
    const dirty = isDirty(state.section);
    ui.saveBtn.disabled = state.busy || !dirty;
    ui.discardBtn.hidden = !dirty;
    ui.discardBtn.disabled = state.busy;
    ui.resetBtn.disabled = state.busy || !state.meta[state.section];
    ui.status.textContent = state.busy ? 'กำลังบันทึก…'
      : dirty ? 'มีการแก้ไขที่ยังไม่บันทึก'
      : state.meta[state.section] ? `บันทึกล่าสุด ${when(state.meta[state.section])}`
      : 'ส่วนนี้ใช้ค่าเริ่มต้นของเว็บไซต์';
    if (state.section === 'roi') updateRoiSamples();
  }

  function renderEditor() {
    const key = state.section;
    const info = SECTION_INFO[key];
    ui.editor.setAttribute('aria-labelledby', `tab-${key}`);
    ui.editor.replaceChildren(
      h('div', { class: 'editor-head' }, h('h1', { class: 'title' }, info.title), h('p', { class: 'muted' }, info.desc)),
      EDITORS[key](state.draft[key]),
    );
    changed();
  }

  // ---------- save / discard / reset ----------

  async function save() {
    const key = state.section;
    const data = C.normalize(key, state.draft[key]);
    state.busy = true; changed();
    try {
      const { data: row, error } = await sb.from('site_content')
        .upsert({ key, data }, { onConflict: 'key' })
        .select('updated_at')
        .single();
      if (error) throw error;
      state.saved[key] = data;
      state.draft[key] = clone(data);
      state.meta[key] = row.updated_at;
      toast(`บันทึก${SECTION_INFO[key].title}แล้ว ผู้เข้าชมจะเห็นข้อมูลใหม่เมื่อเปิดหน้าเว็บครั้งถัดไป`);
      state.busy = false;
      renderEditor();
    } catch (err) {
      state.busy = false; changed();
      toast(`บันทึกไม่สำเร็จ: ${describeError(err)}`, 'error');
    }
  }

  function discard() {
    const key = state.section;
    state.draft[key] = clone(state.saved[key]);
    renderEditor();
  }

  async function resetToDefaults() {
    const key = state.section;
    if (!confirm(`ลบข้อมูลที่บันทึกไว้ของ "${SECTION_INFO[key].title}" และกลับไปใช้ค่าเริ่มต้นของเว็บไซต์หรือไม่?`)) return;
    state.busy = true; changed();
    try {
      // RLS turns a forbidden delete into "0 rows", not an error, so check what came back.
      const { data: gone, error } = await sb.from('site_content').delete().eq('key', key).select('key');
      if (error) throw error;
      if (!gone || !gone.length) throw Object.assign(new Error('no rows deleted'), { code: '42501' });
      state.saved[key] = C.normalize(key, C.defaults()[key]);
      state.draft[key] = clone(state.saved[key]);
      state.meta[key] = null;
      toast('กลับไปใช้ค่าเริ่มต้นแล้ว');
      state.busy = false;
      renderEditor();
    } catch (err) {
      state.busy = false; changed();
      toast(`คืนค่าไม่สำเร็จ: ${describeError(err)}`, 'error');
    }
  }

  // ---------- form building blocks ----------
  // Inputs write straight into the draft object; the editor only re-renders
  // for structural changes (add / remove / reorder), so focus is never lost.

  function field(label, control, hint, extraClass) {
    return h('label', { class: `field ${extraClass || ''}` },
      h('span', { class: 'field-label' }, label), control, hint ? h('span', { class: 'field-hint' }, hint) : null);
  }

  function text(obj, prop, attrs = {}) {
    return h('input', { type: 'text', value: obj[prop] ?? '', ...attrs, oninput: (e) => { obj[prop] = e.target.value; changed(); } });
  }

  function area(obj, prop, rows = 3, attrs = {}) {
    return h('textarea', { rows, ...attrs, oninput: (e) => { obj[prop] = e.target.value; changed(); } }, obj[prop] ?? '');
  }

  // Number input; `scale` shows a fraction as a percentage (0.005 ↔ 0.5).
  function number(obj, prop, { min, max, step = 'any', scale = 1, blankNull = false } = {}) {
    const v = obj[prop];
    return h('input', {
      type: 'number', inputmode: 'decimal', min, max, step,
      value: v === null || v === undefined || v === '' ? '' : String(+(v * scale).toFixed(6)),
      oninput: (e) => {
        const raw = e.target.value;
        obj[prop] = raw === '' ? (blankNull ? null : '') : Number(raw) / scale;
        changed();
      },
    });
  }

  // Lines of a textarea ↔ an array of strings.
  function lines(obj, prop, rows = 4) {
    return h('textarea', {
      rows,
      oninput: (e) => { obj[prop] = e.target.value.split('\n'); changed(); },
    }, (obj[prop] || []).join('\n'));
  }

  function smallBtn(label, onclick, attrs = {}) {
    return h('button', { class: 'btn btn--small', type: 'button', onclick, ...attrs }, label);
  }

  // URL input with validation and a live preview (image or video).
  function media(obj, prop, kind, label, hint) {
    const msg = h('span', { class: 'field-hint' }, hint || '');
    const preview = h('div', { class: `preview preview--${kind}` });
    let timer = 0;

    const show = () => {
      const raw = (obj[prop] || '').trim();
      const url = C.safeUrl(raw);
      preview.classList.remove('is-error');
      msg.classList.remove('is-error');
      msg.textContent = hint || '';
      if (!raw) { preview.replaceChildren(h('span', { class: 'preview-note' }, 'ยังไม่ได้ใส่ลิงก์')); return; }
      if (!url) {
        preview.classList.add('is-error');
        msg.classList.add('is-error');
        msg.textContent = 'ลิงก์ต้องขึ้นต้นด้วย https:// หรือเป็นไฟล์ในเว็บ เช่น Media/packages/home.jpg';
        preview.replaceChildren(h('span', { class: 'preview-note' }, 'ลิงก์ไม่ถูกต้อง'));
        return;
      }
      const fail = () => {
        preview.classList.add('is-error');
        preview.replaceChildren(h('span', { class: 'preview-note' }, kind === 'video' ? 'เปิดวิดีโอจากลิงก์นี้ไม่ได้' : 'เปิดรูปจากลิงก์นี้ไม่ได้'));
      };
      const el = kind === 'video'
        ? h('video', { src: url, muted: true, playsInline: true, preload: 'metadata', onerror: fail })
        : h('img', { src: url, alt: '', loading: 'lazy', onerror: fail });
      preview.replaceChildren(el);
    };

    const input = h('input', {
      type: 'url', inputmode: 'url', value: obj[prop] || '', placeholder: 'https://… หรือ Media/…',
      oninput: (e) => { obj[prop] = e.target.value; changed(); clearTimeout(timer); timer = setTimeout(show, 350); },
    });
    show();
    return h('div', { class: 'field media-field' },
      h('label', { class: 'field' }, h('span', { class: 'field-label' }, label), input, msg),
      preview);
  }

  // A plain URL (social links): validation message only.
  function link(obj, prop, label) {
    const msg = h('span', { class: 'field-hint' });
    const check = () => {
      const raw = (obj[prop] || '').trim();
      const ok = !raw || /^https:\/\//i.test(raw) && C.safeUrl(raw);
      msg.textContent = ok ? '' : 'ใส่ลิงก์เต็มที่ขึ้นต้นด้วย https://';
      msg.classList.toggle('is-error', !ok);
    };
    const input = h('input', { type: 'url', inputmode: 'url', value: obj[prop] || '', placeholder: 'https://', oninput: (e) => { obj[prop] = e.target.value; check(); changed(); } });
    check();
    return h('label', { class: 'field' }, h('span', { class: 'field-label' }, label), input, msg);
  }

  // ---------- section editors ----------

  function heroEditor(d) {
    while (d.lines.length < 3) d.lines.push('');
    return h('div', { class: 'stack-lg' },
      h('fieldset', { class: 'group' }, h('legend', {}, 'ข้อความ'),
        field('ป้ายกำกับเหนือหัวข้อ', text(d, 'tag', { maxlength: 80 })),
        h('div', { class: 'grid-3' },
          field('หัวข้อ บรรทัดที่ 1', text(d.lines, 0, { maxlength: 80 })),
          field('บรรทัดที่ 2', text(d.lines, 1, { maxlength: 80 })),
          field('บรรทัดที่ 3', text(d.lines, 2, { maxlength: 80 }), 'เว้นว่างได้')),
        field('คำโปรย', area(d, 'subtitle', 4, { maxlength: 600 })),
        h('div', { class: 'grid-2' },
          field('ปุ่มหลัก (ไปที่เครื่องคำนวณ)', text(d, 'ctaPrimary', { maxlength: 40 })),
          field('ปุ่มรอง (ไปที่แพ็กเกจ)', text(d, 'ctaSecondary', { maxlength: 40 })))),
      h('fieldset', { class: 'group' }, h('legend', {}, 'พื้นหลัง'),
        media(d, 'videoUrl', 'video', 'วิดีโอพื้นหลัง (MP4)', 'ไฟล์ MP4 ไม่มีเสียง ขนาดไม่เกิน ~5 MB เพื่อให้โหลดเร็วบนมือถือ'),
        media(d, 'posterUrl', 'image', 'ภาพแสดงก่อนวิดีโอเล่น (ไม่บังคับ)', 'แสดงระหว่างโหลดวิดีโอ และเมื่อผู้ใช้หยุดวิดีโอ')),
    );
  }

  function packagesEditor(d) {
    const seg = state.pkSeg;
    const group = d[seg];
    const segBtn = (val, label) => h('button', {
      class: 'seg-btn', type: 'button', 'aria-pressed': String(seg === val),
      onclick: () => { state.pkSeg = val; renderEditor(); },
    }, label);

    const move = (i, dir) => {
      const j = i + dir;
      [group.items[i], group.items[j]] = [group.items[j], group.items[i]];
      renderEditor();
    };

    const cards = group.items.map((p, i) => {
      const specRows = p.specs.map((row, r) => h('div', { class: 'spec-row' },
        text(row, 0, { placeholder: 'หัวข้อ เช่น รับประกันแผง', 'aria-label': `หัวข้อสเปกที่ ${r + 1}`, maxlength: 60 }),
        text(row, 1, { placeholder: 'รายละเอียด เช่น 30 ปี', 'aria-label': `รายละเอียดสเปกที่ ${r + 1}`, maxlength: 60 }),
        smallBtn('ลบ', () => { p.specs.splice(r, 1); renderEditor(); }, { 'aria-label': `ลบสเปกที่ ${r + 1}` })));

      return h('article', { class: 'card' },
        h('header', { class: 'card-head' },
          h('h3', {}, `แพ็กเกจที่ ${i + 1}`),
          h('span', { class: 'spacer' }),
          smallBtn('ขึ้น', () => move(i, -1), { disabled: i === 0, 'aria-label': `เลื่อนแพ็กเกจที่ ${i + 1} ขึ้น` }),
          smallBtn('ลง', () => move(i, 1), { disabled: i === group.items.length - 1, 'aria-label': `เลื่อนแพ็กเกจที่ ${i + 1} ลง` }),
          smallBtn('ลบ', () => {
            if (!confirm(`ลบ "${p.name || `แพ็กเกจที่ ${i + 1}`}" หรือไม่?`)) return;
            group.items.splice(i, 1);
            renderEditor();
          }, { class: 'btn btn--small btn--danger', 'aria-label': `ลบแพ็กเกจที่ ${i + 1}` })),
        h('div', { class: 'grid-2' },
          field('ชื่อแพ็กเกจ', text(p, 'name', { maxlength: 80 })),
          field('ป้าย (บนรูป)', text(p, 'badge', { maxlength: 60 }), 'เช่น ออนกริด 3 เฟส'),
          field('ขนาดระบบ (kWp)', number(p, 'kwp', { min: 0, step: 0.5 })),
          field('ราคาเริ่มต้นรวมติดตั้ง (บาท)', number(p, 'price', { min: 0, step: 1000 }), 'ใส่ 0 เพื่อซ่อนราคา')),
        field('เหมาะสำหรับ', area(p, 'fit', 2, { maxlength: 240 })),
        media(p, 'image', 'image', 'รูปแพ็กเกจ', 'ว่างไว้เพื่อใช้ภาพลายเส้นและวิดีโอเดิม'),
        h('div', { class: 'field' },
          h('span', { class: 'field-label' }, 'สเปกและจุดเด่น'),
          h('div', { class: 'specs' }, specRows),
          p.specs.length < 8 ? smallBtn('เพิ่มรายการ', () => { p.specs.push(['', '']); renderEditor(); }) : null));
    });

    return h('div', { class: 'stack-lg' },
      h('div', { class: 'seg', role: 'group', 'aria-label': 'ประเภทลูกค้า' },
        segBtn('home', 'บ้านและธุรกิจขนาดเล็ก'), segBtn('factory', 'โรงงานและอาคาร')),
      field('หมายเหตุใต้แพ็กเกจ', area(group, 'note', 2, { maxlength: 400 })),
      cards,
      group.items.length < 12
        ? h('button', {
            class: 'btn btn--dashed', type: 'button',
            onclick: () => {
              group.items.push({ name: '', kwp: 0, badge: '', fit: '', specs: [['', '']], price: 0, image: '', slot: '', t: (group.items.length * 2.7) % 9 });
              renderEditor();
            },
          }, 'เพิ่มแพ็กเกจ')
        : h('p', { class: 'muted small' }, 'มีแพ็กเกจครบ 12 รายการแล้ว'));
  }

  // Same formula as the public calculator (main.js), for the sample results.
  function roiSample(roi, seg) {
    const p = roi[seg];
    const units = p.bill.value / p.tariff;
    const dayUnits = units * (p.day / 100);
    let kw = Math.round(dayUnits / roi.yield / p.round) * p.round;
    kw = Math.min(Math.max(kw, p.minKw), p.maxKw);
    const tier = p.tiers.find((t) => t.upTo === null || kw <= t.upTo) || p.tiers[p.tiers.length - 1];
    const cost = kw * tier.perKw;
    const yearly = Math.min(kw * roi.yield, dayUnits) * p.tariff * 12;
    let cum = -cost, payback = null;
    for (let y = 1; y <= 25; y++) {
      const s = yearly * Math.pow(1 - roi.degradation, y - 1);
      const prev = cum;
      cum += s;
      if (payback === null && cum >= 0) payback = y - 1 + -prev / s;
    }
    return { kw, cost, payback };
  }

  let roiSampleEls = {};
  function updateRoiSamples() {
    const roi = C.normalize('roi', state.draft.roi);
    for (const seg of ['home', 'factory']) {
      const el = roiSampleEls[seg];
      if (!el) continue;
      const s = roiSample(roi, seg);
      el.textContent = `ตัวอย่าง: ค่าไฟ ${fmt(roi[seg].bill.value)} บาท/เดือน ใช้กลางวัน ${roi[seg].day}% → ระบบ ${fmt(s.kw, s.kw % 1 ? 1 : 0)} kWp ลงทุน ${fmt(Math.round(s.cost))} บาท คืนทุน ${s.payback === null ? 'เกิน 25 ปี' : `${fmt(s.payback, 1)} ปี`}`;
    }
  }

  function roiEditor(d) {
    roiSampleEls = {};
    const profile = (seg, label) => {
      const p = d[seg];
      const tierRows = p.tiers.map((t, i) => h('div', { class: 'tier-row' },
        field(i === p.tiers.length - 1 ? 'ระบบขนาดเกินกว่านั้น' : 'ระบบขนาดไม่เกิน (kWp)',
          i === p.tiers.length - 1 ? h('input', { type: 'text', value: 'ทุกขนาดที่เหลือ', disabled: true }) : number(t, 'upTo', { min: 0, step: 1 })),
        field('ต้นทุนต่อ kWp (บาท)', number(t, 'perKw', { min: 1, step: 500 })),
        p.tiers.length > 1 && i < p.tiers.length - 1
          ? smallBtn('ลบ', () => { p.tiers.splice(i, 1); renderEditor(); }, { 'aria-label': `ลบช่วงราคาที่ ${i + 1}` })
          : h('span')));
      const sample = h('p', { class: 'sample' });
      roiSampleEls[seg] = sample;
      return h('fieldset', { class: 'group' }, h('legend', {}, label),
        h('div', { class: 'grid-3' },
          field('ค่าไฟต่อหน่วย (บาท)', number(p, 'tariff', { min: 0.5, max: 50, step: 0.05 }), 'รวม Ft และภาษี'),
          field('สัดส่วนใช้ไฟกลางวันเริ่มต้น (%)', number(p, 'day', { min: 20, max: 90, step: 5 })),
          field('ปัดขนาดระบบทีละ (kWp)', number(p, 'round', { min: 0.1, step: 0.5 }))),
        h('div', { class: 'grid-4' },
          field('ค่าไฟต่ำสุดบนสไลเดอร์', number(p.bill, 'min', { min: 0, step: 100 })),
          field('ค่าไฟสูงสุด', number(p.bill, 'max', { min: 0, step: 100 })),
          field('ขั้นละ', number(p.bill, 'step', { min: 1, step: 100 })),
          field('ค่าเริ่มต้น', number(p.bill, 'value', { min: 0, step: 100 }))),
        h('div', { class: 'grid-2' },
          field('ขนาดระบบเล็กสุด (kWp)', number(p, 'minKw', { min: 0, step: 0.5 })),
          field('ขนาดระบบใหญ่สุด (kWp)', number(p, 'maxKw', { min: 0, step: 1 }))),
        h('div', { class: 'field' },
          h('span', { class: 'field-label' }, 'ต้นทุนติดตั้งตามขนาดระบบ'),
          h('div', { class: 'tiers' }, tierRows),
          p.tiers.length < 8 ? smallBtn('เพิ่มช่วงราคา', () => {
            const last = p.tiers[p.tiers.length - 1];
            const prevUp = p.tiers.length > 1 ? p.tiers[p.tiers.length - 2].upTo || 0 : 0;
            p.tiers.splice(p.tiers.length - 1, 0, { upTo: prevUp + 10, perKw: last.perKw });
            renderEditor();
          }) : null),
        sample);
    };

    return h('div', { class: 'stack-lg' },
      h('fieldset', { class: 'group' }, h('legend', {}, 'ค่ากลาง'),
        h('div', { class: 'grid-2' },
          field('ผลผลิตไฟเฉลี่ย (kWh ต่อ kWp ต่อเดือน)', number(d, 'yield', { min: 30, max: 250, step: 1 }), 'ค่าเฉลี่ยประเทศไทยประมาณ 110'),
          field('ประสิทธิภาพแผงลดลงต่อปี (%)', number(d, 'degradation', { min: 0, max: 5, step: 0.1, scale: 100 }), 'แผง N-type ทั่วไปประมาณ 0.4–0.5%'))),
      profile('home', 'บ้านและธุรกิจขนาดเล็ก'),
      profile('factory', 'โรงงานและอาคาร'));
  }

  function contactEditor(d) {
    return h('div', { class: 'stack-lg' },
      h('fieldset', { class: 'group' }, h('legend', {}, 'สำนักงาน'),
        field('ที่อยู่ (บรรทัดละหนึ่งรายการ)', lines(d, 'addressLines', 4))),
      h('fieldset', { class: 'group' }, h('legend', {}, 'ช่องทางติดต่อ'),
        h('div', { class: 'grid-2' },
          field('เบอร์โทร', text(d, 'phone', { inputmode: 'tel', maxlength: 80 }), 'หลายเบอร์ให้คั่นด้วยจุลภาค เบอร์แรกใช้กับปุ่มนัดสำรวจหน้างาน'),
          field('อีเมล', text(d, 'email', { inputmode: 'email', maxlength: 120 })),
          field('เวลาทำการ', text(d, 'hours', { maxlength: 80 })),
          field('LINE ID', text(d, 'lineId', { maxlength: 40, placeholder: '@solar1energy' }), 'ปุ่มในส่วนท้ายจะเปิดแชต LINE โดยตรง'))),
      h('fieldset', { class: 'group' }, h('legend', {}, 'โซเชียลมีเดีย'),
        h('div', { class: 'grid-2' },
          link(d, 'facebook', 'Facebook'),
          link(d, 'instagram', 'Instagram'),
          link(d, 'youtube', 'YouTube'),
          link(d, 'tiktok', 'TikTok'))));
  }

  function checkbox(obj, prop, label) {
    return h('label', { class: 'check' },
      h('input', { type: 'checkbox', checked: obj[prop] === true, onchange: (e) => { obj[prop] = e.target.checked; changed(); } }),
      h('span', {}, label));
  }

  function select(obj, prop, options) {
    return h('select', { onchange: (e) => { obj[prop] = e.target.value; changed(); } },
      options.map(([value, label]) => h('option', { value, selected: obj[prop] === value }, label)));
  }

  const PROJECT_CATEGORY_LABELS = [['industry', 'โรงงานและฟาร์ม'], ['business', 'ธุรกิจ อาคาร และองค์กร'], ['home', 'บ้านพักอาศัย']];

  function projectsEditor(d) {
    const move = (list, i, dir) => {
      const j = i + dir;
      [list[i], list[j]] = [list[j], list[i]];
      renderEditor();
    };

    const statRows = d.stats.map((s, i) => h('div', { class: 'grid-3' },
      field(`ตัวเลขที่ ${i + 1}`, number(s, 'value', { min: 0, step: 'any' }), 'ทศนิยมได้ เช่น 3.5'),
      field('หน่วยต่อท้าย', text(s, 'small', { maxlength: 20 }), 'เช่น + ปี, MW, ล้านบาท'),
      field('คำอธิบาย', text(s, 'label', { maxlength: 120 }))));

    const cards = d.items.map((p, i) => h('article', { class: 'card' },
      h('header', { class: 'card-head' },
        h('h3', {}, `${i + 1}. ${p.name || 'ผลงานใหม่'}`),
        h('span', { class: 'spacer' }),
        smallBtn('ขึ้น', () => move(d.items, i, -1), { disabled: i === 0, 'aria-label': `เลื่อนผลงานที่ ${i + 1} ขึ้น` }),
        smallBtn('ลง', () => move(d.items, i, 1), { disabled: i === d.items.length - 1, 'aria-label': `เลื่อนผลงานที่ ${i + 1} ลง` }),
        smallBtn('ลบ', () => {
          if (!confirm(`ลบ "${p.name || `ผลงานที่ ${i + 1}`}" หรือไม่?`)) return;
          d.items.splice(i, 1);
          renderEditor();
        }, { class: 'btn btn--small btn--danger', 'aria-label': `ลบผลงานที่ ${i + 1}` })),
      h('div', { class: 'grid-2' },
        field('ชื่อโครงการหรือลูกค้า', text(p, 'name', { maxlength: 120 }), 'ต้องมีชื่อ ผลงานที่ไม่มีชื่อจะไม่ถูกบันทึก'),
        field('ประเภท', select(p, 'category', PROJECT_CATEGORY_LABELS)),
        field('สถานที่', text(p, 'location', { maxlength: 120 }), 'อำเภอ/เขต, จังหวัด'),
        field('ปีที่ติดตั้งแล้วเสร็จ (พ.ศ.)', number(p, 'year', { min: 0, step: 1 }), 'ใส่ 0 หากไม่ต้องการแสดงปี'),
        field('ขนาดระบบ (kW)', number(p, 'kw', { min: 0, step: 'any' }), '1,000 kW ขึ้นไปจะแสดงเป็น MW'),
        field('ค่าไฟที่ลดได้ (บาท/เดือน)', number(p, 'saving', { min: 0, step: 100 }), 'ใส่ 0 เพื่อซ่อน')),
      h('div', { class: 'checks' },
        checkbox(p, 'savingUpTo', 'แสดงค่าไฟเป็น "สูงสุด" (กรณีข้อมูลเป็นช่วง)'),
        checkbox(p, 'featured', 'แสดงเป็นโครงการเด่น (การ์ดใหญ่ ใช้รายการแรกที่เลือก)')),
      media(p, 'image', 'image', 'รูปผลงาน', 'เช่น Media/projects/ชื่อไฟล์.webp หรือลิงก์ https://')));

    const clientRows = d.clients.map((c, i) => h('div', { class: 'card' },
      h('header', { class: 'card-head' },
        h('h3', {}, c.name || `โลโก้ที่ ${i + 1}`),
        h('span', { class: 'spacer' }),
        smallBtn('ขึ้น', () => move(d.clients, i, -1), { disabled: i === 0, 'aria-label': `เลื่อนโลโก้ที่ ${i + 1} ขึ้น` }),
        smallBtn('ลง', () => move(d.clients, i, 1), { disabled: i === d.clients.length - 1, 'aria-label': `เลื่อนโลโก้ที่ ${i + 1} ลง` }),
        smallBtn('ลบ', () => { d.clients.splice(i, 1); renderEditor(); }, { class: 'btn btn--small btn--danger', 'aria-label': `ลบโลโก้ที่ ${i + 1}` })),
      field('ชื่อลูกค้า (ใช้เป็นข้อความแทนรูป)', text(c, 'name', { maxlength: 80 })),
      media(c, 'logo', 'image', 'ไฟล์โลโก้', 'พื้นโปร่งใสหรือพื้นขาว เช่น Media/clients/ชื่อไฟล์.webp')));

    return h('div', { class: 'stack-lg' },
      h('fieldset', { class: 'group' }, h('legend', {}, 'ตัวเลขในส่วนเกี่ยวกับเรา (4 ช่อง)'), statRows),
      h('fieldset', { class: 'group' }, h('legend', {}, `ผลงานติดตั้ง (${d.items.length} รายการ)`),
        h('p', { class: 'muted small' }, 'ลำดับในรายการคือลำดับที่แสดงบนเว็บ หน้าเว็บแสดงครั้งละ 6 รายการพร้อมปุ่มดูทั้งหมด'),
        cards,
        d.items.length < 80
          ? h('button', {
              class: 'btn btn--dashed', type: 'button',
              onclick: () => {
                d.items.push({ name: '', category: 'business', location: '', kw: 0, saving: 0, savingUpTo: false, year: 0, image: '', featured: false });
                renderEditor();
              },
            }, 'เพิ่มผลงาน')
          : h('p', { class: 'muted small' }, 'มีผลงานครบ 80 รายการแล้ว')),
      h('fieldset', { class: 'group' }, h('legend', {}, 'โลโก้ลูกค้าองค์กร'),
        clientRows,
        d.clients.length < 30
          ? h('button', { class: 'btn btn--dashed', type: 'button', onclick: () => { d.clients.push({ name: '', logo: '' }); renderEditor(); } }, 'เพิ่มโลโก้')
          : null));
  }

  const EDITORS = { hero: heroEditor, packages: packagesEditor, roi: roiEditor, contact: contactEditor, projects: projectsEditor };
})();
