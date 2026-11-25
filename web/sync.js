// 같이 쓰기 (한 집, Travely 처럼 초대): Firebase 프로젝트 pixel-house-b99dd
//   계정 = 앱 안에서 가입/로그인 (이메일·비밀번호)
//   주인이 "같이 쓰는 집 만들기" -> houses/{집} + members/{나: owner}. 이 폰의 집이 그대로 올라감
//   초대 링크 = <주소>#join/{집}/{토큰} (7일). 받은 사람이 링크를 열고 로그인 -> members/{나: editor, 토큰} -> 그 집으로 바뀜
//   맞추는 파일 = houses/{집}/files/{life|features|profile}: 생활 기록 .md / 가구 연결 / 집·가구·펫·하우스 이름·탭
//   각자 것 = 내 이름·내 모습·옷차림·그림 세트·백업 사본
//   둘이 거의 동시에 바꾸면: 서버 것을 받은 뒤 내가 한 동작(물컵·체크·추가…)을 그 위에 다시 해서 올림 (둘 다 남음)
(function (root) {
  'use strict';
  const RT = root.__PHWebRT, WM = root.PHWebMain;
  if (!RT || !WM) return;
  const fs = RT.fs, ipc = RT.electron.ipcRenderer;
  const FIREBASE = {
    apiKey: 'AIzaSyBrgyOwy9NaYpZaom_TNXFiV3Enxtit1QQ', authDomain: 'pixel-house-b99dd.firebaseapp.com', projectId: 'pixel-house-b99dd',
    storageBucket: 'pixel-house-b99dd.firebasestorage.app', messagingSenderId: '50419967434', appId: '1:50419967434:web:bbeb7aaca178b911849b33',
  };
  const INVITE_DAYS = 7;
  const PROFILE_SHARED = ['house', 'furniture', 'pet', 'cat', 'brand', 'tabsHidden'];
  const FILES = {
    life: () => WM.lifeFile(),
    features: () => '/data/userData/features.json',
    profile: () => '/data/userData/profile.json',
  };
  const keyOf = (p) => { const r = RT.path.resolve(p); return Object.keys(FILES).find((k) => FILES[k]() && RT.path.resolve(FILES[k]()) === r) || null; };
  const localProfile = () => { try { return JSON.parse(fs.readFileSync(FILES.profile())); } catch (e) { return {}; } };
  const myName = () => localProfile().name || '';

  // ---- 상태 (이 폰) ----
  const MK = 'phsync:meta', OK = 'phsync:ops', JK = 'phsync:join';
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const meta = Object.assign({ on: false, house: '', houseName: '', role: '', linked: false, files: {}, lastAt: 0 }, load(MK, {}));
  meta.files = meta.files || {};
  let ops = load(OK, []);
  const saveMeta = () => { try { localStorage.setItem(MK, JSON.stringify(meta)); } catch (e) {} };
  const saveOps = () => { try { localStorage.setItem(OK, JSON.stringify(ops)); } catch (e) {} };
  const fm = (k) => (meta.files[k] = meta.files[k] || { v: 0, dirty: false });

  // 초대 링크로 열었으면 기억해 두고 주소에서는 지움
  (function catchInvite() {
    const m = String(location.hash || '').match(/^#join\/([A-Za-z0-9]{6,40})\/([A-Za-z0-9_-]{32,64})$/);
    if (!m) return;
    localStorage.setItem(JK, JSON.stringify({ house: m[1], token: m[2], at: Date.now() }));
    history.replaceState(null, '', location.pathname + location.search);
  })();
  const pendingJoin = () => { const j = load(JK, null); return j && j.house && j.token ? j : null; };

  // ---- 이 폰 파일 ↔ 서버 글 ----
  function readLocal(k) { const p = FILES[k](); try { return p && fs.existsSync(p) ? fs.readFileSync(p) : null; } catch (e) { return null; } }
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
      const cur = localProfile();
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
      if (!applying && meta.linked) { const k = keyOf(name === 'renameSync' ? b : a); if (k) { fm(k).dirty = true; saveMeta(); schedulePush(); } }
      return r;
    };
  });
  // 동작 기록: 생활 기록을 바꾼 IPC 를 적어 둠 (겹쳤을 때 서버 것 위에 다시 하기)
  const origInvoke = ipc.invoke.bind(ipc);
  ipc.invoke = async function (ch, arg) {
    const lf = FILES.life(), before = lf && fs.existsSync(lf) ? fs.statSync(lf).mtimeMs : 0;
    const res = await origInvoke(ch, arg);
    if (meta.linked && lf && fs.existsSync(lf) && fs.statSync(lf).mtimeMs !== before && arg && typeof arg === 'object' && 'lastModified' in arg) {
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
  function reopen(tab) {
    const q = new URLSearchParams(location.search), t = tab || (root.PHApp && root.PHApp.tab) || 'home';
    q.set('resume', JSON.stringify({ entered: true, tab: t }));
    location.replace(location.pathname + '?' + q.toString());
  }
  let reloadWanted = false;
  function wantReload() {
    reloadWanted = true;
    const tryNow = () => {
      if (!reloadWanted) return;
      const busy = root.PHLifeSync && root.PHLifeSync.busy && root.PHLifeSync.busy();
      if (busy || (root.PHSettingsUI && root.PHSettingsUI.isOpen && root.PHSettingsUI.isOpen())) { setTimeout(tryNow, 1500); return; }
      reloadWanted = false; reopen();
    };
    setTimeout(tryNow, 600);
  }
  let toastAt = 0;
  function note(msg, force) { if (!force && Date.now() - toastAt < 8000) return; toastAt = Date.now(); if (root.PHWeb && root.PHWeb.toast) root.PHWeb.toast(msg); }
  const ERR = {
    'auth/invalid-credential': '이메일이나 비밀번호가 맞지 않아요', 'auth/wrong-password': '이메일이나 비밀번호가 맞지 않아요', 'auth/user-not-found': '가입된 이메일이 아니에요',
    'auth/invalid-email': '이메일 모양이 아니에요', 'auth/email-already-in-use': '이미 가입된 이메일이에요. 로그인해 주세요', 'auth/weak-password': '비밀번호는 6자 이상이어야 해요',
    'auth/network-request-failed': '인터넷 연결을 확인해 주세요', 'auth/too-many-requests': '잠시 뒤에 다시 해 주세요', 'permission-denied': '권한이 없어요 (Firebase 규칙을 확인해 주세요)',
    'unavailable': '서버에 연결하지 못했어요. 인터넷을 확인해 주세요',
  };
  const errText = (e) => { const c = (e && (e.code || e.message)) || String(e); return ERR[c] || ERR[String(c).replace(/^firestore\//, '')] || c; };

  // ---- 서버 ----
  let backend = null, user = null, status = 'off', lastErr = '';
  const listeners = new Set();
  const refreshUI = () => listeners.forEach((f) => { try { f(); } catch (e) {} });
  const setStatus = (s, err) => { status = s; lastErr = err || ''; refreshUI(); };
  const token = () => { const a = new Uint8Array(30); crypto.getRandomValues(a); return Array.from(a, (b) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'[b & 63]).join('') + 'ph'; };

  function loadScript(src) {
    return new Promise((res, rej) => { if (root.PHFirebase) { res(); return; } const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Firebase 를 불러오지 못했어요 (인터넷 확인)')); document.head.appendChild(s); });
  }
  async function firebaseBackend() {
    await loadScript('web/firebase.js');
    const F = root.PHFirebase;
    const app = F.initializeApp(FIREBASE, 'pixelhouse');
    const auth = F.getAuth(app);
    const db = F.initializeFirestore(app, { localCache: F.memoryLocalCache() });
    const U = (u) => F.doc(db, 'users', u), M = (h, u) => F.doc(db, 'houses', h, 'members', u), I = (h, t) => F.doc(db, 'houses', h, 'invites', t);
    const fileRef = (h, k) => F.doc(db, 'houses', h, 'files', k);
    const uid = () => auth.currentUser && auth.currentUser.uid;
    return {
      kind: 'firebase',
      onUser(cb) { return F.onAuthStateChanged(auth, (u) => cb(u ? { email: u.email, uid: u.uid } : null)); },
      login: (email, pw) => F.signInWithEmailAndPassword(auth, email, pw),
      signUp: async (email, pw, name) => { const c = await F.createUserWithEmailAndPassword(auth, email, pw); if (name) { try { await F.updateProfile(c.user, { displayName: name }); } catch (e) {} } },
      logout: () => F.signOut(auth),
      // 내 집 목록 = users/{나}.houses (색인 없이 바로 읽음)
      async myHouses() {
        const s = await F.getDoc(U(uid())); const hs = (s.exists() && s.data().houses) || {};
        return Object.keys(hs).map((h) => ({ house: h, houseName: hs[h].houseName || '', role: hs[h].role || 'editor' }));
      },
      async createHouse(houseName, name) {
        const ref = F.doc(F.collection(db, 'houses')), b = F.writeBatch(db);
        b.set(ref, { ownerUid: uid(), name: houseName, createdAt: F.serverTimestamp() });
        b.set(M(ref.id, uid()), { uid: uid(), role: 'owner', status: 'active', name, houseName, joinedAt: F.serverTimestamp() });
        await b.commit();
        await F.setDoc(U(uid()), { houses: { [ref.id]: { houseName, role: 'owner' } } }, { merge: true });
        return ref.id;
      },
      async createInvite(h, houseName, inviterName) {
        const t = token();
        await F.setDoc(I(h, t), { revoked: false, createdBy: uid(), createdAt: F.serverTimestamp(), expiresAt: F.Timestamp.fromMillis(Date.now() + INVITE_DAYS * 864e5), houseName, inviterName });
        return t;
      },
      async getInvite(h, t) {
        const s = await F.getDoc(I(h, t)); if (!s.exists()) return null;
        const v = s.data(); return { houseName: v.houseName, inviterName: v.inviterName, valid: !v.revoked && v.expiresAt && v.expiresAt.toMillis() > Date.now() };
      },
      async join(h, t, name, houseName) {
        const me = await F.getDoc(M(h, uid()));
        if (me.exists() && me.data().status === 'active') { await F.setDoc(U(uid()), { houses: { [h]: { houseName, role: me.data().role } } }, { merge: true }); return me.data().role; }
        await F.setDoc(M(h, uid()), { uid: uid(), role: 'editor', status: 'active', name, houseName, inviteToken: t, joinedAt: F.serverTimestamp() });
        await F.setDoc(U(uid()), { houses: { [h]: { houseName, role: 'editor' } } }, { merge: true });
        return 'editor';
      },
      async members(h) { const s = await F.getDocs(F.collection(db, 'houses', h, 'members')); const out = []; s.forEach((d) => { const v = d.data(); if (v.status === 'active') out.push({ name: v.name, role: v.role }); }); return out; },
      watch(h, cb, onErr) {
        return F.onSnapshot(F.collection(db, 'houses', h, 'files'), (snap) => {
          const docs = {}; snap.forEach((d) => { const v = d.data(); docs[d.id] = { t: v.t, v: v.v || 0, by: v.by || '' }; });
          cb(docs, snap.metadata.fromCache);
        }, onErr);
      },
      push(h, k, baseV, text, by) {
        return F.runTransaction(db, async (tx) => {
          const s = await tx.get(fileRef(h, k));
          const rv = s.exists() ? (s.data().v || 0) : 0;
          if (rv !== baseV) return { ok: false, remote: s.exists() ? { t: s.data().t, v: rv } : null };
          tx.set(fileRef(h, k), { t: text, v: baseV + 1, by, at: F.serverTimestamp() });
          return { ok: true, v: baseV + 1 };
        });
      },
    };
  }
  // 시험용 가짜 서버 (localStorage phsync:mock = 1 일 때만, tools 의 mock_server.py)
  function mockBackend() {
    let cbUser = null;
    const api = async (op, q) => { const r = await (await fetch('/mock/api', { method: 'POST', body: JSON.stringify(Object.assign({ op, uid: user && user.uid }, q)) })).json(); if (r.error) { const e = new Error(r.error); e.code = r.error; throw e; } return r; };
    const setU = (u) => { if (u) localStorage.setItem('phsync:mockuser', JSON.stringify(u)); else localStorage.removeItem('phsync:mockuser'); cbUser && cbUser(u); };
    return {
      kind: 'mock',
      onUser(cb) { cbUser = cb; setTimeout(() => cb(load('phsync:mockuser', null)), 0); return () => {}; },
      login: async (email, pw) => setU((await api('login', { email, pw })).user),
      signUp: async (email, pw, name) => setU((await api('signup', { email, pw, name })).user),
      logout: async () => setU(null),
      myHouses: async () => (await api('myHouses', {})).houses,
      createHouse: async (houseName, name) => (await api('createHouse', { houseName, name })).house,
      createInvite: async (h, houseName, inviterName) => (await api('createInvite', { h, houseName, inviterName })).token,
      getInvite: async (h, t) => (await api('getInvite', { h, t })).invite,
      join: async (h, t, name, houseName) => (await api('join', { h, t, name, houseName })).role,
      members: async (h) => (await api('members', { h })).members,
      watch(h, cb) {
        let stop = false;
        (async function loop() { while (!stop) { try { cb((await api('files', { h })).docs, false); } catch (e) {} await new Promise((r) => setTimeout(r, 400)); } })();
        return () => { stop = true; };
      },
      push: async (h, k, baseV, text, by) => api('push', { h, k, baseV, text, by }),
    };
  }
  let starting = null;
  function ensureBackend() {
    if (backend) return Promise.resolve(backend);
    if (starting) return starting;
    setStatus('connecting');
    starting = (async () => {
      try { backend = localStorage.getItem('phsync:mock') === '1' ? mockBackend() : await firebaseBackend(); }
      catch (e) { starting = null; setStatus('error', e.message); throw e; }
      await new Promise((res) => {
        let first = true;
        backend.onUser((u) => {
          user = u;
          if (first) { first = false; res(); }
          if (!u) { stopWatch(); setStatus('off'); return; }
          if (meta.linked && meta.house) startWatch(); else setStatus('signed');
        });
      });
      return backend;
    })();
    return starting;
  }

  // ---- 맞추기 ----
  let unwatch = null, pushT = null, pushing = false, firstSnap = true;
  function stopWatch() { if (unwatch) { unwatch(); unwatch = null; } }
  function startWatch() {
    stopWatch(); firstSnap = true; setStatus('connecting');
    unwatch = backend.watch(meta.house, onDocs, (e) => setStatus('error', errText(e)));
  }
  function schedulePush(ms) { clearTimeout(pushT); pushT = setTimeout(pushAll, ms == null ? 300 : ms); }
  async function pushAll() {
    if (!backend || !user || !meta.linked || !meta.house) return;
    if (pushing) { schedulePush(500); return; }
    pushing = true;
    try {
      for (const k of Object.keys(FILES)) {
        const f = fm(k); if (!f.dirty) continue;
        for (let tries = 0; tries < 4; tries++) {
          const text = toRemote(k, readLocal(k)); if (text == null) { f.dirty = false; break; }
          const nOps = ops.length;
          const r = await backend.push(meta.house, k, f.v, text, user.email);
          if (r.ok) { f.v = r.v; f.dirty = false; if (k === 'life') { ops = ops.slice(nOps); saveOps(); } meta.lastAt = Date.now(); saveMeta(); break; }
          if (k === 'life') { // 겹침: 서버 것을 받고 내 동작을 그 위에 다시
            const mine = ops.slice(); ops = []; saveOps();
            writeLocal('life', r.remote ? r.remote.t : ''); f.v = r.remote ? r.remote.v : 0; f.dirty = false; saveMeta();
            const n = mine.length ? await replayOps(mine) : 0;
            ops = mine.concat(ops); saveOps();
            f.dirty = n > 0; saveMeta(); tellLife();
          } else {
            if (r.remote) writeLocal(k, r.remote.t); f.v = r.remote ? r.remote.v : 0; f.dirty = false; saveMeta();
            note('상대가 먼저 바꾼 설정으로 맞췄어요', true); wantReload(); break;
          }
          if (!f.dirty) break;
        }
      }
      setStatus('on');
    } catch (e) {
      setStatus('error', errText(e)); schedulePush(15000);
    } finally { pushing = false; }
  }
  function onDocs(docs, fromCache) {
    let lifeNew = false, otherNew = false;
    Object.keys(FILES).forEach((k) => {
      const d = docs[k]; if (!d) return; const f = fm(k);
      if (d.v <= f.v) return;
      if (f.dirty) { schedulePush(0); return; }
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
  function backupLocal(tag) {
    const st = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
    Object.keys(FILES).forEach((k) => { const t = readLocal(k); if (t != null) fs.writeFileSync('/data/userData/backup/before_' + tag + '_' + st + '_' + k, t); });
  }
  function linkTo(house, houseName, role) {
    meta.on = true; meta.house = house; meta.houseName = houseName || ''; meta.role = role; meta.linked = true; meta.files = {}; saveMeta(); ops = []; saveOps();
  }
  // 서버 집을 받아 이 폰을 그 집으로 (들어가기·다시 연결)
  async function pullHouse(house) {
    const docs = await new Promise((res, rej) => { let u = null; u = backend.watch(house, (d) => { setTimeout(() => u && u(), 0); res(d); }, rej); });
    backupLocal('join');
    Object.keys(FILES).forEach((k) => { const d = docs[k], f = fm(k); if (d) { writeLocal(k, d.t); f.v = d.v; f.dirty = false; } else { f.v = 0; f.dirty = readLocal(k) != null; } });
    saveMeta();
  }

  // ---- 동작 (화면에서 부름) ----
  async function signIn(mode, email, pw, name) {
    await ensureBackend();
    email = String(email || '').trim().toLowerCase();
    if (mode === 'up') await backend.signUp(email, pw, name || myName()); else await backend.login(email, pw);
  }
  async function createHouse() {
    await ensureBackend(); if (!user) throw new Error('먼저 로그인해 주세요');
    const p = localProfile(), name = p.name || '나';
    const houseName = (p.brand && p.brand !== 'Pixel House') ? p.brand : name + '님의 집';
    const h = await backend.createHouse(houseName, name);
    linkTo(h, houseName, 'owner');
    Object.keys(FILES).forEach((k) => { fm(k).dirty = readLocal(k) != null; }); saveMeta();
    startWatch(); await pushAll();
    note('같이 쓰는 집을 만들었어요. 이제 초대 링크를 보내 주세요', true);
  }
  async function reconnect(h) {
    await ensureBackend();
    linkTo(h.house, h.houseName, h.role);
    await pullHouse(h.house);
    note('내 집에 다시 연결했어요. 다시 여는 중…', true);
    setTimeout(() => reopen('home'), 800);
  }
  async function makeInvite() {
    await ensureBackend();
    const t = await backend.createInvite(meta.house, meta.houseName || '우리 집', myName() || '집주인');
    const base = location.origin + location.pathname.replace(/index\.html$/, '');
    return base + '#join/' + meta.house + '/' + t;
  }
  async function shareInvite(url) {
    const text = (myName() || '') + '님이 Pixel House 집에 초대했어요';
    try { if (navigator.share) { await navigator.share({ title: 'Pixel House 초대', text, url }); return 'shared'; } } catch (e) { if (e && e.name === 'AbortError') return 'cancel'; }
    try { await navigator.clipboard.writeText(url); return 'copied'; } catch (e) { return 'shown'; }
  }
  async function acceptInvite(j) {
    await ensureBackend(); if (!user) throw new Error('먼저 로그인해 주세요');
    const inv = await backend.getInvite(j.house, j.token);
    if (!inv || !inv.valid) { localStorage.removeItem(JK); throw new Error('초대 링크가 만료됐거나 없어요. 새 링크를 받아 주세요'); }
    const role = await backend.join(j.house, j.token, myName() || '나', inv.houseName);
    linkTo(j.house, inv.houseName, role);
    await pullHouse(j.house);
    localStorage.removeItem(JK);
    note(inv.houseName + '에 들어왔어요. 다시 여는 중…', true);
    setTimeout(() => reopen('home'), 900);
  }
  async function leave(logout) {
    stopWatch();
    meta.on = false; meta.linked = false; meta.house = ''; meta.houseName = ''; meta.role = ''; meta.files = {}; saveMeta(); ops = []; saveOps();
    if (logout && backend) { try { await backend.logout(); } catch (e) {} }
    setStatus(user && !logout ? 'signed' : 'off');
  }
  root.addEventListener('online', () => schedulePush(0));
  setInterval(() => { if (meta.linked && Object.keys(FILES).some((k) => fm(k).dirty)) schedulePush(0); }, 20000);

  // ---- 화면 ----
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const hm = (t) => { if (!t) return ''; const d = new Date(t), p = (x) => String(x).padStart(2, '0'); return `${d.getMonth() + 1}/${d.getDate()} ${p(d.getHours())}:${p(d.getMinutes())}`; };
  function authForm(onDone) {
    const f = document.createElement('form'); f.className = 'phw-login'; let mode = 'in';
    const paint = () => {
      f.innerHTML = `<div class="phw-seg"><button type="button" data-m="in" class="${mode === 'in' ? 'on' : ''}">로그인</button><button type="button" data-m="up" class="${mode === 'up' ? 'on' : ''}">처음이에요 (가입)</button></div>`
        + '<input type="email" name="e" placeholder="이메일" autocomplete="username" required>'
        + `<input type="password" name="p" placeholder="비밀번호${mode === 'up' ? ' (6자 이상)' : ''}" autocomplete="${mode === 'up' ? 'new-password' : 'current-password'}" minlength="6" required>`
        + `<button type="submit" class="main">${mode === 'up' ? '가입하고 시작' : '로그인'}</button>`;
      f.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => { mode = b.dataset.m; paint(); }));
    };
    paint();
    f.addEventListener('submit', async (e) => {
      e.preventDefault(); const b = f.querySelector('button[type=submit]'), label = b.textContent; b.disabled = true; b.textContent = '잠시만요…';
      try { await signIn(mode, f.e.value, f.p.value); if (onDone) onDone(); } catch (err) { note(errText(err), true); b.disabled = false; b.textContent = label; }
    });
    return f;
  }
  function btn(label, cls, fn) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = label; if (cls) b.className = cls;
    b.addEventListener('click', async () => { const l = b.textContent; b.disabled = true; b.textContent = '잠시만요…'; try { await fn(b); } catch (e) { note(errText(e), true); } finally { if (b.isConnected) { b.disabled = false; b.textContent = l; } } });
    return b;
  }
  function section() {
    const s = document.createElement('section'); s.className = 'phw-backup phw-sync';
    let houses = null, members = null, invite = '';
    const paint = async () => {
      s.innerHTML = '<h4>같이 쓰기</h4>';
      const p = (html) => { const x = document.createElement('p'); x.innerHTML = html; s.appendChild(x); return x; };
      const row = () => { const r = document.createElement('div'); r.className = 'phw-row'; s.appendChild(r); return r; };
      if (status === 'error') p('<span class="phw-err">' + esc(lastErr) + '</span>');
      if (meta.linked && meta.house) {
        p(`<b>${esc(meta.houseName || '같이 쓰는 집')}</b> · ${meta.role === 'owner' ? '내가 만든 집' : '초대받은 집'}${user ? '' : ' · <b>로그인 필요</b>'}`);
        if (user) {
          p(`${esc(user.email)} · ${status === 'on' ? (meta.lastAt ? hm(meta.lastAt) + ' 맞춤' : '연결됨') : '연결 중…'}`);
          const ml = p(members ? '함께 사는 사람: ' + members.map((m) => esc(m.name) + (m.role === 'owner' ? '(주인)' : '')).join(', ') : '');
          if (!members) backend.members(meta.house).then((m) => { members = m; if (s.isConnected) ml.textContent = '함께 사는 사람: ' + m.map((x) => x.name + (x.role === 'owner' ? '(주인)' : '')).join(', '); }).catch(() => {});
          if (meta.role === 'owner') {
            p('초대 링크를 보내면 상대가 링크를 열고 로그인해서 이 집에 들어와요. 링크는 ' + INVITE_DAYS + '일 동안 쓸 수 있어요.');
            const r = row();
            r.appendChild(btn('초대 링크 보내기', 'main', async () => { invite = await makeInvite(); const how = await shareInvite(invite); if (how === 'copied') note('초대 링크를 복사했어요. 카톡에 붙여 넣어 보내 주세요', true); paint(); }));
            if (invite) { const i = document.createElement('input'); i.className = 'phw-link'; i.readOnly = true; i.value = invite; i.addEventListener('focus', () => i.select()); s.appendChild(i); }
          }
          const r2 = row(); r2.appendChild(btn('이 폰에서 같이 쓰기 끄기', '', async () => { if (confirm('이 폰에서 같이 쓰기를 끌까요? 이 폰의 기록은 그대로 남아요.')) { await leave(true); paint(); } }));
        } else s.appendChild(authForm(paint));
        return;
      }
      if (!user) {
        p('내가 집을 만들고 초대 링크를 보내면, 둘이 한 집(물컵·습관·기록·약속·가구)을 같이 써요. 내 이름·모습·옷은 각자예요.');
        s.appendChild(authForm(paint)); return;
      }
      p(`<b>${esc(user.email)}</b> 로 로그인했어요.`);
      if (houses === null) { p('내 집을 찾는 중…'); backend.myHouses().then((h) => { houses = h; paint(); }).catch((e) => { houses = []; note(errText(e), true); paint(); }); return; }
      const j = pendingJoin();
      if (j) { p('받은 초대가 있어요.'); row().appendChild(btn('초대받은 집에 들어가기', 'main', async () => { await acceptInvite(j); })); }
      houses.forEach((h) => { row().appendChild(btn(`'${h.houseName || '같이 쓰는 집'}' 다시 연결`, j ? '' : 'main', async () => { await reconnect(h); })); });
      if (!houses.length && !j) p('이 폰의 집을 같이 쓰는 집으로 만들고, 초대 링크를 보내 주세요.');
      row().appendChild(btn('이 폰의 집으로 같이 쓰는 집 만들기', houses.length || j ? '' : 'main', async () => { await createHouse(); invite = ''; paint(); }));
      row().appendChild(btn('로그아웃', '', async () => { await leave(true); houses = null; paint(); }));
    };
    listeners.add(() => { if (s.isConnected) paint(); });
    paint(); return s;
  }
  new MutationObserver(() => {
    const p = document.getElementById('cfg-panel'); if (!p) return;
    const ui = root.PHSettingsUI, tab = ui && ui.U && ui.U.tab;
    if (tab === 'side' && !p.querySelector('.phw-sync')) { const b = p.querySelector('.phw-backup'); if (b) { p.insertBefore(section(), b); if (!backend && (meta.on || pendingJoin())) ensureBackend().catch(() => {}); } }
  }).observe(document.documentElement, { childList: true, subtree: true });

  // 초대 링크로 열었을 때: 처음 설정이 끝나 있으면 들어가기 카드
  function inviteCard() {
    const j = pendingJoin(); if (!j || document.querySelector('.phw-invite')) return;
    if (root.PHProfile && root.PHProfile.isOnboard && root.PHProfile.isOnboard()) return; // 처음 설정을 먼저 (끝나면 다시 열리며 이 카드)
    const ov = document.createElement('div'); ov.className = 'phw-invite';
    const card = document.createElement('div'); card.className = 'phw-backup phw-invite-card'; ov.appendChild(card);
    const close = () => { ov.classList.remove('on'); setTimeout(() => ov.remove(), 260); };
    const paint = async () => {
      card.innerHTML = '<h4>집 초대가 왔어요</h4>';
      const p = (html) => { const x = document.createElement('p'); x.innerHTML = html; card.appendChild(x); return x; };
      if (!user) { p('초대한 집에 들어가려면 로그인(처음이면 가입)해 주세요. 내 이름·모습은 그대로예요.'); card.appendChild(authForm(paint)); }
      else {
        let inv = null; try { inv = await backend.getInvite(j.house, j.token); } catch (e) { p('<span class="phw-err">' + esc(errText(e)) + '</span>'); }
        if (inv && inv.valid) {
          p(`<b>${esc(inv.inviterName)}</b>님이 <b>${esc(inv.houseName)}</b>에 초대했어요. 들어갈까요?`);
          p('이 폰의 지금 집·기록은 그 집으로 바뀌어요 (지금 기록은 백업 사본으로 남겨요).');
          const r = document.createElement('div'); r.className = 'phw-row'; card.appendChild(r);
          r.appendChild(btn('들어가기', 'main', async () => { await acceptInvite(j); close(); }));
        } else if (inv) p('초대 링크가 만료됐어요. 새 링크를 받아 주세요.');
        else if (inv === null && !card.querySelector('.phw-err')) p('초대 링크가 없거나 지워졌어요. 새 링크를 받아 주세요.');
      }
      const r2 = document.createElement('div'); r2.className = 'phw-row'; card.appendChild(r2);
      r2.appendChild(btn('나중에', '', async () => close()));
      r2.appendChild(btn('초대 지우기', '', async () => { localStorage.removeItem(JK); close(); }));
    };
    document.body.appendChild(ov); requestAnimationFrame(() => requestAnimationFrame(() => ov.classList.add('on')));
    ensureBackend().then(paint, () => { card.innerHTML = '<h4>집 초대가 왔어요</h4><p class="phw-err">' + esc(lastErr || '연결하지 못했어요') + '</p>'; });
    paint();
  }
  root.addEventListener('load', () => setTimeout(inviteCard, 600));

  if (meta.linked || meta.on) ensureBackend().catch(() => {});
  root.PHSync = { ensureBackend, signIn, createHouse, makeInvite, acceptInvite, reconnect, leave, meta: () => meta, status: () => status, pushAll, ops: () => ops, user: () => user };
})(window);
