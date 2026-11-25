// 같이 쓰기 (한 집): 생활 기록·가구 연결·집 설정을 Firebase(Firestore)로 두 폰이 맞춤
//   저장 = 그대로 이 폰(localStorage)에 먼저, 그다음 서버로 올림. 서버에서 바뀐 것은 내려받아 화면에 알림(life_sync.js)
//   같이 쓰는 것: 생활 기록 .md / features.json(가구 연결) / profile.json 중 집·가구·펫·하우스 이름·탭
//   각자 것: 내 이름·내 모습(아바타)·옷차림·그림 세트·백업 사본
//   둘이 거의 동시에 기록을 바꾸면: 서버 것을 받은 뒤 내가 한 동작(물컵·체크·추가…)을 그 위에 다시 해서 올림 (둘 다 남음)
(function (root) {
  'use strict';
  const RT = root.__PHWebRT, WM = root.PHWebMain;
  if (!RT || !WM) return;
  const fs = RT.fs, ipc = RT.electron.ipcRenderer;
  const HOUSE = 'main';
  const FIREBASE = {
    apiKey: 'AIzaSyD3n15JbHIPAIRmRACRvFiTmgEkbVHRqzo', authDomain: 'study-duo-dae68.firebaseapp.com', projectId: 'study-duo-dae68',
    storageBucket: 'study-duo-dae68.firebasestorage.app', messagingSenderId: '420102682191', appId: '1:420102682191:web:8ba1e32f06390336609c3a',
  };
  const PROFILE_SHARED = ['house', 'furniture', 'pet', 'cat', 'brand', 'tabsHidden'];
  const FILES = {
    life: () => WM.lifeFile(),
    features: () => '/data/userData/features.json',
    profile: () => '/data/userData/profile.json',
  };
  const keyOf = (p) => { const r = RT.path.resolve(p); return Object.keys(FILES).find((k) => FILES[k]() && RT.path.resolve(FILES[k]()) === r) || null; };

  // ---- 상태 (이 폰) ----
  const MK = 'phsync:meta', OK = 'phsync:ops';
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const meta = load(MK, { on: false, email: '', linked: false, files: {}, lastAt: 0 });
  meta.files = meta.files || {};
  let ops = load(OK, []);
  const saveMeta = () => { try { localStorage.setItem(MK, JSON.stringify(meta)); } catch (e) {} };
  const saveOps = () => { try { localStorage.setItem(OK, JSON.stringify(ops)); } catch (e) {} };
  const fm = (k) => (meta.files[k] = meta.files[k] || { v: 0, dirty: false });

  // ---- 이 폰 파일 ↔ 서버 글 ----
  function readLocal(k) { const p = FILES[k](); try { return fs.existsSync(p) ? fs.readFileSync(p) : null; } catch (e) { return null; } }
  function toRemote(k, text) {
    if (text == null) return null;
    if (k !== 'profile') return text;
    try { const v = JSON.parse(text), o = {}; PROFILE_SHARED.forEach((f) => { if (v[f] !== undefined) o[f] = v[f]; }); return JSON.stringify(o); } catch (e) { return null; }
  }
  let applying = false;
  function writeLocal(k, remoteText) {
    const p = FILES[k](); if (!p) return false;
    let text = remoteText;
    if (k === 'profile') {
      let cur = {}; try { cur = JSON.parse(readLocal('profile') || '{}'); } catch (e) { cur = {}; }
      let r = {}; try { r = JSON.parse(remoteText || '{}'); } catch (e) { r = {}; }
      PROFILE_SHARED.forEach((f) => { if (r[f] === undefined) delete cur[f]; else cur[f] = r[f]; });
      if (!cur.bundle) return false; // 이 폰은 아직 처음 설정 전
      text = JSON.stringify(cur, null, 2);
    }
    if (readLocal(k) === text) return false;
    applying = true; try { fs.writeFileSync(p, text); } finally { applying = false; }
    return true;
  }

  // 쓰기 감시: 같이 쓰는 파일이 이 폰에서 바뀌면 올릴 것으로 표시
  ['writeFileSync', 'renameSync'].forEach((name) => {
    const orig = fs[name];
    fs[name] = function (a, b) {
      const r = orig.apply(this, arguments);
      if (!applying && meta.on) { const k = keyOf(name === 'renameSync' ? b : a); if (k) { fm(k).dirty = true; saveMeta(); schedulePush(); } }
      return r;
    };
  });
  // 동작 기록: 생활 기록을 바꾼 IPC 를 적어 둠 (겹쳤을 때 서버 것 위에 다시 하기)
  const origInvoke = ipc.invoke.bind(ipc);
  ipc.invoke = async function (ch, arg) {
    const lf = FILES.life(), before = lf && fs.existsSync(lf) ? fs.statSync(lf).mtimeMs : 0;
    const res = await origInvoke(ch, arg);
    if (meta.on && lf && fs.existsSync(lf) && fs.statSync(lf).mtimeMs !== before && arg && typeof arg === 'object' && 'lastModified' in arg) {
      ops.push({ ch, arg: JSON.parse(JSON.stringify(arg)) }); if (ops.length > 50) ops = ops.slice(-50); saveOps();
    }
    return res;
  };
  async function replayOps(list) {
    const lf = FILES.life(); let n = 0;
    for (const o of list) {
      const a = Object.assign({}, o.arg, { lastModified: fs.statSync(lf).mtimeMs });
      try { const r = await origInvoke(o.ch, a); if (!(r && r.conflict)) n++; } catch (e) { /* 이제 안 맞는 동작(이미 지운 줄 등)은 건너뜀 */ }
    }
    return n;
  }

  // ---- 화면에 알리기 ----
  function tellLife() {
    const lf = FILES.life(); if (!lf || !fs.existsSync(lf)) return;
    const d = { lastModified: fs.statSync(lf).mtimeMs, why: 'remote' };
    (RT.listeners['ph:lifeChanged'] || []).forEach((cb) => { try { cb({ lastModified: d.lastModified, why: d.why }); } catch (e) {} });
  }
  let reloadWanted = false;
  function wantReload() {
    reloadWanted = true;
    const tryNow = () => {
      if (!reloadWanted) return;
      const busy = root.PHLifeSync && root.PHLifeSync.busy && root.PHLifeSync.busy();
      if (busy || (root.PHSettingsUI && root.PHSettingsUI.isOpen && root.PHSettingsUI.isOpen())) { setTimeout(tryNow, 1500); return; }
      reloadWanted = false;
      // 보던 탭 그대로, 입장 화면 건너뛰고 다시 열기 (js/artset.js resume)
      const q = new URLSearchParams(location.search), tab = root.PHApp && root.PHApp.tab;
      q.set('resume', JSON.stringify({ entered: true, tab: tab || 'home' }));
      location.replace(location.pathname + '?' + q.toString());
    };
    setTimeout(tryNow, 600);
  }
  let toastAt = 0;
  function note(msg, force) { if (!force && Date.now() - toastAt < 8000) return; toastAt = Date.now(); if (root.PHWeb && root.PHWeb.toast) root.PHWeb.toast(msg); }

  // ---- 서버 (Firebase 또는 시험용) ----
  let backend = null, user = null, status = 'off', lastErr = '';
  const listeners = new Set();
  const setStatus = (s, err) => { status = s; lastErr = err || ''; listeners.forEach((f) => { try { f(); } catch (e) {} }); };

  function loadScript(src) {
    return new Promise((res, rej) => { if (root.PHFirebase) { res(); return; } const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Firebase 를 불러오지 못했어요')); document.head.appendChild(s); });
  }
  async function firebaseBackend() {
    await loadScript('web/firebase.js');
    const F = root.PHFirebase;
    const app = F.initializeApp(FIREBASE, 'pixelhouse');
    const auth = F.getAuth(app);
    const db = F.initializeFirestore(app, { localCache: F.memoryLocalCache() });
    const ref = (k) => F.doc(db, 'pixelhouse', HOUSE, 'files', k);
    return {
      kind: 'firebase',
      onUser(cb) { return F.onAuthStateChanged(auth, (u) => cb(u ? { email: u.email, uid: u.uid } : null)); },
      login: (email, pw) => F.signInWithEmailAndPassword(auth, email, pw),
      logout: () => F.signOut(auth),
      watch(cb, onErr) {
        return F.onSnapshot(F.collection(db, 'pixelhouse', HOUSE, 'files'), (snap) => {
          const docs = {}; snap.forEach((d) => { const v = d.data(); docs[d.id] = { t: v.t, v: v.v || 0, by: v.by || '' }; });
          cb(docs, snap.metadata.fromCache);
        }, onErr);
      },
      push(k, baseV, text, by) {
        return F.runTransaction(db, async (tx) => {
          const s = await tx.get(ref(k));
          const rv = s.exists() ? (s.data().v || 0) : 0;
          if (rv !== baseV) return { ok: false, remote: s.exists() ? { t: s.data().t, v: rv } : null };
          tx.set(ref(k), { t: text, v: baseV + 1, by, at: F.serverTimestamp() });
          return { ok: true, v: baseV + 1 };
        });
      },
    };
  }
  // 시험용: 같은 주소의 /mock/ (tools 의 시험 서버). localStorage phsync:mock = 1 일 때만
  function mockBackend() {
    let cbUser = null, cur = null;
    return {
      kind: 'mock',
      onUser(cb) { cbUser = cb; const e = localStorage.getItem('phsync:mockuser'); cur = e ? { email: e, uid: e } : null; setTimeout(() => cb(cur), 0); return () => {}; },
      login: async (email) => { localStorage.setItem('phsync:mockuser', email); cur = { email, uid: email }; cbUser && cbUser(cur); },
      logout: async () => { localStorage.removeItem('phsync:mockuser'); cur = null; cbUser && cbUser(null); },
      watch(cb) {
        let stop = false;
        (async function loop() { while (!stop) { try { const r = await fetch('/mock/files'); cb(await r.json(), false); } catch (e) {} await new Promise((r) => setTimeout(r, 400)); } })();
        return () => { stop = true; };
      },
      push: async (k, baseV, text, by) => (await fetch('/mock/push', { method: 'POST', body: JSON.stringify({ k, baseV, text, by }) })).json(),
    };
  }

  // ---- 맞추기 ----
  let unwatch = null, pushT = null, pushing = false, firstSnap = true, remote = {};
  function schedulePush(ms) { clearTimeout(pushT); pushT = setTimeout(pushAll, ms == null ? 300 : ms); }
  async function pushAll() {
    if (!backend || !user || !meta.linked || pushing) { if (pushing) schedulePush(500); return; }
    pushing = true;
    try {
      for (const k of Object.keys(FILES)) {
        const f = fm(k); if (!f.dirty) continue;
        for (let tries = 0; tries < 4; tries++) {
          const text = toRemote(k, readLocal(k)); if (text == null) { f.dirty = false; break; }
          const nOps = ops.length;
          const r = await backend.push(k, f.v, text, user.email);
          if (r.ok) { f.v = r.v; f.dirty = false; if (k === 'life') { ops = ops.slice(nOps); saveOps(); } meta.lastAt = Date.now(); saveMeta(); break; }
          // 겹침: 서버 것을 받고
          if (k === 'life') {
            const mine = ops.slice(); ops = []; saveOps();
            writeLocal('life', r.remote ? r.remote.t : ''); f.v = r.remote ? r.remote.v : 0; f.dirty = false; saveMeta();
            const n = mine.length ? await replayOps(mine) : 0; // 내 동작을 그 위에 다시
            ops = mine.concat(ops); saveOps(); // 올라갈 때까지 들고 있음 (또 겹치면 또 다시 함)
            f.dirty = n > 0; saveMeta(); tellLife();
          } else {
            if (r.remote) writeLocal(k, r.remote.t); f.v = r.remote ? r.remote.v : 0; f.dirty = false; saveMeta();
            note('상대가 먼저 바꾼 설정으로 맞췄어요', true); wantReload(); break;
          }
          saveMeta();
          if (!f.dirty) break;
        }
      }
      setStatus('on');
    } catch (e) {
      setStatus('error', (e && (e.code || e.message)) || String(e)); schedulePush(15000);
    } finally { pushing = false; }
  }
  function onDocs(docs, fromCache) {
    remote = docs;
    if (!meta.linked) { link(docs); return; }
    let lifeNew = false, otherNew = false;
    Object.keys(FILES).forEach((k) => {
      const d = docs[k]; if (!d) return; const f = fm(k);
      if (d.v <= f.v) return;
      if (f.dirty) { schedulePush(0); return; } // 겹침은 올릴 때 풀림
      const changed = writeLocal(k, d.t); f.v = d.v;
      if (changed) { if (k === 'life') lifeNew = true; else otherNew = true; }
    });
    meta.lastAt = Date.now(); saveMeta();
    if (lifeNew) { tellLife(); if (!firstSnap) note('같이 쓰는 집에 새 기록이 있어요'); }
    if (otherNew) { note('같이 쓰는 집 설정이 바뀌어서 다시 열어요', true); wantReload(); }
    firstSnap = false;
    if (!fromCache) setStatus('on');
    if (Object.keys(FILES).some((k) => fm(k).dirty)) schedulePush();
  }
  // 처음 연결: 서버가 비었으면 이 폰 집을 올림, 아니면 서버 집으로 바꿈
  let linking = false;
  async function link(docs) {
    if (linking) return; linking = true;
    try {
      const empty = !docs.life;
      if (empty) {
        Object.keys(FILES).forEach((k) => { const f = fm(k); f.v = 0; f.dirty = readLocal(k) != null; });
        meta.linked = true; saveMeta(); ops = []; saveOps();
        note('이 폰의 집을 같이 쓰는 집으로 올렸어요', true);
        schedulePush(0); return;
      }
      if (!confirm('같이 쓰는 집이 이미 있어요. 이 폰을 그 집으로 바꿀까요?\n(이 폰의 지금 기록은 백업 사본으로 남겨 둬요. 내 이름·모습은 그대로예요)')) { await stop(true); return; }
      const st = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
      Object.keys(FILES).forEach((k) => { const t = readLocal(k); if (t != null) fs.writeFileSync('/data/userData/backup/before_share_' + st + '_' + k, t); });
      Object.keys(FILES).forEach((k) => { const d = docs[k], f = fm(k); if (d) { writeLocal(k, d.t); f.v = d.v; } else { f.v = 0; f.dirty = readLocal(k) != null; } });
      meta.linked = true; saveMeta(); ops = []; saveOps();
      note('같이 쓰는 집으로 바꿨어요. 다시 여는 중…', true);
      setTimeout(() => location.reload(), 900);
    } finally { linking = false; }
  }

  async function start() {
    if (backend) return;
    setStatus('connecting');
    try { backend = localStorage.getItem('phsync:mock') === '1' ? mockBackend() : await firebaseBackend(); }
    catch (e) { backend = null; setStatus('error', e.message); return; }
    backend.onUser((u) => {
      user = u;
      if (unwatch) { unwatch(); unwatch = null; }
      if (!u) { setStatus(meta.on ? 'login' : 'off'); return; }
      meta.on = true; meta.email = u.email; saveMeta();
      firstSnap = true;
      unwatch = backend.watch(onDocs, (e) => setStatus('error', (e && (e.code || e.message)) || String(e)));
      setStatus('connecting');
    });
  }
  async function stop(logout) {
    if (unwatch) { unwatch(); unwatch = null; }
    if (logout && backend) { try { await backend.logout(); } catch (e) {} }
    meta.on = false; meta.linked = false; meta.files = {}; saveMeta(); ops = []; saveOps();
    setStatus('off');
  }
  async function login(email, pw) {
    meta.on = true; saveMeta();
    await start(); if (!backend) throw new Error(lastErr || '연결하지 못했어요');
    await backend.login(String(email || '').trim().toLowerCase(), pw);
  }
  root.addEventListener('online', () => schedulePush(0));
  setInterval(() => { if (Object.keys(FILES).some((k) => fm(k).dirty)) schedulePush(0); }, 20000);

  // ---- 설정 창: 같이 쓰기 ----
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const hm = (t) => { if (!t) return ''; const d = new Date(t), p = (x) => String(x).padStart(2, '0'); return `${d.getMonth() + 1}/${d.getDate()} ${p(d.getHours())}:${p(d.getMinutes())}`; };
  function section() {
    const s = document.createElement('section'); s.className = 'phw-backup phw-sync';
    const paint = () => {
      const on = !!user && meta.on;
      const st = status === 'error' ? `연결 문제: ${esc(lastErr)}` : status === 'connecting' ? '연결 중…' : on ? `<b>${esc(user.email)}</b> 로 같이 쓰는 중${meta.lastAt ? ' · ' + hm(meta.lastAt) + ' 맞춤' : ''}` : '';
      s.innerHTML = '<h4>같이 쓰기 (한 집)</h4>'
        + (on ? `<p>${st}</p><p>물컵·습관·기록·약속·가구 연결·집 설정을 같이 써요. 내 이름·모습·옷은 각자예요.</p><div class="phw-row"><button type="button" data-a="out">그만 같이 쓰기</button></div>`
          : `<p>우리의 공부 앱과 같은 계정으로 로그인하면 둘이 한 집을 같이 써요.${st ? '<br>' + st : ''}</p>`
          + '<form class="phw-login"><input type="email" name="e" placeholder="이메일" autocomplete="username" required><input type="password" name="p" placeholder="비밀번호" autocomplete="current-password" required><button type="submit" class="main">로그인</button></form>');
      const f = s.querySelector('form');
      if (f) f.addEventListener('submit', async (e) => {
        e.preventDefault(); const b = f.querySelector('button'); b.disabled = true; b.textContent = '연결 중…';
        try { await login(f.e.value, f.p.value); } catch (err) { const c = String(err && (err.code || err.message) || err); note(/invalid-credential|wrong-password|user-not-found|invalid-email/.test(c) ? '이메일이나 비밀번호가 맞지 않아요' : '로그인하지 못했어요: ' + c, true); b.disabled = false; b.textContent = '로그인'; }
      });
      const o = s.querySelector('[data-a=out]');
      if (o) o.addEventListener('click', async () => { if (confirm('같이 쓰기를 그만둘까요? 이 폰의 기록은 그대로 남아요.')) { await stop(true); paint(); } });
    };
    listeners.add(() => { if (s.isConnected) paint(); });
    paint(); return s;
  }
  new MutationObserver(() => {
    const p = document.getElementById('cfg-panel'); if (!p) return;
    const ui = root.PHSettingsUI, tab = ui && ui.U && ui.U.tab;
    if (tab === 'side' && !p.querySelector('.phw-sync')) { const b = p.querySelector('.phw-backup'); if (b) p.insertBefore(section(), b); }
  }).observe(document.documentElement, { childList: true, subtree: true });

  if (meta.on) start();
  root.PHSync = { start, stop, login, meta: () => meta, status: () => status, pushAll, ops: () => ops };
})(window);
