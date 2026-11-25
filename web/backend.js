// Pixel House 모바일 웹판: Electron 메인 프로세스 대신 브라우저 안에서 같은 코드를 돌리는 작은 런타임
//   fs = 브라우저 저장소(localStorage)에 파일을 두는 가짜 파일 시스템, ipcMain/ipcRenderer = 함수 호출
(function () {
  'use strict';
  const W = window;
  // ---------- path (posix) ----------
  function normalizeArr(parts) {
    const out = [];
    parts.forEach((p) => { if (!p || p === '.') return; if (p === '..') out.pop(); else out.push(p); });
    return out;
  }
  const path = {
    sep: '/', delimiter: ':',
    isAbsolute: (p) => String(p).startsWith('/'),
    normalize: (p) => '/' + normalizeArr(String(p).split('/')).join('/'),
    join: (...a) => { const s = a.filter((x) => x !== '').join('/'); const abs = s.startsWith('/'); const n = normalizeArr(s.split('/')).join('/'); return (abs ? '/' : '') + n || '.'; },
    resolve: (...a) => { let r = ''; for (let i = a.length - 1; i >= 0; i--) { r = a[i] + (r ? '/' + r : ''); if (String(a[i]).startsWith('/')) break; } if (!r.startsWith('/')) r = '/' + r; return '/' + normalizeArr(r.split('/')).join('/'); },
    dirname: (p) => { const s = String(p).replace(/\/+$/, ''); const i = s.lastIndexOf('/'); return i <= 0 ? '/' : s.slice(0, i); },
    basename: (p, ext) => { let b = String(p).replace(/\/+$/, '').split('/').pop(); if (ext && b.endsWith(ext)) b = b.slice(0, -ext.length); return b; },
    extname: (p) => { const b = path.basename(p); const i = b.lastIndexOf('.'); return i > 0 ? b.slice(i) : ''; },
  };
  path.posix = path;

  // ---------- fs (localStorage) ----------
  const PFX = 'phfs:';
  const STATIC = {}; // 읽기 전용 앱 파일 (빌드가 채움)
  const DIRS = new Set(['/', '/app', '/data']);
  let lastM = 0;
  const now = () => { let t = Date.now(); if (t <= lastM) t = lastM + 1; lastM = t; return t; };
  function err(code, p) { const e = new Error(code + ': ' + p); e.code = code; return e; }
  function getRec(p) {
    p = path.resolve(p);
    if (Object.prototype.hasOwnProperty.call(STATIC, p)) return { t: STATIC[p], m: 1 };
    let raw = null; try { raw = W.localStorage.getItem(PFX + p); } catch (e) { raw = null; }
    if (raw == null) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }
  function putRec(p, rec) {
    p = path.resolve(p);
    try { W.localStorage.setItem(PFX + p, JSON.stringify(rec)); }
    catch (e) { const x = new Error('저장 공간이 부족해요 (' + p + ')'); x.code = 'ENOSPC'; throw x; }
    let d = path.dirname(p); while (d && !DIRS.has(d)) { DIRS.add(d); d = path.dirname(d); }
  }
  function allKeys() { const out = []; try { for (let i = 0; i < W.localStorage.length; i++) { const k = W.localStorage.key(i); if (k && k.startsWith(PFX)) out.push(k.slice(PFX.length)); } } catch (e) {} return out.concat(Object.keys(STATIC)); }
  function isDir(p) { p = path.resolve(p); if (DIRS.has(p)) return true; const pre = p === '/' ? '/' : p + '/'; return allKeys().some((k) => k.startsWith(pre)); }
  const fs = {
    constants: { R_OK: 4, W_OK: 2, F_OK: 0 },
    readFileSync(p, enc) { const r = getRec(p); if (!r) throw err('ENOENT', p); return r.t; },
    writeFileSync(p, data, opt) {
      const flag = opt && typeof opt === 'object' ? opt.flag : null;
      if (flag === 'wx' && getRec(p)) throw err('EEXIST', p);
      if (Object.prototype.hasOwnProperty.call(STATIC, path.resolve(p))) throw err('EROFS', p);
      putRec(p, { t: String(data), m: now() });
    },
    existsSync(p) { return !!getRec(p) || isDir(p); },
    statSync(p) {
      const r = getRec(p);
      if (r) return { mtimeMs: r.m, size: r.t.length, isFile: () => true, isDirectory: () => false };
      if (isDir(p)) return { mtimeMs: 0, size: 0, isFile: () => false, isDirectory: () => true };
      throw err('ENOENT', p);
    },
    accessSync(p) { if (!fs.existsSync(p)) throw err('ENOENT', p); },
    mkdirSync(p) { let d = path.resolve(p); while (d && !DIRS.has(d)) { DIRS.add(d); d = path.dirname(d); } },
    renameSync(a, b) { const r = getRec(a); if (!r) throw err('ENOENT', a); putRec(b, { t: r.t, m: now() }); fs.unlinkSync(a); },
    unlinkSync(p) { try { W.localStorage.removeItem(PFX + path.resolve(p)); } catch (e) {} },
    rmSync(p) { fs.unlinkSync(p); },
    readdirSync(p) {
      const pre = path.resolve(p) === '/' ? '/' : path.resolve(p) + '/';
      const names = new Set();
      allKeys().forEach((k) => { if (k.startsWith(pre)) names.add(k.slice(pre.length).split('/')[0]); });
      DIRS.forEach((d) => { if (d.startsWith(pre) && d !== pre) names.add(d.slice(pre.length).split('/')[0]); });
      return Array.from(names).filter(Boolean).sort();
    },
    copyFileSync(a, b) { fs.writeFileSync(b, fs.readFileSync(a)); },
    watchFile() {}, unwatchFile() {}, watch() { return { close() {} }; },
  };

  // ---------- electron ----------
  const handlers = {}, onHandlers = {}, listeners = {};
  const ipcMain = {
    handle(ch, fn) { handlers[ch] = fn; },
    removeHandler(ch) { delete handlers[ch]; },
    on(ch, fn) { onHandlers[ch] = fn; },
  };
  const app = {
    getPath: (n) => ({ userData: '/data/userData', documents: '/data/Documents', home: '/data' }[n] || '/data/' + n),
    setName() {}, getName: () => 'Pixel House',
  };
  const dialog = { showOpenDialog: async () => ({ canceled: false, filePaths: ['/data/Documents/PixelHouse'] }) };
  const clone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));
  const ipcRenderer = {
    invoke(ch, arg) {
      return new Promise((res, rej) => {
        const h = handlers[ch];
        if (!h) { rej(new Error("No handler registered for '" + ch + "'")); return; }
        Promise.resolve().then(() => h({ sender: null }, clone(arg))).then((v) => res(clone(v)), (e) => {
          console.warn('[ph]', ch, e);
          rej(new Error("Error invoking remote method '" + ch + "': " + (e && e.message ? 'Error: ' + e.message : e)));
        });
      });
    },
    sendSync(ch, arg) { const h = onHandlers[ch]; const e = { returnValue: undefined }; if (h) h(e, arg); return clone(e.returnValue); },
    on(ch, cb) { (listeners[ch] = listeners[ch] || []).push(cb); },
  };
  const contextBridge = { exposeInMainWorld(k, v) { W[k] = v; } };
  const electron = { app, ipcMain, dialog, ipcRenderer, contextBridge, shell: { openExternal: (u) => W.open(u, '_blank') } };

  // ---------- 메인 쪽 전역 (화면 전역과 따로: Electron 메인 프로세스처럼) ----------
  const mainGlobal = {};
  const mainRoot = new Proxy(mainGlobal, {
    get(t, k) { if (k in t) return t[k]; if (typeof k === 'string' && /^(PH|__PH)/.test(k)) return undefined; const v = W[k]; return typeof v === 'function' && !/^[A-Z]/.test(k) ? v.bind(W) : v; },
    set(t, k, v) { t[k] = v; return true; },
    has(t, k) { return k in t || (!(typeof k === 'string' && /^PH/.test(k)) && k in W); },
  });
  const processMain = { env: {}, platform: 'web', versions: { node: '22' }, cwd: () => '/app' };
  const processPage = { env: {}, platform: 'web', versions: {}, cwd: () => '/app' };

  // ---------- 모듈 (CommonJS) ----------
  const MODS = {}; // 경로 -> function(module, exports, require, __filename, __dirname, window, globalThis, process, global, self)
  const cache = {};
  const BUILTIN = { fs, path, electron, os: { homedir: () => '/data', tmpdir: () => '/tmp', platform: () => 'web' } };
  function resolveFrom(dir, name) {
    if (BUILTIN[name]) return name;
    const base = name.startsWith('/') ? name : path.resolve(dir, name);
    for (const c of [base, base + '.js', base + '/index.js']) if (MODS[c] || Object.prototype.hasOwnProperty.call(STATIC, c)) return c;
    throw new Error("Cannot find module '" + name + "' from " + dir);
  }
  function load(id, isPage) {
    if (BUILTIN[id]) return BUILTIN[id];
    const key = (isPage ? 'p:' : 'm:') + id;
    if (cache[key]) return cache[key].exports;
    if (!MODS[id] && /\.json$/.test(id)) { const m = { exports: JSON.parse(STATIC[id]) }; cache[key] = m; return m.exports; }
    const module = { exports: {}, id, filename: id };
    cache[key] = module;
    const dir = path.dirname(id);
    const req = (n) => load(resolveFrom(dir, n), isPage);
    req.cache = {}; req.resolve = (n) => resolveFrom(dir, n);
    const R = isPage ? W : mainRoot, P = isPage ? processPage : processMain;
    MODS[id].call(R, module, module.exports, req, id, dir, R, R, P, R, R);
    return module.exports;
  }
  W.__PHWebRT = { MODS, STATIC, fs, path, electron, load, mainRoot, listeners };
})();

(function (RT) {
RT.STATIC["/app/profiles/default/profile.json"] = "{\n  \"id\": \"default\",\n  \"note\": \"공용판 묶음. 코드 기본값(원룸·아바타·이웃 없음)을 그대로 쓰고, 이름·아바타·집·기록 폴더는 첫 실행 온보딩에서 고른 값(앱 설정 폴더 profile.json)을 쓴다.\",\n  \"user\": \"\",\n  \"patch\": {}\n}\n";
RT.MODS["/app/web/web_main.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 모바일 웹판 메인 (electron/main.js 의 저장 부분만 옮김). 창·메뉴·바탕화면 펫·시험 코드는 없음
'use strict';
const { app, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const ROOT = '/app';
const Prof = require('/app/electron/profile_main.js')({ app, ROOT, env: process.env });
let PROFILE = Prof.choose();
function setProfileEnv() {
  process.env.PH_PROFILE = PROFILE.id;
  if (PROFILE.id === 'default' && PROFILE.user && PROFILE.user.name) process.env.PH_PROFILE_USER = JSON.stringify({ name: PROFILE.user.name, cat: PROFILE.user.cat, avatar: PROFILE.user.avatar, house: PROFILE.user.house, pet: PROFILE.user.pet, brand: PROFILE.user.brand, tabsHidden: PROFILE.user.tabsHidden });
}
setProfileEnv();
function bootData() {
  const u = PROFILE.user || {};
  return { id: PROFILE.id, bundle: PROFILE.bundle || {}, onboard: !!PROFILE.onboard,
    user: PROFILE.id === 'default' ? { name: u.name || '', cat: u.cat || '', avatar: u.avatar || '', house: u.house || '', furniture: u.furniture || {}, pet: u.pet || '', brand: u.brand || '', tabsHidden: u.tabsHidden || [], desktopPet: false } : {} };
}
ipcMain.on('ph:profileSync', (e) => { e.returnValue = bootData(); });

let HOUSE = PROFILE.dir ? path.resolve(PROFILE.dir) : null;
const HousePath = require('/app/electron/house_path.js');
function resolveSafe(rel) { return HousePath.safeMd(HOUSE, rel); }
ipcMain.handle('ph:read', (e, rel) => {
  const full = resolveSafe(rel);
  return { text: fs.readFileSync(full, 'utf8'), lastModified: fs.statSync(full).mtimeMs };
});

require('/app/js/data/settings.js');
require('/app/js/life_md.js');
const S = globalThis.PH_SETTINGS;
let LIFE_FULL = null, backup = null, FEAT = null, houseOn = false;
function today() { return globalThis.PHLifeMd.logDay(Date.now(), S.DAY_START_HOUR); }
require('/app/electron/outfit_ipc.js')({ ipcMain, app });
function startHouse() {
  if (houseOn) return; houseOn = true;
  LIFE_FULL = resolveSafe(S.LIFE_FILE);
  backup = require('/app/electron/life_backup.js')({ dir: () => path.join(app.getPath('userData'), 'backup'), file: LIFE_FULL, keep: 5 });
  const base = { ipcMain, file: LIFE_FULL, backup, settings: S, fixedDay: () => null, guard: () => {} };
  require('/app/electron/water_ipc.js')(Object.assign({}, base, { today }));
  FEAT = require('/app/electron/furnish_ipc.js')({ ipcMain, app, file: LIFE_FULL });
  base.features = FEAT;
  require('/app/electron/life_log_ipc.js')(base);
  require('/app/electron/life_check_ipc.js')(base);
  require('/app/electron/study_ipc.js')(base);
  require('/app/electron/book_ipc.js')(base);
  require('/app/electron/household_ipc.js')(base);
  const habitIpc = require('/app/electron/habit_ipc.js')(base);
  try { habitIpc.migrate(); } catch (e) { console.warn('migrate', e); }
  require('/app/electron/meeting_ipc.js')(base);
  require('/app/electron/record_ipc.js')(base);
  require('/app/electron/logs_ipc.js')(base);
}

// ---- 그림 세트 ----
const SET_NAMES = globalThis.__PH_SET_NAMES || [];
const SET_LABELS = globalThis.__PH_SET_LABELS || {};
const prefsPath = () => path.join(app.getPath('userData'), 'prefs.json');
function readPrefs() { try { const p = JSON.parse(fs.readFileSync(prefsPath(), 'utf8')); return p && typeof p === 'object' ? p : {}; } catch (e) { return {}; } }
function writePrefs(p) { try { fs.writeFileSync(prefsPath(), JSON.stringify(p, null, 2)); return true; } catch (e) { return false; } }
function chooseSet() {
  const ok = (k) => typeof k === 'string' && SET_NAMES.includes(k);
  if (PROFILE && PROFILE.id === 'default' && PROFILE.user && ok(PROFILE.user.house)) return PROFILE.user.house;
  const p = readPrefs().artSet; if (ok(p)) return p;
  if (ok(S.ART_SET_DEFAULT)) return S.ART_SET_DEFAULT;
  return SET_NAMES[SET_NAMES.length - 1] || null;
}
const DIRS = ['up', 'down', 'left', 'right'], TABS = ['home', 'habits', 'meetings', 'bucket', 'archive'];
function cleanResume(r) {
  if (!r || typeof r !== 'object') return null;
  const n = (v) => (typeof v === 'number' && isFinite(v) ? Math.min(1, Math.max(0, v)) : undefined);
  return { entered: r.entered === true, zone: typeof r.zone === 'string' && /^[a-z_]{1,20}$/.test(r.zone) ? r.zone : undefined,
    fx: n(r.fx), fy: n(r.fy), face: DIRS.includes(r.face) ? r.face : undefined, tab: TABS.includes(r.tab) ? r.tab : undefined,
    settings: ['pet', 'house', 'avatar', 'side'].includes(r.settings) ? r.settings : undefined };
}
function pageUrl(set, resume) {
  const q = new URLSearchParams(); q.set('pb', '1'); if (set) q.set('set', set); if (resume) q.set('resume', JSON.stringify(resume));
  return location.pathname + '?' + q.toString();
}
let currentSet = null;
function openPage(set, resume) { setTimeout(() => location.replace(pageUrl(set, resume)), 0); }
ipcMain.handle('ph:setArtSet', (e, req) => {
  const set = req && req.set; if (!SET_NAMES.includes(set)) return false;
  const p = readPrefs(); p.artSet = set; writePrefs(p);
  openPage(set, cleanResume(req && req.resume)); return true;
});
ipcMain.handle('ph:artSets', () => ({ current: currentSet, sets: SET_NAMES.map((k) => ({ id: k, label: SET_LABELS[k] || k })) }));

function houseReady() {
  PROFILE = Prof.choose(); setProfileEnv();
  HOUSE = PROFILE.dir ? path.resolve(PROFILE.dir) : null;
  if (!HOUSE || PROFILE.onboard) return;
  openPage(chooseSet(), null); // 새로 읽으면서 집을 연다
}
if (!PROFILE.onboard) startHouse();
else Prof.registerOnboard({ ipcMain, dialog, getWin: () => null, S, onDone: houseReady });
Prof.registerFurniture({ ipcMain, onChange: (u) => { if (u && PROFILE.id === 'default') PROFILE.user = u; } });
Prof.registerSettings({ ipcMain, onChange: (u) => { if (u && PROFILE.id === 'default') { PROFILE.user = u; setProfileEnv(); } } });

// 처음 열 때: 주소에 pb=1·set 을 붙여 둔다 (화면 스크립트가 읽기 전, 다시 읽지 않음)
(function fixUrl() {
  const q = new URLSearchParams(location.search);
  const want = q.get('set');
  currentSet = SET_NAMES.includes(want) ? want : chooseSet();
  if (q.get('pb') !== '1' || !q.get('set')) {
    let resume = null; try { resume = q.get('resume') ? JSON.parse(q.get('resume')) : null; } catch (e) { resume = null; }
    history.replaceState(null, '', pageUrl(currentSet, cleanResume(resume)));
  }
})();

// ---- 백업 (내보내기·가져오기) ----
module.exports = {
  lifeFile: () => (HOUSE ? path.join(HOUSE, ...String(S.LIFE_FILE).split('/')) : null),
  profile: () => PROFILE,
};

};
RT.MODS["/app/electron/profile_main.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 설정 묶음 고르기 + 첫 실행 온보딩 (메인 프로세스, 2026-10-08 로드맵 4단계). 규칙·묶음 합치기는 js/profile.js
//   저장: 앱 설정 폴더 userData/profile.json
//     제작자 판 = { bundle: 'player' }  /  공용판 = { bundle: 'default', name, avatar, house, dir, furniture: { 자리 id: 그림 이름 }, createdAt }
//   고르는 순서
//     1) 환경변수 PH_PROFILE (시험): 'player' | 'default'
//     2) userData/profile.json
//     3) 제작자 묶음(profiles/player)이 있고 그 기록 파일이 있으면(PH_HOUSE 또는 묶음 houseDir) 제작자 판 -> profile.json 에 적어 둠
//        = 제작자 컴퓨터는 지금처럼 바로 열림 (가장 중요한 시험). 공개 저장소에는 profiles/player 가 없음
//     4) 그 밖 = 공용판 온보딩 (이름 -> 아바타 -> 집 -> 기록 폴더 -> 습관)
//   기록 폴더는 사용자가 폴더 고르기 창에서 고른 곳 또는 기본(~/Documents/PixelHouse)만 받는다 (화면이 아무 경로나 보낼 수 없음)
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

const NAME_MAX = 12;
const NAME_BAD = /[|｜\\/<>`*#{}\[\]\u0000-\u001f\u007f\u2028\u2029]/;
const HOUSES = ['room1', 'room2', 'room3']; // 집 목록 (목록형): 원룸·투룸·쓰리룸 (2026-10-08 무늬 공용판투룸쓰리룸 v01, 제작자 지시)
const AVATARS = ['avatar1', 'avatar2', 'avatar3'];
const CAT_DEFAULT = '두부'; // 고양이 이름 기본 (js/profile.js CAT_DEFAULT와 같음)
const SLOT_RE = /^[a-z][a-z0-9_]{0,30}$/, SPRITE_RE = /^[a-z][a-z0-9_]{0,40}$/;
// 설정 화면 (공용판, 2026-10-08 무늬 설정화면 v01 6절): 펫·하우스 이름·숨긴 사이드바 탭. 값 목록은 화면 js/data/pet_lines.js 와 같게
const PETS = ['cat_white', 'cat_cheese', 'cat_black', 'dog_white', 'dog_yellow'];
const PET_DEFAULT_NAME = { cat: '두부', dog: '콩떡' }; // 펫 이름을 비웠을 때 (js/data/pet_lines.js PH_PET_KIND 와 같음. 강아지 = 부기 제안, 제작자 확인 전)
const BRAND_MAX = 10; // 하우스 이름 (무늬 4-2: 사이드바 176px 칸, 부기 임시 20자와 다름 -> 제작자 확인)
const BRAND_DEFAULT = 'Pixel House';
const TAB_IDS = ['habits', 'meetings', 'bucket', 'archive']; // 우리집(home)은 늘 보임

function cleanName(s) {
  if (typeof s !== 'string') return { ok: false, code: 'empty' };
  const t = s.replace(/\s+/g, ' ').trim();
  if (!t) return { ok: false, code: 'empty' };
  if (NAME_BAD.test(t)) return { ok: false, code: 'bad' };
  if (Array.from(t).length > NAME_MAX) return { ok: false, code: 'tooLong' };
  return { ok: true, name: t };
}
function cleanBrand(s) { // 하우스 이름: 이름과 같은 글자 규칙, BRAND_MAX자
  if (typeof s !== 'string') return { ok: false, code: 'empty' };
  const t = s.replace(/\s+/g, ' ').trim();
  if (!t) return { ok: false, code: 'empty' };
  if (NAME_BAD.test(t)) return { ok: false, code: 'bad' };
  if (Array.from(t).length > BRAND_MAX) return { ok: false, code: 'tooLong' };
  return { ok: true, name: t };
}
const cleanTabs = (a) => (Array.isArray(a) ? TAB_IDS.filter((t) => a.includes(t)) : []);
function cleanFurniture(f) {
  const out = {};
  if (!f || typeof f !== 'object' || Array.isArray(f)) return out;
  Object.keys(f).slice(0, 40).forEach((k) => { if (SLOT_RE.test(k) && typeof f[k] === 'string' && SPRITE_RE.test(f[k])) out[k] = f[k]; });
  return out;
}
const expand = (p) => (typeof p === 'string' && p.startsWith('~/') ? path.join(os.homedir(), p.slice(2)) : p);

module.exports = function create(o) {
  const { app, ROOT, env } = o;
  const store = () => path.join(app.getPath('userData'), 'profile.json');
  const bundleFile = (id) => path.join(ROOT, 'profiles', id, 'profile.json');
  function loadBundle(id) { try { const v = JSON.parse(fs.readFileSync(bundleFile(id), 'utf8')); return v && typeof v === 'object' ? v : null; } catch (e) { return null; } }
  function read() {
    try {
      const v = JSON.parse(fs.readFileSync(store(), 'utf8'));
      if (!v || typeof v !== 'object') return null;
      if (v.bundle === 'player') return { bundle: 'player' };
      if (v.bundle !== 'default') return null;
      const n = cleanName(v.name);
      if (!n.ok || !AVATARS.includes(v.avatar) || !HOUSES.includes(v.house) || typeof v.dir !== 'string' || !path.isAbsolute(v.dir)) return null;
      const c = cleanName(v.cat); // 고양이 이름 (2026-10-08 3-1단계, 없거나 이상하면 기본 두부 = 안 적음)
      const b = cleanBrand(v.brand), tabs = cleanTabs(v.tabsHidden); // 설정 화면 값 (없으면 안 적음 = 기본)
      return Object.assign({ bundle: 'default', name: n.name, avatar: v.avatar, house: v.house, dir: v.dir, furniture: cleanFurniture(v.furniture), createdAt: v.createdAt || null }, c.ok ? { cat: c.name } : {},
        PETS.includes(v.pet) ? { pet: v.pet } : {}, b.ok ? { brand: b.name } : {}, tabs.length ? { tabsHidden: tabs } : {},
        v.desktopPet === true ? { desktopPet: true } : {}); // 바탕화면 펫 (2026-10-13, 처음 꺼짐 = 안 적음)
    } catch (e) { return null; }
  }
  function write(v) {
    const f = store(), tmp = f + '.tmp';
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(tmp, JSON.stringify(v, null, 2));
    fs.renameSync(tmp, f);
    return v;
  }
  const lifeRel = (S) => String(S.LIFE_FILE || '').split('/').filter(Boolean);

  // -> { id, bundle, user, dir(기록 폴더, 온보딩이면 null), onboard }
  function choose() {
    const want = env.PH_PROFILE;
    const player = loadBundle('player');
    const asPlayer = () => ({ id: 'player', bundle: player, user: {}, dir: env.PH_HOUSE ? path.resolve(env.PH_HOUSE) : expand(player.houseDir), onboard: false });
    const asDefault = (u) => ({ id: 'default', bundle: loadBundle('default') || {}, user: u || {}, dir: env.PH_HOUSE ? path.resolve(env.PH_HOUSE) : (u && u.dir) || null, onboard: !u });
    if (want === 'player' && player) return asPlayer();
    const saved = read();
    if (want === 'default') return asDefault(saved && saved.bundle === 'default' ? saved : null);
    if (saved && saved.bundle === 'player' && player) return asPlayer();
    if (saved && saved.bundle === 'default') return asDefault(saved);
    if (player) {
      const dir = env.PH_HOUSE ? path.resolve(env.PH_HOUSE) : expand(player.houseDir);
      const life = (((player.patch || {}).PH_SETTINGS || {}).LIFE_FILE || '').split('/').filter(Boolean);
      if (dir && life.length && fs.existsSync(path.join(dir, ...life))) { try { write({ bundle: 'player', savedAt: new Date().toISOString() }); } catch (e) { /* 못 적어도 이번엔 제작자 판 */ } return asPlayer(); }
    }
    return asDefault(null);
  }

  // ---- 온보딩 (공용판 첫 실행) ----
  // onDone(user) = 메인이 집을 열기 (IPC 등록 + 화면 다시 열기). S = settings (LIFE_FILE)
  function registerOnboard({ ipcMain, dialog, getWin, S, onDone }) {
    const defaultDir = env.PH_DEFAULT_DIR ? path.resolve(env.PH_DEFAULT_DIR) : path.join(app.getPath('documents'), 'PixelHouse');
    const allowed = new Set([defaultDir]);
    function folderInfo(dir) {
      const file = path.join(dir, ...lifeRel(S));
      let exists = false; try { exists = fs.statSync(file).isFile(); } catch (e) { exists = false; }
      return { dir, file: path.basename(file), found: exists, isDefault: dir === defaultDir };
    }
    ipcMain.handle('ph:onboardInfo', () => ({ ok: true, defaultDir, folder: folderInfo(defaultDir), houses: HOUSES, avatars: AVATARS, nameMax: NAME_MAX }));
    ipcMain.handle('ph:onboardCheckName', (e, name) => cleanName(name));
    // 폴더 고르기 창 (시험은 PH_PICK_DIR 로 고른 것처럼)
    ipcMain.handle('ph:onboardPickFolder', async () => {
      let dir = null;
      if (env.PH_SHOTS === '1') dir = env.PH_PICK_DIR ? path.resolve(env.PH_PICK_DIR) : null;
      else {
        const r = await dialog.showOpenDialog(getWin(), { title: '기록 폴더 고르기', defaultPath: fs.existsSync(defaultDir) ? defaultDir : app.getPath('documents'), properties: ['openDirectory', 'createDirectory'] });
        dir = r.canceled || !r.filePaths || !r.filePaths[0] ? null : r.filePaths[0];
      }
      if (!dir) return { ok: false, canceled: true };
      allowed.add(dir);
      return Object.assign({ ok: true }, folderInfo(dir));
    });
    // 끝: 폴더 확인 -> (기록 파일이 없으면) 빈 틀 + 고른 습관 -> profile.json -> 집 열기
    ipcMain.handle('ph:onboardFinish', async (e, req) => {
      const r = req || {}, n = cleanName(r.name);
      if (!n.ok) return { ok: false, code: 'name:' + n.code };
      if (!AVATARS.includes(r.avatar)) return { ok: false, code: 'avatar' };
      if (!HOUSES.includes(r.house)) return { ok: false, code: 'house' };
      if (typeof r.dir !== 'string' || !allowed.has(r.dir)) return { ok: false, code: 'dir' };
      const dir = r.dir, file = path.join(dir, ...lifeRel(S));
      let made = false, added = [], skipped = [];
      try {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        if (!fs.existsSync(file)) {
          const LT = require(path.join(ROOT, 'js', 'life_template.js'));
          const b = LT.build(Array.isArray(r.habits) ? r.habits : []);
          fs.writeFileSync(file, b.text, { flag: 'wx' }); // 없을 때만 (사이에 생겼으면 덮지 않음)
          made = true; added = b.added; skipped = b.skipped;
        }
        fs.accessSync(file, fs.constants.R_OK | fs.constants.W_OK);
      } catch (err) { return { ok: false, code: 'folder', message: String(err && err.message || err) }; }
      const c = r.cat == null || (typeof r.cat === 'string' && !r.cat.trim()) ? { ok: true, name: CAT_DEFAULT } : cleanName(r.cat); // 고양이 이름: 비우면 기본 두부 (같은 글자 규칙)
      if (!c.ok) return { ok: false, code: 'cat:' + c.code };
      const user = { bundle: 'default', name: n.name, cat: c.name, avatar: r.avatar, house: r.house, dir, furniture: {}, createdAt: new Date().toISOString() };
      write(user);
      setTimeout(() => onDone(read()), 30); // 답을 먼저 보내고 화면을 다시 엶
      return { ok: true, made, added, skipped, file: path.basename(file) };
    });
  }

  // ---- 집 꾸미기 (가): 정해진 자리마다 고른 그림 (공용판만) ----
  function registerFurniture({ ipcMain, onChange }) {
    ipcMain.handle('ph:furnitureSet', (e, req) => {
      const v = read(); if (!v || v.bundle !== 'default') return { ok: false, code: 'profile' };
      const slot = req && req.slot, sprite = req && req.sprite;
      if (!SLOT_RE.test(String(slot)) || !SPRITE_RE.test(String(sprite))) return { ok: false, code: 'bad' };
      v.furniture = Object.assign({}, v.furniture, { [slot]: sprite });
      write(v);
      if (onChange) onChange(read());
      return { ok: true, furniture: v.furniture };
    });
  }

  // ---- 설정 화면 (공용판만): 칸 하나씩 바로 저장 (무늬 설정화면 v01: 저장 버튼 없음) ----
  //   req = { key: 'pet' | 'cat' | 'brand' | 'avatar' | 'house' | 'tabsHidden' | 'desktopPet', value }. 이름을 비우면 기본값(펫 이름 = 그 종류 기본, 하우스 = Pixel House)
  //   desktopPet (2026-10-13 제작자 결정 "바탕화면 펫 켜기"): true = 켬, 그 밖 = 끔(안 적음). 펫 창 열고 닫기는 electron/main.js onChange
  function registerSettings({ ipcMain, onChange }) {
    ipcMain.handle('ph:profileSet', (e, req) => {
      const v = read(); if (!v || v.bundle !== 'default') return { ok: false, code: 'profile' };
      const key = req && req.key, val = req && req.value;
      if (key === 'pet') { if (!PETS.includes(val)) return { ok: false, code: 'bad' }; v.pet = val; }
      else if (key === 'cat') {
        const kind = String(v.pet || 'cat_white').split('_')[0];
        const c = typeof val === 'string' && !val.trim() ? { ok: true, name: PET_DEFAULT_NAME[kind] || '두부' } : cleanName(val);
        if (!c.ok) return { ok: false, code: c.code, max: NAME_MAX }; v.cat = c.name;
      } else if (key === 'brand') {
        const b = typeof val === 'string' && !val.trim() ? { ok: true, name: BRAND_DEFAULT } : cleanBrand(val);
        if (!b.ok) return { ok: false, code: b.code, max: BRAND_MAX };
        if (b.name === BRAND_DEFAULT) delete v.brand; else v.brand = b.name;
      } else if (key === 'avatar') { if (!AVATARS.includes(val)) return { ok: false, code: 'bad' }; v.avatar = val; }
      else if (key === 'house') { if (!HOUSES.includes(val)) return { ok: false, code: 'bad' }; v.house = val; }
      else if (key === 'tabsHidden') { const t = cleanTabs(val); if (t.length) v.tabsHidden = t; else delete v.tabsHidden; }
      else if (key === 'desktopPet') { if (typeof val !== 'boolean') return { ok: false, code: 'bad' }; if (val) v.desktopPet = true; else delete v.desktopPet; }
      else return { ok: false, code: 'key' };
      write(v);
      const u = read();
      if (onChange) onChange(u);
      return { ok: true, user: { pet: u.pet || 'cat_white', cat: u.cat || '', brand: u.brand || BRAND_DEFAULT, avatar: u.avatar, house: u.house, tabsHidden: u.tabsHidden || [], desktopPet: u.desktopPet === true } };
    });
  }

  // 바탕화면 펫 끄기 (펫 메뉴 "바탕화면 펫 끄기", 2026-10-13): 공용판 profile.json 에서 desktopPet 지움. 돌려줌 = 새 사용자 값 (공용판 아니면 null)
  function turnOffDesktopPet() {
    const v = read(); if (!v || v.bundle !== 'default') return null;
    delete v.desktopPet; write(v); return read();
  }

  return { choose, read, write, store, turnOffDesktopPet, loadBundle, registerOnboard, registerFurniture, registerSettings, cleanName, cleanBrand, cleanFurniture, HOUSES, AVATARS, PETS, BRAND_MAX, NAME_MAX };
};

};
RT.MODS["/app/js/life_template.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 공용판 첫 실행: 빈 생활 기록 파일 만들기 (2026-10-08 로드맵 4단계 온보딩). 그림·파일 접근 없음: 글을 만들어 돌려준다.
//   메인(electron/profile_main.js)이 고른 기록 폴더에 이 글로 settings.LIFE_FILE 을 만든다 (이미 있으면 안 건드림 = 이어 쓰기).
//   습관 줄은 습관 편집(js/habit_edit.js addHabit)을 그대로 거쳐 더한다 = 앱 안 "생활 습관 > 편집"으로 더한 것과 같은 글자.
//   표 모양은 제작자 판 생활기록 v01 과 같음 (js/life_md.js 가 읽는 섹션: 생활습관·공부·습관 기록·약속·버킷리스트). 나머지 섹션은 처음 쓸 때 앱이 만든다
//   (## 수면·## 식사·## 한마디 = js/life_log.js. 수면은 하루 구간 여러 개 + 선잠, 2026-10-08. 버킷리스트 바로 앞에 생김)
(function (root) {
  'use strict';
  const req = (n) => (typeof require !== 'undefined' ? require(n) : null);
  const HE = root.PHHabitEdit || req('./habit_edit.js');

  const HEAD = [
    '# 생활 기록 (Pixel House)',
    'Pixel House 앱이 이 파일을 읽고 씁니다. 이 컴퓨터에만 있고, 앱이 인터넷으로 보내지 않습니다. 표 모양을 지키면 직접 고쳐도 됩니다.',
    '',
    '## 생활습관',
    '종류: 목표 = 매일·매주 체크 / 안전장치 = 평소엔 체크 안 함, 주 1회 "잘 챙겼다" 한 번만. "놓쳤다"면 2주 동안 목표로 바뀜 / 기록 = 할 때만 양을 적음, 못 해도 실패 표시 없음',
    '| 습관 | 종류 | 기준 | 주기 |',
    '|---|---|---|---|',
    '',
    '## 공부',
    '| 공부 | 시작 | 끝 | 메모 |',
    '|---|---|---|---|',
    '',
    '## 습관 기록',
    '| 날짜 | 한 습관 |',
    '|---|---|',
    '',
    '## 약속',
    '| 날짜 | 시간 | 내용 |',
    '|---|---|---|',
    '',
    '## 버킷리스트',
    '',
  ].join('\n');

  // 온보딩 추천 습관 (on = 처음부터 골라 둠). 물 = 정수기·물컵과 이어진 이름(settings.WATER_HABIT), 요가 = 러그, 독서 = 책꽂이
  const RECOMMEND = [
    { id: 'water', name: '물', kind: '목표', target: '1.5L (250ml × 6칸)', cycle: '매일', on: true },
    { id: 'stretch', name: '스트레칭', kind: '목표', target: '10분', cycle: '매일' },
    { id: 'yoga', name: '요가', kind: '목표', target: '20분', cycle: '주 3회' },
    { id: 'walk', name: '산책', kind: '목표', target: '20분', cycle: '주 3회' },
    { id: 'vitamin', name: '영양제', kind: '안전장치', target: '먹기', cycle: '매일' },
    { id: 'reading', name: '독서', kind: '기록', target: '책꽂이에 기록', cycle: '-' }, // 2026-10-08 쪽수 뺌 (features.js reading target과 같은 글)
  ];
  const MAX_HABITS = 20;

  // habits = [{ name, kind?, target?, cycle? }] (추천 id 또는 직접 적은 이름). -> { text, added: [이름], skipped: [{ name, code }] }
  //   직접 적은 습관 = 목표, 기준 없음, 매일. 이름 검사·같은 이름 막기는 습관 편집 규칙 그대로
  function build(habits) {
    let text = HEAD;
    const added = [], skipped = [];
    (Array.isArray(habits) ? habits : []).slice(0, MAX_HABITS).forEach((h) => {
      const rec = typeof h === 'string' ? RECOMMEND.find((r) => r.id === h) : null;
      const o = rec || (h && typeof h === 'object' ? { name: h.name, kind: h.kind || '목표', target: h.target == null ? '' : h.target, cycle: h.cycle || '매일' } : null);
      if (!o || typeof o.name !== 'string') { skipped.push({ name: String(h && h.name || h), code: 'badName' }); return; }
      try { const r = HE.addHabit(text, { kind: o.kind, name: o.name, target: o.target, cycle: o.cycle }); text = r.text; added.push(r.name); }
      catch (e) { skipped.push({ name: o.name, code: e.code || 'error' }); }
    });
    return { text, added, skipped };
  }

  const LT = { HEAD, RECOMMEND, MAX_HABITS, build };
  root.PHLifeTemplate = LT;
  if (typeof module !== 'undefined' && module.exports) module.exports = LT;
})(typeof window !== 'undefined' ? window : globalThis);

};
RT.MODS["/app/js/habit_edit.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 습관 편집·공부 완전 삭제 (2026-10-04 비트, 제작자 "메뉴 내가 추가하거나 없앨 수 있게"). 그림·파일 접근 없음: 글(text)을 받아 새 글을 돌려준다.
// Electron 메인(electron/habit_ipc.js)과 화면(js/habit_edit_ui.js), Node 시험(tests/test_habit_edit.js)이 같이 쓴다.
//   ## 생활습관 표 | 습관 | 종류 | 기준 | 주기 |  한 줄 더하기(addHabit)·고치기(updateHabit)·빼기(removeHabit)·같은 종류 안에서 위아래(moveHabit)
//   ## 공부 표 한 줄 완전히 빼기(removeStudy) / 되돌리기(unremoveStudy, 같은 자리)
//   종류: 목표(화면 "오늘") / 안전장치 / 기록 / 살림. 종류는 고치기에서 안 바꿈
//   주기: 목표·살림 = 매일 n회 / 주 n회 / 월 n회, 안전장치 = 매일 / 주 n회, 기록 = "-" (기준 = 단위 "쪽", "장")
//   물(settings.WATER_HABIT)은 정수기·물컵과 이어져 있어서 이름·기준·주기·삭제는 막음 (순서만 바꿀 수 있음)
//   살림 줄이 파일에 하나도 없으면(화면에만 기본 5개) 처음 편집할 때 기본 줄을 먼저 표에 더함 (household.js ensureChores와 같음)
// 쓰기 원칙: 정해진 표 안 줄만. 다른 줄은 한 글자도 안 바뀐다. 메인이 쓰기 직전에 onlyHabitsChanged / onlyStudyRemoved로 다시 확인한다.
// 이름을 바꾸면 지난 기록(## 습관 기록 항목, ## 안전장치 확인 항목)의 그 이름도 같이 바꾼다 (2026-10-04 제작자 결정, js/record_rename.js).
//   지우면 지난 기록 글자는 그대로 둔다 (옛 기록 줄의 "러닝"처럼). 지난 기록에만 남은 이름으로는 바꾸지도 새로 더하지도 않는다
//   (code 'usedName' + lastDate 마지막 기록 날: 섞이면 되돌릴 수 없어서. 2026-10-04 제작자 결정으로 더하기도 막음, 바로 앞 삭제의 되돌리기만 허용)
// 일지 기능 습관(대변·식사·독서, js/features.js fnHabit): 이름이 변기·식탁 일지·책꽂이와 이어진 열쇠라 고치기는 막음(code 'locked', 순서·삭제만).
//   더하기는 기록 카드 추가 목록에서: 종류 = 기록, 기준 = 정해진 글("변기에서 기록"), 주기 "-" (일지 첫 저장 때 메인이 더하는 줄과 같은 글자)
(function (root) {
  'use strict';
  const req = (n) => (typeof require !== 'undefined' ? require(n) : null);
  const Md = root.PHLifeMd || req('./life_md.js');
  const LC = root.PHLifeCheck || req('./life_check.js');
  const HC = root.PHHabitCycle || req('./habit_cycle.js');
  const HH = root.PHHousehold || req('./household.js');
  const H = root.PH_HOUSEHOLD || req('./data/household.js');
  const SW = root.PHStudyWrite || req('./study_write.js');
  const RR = root.PHRecordRename || req('./record_rename.js');
  const FX = root.PHFeatures || req('./features.js');

  const KIND = { goal: '목표', safety: '안전장치', log: '기록', house: '살림' };
  const KINDS = Object.values(KIND);
  const HEAD = ['습관', '종류', '기준', '주기'];
  const NAME_MAX = 20, TARGET_MAX = 30;
  const NO_CYCLE = '-';
  // 기록 카드 + 추가 "횟수·양 기록" 기준 (2026-10-08 제작자 피드백 4: 단위 입력 없음). "회" = 생활 습관 카드에서 "+ n회"로 적힘 (js/life_check.js unitOf를 그대로 통과)
  const LOG_UNIT = '회';
  const water = () => (root.PH_SETTINGS && root.PH_SETTINGS.WATER_HABIT) || '물';
  const fnOf = (name) => (FX ? FX.byHabit(name) : null); // 일지 기능 습관이면 그 기능
  const fnRow = (f) => [f.habit, '기록', f.target, NO_CYCLE];

  const err = (msg, code) => Object.assign(new Error(msg), code ? { code } : {});
  const splitLines = (t) => String(t).split(/\r?\n/);
  const nlOf = (t) => (/\r\n/.test(t) ? '\r\n' : '\n');
  const cellsOf = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  const isRow = (l) => /^\s*\|/.test(l);
  const isSep = (l) => /^\s*\|?\s*:?-{3,}/.test(l);
  const rowText = (c) => '| ' + c.join(' | ') + ' |';
  const len = (s) => Array.from(s).length;

  // ---- 값 검사: 표를 깨는 글자는 바꾸지 않고 막음 (code 'badName' / 'badTarget' / 'badCycle') ----
  const TABLE_BAD = /[|｜\u0000-\u001f\u007f\u2028\u2029]/;
  // 이름: 습관 기록 칸에 "이름", "이름 2/3", "이름 20쪽"으로 들어가므로 쉼표·빗금도 막고, 숫자로 시작하거나 " 숫자"가 들어간 이름도 막음(양으로 읽힘)
  const NAME_BAD = /[|｜,，/\\`*#\[\]<>]/;
  function checkName(s) {
    if (typeof s !== 'string') throw err('이름 형식 오류', 'badName');
    if (TABLE_BAD.test(s)) throw err('이름에 표를 깨는 글자', 'badName');
    const t = s.replace(/\s+/g, ' ').trim();
    if (!t) throw err('이름이 비었음', 'badName');
    if (NAME_BAD.test(t)) throw err('이름에 쓸 수 없는 글자 (| , / \\ ` * # [ ] < >)', 'badName');
    if (/^\d/.test(t) || /\s\d/.test(t)) throw err('이름에 숫자를 띄어 쓸 수 없음 (양으로 읽혀요)', 'badName');
    if (/^-+$/.test(t)) throw err('이름 모양 오류', 'badName');
    if (len(t) > NAME_MAX) throw err('이름이 너무 김 (' + NAME_MAX + '자까지)', 'badName');
    return t;
  }
  // 기준: 짧은 글 (빈 글 = "-"). 기록 습관은 단위(쪽, 장: 숫자·띄어쓰기 없는 1~4글자)
  function checkTarget(s, kind) {
    if (s != null && typeof s !== 'string') throw err('기준 형식 오류', 'badTarget');
    if (TABLE_BAD.test(s || '')) throw err('기준에 표를 깨는 글자', 'badTarget');
    const t = String(s || '').replace(/\s+/g, ' ').trim();
    if (kind === KIND.log) { if (!LC.unitOf(t)) throw err('단위는 숫자 없이 4글자까지 (예: 쪽, 장)', 'badTarget'); return t; }
    if (len(t) > TARGET_MAX) throw err('기준이 너무 김 (' + TARGET_MAX + '자까지)', 'badTarget');
    return t || '-';
  }
  // 주기: { per, n } 또는 글. 종류마다 고를 수 있는 것만
  function checkCycle(c, kind) {
    if (kind === KIND.log) return NO_CYCLE;
    let cy = null;
    if (c && typeof c === 'object' && !Array.isArray(c)) { try { cy = HC.parseCycle(HC.formatCycle(c.per, c.n)); } catch (e) { cy = null; } }
    else if (typeof c === 'string') cy = HC.parseCycle(c);
    if (!cy) throw err('주기 오류', 'badCycle');
    if (kind === KIND.safety && cy.per === 'month') throw err('안전장치는 매일 또는 주 n회', 'badCycle');
    if (kind === KIND.safety && cy.per === 'day' && cy.n !== 1) throw err('안전장치는 매일 또는 주 n회', 'badCycle');
    return HC.formatCycle(cy.per, cy.n);
  }
  function checkKind(k) { if (!KINDS.includes(k)) throw err('종류 오류', 'badKind'); return k; }

  // ---- 표 찾기 ----
  function habitsTable(lines) {
    const secs = Md.sections(lines).filter((s) => s.name === Md.NAMES.habits);
    if (!secs.length) throw err('## 생활습관 섹션 없음');
    if (secs.length > 1) throw err('## 생활습관 섹션이 둘이라 멈춤');
    const sec = secs[0], t = Md.table(lines, sec); if (!t) throw err('## 생활습관 표 없음');
    if (t.head.join('|') !== HEAD.join('|')) throw err('## 생활습관 표 머리가 달라서 멈춤');
    let sep = t.line + 1; if (!(sep < sec.end && isSep(lines[sep]))) sep = null;
    let end = (sep == null ? t.line : sep) + 1;
    while (end < sec.end && isRow(lines[end])) end++;
    const rows = []; for (let i = (sep == null ? t.line : sep) + 1; i < end; i++) if (!isSep(lines[i])) rows.push({ line: i, cells: cellsOf(lines[i]) });
    return { sec, headLine: t.line, sepLine: sep, rows, endLine: end };
  }
  const nameOf = (r) => r.cells[0] || '';
  function findRow(T, name) {
    const hits = T.rows.filter((r) => nameOf(r) === name);
    if (!hits.length) throw err('습관 없음: ' + name, 'notFound');
    if (hits.length > 1) throw err('같은 이름이 둘이라 멈춤: ' + name, 'dupName');
    return hits[0];
  }
  function studyNames(text) { try { const p = SW.parse(text); return p.study.concat(p.archive).map((r) => r.name); } catch (e) { return []; } }
  // 이름이 비었는지: 습관 표(except 빼고) + 공부 이름 (습관 기록 칸에서 헷갈리지 않게)
  function nameFree(text, T, name, except) {
    if (T.rows.some((r) => nameOf(r) === name && nameOf(r) !== except)) throw err('같은 이름의 습관이 이미 있음: ' + name, 'dupName');
    if (studyNames(text).includes(name)) throw err('공부 이름과 같아서 안 됨: ' + name, 'dupName');
  }
  // 살림 줄이 하나도 없으면 기본 줄을 먼저 더함 (화면에만 보이던 기본 5개를 파일로)
  function withChores(text, kind) {
    if (kind !== KIND.house) return { text, choresAdded: false };
    const r = HH.ensureChores(text);
    return { text: r.text, choresAdded: !!r.changed };
  }
  // 고칠 줄 찾기. 화면에만 있는 살림 기본 줄(파일에 살림 줄이 하나도 없을 때)이면 기본 줄을 먼저 더하고 찾음
  //   -> { text(기본 줄 더한 뒤), lines, T, row, choresAdded }
  function locate(text, name) {
    let lines = splitLines(text), T = habitsTable(lines);
    if (!T.rows.some((r) => nameOf(r) === name) && H.CHORES.some((c) => c.name === name) && !T.rows.some((r) => r.cells[1] === KIND.house)) {
      const b = withChores(text, KIND.house); lines = splitLines(b.text); T = habitsTable(lines);
      return { text: b.text, lines, T, row: findRow(T, name), choresAdded: b.choresAdded };
    }
    const row = findRow(T, name);
    const b = withChores(text, row.cells[1]);
    if (b.choresAdded) { lines = splitLines(b.text); T = habitsTable(lines); return { text: b.text, lines, T, row: findRow(T, name), choresAdded: true }; }
    return { text, lines, T, row, choresAdded: false };
  }
  // 되돌리기 때 지운 줄 글자 그대로(띄어쓰기까지) 쓰기: raw의 칸이 검사한 값과 똑같을 때만. 아니면 새로 만든 줄
  function sameRaw(raw, cells) {
    if (typeof raw !== 'string' || /[\r\n]/.test(raw) || !isRow(raw) || isSep(raw)) return null;
    const c = cellsOf(raw); return c.length === cells.length && c.every((x, i) => x === cells[i]) ? raw : null;
  }
  const done = (src, lines, extra) => Object.assign({ text: lines.join(nlOf(src)), changed: true }, extra);
  const rowObj = (c) => ({ name: c[0] || '', kind: c[1] || '', target: c[2] || '', cycle: c[3] || '' });

  // ---- 더하기: o = { kind, name, target, cycle({per,n} 또는 글), before(이 이름 앞에, 되돌리기용) } ----
  //   자리: before가 같은 종류 줄이면 그 앞, 아니면 같은 종류 마지막 줄 다음, 같은 종류가 없으면 표 끝
  function addHabit(text, o) {
    o = o || {};
    const kind = checkKind(o.kind), name = checkName(o.name), fn = fnOf(name);
    if (fn && kind !== KIND.log) throw err('일지 기능 이름이라 기록 카드에서만 더할 수 있음: ' + name, 'dupName');
    const target = fn ? fn.target : checkTarget(o.target, kind), cycle = fn ? NO_CYCLE : checkCycle(o.cycle, kind);
    const base = withChores(text, kind), lines = splitLines(base.text), T = habitsTable(lines);
    nameFree(base.text, T, name);
    // 지난 기록에만 남은 이름(지운 습관)으로 새로 더하기도 막음 (제작자 결정 2026-10-04). 삭제 되돌리기(before 자리 또는 raw 원래 글자를 줌)만 그대로 허용
    const undo = o.before !== undefined || o.raw != null;
    if (!undo && !fn && RR.usedInRecords(base.text, name)) throw RR.usedErr(base.text, name, 'habit');
    const same = T.rows.filter((r) => r.cells[1] === kind);
    const bef = o.before != null ? same.find((r) => nameOf(r) === o.before) : null;
    const at = bef ? bef.line : same.length ? same[same.length - 1].line + 1 : T.endLine;
    const row = sameRaw(o.raw, [name, kind, target, cycle]) || rowText([name, kind, target, cycle]);
    lines.splice(at, 0, row);
    return done(text, lines, { op: 'add', line: at, name, kind, row: rowObj([name, kind, target, cycle]), after: row, choresAdded: base.choresAdded });
  }
  // ---- 고치기: patch = { newName, target, cycle } (없는 값 = 그대로). 종류는 그대로 ----
  function updateHabit(text, name, patch) {
    const p = patch || {};
    if (typeof name !== 'string') throw err('이름 형식 오류', 'badName');
    if (name === water()) throw err('물은 정수기와 이어져 있어서 고칠 수 없음 (순서만)', 'locked');
    if (fnOf(name)) throw err(name + '은(는) 일지와 이어진 이름이라 고칠 수 없음 (순서·삭제만)', 'locked');
    const base = locate(text, name), lines = base.lines, T = base.T, row = base.row, kind = row.cells[1];
    if (!KINDS.includes(kind)) throw err('모르는 종류라 고칠 수 없음: ' + kind, 'badKind');
    const c = row.cells.slice(0, 4); while (c.length < 4) c.push('');
    const next = c.slice();
    if (p.newName != null) { next[0] = checkName(p.newName); if (next[0] !== c[0]) { nameFree(base.text, T, next[0], c[0]); if (fnOf(next[0])) throw err('일지 기능 이름으로는 바꿀 수 없음: ' + next[0], 'dupName'); } }
    if (p.target != null) next[2] = checkTarget(p.target, kind);
    if (p.cycle != null) next[3] = checkCycle(p.cycle, kind);
    if (next.join('|') === c.join('|') && row.cells.length === 4 && !base.choresAdded) return { text, changed: false, op: 'update', line: row.line, name: next[0], kind };
    const renamed = next[0] !== c[0];
    if (renamed && RR.usedInRecords(base.text, next[0])) throw RR.usedErr(base.text, next[0], 'habit');
    const before = lines[row.line], after = rowText(next);
    lines[row.line] = after;
    // 1단계 = 생활습관 표 한 줄(mid), 2단계 = 지난 기록 이름 (메인이 단계마다 따로 검사)
    const mid = lines.join(nlOf(text)), rn = renamed ? RR.renameInRecords(mid, c[0], next[0]) : { text: mid, changed: false, records: 0, items: 0, safety: 0 };
    return { text: rn.text, changed: true, mid, op: 'update', line: row.line, name: next[0], oldName: c[0], kind, row: rowObj(next), prev: rowObj(c), before, after, choresAdded: base.choresAdded,
      renamedRecords: { records: rn.records, items: rn.items, safety: rn.safety } };
  }
  // ---- 빼기: -> { removed: { name, kind, target, cycle }, before(바로 뒤 같은 종류 줄 이름, 되돌리기 자리) } ----
  //   살림은 마지막 한 줄은 못 뺌 (다 빼면 기본 5개가 다시 화면에 나와서): code 'lastChore'
  function removeHabit(text, name) {
    if (typeof name !== 'string') throw err('이름 형식 오류', 'badName');
    if (name === water()) throw err('물은 정수기와 이어져 있어서 지울 수 없음', 'locked');
    const base = locate(text, name), lines = base.lines, T = base.T, row = base.row, kind = row.cells[1];
    const same = T.rows.filter((r) => r.cells[1] === kind);
    if (kind === KIND.house && same.length <= 1) throw err('살림 습관은 하나는 남겨 두어야 함', 'lastChore');
    const i = same.indexOf(row), next = same[i + 1];
    const c = row.cells.slice(0, 4); while (c.length < 4) c.push('');
    const before = lines[row.line];
    lines.splice(row.line, 1);
    return done(text, lines, { op: 'remove', line: row.line, name, kind, removed: rowObj(c), before: next ? nameOf(next) : null, removedText: before, choresAdded: base.choresAdded });
  }
  // ---- 순서: dir -1 = 위로, +1 = 아래로. 같은 종류 바로 옆 줄과 자리 바꿈 (끝이면 그대로) ----
  function moveHabit(text, name, dir) {
    if (dir !== -1 && dir !== 1) throw err('방향 오류');
    if (typeof name !== 'string') throw err('이름 형식 오류', 'badName');
    const base = locate(text, name), lines = base.lines, T = base.T, row = base.row, kind = row.cells[1];
    const same = T.rows.filter((r) => r.cells[1] === kind), i = same.indexOf(row), other = same[i + dir];
    if (!other) return base.choresAdded ? done(text, lines, { op: 'move', name, kind, line: row.line, edge: true, choresAdded: true }) : { text, changed: false, op: 'move', name, kind, edge: true };
    const a = lines[row.line]; lines[row.line] = lines[other.line]; lines[other.line] = a;
    return done(text, lines, { op: 'move', name, kind, line: other.line, from: row.line, choresAdded: base.choresAdded });
  }

  // ---- 안전 검사 (메인이 쓰기 직전에): ## 생활습관 표 줄만 바뀌었는지 ----
  //   섹션 밖·섹션 안 글 줄·표 머리·구분선은 한 글자도 같음. 새로 생긴(또는 바뀐) 줄은 칸 4개·종류·이름·기준·주기 검사. 이름 겹침 없음
  //   바뀐 줄 수(빠진 + 생긴)는 limit 이하 (기본 2 + 살림 기본 줄 수)
  // 고치기(이름 바꾸기 포함) 검사: 옛 글 -> mid = 생활습관 표만(줄 1개), mid -> 새 글 = 지난 기록 이름만 oldName -> name
  function onlyHabitUpdated(oldText, r) {
    if (!r || typeof r.mid !== 'string') return onlyHabitsChanged(oldText, r && r.text);
    if (!onlyHabitsChanged(oldText, r.mid, r.choresAdded ? undefined : 2)) return false; // 고친 줄 하나(빠진 1 + 생긴 1), 살림 기본 줄을 처음 더할 때만 그만큼 더
    if (r.text === r.mid) return true;
    return !!r.oldName && r.oldName !== r.name && RR.onlyNamesRenamed(r.mid, r.text, r.oldName, r.name);
  }
  function onlyHabitsChanged(oldText, newText, limit) {
    try {
      const a = splitLines(oldText), b = splitLines(newText);
      const A = habitsTable(a), B = habitsTable(b);
      if (a.slice(0, A.sec.line).join('\n') !== b.slice(0, B.sec.line).join('\n')) return false;
      if (a.slice(A.sec.end).join('\n') !== b.slice(B.sec.end).join('\n')) return false;
      const prose = (L, T) => L.slice(T.sec.line, T.sec.end).filter((l, k) => { const i = T.sec.line + k; return !(i > (T.sepLine == null ? T.headLine : T.sepLine) && i < T.endLine); });
      if (prose(a, A).join('\n') !== prose(b, B).join('\n')) return false; // 제목·설명·머리·구분선·표 뒤 글
      const ra = A.rows.map((r) => a[r.line]), rb = B.rows.map((r) => b[r.line]);
      const left = ra.slice(), added = [];
      rb.forEach((l) => { const i = left.indexOf(l); if (i >= 0) left.splice(i, 1); else added.push(l); });
      if (left.length + added.length > (limit == null ? 2 + H.CHORES.length : limit)) return false;
      if (!added.every(okRow)) return false;
      const names = rb.map((l) => cellsOf(l)[0]), namesA = ra.map((l) => cellsOf(l)[0]);
      if (new Set(names).size !== names.length && new Set(namesA).size === namesA.length) return false;
      return true;
    } catch (e) { return false; }
  }
  function okRow(l) {
    if (isSep(l)) return false;
    const c = cellsOf(l); if (c.length !== 4) return false;
    try {
      if (!KINDS.includes(c[1])) return false;
      if (checkName(c[0]) !== c[0]) return false;
      if (c[0] === water()) return okWaterRow(c);
      const fn = fnOf(c[0]); if (fn) return fnRow(fn).join('|') === c.join('|'); // 일지 기능 줄은 정해진 글자 그대로만
      if (checkTarget(c[2], c[1]) !== c[2]) return false;
      return checkCycle(c[3], c[1]) === c[3];
    } catch (e) { return false; }
  }
  // 물 줄은 순서만 바뀌므로 줄 글자 그대로 (여기 오면 = 바뀐 줄로 보인 것). 기준에 n칸이 있으면 통과
  function okWaterRow(c) { return Md.slotsOf(c[2]) > 0; }

  // ---- 공부 완전 삭제 / 되돌리기 ----
  function studyTable(lines) {
    const secs = Md.sections(lines).filter((s) => s.name === SW.STUDY);
    if (secs.length !== 1) throw err('## 공부 섹션 없음 또는 둘');
    const sec = secs[0], t = Md.table(lines, sec); if (!t) throw err('## 공부 표 없음');
    if (t.head.join('|') !== SW.HEAD.join('|')) throw err('## 공부 표 머리가 달라서 멈춤');
    let sep = t.line + 1; if (!(sep < sec.end && isSep(lines[sep]))) sep = null;
    let end = (sep == null ? t.line : sep) + 1;
    while (end < sec.end && isRow(lines[end])) end++;
    const rows = []; for (let i = (sep == null ? t.line : sep) + 1; i < end; i++) if (!isSep(lines[i])) rows.push({ line: i, cells: cellsOf(lines[i]) });
    return { sec, headLine: t.line, sepLine: sep, rows, endLine: end };
  }
  // ## 공부에서 그 줄을 뺌 (보관함으로 가지 않음). 습관 기록의 "이름 n시간"은 그대로. -> { removed: { name, start, end, memo }, before(바로 뒤 줄 이름) }
  function removeStudy(text, name) {
    if (typeof name !== 'string' || !name) throw err('이름 형식 오류', 'badName');
    const lines = splitLines(text), T = studyTable(lines), hits = T.rows.filter((r) => r.cells[0] === name);
    if (!hits.length) throw err('공부 없음: ' + name, 'notFound');
    if (hits.length > 1) throw err('같은 이름이 둘이라 멈춤: ' + name, 'dupName');
    const row = hits[0], i = T.rows.indexOf(row), next = T.rows[i + 1];
    const c = row.cells.slice(0, 4); while (c.length < 4) c.push('');
    const before = lines[row.line];
    lines.splice(row.line, 1);
    return done(text, lines, { op: 'removeStudy', line: row.line, name, removed: { name: c[0], start: c[1], end: c[2], memo: c[3] }, before: next ? next.cells[0] : null, removedText: before });
  }
  // 되돌리기: 지운 줄을 같은 자리(before 앞, 없으면 표 끝)에. 값은 공부 추가와 같은 검사
  function unremoveStudy(text, row, before, raw) {
    if (!row || typeof row !== 'object') throw err('값 형식 오류');
    const name = SW.checkName(row.name), memo = SW.checkMemo(row.memo || ''), start = row.start, end = row.end == null ? '' : row.end;
    if (typeof start !== 'string' || typeof end !== 'string' || !SW.validDates(start, end)) throw err('날짜 오류');
    const lines = splitLines(text), T = studyTable(lines);
    if (T.rows.some((r) => r.cells[0] === name)) throw err('같은 이름의 공부가 이미 있음: ' + name, 'dupName');
    const d = Md.parse(text); if (d.habits && d.habits.rows.some((r) => r.name === name)) throw err('생활습관 이름과 같아서 안 됨: ' + name, 'dupName');
    const bef = before != null ? T.rows.find((r) => r.cells[0] === before) : null;
    const at = bef ? bef.line : T.endLine, l = sameRaw(raw, [name, start, end, memo]) || rowText([name, start, end, memo]);
    lines.splice(at, 0, l);
    return done(text, lines, { op: 'unremoveStudy', line: at, name, after: l });
  }
  // ## 공부 표에서 한 줄만 빠졌는지 (나머지 줄·순서·섹션 밖 그대로)
  function onlyStudyRemoved(oldText, newText) {
    try {
      const a = splitLines(oldText), b = splitLines(newText);
      if (b.length !== a.length - 1) return false;
      const T = studyTable(a);
      let i = 0; while (i < b.length && a[i] === b[i]) i++;
      if (a.slice(i + 1).join('\n') !== b.slice(i).join('\n')) return false;
      return T.rows.some((r) => r.line === i);
    } catch (e) { return false; }
  }
  // ## 공부 표에 한 줄만 더해졌는지 (되돌리기)
  function onlyStudyAdded(oldText, newText) {
    try {
      const a = splitLines(oldText), b = splitLines(newText);
      if (b.length !== a.length + 1) return false;
      const T = studyTable(a);
      let i = 0; while (i < a.length && a[i] === b[i]) i++;
      if (a.slice(i).join('\n') !== b.slice(i + 1).join('\n')) return false;
      const lo = (T.sepLine == null ? T.headLine : T.sepLine) + 1, c = cellsOf(b[i]);
      return i >= lo && i <= T.endLine && isRow(b[i]) && !isSep(b[i]) && c.length === 4 && !!c[0] && SW.validDates(c[1], c[2]);
    } catch (e) { return false; }
  }

  // 옛 일지 기능 줄 옮기기 (2026-10-08 제작자 "독서 쪽수 완전히 없애기"): | 독서 | 기록 | 쪽 | - | -> | 독서 | 기록 | 책꽂이에 기록 | - |
  //   features.js oldTargets에 적힌 옛 기준 글자일 때만, 그 줄 기준 칸만 바꿈. ## 독서·## 독서 보관(책꽂이 책)·지난 기록 "독서 20쪽"은 그대로
  function migrateFnRows(src) {
    const lines = splitLines(src); let T;
    try { T = habitsTable(lines); } catch (e) { return { text: src, changed: false, moved: [] }; }
    const moved = [];
    T.rows.forEach((r) => {
      const fn = fnOf(nameOf(r)); if (!fn || !fn.oldTargets || r.cells.length !== 4) return;
      if (r.cells[1] !== KIND.log || !fn.oldTargets.includes(r.cells[2]) || r.cells[3] !== NO_CYCLE) return;
      lines[r.line] = rowText(fnRow(fn)); moved.push(fn.habit);
    });
    if (!moved.length) return { text: src, changed: false, moved };
    return { text: lines.join(nlOf(src)), changed: true, op: 'migrate', moved };
  }
  const needsMigrate = (src) => migrateFnRows(src).changed;

  const HE = { KIND, KINDS, LOG_UNIT, migrateFnRows, needsMigrate, HEAD, NAME_MAX, TARGET_MAX, NO_CYCLE, checkName, checkTarget, checkCycle, habitsTable, addHabit, updateHabit, removeHabit, moveHabit,
    onlyHabitsChanged, onlyHabitUpdated, okRow, fnOf, removeStudy, unremoveStudy, onlyStudyRemoved, onlyStudyAdded, water };
  root.PHHabitEdit = HE;
  if (typeof module !== 'undefined' && module.exports) module.exports = HE;
})(typeof window !== 'undefined' ? window : globalThis);

};
RT.MODS["/app/js/life_md.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 생활 자료 md 읽기 (그림 없음, Node 시험에서도 씀). 원본: settings.LIFE_FILE (PixelHouse 폴더 안 상대 경로)
// 첫 판은 읽기만. 나중에 쓰기를 붙이기 쉽게 모든 줄 번호(line, 0부터)를 남긴다:
//   쓰기 = "바뀐 줄만 lines[line]에 바꿔 끼우고 join" (pixel-office priority_md와 같은 방식). 모르는 줄·섹션은 그대로 둔다
(function (root) {
  'use strict';

  // '## 이름' 단위로 나눔. { name, line(제목 줄), start(본문 첫 줄), end(다음 제목 줄, 없으면 끝) }
  function sections(lines) {
    const out = [];
    lines.forEach((l, i) => { const m = /^##\s+(.+?)\s*$/.exec(l); if (m) out.push({ name: m[1], line: i, start: i + 1, end: lines.length }); });
    out.forEach((s, i) => { if (out[i + 1]) s.end = out[i + 1].line; });
    return out;
  }
  function cells(l) { return l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim()); }
  const isTable = (l) => /^\s*\|/.test(l);
  const isSep = (l) => /^\s*\|?\s*:?-{3,}/.test(l);
  // 섹션 안 첫 표: { head: [...], rows: [{ line, cells: {머리: 값}, raw: [...] }] }
  function table(lines, sec) {
    let i = sec.start;
    while (i < sec.end && !isTable(lines[i])) i++;
    if (i >= sec.end) return null;
    const head = cells(lines[i]); const rows = [];
    for (let j = i + 1; j < sec.end && isTable(lines[j]); j++) {
      if (isSep(lines[j])) continue;
      const raw = cells(lines[j]), c = {};
      head.forEach((h, k) => { c[h] = raw[k] == null ? '' : raw[k]; });
      rows.push({ line: j, cells: c, raw });
    }
    return { line: i, head, rows };
  }
  // 섹션 안 표 아닌 글줄 (설명)
  function prose(lines, sec) { const out = []; for (let i = sec.start; i < sec.end; i++) if (lines[i].trim() && !isTable(lines[i])) out.push({ line: i, text: lines[i].trim() }); return out; }

  // "물 3/6, 독서 20쪽, 요가" -> [{ name: '물', value: 3, of: 6 }, { name: '독서', value: 20, unit: '쪽' }, { name: '요가' }] (모두 text 포함)
  function recordItems(s) {
    return String(s || '').split(/[,，]\s*/).map((t) => t.trim()).filter(Boolean).map((t) => {
      let m = /^(.+?)\s+(\d+)\s*\/\s*(\d+)$/.exec(t);
      if (m) return { name: m[1], value: Number(m[2]), of: Number(m[3]), text: t };
      m = /^(.+?)\s+(\d+(?:\.\d+)?)\s*([^\d\s/,]+)$/.exec(t);
      if (m) return { name: m[1], value: Number(m[2]), unit: m[3], text: t };
      return { name: t, text: t };
    });
  }
  // 습관 기록을 "한 칸 = 한 날짜의 한 습관"으로 펼친 목록 (기록 보관·나중의 분석·그래프용)
  //   { date, day(그날 0시 ms 또는 null), habit, value, of, unit, done(true), text, line }
  function entries(records) {
    const out = [];
    (records || []).forEach((r) => r.items.forEach((it) => out.push({ date: r.date, day: dateOf(r.date), habit: it.name, value: it.value == null ? null : it.value,
      of: it.of || null, unit: it.unit || null, done: true, text: it.text, line: r.line })));
    return out;
  }
  // 날짜별 묶음 (최근 날짜 먼저): [{ date, day, items: [...] }]
  function byDate(list) {
    const m = new Map();
    (list || []).forEach((e) => { if (!m.has(e.date)) m.set(e.date, { date: e.date, day: e.day, items: [] }); m.get(e.date).items.push(e); });
    return [...m.values()].sort((a, b) => (b.day || 0) - (a.day || 0));
  }
  // 습관별 묶음 (습관 표 순서, 표에 없는 습관은 뒤에): [{ habit, count, total, unit, of, items: [...] }]
  function byHabit(list, habitRows) {
    const order = (habitRows || []).map((r) => r.name), m = new Map();
    (list || []).forEach((e) => {
      if (!m.has(e.habit)) m.set(e.habit, { habit: e.habit, count: 0, total: 0, unit: e.unit, of: e.of, items: [] });
      const g = m.get(e.habit); g.count++; if (e.value != null) g.total += e.value; g.items.push(e);
    });
    const rank = (h) => { const i = order.indexOf(h); return i < 0 ? 1e6 : i; };
    return [...m.values()].sort((a, b) => rank(a.habit) - rank(b.habit) || a.habit.localeCompare(b.habit));
  }
  // 종류 설명 줄: "종류: 목표 = ... / 안전장치 = ... / 기록 = ..." -> [{ name, desc }]
  function kinds(text) {
    const m = /^종류\s*[:：]\s*(.+)$/.exec(text || ''); if (!m) return [];
    return m[1].split(/\s+\/\s+/).map((p) => { const k = /^(.+?)\s*=\s*(.+)$/.exec(p.trim()); return k ? { name: k[1].trim(), desc: k[2].trim() } : null; }).filter(Boolean);
  }
  // 기준에서 칸 수: "1.5L (250ml × 6칸)" -> 6
  function slotsOf(s) { const m = /(\d+)\s*칸/.exec(s || ''); return m ? Number(m[1]) : 0; }

  // 섹션 이름 (파일에 맞춘 것. 이름이 바뀌면 여기만)
  //   약속은 새 이름 '약속', 옛 파일의 'Meeting'도 읽음. 공부는 생활기록 v01에 새로 생긴 섹션
  const NAMES = { habits: '생활습관', study: '공부', records: '습관 기록', meetings: ['약속', 'Meeting'], bucket: '버킷리스트' };
  const first = (n) => (Array.isArray(n) ? n[0] : n);

  function parse(text) {
    const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
    const secs = sections(lines), sec = (n) => secs.find((s) => (Array.isArray(n) ? n.includes(s.name) : s.name === n)) || null;
    const out = { lines, sections: secs, missing: [] };
    // 생활습관
    const hs = sec(NAMES.habits);
    if (hs) {
      const t = table(lines, hs), desc = prose(lines, hs).find((p) => /^종류\s*[:：]/.test(p.text));
      out.habits = {
        kinds: desc ? kinds(desc.text) : [], kindsLine: desc ? desc.line : null,
        rows: t ? t.rows.map((r) => ({ line: r.line, name: r.cells['습관'], kind: r.cells['종류'], target: r.cells['기준'], cycle: r.cells['주기'], slots: slotsOf(r.cells['기준']) })) : [],
      };
    } else out.missing.push(NAMES.habits);
    // 공부: "기준: 매일 1시간" 줄 + | 공부 | 시작 | 끝 | 메모 | 표 (간트 막대 하나 = 한 줄)
    const ss = sec(NAMES.study);
    if (ss) {
      const t = table(lines, ss), crit = prose(lines, ss).find((p) => /^기준\s*[:：]/.test(p.text));
      out.study = {
        target: crit ? crit.text.replace(/^기준\s*[:：]\s*/, '') : '', targetLine: crit ? crit.line : null, tableLine: t ? t.line : null,
        rows: t ? t.rows.map((r) => ({ line: r.line, name: r.cells['공부'], start: r.cells['시작'], end: r.cells['끝'], memo: r.cells['메모'] || '',
          startDay: dateOf(r.cells['시작']), endDay: dateOf(r.cells['끝']), open: !String(r.cells['끝'] || '').trim() })) : [], // open = 끝 날짜 비어 있음(미정)
      };
    } else out.missing.push(NAMES.study);
    // 습관 기록 (+ 펼친 목록 entries: 날짜별·습관별로 묶기 쉽게)
    const rs = sec(NAMES.records);
    if (rs) { const t = table(lines, rs); out.records = t ? t.rows.map((r) => ({ line: r.line, date: r.cells['날짜'], text: r.cells['한 습관'], items: recordItems(r.cells['한 습관']) })) : []; out.entries = entries(out.records); }
    else { out.missing.push(NAMES.records); out.entries = []; }
    // 약속 (옛 이름 Meeting)
    const ms = sec(NAMES.meetings);
    if (ms) { const t = table(lines, ms); out.meetings = t ? t.rows.map((r) => ({ line: r.line, date: r.cells['날짜'], time: r.cells['시간'], text: r.cells['내용'] })) : []; out.meetingsSection = ms.name; }
    else out.missing.push(first(NAMES.meetings));
    // 버킷리스트: "- [ ] 할 일" / "- [x] 한 일". "(…채우기)"처럼 괄호만 있는 줄은 자리 표시
    const bs = sec(NAMES.bucket);
    if (bs) {
      out.bucket = [];
      for (let i = bs.start; i < bs.end; i++) {
        const m = /^\s*[-*]\s+\[([ xX])\]\s*(.*)$/.exec(lines[i]); if (!m) continue;
        let t = m[2].trim(), doneDate = null;
        const dd = /\s*\(완료 (\d{4}-\d{2}-\d{2})\)\s*$/.exec(t); // 2026-10-08: 체크할 때 적는 끝낸 날 (js/bucket_write.js). 글에서는 뺌
        if (dd && m[1] !== ' ') { doneDate = dd[1]; t = t.slice(0, dd.index).trim(); }
        out.bucket.push({ line: i, done: m[1] !== ' ', text: t, doneDate, placeholder: /^\(.*\)$/.test(t) || !t });
      }
    } else out.missing.push(NAMES.bucket);
    return out;
  }
  // 날짜 문자열 "2026-10-02" -> 그날 0시 (기기 시간). 못 읽으면 null
  function dateOf(s) { const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(String(s || '').trim()); return m ? new Date(+m[1], +m[2] - 1, +m[3]).getTime() : null; }
  // 약속 나누기: 오늘 이후(가까운 순) / 지난 것(최근 순) / 날짜 모름
  function splitMeetings(list, now) {
    const today = new Date(now); today.setHours(0, 0, 0, 0);
    const t0 = today.getTime(), up = [], past = [], unknown = [];
    (list || []).forEach((m) => { const d = dateOf(m.date); (d == null ? unknown : d >= t0 ? up : past).push(Object.assign({ day: d }, m)); });
    up.sort((a, b) => a.day - b.day); past.sort((a, b) => b.day - a.day);
    return { up, past, unknown };
  }
  // ---- 하루 경계 (settings.DAY_START_HOUR, 기본 6시): 01~06시는 전날. 물컵·대화창·습관 체크가 모두 이 함수를 씀 ----
  const pad2 = (n) => String(n).padStart(2, '0');
  function ymd(d) { const x = new Date(d); return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())}`; }
  const hourOf = (h) => (Number.isFinite(h) ? h : 6);
  // 기록 날짜 문자열 "2026-10-02"
  function logDay(ms, startHour) { return ymd(ms - hourOf(startHour) * 3600000); }
  // 기록 날짜의 0시 (기기 시간, ms)
  function logDayMs(ms, startHour) { return dateOf(logDay(ms, startHour)); }
  // 그 날짜가 든 주의 월요일 "2026-09-28" (주는 월요일 시작, 간트와 같음)
  function weekStart(date) { const d = new Date(dateOf(date)); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return ymd(d); }
  function addDays(date, n) { const d = new Date(dateOf(date)); d.setDate(d.getDate() + n); return ymd(d); }

  // 칸 습관(물 6칸)의 기록: 오늘 기록이 있으면 오늘, 없으면 가장 최근 날짜 { date, value, of, isToday } / 없으면 null
  //   startHour = 하루 경계(settings.DAY_START_HOUR). 생략하면 0(자정, 옛 동작)
  function latestSlots(records, name, now, startHour) {
    const today = new Date(logDayMs(now, Number.isFinite(startHour) ? startHour : 0));
    const hits = (records || []).map((r) => ({ r, it: r.items.find((x) => x.name === name && x.of) })).filter((h) => h.it && dateOf(h.r.date) != null);
    if (!hits.length) return null;
    hits.sort((a, b) => dateOf(b.r.date) - dateOf(a.r.date));
    const h = hits[0];
    return { date: h.r.date, value: h.it.value, of: h.it.of, isToday: dateOf(h.r.date) === today.getTime() };
  }

  // 간트 기간: 이번 주 월요일부터 weeks주 (기본 minWeeks, 막대 끝이 더 뒤면 maxWeeks까지 늘림). { start, end(마지막 날 다음 0시), days, weeks }
  function ganttRange(rows, now, minWeeks, maxWeeks) {
    const t = new Date(now); t.setHours(0, 0, 0, 0);
    const mon = new Date(t); mon.setDate(t.getDate() - ((t.getDay() + 6) % 7));
    const start = mon.getTime(), DAY = 86400000;
    let weeks = minWeeks || 4;
    // 날짜 못 읽은 줄(시작 없음)·진행 중(끝 없음)은 기간을 늘리지 않음
    (rows || []).forEach((r) => { if (r.endDay != null && r.startDay != null) { const need = Math.floor((r.endDay - start) / DAY / 7) + 1; if (need > weeks) weeks = need; } });
    weeks = Math.min(weeks, maxWeeks || 12);
    const end = new Date(mon); end.setDate(mon.getDate() + weeks * 7);
    return { start, end: end.getTime(), days: weeks * 7, weeks, today: t.getTime() };
  }
  // 막대 자리 (기간 안 날짜 칸, 0부터): { from, to(포함), clipStart, clipEnd, open } / 기간 밖이면 null, 날짜 못 읽으면 { bad: true }
  //   끝이 비어 있으면(open, "끝 날짜 미정") 기간 끝까지 열린 막대
  function ganttBar(row, range) {
    if (row.startDay == null) return { bad: true };
    if (!row.open && (row.endDay == null || row.endDay < row.startDay)) return { bad: true };
    const DAY = 86400000, idx = (d) => Math.round((new Date(d).setHours(12) - new Date(range.start).setHours(12)) / DAY);
    const a = idx(row.startDay), b = row.open ? range.days - 1 : idx(row.endDay);
    if (b < 0 || a >= range.days) return null;
    return { from: Math.max(0, a), to: Math.min(range.days - 1, b), clipStart: a < 0, clipEnd: row.open || b >= range.days, open: !!row.open };
  }

  root.PHLifeMd = { ymd, logDay, logDayMs, weekStart, addDays, parse, sections, table, recordItems, entries, byDate, byHabit, kinds, slotsOf, dateOf, splitMeetings, latestSlots, ganttRange, ganttBar, NAMES };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.PHLifeMd;
})(typeof window !== 'undefined' ? window : globalThis);

};
RT.MODS["/app/js/life_check.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 생활 습관 체크 (MVP E·I + 기록 습관 양 적기). 그림·파일 접근 없음: 글(text)을 받아 새 글을 돌려준다.
// Electron 메인(electron/life_check_ipc.js)과 화면(life.js), Node 시험(tests/test_check.js)이 같이 쓴다.
//   E 주 N회 (주기 "주 N회"인 습관): 오늘 습관 기록 줄에 "요가"를 더하거나 뺌. 주는 월요일 시작. 연속 기록 숫자·못 채운 표시 없음
//   기록 습관 양 (종류 "기록", 기준 = 단위 "쪽"·"장"): 오늘 줄에 "독서 20쪽". 이미 있으면 더하기(add) 또는 바꾸기(set)
//   I 안전장치 주간 확인: ## 안전장치 확인 표(주 시작일 | 항목 | 결과). "놓침"인 항목은 그 주부터 2주 더(PROMOTE_DAYS) "오늘" 카드에 올라옴
// 쓰기 원칙은 물컵(life_write.js)과 같다: 습관 기록 표 오늘 줄 하나만 바꾸거나 한 줄 더함 / 안전장치 확인 표 한 줄만. 메인이 쓰기 직전에 다시 검사한다.
(function (root) {
  'use strict';
  const Md = root.PHLifeMd || (typeof require !== 'undefined' ? require('./life_md.js') : null);
  const LW = root.PHLifeWrite || (typeof require !== 'undefined' ? require('./life_write.js') : null);
  const LL = root.PHLifeLog || (typeof require !== 'undefined' ? require('./life_log.js') : null);

  const KIND = { goal: '목표', safety: '안전장치', log: '기록' }; // 파일의 종류 이름
  const RESULTS = { good: '잘 챙김', missed: '놓침' };            // 파일에 적는 결과 글자 (화면 버튼은 "잘 챙겼어 / 놓쳤어")
  const PROMOTE_DAYS = 21; // "놓침"을 고른 주의 월요일부터 21일 = 그 주 + 다음 2주 동안 "오늘" 카드에 (그 뒤 자동으로 안전장치로 돌아감)
  const MAX_AMOUNT = 9999;  // 한 번에 적는 양 (쪽·장) 1 ~ 9999, 정수

  const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
  // "주 2회" -> 2 (아니면 0)
  function weeklyOf(cycle) { const m = /주\s*(\d+)\s*회/.exec(String(cycle || '')); return m ? Number(m[1]) : 0; }
  // 기록 습관 단위: 기준 칸 "쪽" / "장" (숫자·공백·표 글자 없는 짧은 글). 아니면 ''
  function unitOf(target) { const t = String(target || '').trim(); return /^[^\d\s|,，/\-–—]{1,4}$/.test(t) ? t : ''; }

  // ---- 읽기 ----
  // 이번 주(월요일 시작) 이 습관을 한 날 수 + 오늘 했는지. records = Md.parse(...).records, today = "YYYY-MM-DD"(기록 날짜)
  function weekCount(records, habit, today) {
    const from = Md.dateOf(Md.weekStart(today)), to = Md.dateOf(Md.addDays(Md.weekStart(today), 7)), t = Md.dateOf(today);
    const days = new Set(); let todayDone = false;
    (records || []).forEach((r) => {
      const d = Md.dateOf(r.date); if (d == null || d < from || d >= to) return;
      if (!r.items.some((it) => it.name === habit)) return;
      days.add(d); if (d === t) todayDone = true;
    });
    return { count: days.size, todayDone, week: Md.weekStart(today) };
  }
  // 오늘 줄에 적힌 양 (예: 독서 20쪽 -> 20). 없으면 null
  function todayAmount(records, habit, unit, today) {
    const t = Md.dateOf(today); let v = null;
    (records || []).forEach((r) => { if (Md.dateOf(r.date) !== t) return; r.items.forEach((it) => { if (it.name === habit && it.value != null && !it.of && it.unit === unit) v = (v || 0) + it.value; }); });
    return v;
  }
  // 안전장치 확인 표 줄 [{ line, week, item, result }]
  function safetyRows(text) { return LL.parse(text).safety; }
  // 이번 주에 고른 결과 { 항목: 'good' | 'missed' }
  function weekResults(rows, week) {
    const out = {}; const back = { [RESULTS.good]: 'good', [RESULTS.missed]: 'missed' };
    (rows || []).forEach((r) => { if (r.week === week && back[r.result]) out[r.item] = back[r.result]; });
    return out;
  }
  // "오늘" 카드로 올라온 안전장치: [{ name, week, until(마지막 날 "YYYY-MM-DD") }]. 같은 항목이 여러 번이면 가장 늦게 끝나는 것
  function promoted(habitRows, rows, today) {
    const t = Md.dateOf(today), names = new Set((habitRows || []).filter((r) => r.kind === KIND.safety).map((r) => r.name)), out = new Map();
    (rows || []).forEach((r) => {
      if (r.result !== RESULTS.missed || !names.has(r.item) || !isDate(r.week)) return;
      const from = Md.dateOf(r.week), end = Md.dateOf(Md.addDays(r.week, PROMOTE_DAYS));
      if (t < from || t >= end) return;
      const until = Md.addDays(r.week, PROMOTE_DAYS - 1), cur = out.get(r.item);
      if (!cur || until > cur.until) out.set(r.item, { name: r.item, week: r.week, until });
    });
    return [...out.values()];
  }

  // ---- 습관 기록 표 오늘 줄 고치기 (공통) ----
  // 칸 글 "물 5/6, 요가" -> 항목 글자 목록. 구분자(쉼표+공백)는 원래 모양 그대로 둠
  function splitCell(core) {
    const parts = String(core).split(/(\s*[,，]\s*)/);
    const items = [], seps = [];
    parts.forEach((p, i) => (i % 2 ? seps : items).push(p));
    return { items, seps };
  }
  function joinCell(c) { let s = ''; c.items.forEach((it, i) => { s += it; if (i < c.seps.length) s += c.seps[i]; }); return s; }
  function removeItems(core, pred) {
    const c = splitCell(core);
    for (let i = c.items.length - 1; i >= 0; i--) {
      if (!pred(c.items[i].trim())) continue;
      c.items.splice(i, 1);
      if (c.seps.length) c.seps.splice(i > 0 ? i - 1 : 0, 1); // 앞 구분자(첫 항목이면 뒤 구분자)를 같이 뺌
    }
    return joinCell(c).trim();
  }
  const appendItem = (core, item) => { const t = String(core).replace(/\s+$/, ''); return t ? `${t}, ${item}` : item; };
  const nameOf = (t) => Md.recordItems(t)[0] ? Md.recordItems(t)[0].name : t;

  // date 줄의 "한 습관" 칸을 fn(옛 칸 글) -> 새 칸 글로. 줄이 없으면 insert = true일 때만 fn('')로 새 줄
  //   -> { text, changed, line, inserted, before, after }
  function editRecordCell(text, date, fn, insert) {
    if (!isDate(date)) throw new Error('날짜 오류');
    const nl = /\r\n/.test(text) ? '\r\n' : '\n';
    const lines = String(text).split(/\r?\n/);
    const T = LW.recordsTable(lines); if (!T) throw new Error('습관 기록 표 없음');
    const hit = T.rows.find((r) => Md.dateOf(r.date) === Md.dateOf(date));
    if (hit) {
      const m = /^(\s*\|[^|]*\|)([^|]*)(\|.*)$/.exec(lines[hit.line]); if (!m) throw new Error('줄 모양 오류');
      const lead = /^\s*/.exec(m[2])[0], trail = /\s*$/.exec(m[2])[0];
      const core = m[2].slice(lead.length, m[2].length - trail.length), next = fn(core);
      if (next === core) return { text, changed: false, line: hit.line, cell: core };
      const before = lines[hit.line], after = m[1] + (lead || ' ') + next + (trail || ' ') + m[3];
      lines[hit.line] = after;
      return { text: lines.join(nl), changed: true, line: hit.line, inserted: false, before, after, cell: next };
    }
    if (!insert) return { text, changed: false, line: null, cell: '' };
    const cell = fn(''); if (!cell) return { text, changed: false, line: null, cell: '' };
    const row = `| ${date} | ${cell} |`;
    const at = LW.order(T.rows) === 'desc' ? (T.sepLine != null ? T.sepLine + 1 : T.headLine + 1) : T.endLine;
    lines.splice(at, 0, row);
    return { text: lines.join(nl), changed: true, line: at, inserted: true, before: null, after: row, cell };
  }

  // E: 오늘 이 습관을 했음/안 했음 뒤집기 (했으면 오늘 칸에서 빼고, 안 했으면 끝에 더함). -> { ...edit, done(바뀐 뒤 오늘 했는지) }
  //   빼기는 오늘 줄만 (지난 날은 안 건드림). 칸이 비어도 줄은 남김(줄 삭제 없음)
  function toggleWeekly(text, o) {
    const habit = String(o.habit || '');
    if (!habit || /[|,，]/.test(habit)) throw new Error('습관 이름 오류');
    let done = null;
    const r = editRecordCell(text, o.date, (core) => {
      const has = splitCell(core).items.some((it) => it.trim() && nameOf(it.trim()) === habit);
      done = !has;
      return has ? removeItems(core, (it) => nameOf(it) === habit) : appendItem(core, habit);
    }, true);
    return Object.assign(r, { done });
  }

  // 기록 습관 양 적기. mode 'add' = 더하기, 'set' = 바꾸기 (오늘 적힌 양이 없으면 둘 다 새로 적기). -> { ...edit, value(바뀐 뒤 양), prev(옛 양 또는 null) }
  function addAmount(text, o) {
    const habit = String(o.habit || ''), unit = String(o.unit || ''), n = o.value;
    if (!habit || /[|,，]/.test(habit)) throw new Error('습관 이름 오류');
    if (!unitOf(unit)) throw new Error('단위 오류');
    if (!Number.isInteger(n) || n < 1 || n > MAX_AMOUNT) throw new Error('양 오류 (1~' + MAX_AMOUNT + ')');
    if (o.mode !== 'add' && o.mode !== 'set') throw new Error('방식 오류');
    let prev = null, value = n;
    const mine = (t) => { const it = Md.recordItems(t)[0]; return it && it.name === habit && it.value != null && !it.of && it.unit === unit; };
    const r = editRecordCell(text, o.date, (core) => {
      const c = splitCell(core), i = c.items.findIndex((it) => mine(it.trim()));
      if (i < 0) return appendItem(core, `${habit} ${n}${unit}`);
      prev = Md.recordItems(c.items[i].trim())[0].value;
      value = o.mode === 'add' ? prev + n : n;
      if (!Number.isInteger(value) || value > MAX_AMOUNT * 10) throw new Error('양 오류');
      const lead = /^\s*/.exec(c.items[i])[0], trail = /\s*$/.exec(c.items[i])[0];
      c.items[i] = lead + `${habit} ${value}${unit}` + trail;
      return joinCell(c);
    }, true);
    return Object.assign(r, { value, prev });
  }

  // I: 안전장치 확인 한 줄 (그 주·그 항목 줄이 있으면 결과만 바꿈). result = 'good' | 'missed'
  function setSafetyCheck(text, o) {
    if (!isDate(o.week) || Md.weekStart(o.week) !== o.week) throw new Error('주 시작일 오류 (월요일)');
    const item = String(o.item || ''); if (!item || /[|]/.test(item)) throw new Error('항목 오류');
    if (!RESULTS[o.result]) throw new Error('결과 오류');
    return LL.upsert(text, 'safety', [o.week, item, RESULTS[o.result]], (c) => c[0] === o.week && c[1] === item);
  }

  const C = { KIND, RESULTS, PROMOTE_DAYS, MAX_AMOUNT, weeklyOf, unitOf, weekCount, todayAmount, safetyRows, weekResults, promoted,
    splitCell, removeItems, editRecordCell, toggleWeekly, addAmount, setSafetyCheck };
  root.PHLifeCheck = C;
  if (typeof module !== 'undefined' && module.exports) module.exports = C;
})(typeof window !== 'undefined' ? window : globalThis);

};
RT.MODS["/app/js/life_write.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 생활 기록 쓰기 (첫 판: 물 칸만). 그림·파일 접근 없음: 글(text)을 받아 새 글을 돌려준다. Electron 메인과 Node 시험이 같이 쓴다.
// 원칙: "그 줄만 바꿔 쓰기". 다른 줄은 한 글자도 안 바뀐다. 같은 칸의 다른 습관 글자도 그대로 둔다.
//   0/6이 되면 항목을 지우지 않고 "물 0/6"으로 남긴다 (줄·항목 삭제 없음 = 바뀌는 범위가 가장 작고, 되돌리기 쉬움)
(function (root) {
  'use strict';
  const Md = root.PHLifeMd || (typeof require !== 'undefined' ? require('./life_md.js') : null);

  function ymd(d) { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; }
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // 습관 기록 표의 범위: { sec, headLine, sepLine, rows: [{ line, date }], first(첫 데이터 줄), endLine(표 다음 줄) }
  function recordsTable(lines) {
    const secs = Md.sections(lines), sec = secs.find((s) => s.name === Md.NAMES.records);
    if (!sec) return null;
    const t = Md.table(lines, sec); if (!t) return null;
    let sep = t.line + 1; if (!(sep < sec.end && /^\s*\|?\s*:?-{3,}/.test(lines[sep]))) sep = null;
    let end = (sep == null ? t.line : sep) + 1;
    while (end < sec.end && /^\s*\|/.test(lines[end])) end++;
    return { sec, headLine: t.line, sepLine: sep, rows: t.rows.map((r) => ({ line: r.line, date: r.cells['날짜'] })), endLine: end };
  }
  // 표 순서: 날짜가 내려가면 'desc'(최신이 위), 아니면 'asc'(최신이 아래, 기본)
  function order(rows) {
    const ds = rows.map((r) => Md.dateOf(r.date)).filter((d) => d != null);
    if (ds.length < 2) return 'asc';
    return ds[0] > ds[ds.length - 1] ? 'desc' : 'asc';
  }

  // 한 칸(한 습관 칸 글)에서 물 항목만 바꿈. 없으면 끝에 ", 물 v/of"를 붙임 (칸이 비었으면 "물 v/of")
  function setInCell(cell, habit, value, of) {
    const re = new RegExp('(^|[,，]\\s*)(' + esc(habit) + ')\\s+\\d+\\s*/\\s*\\d+(?=\\s*(?:[,，]|$))');
    if (re.test(cell)) return cell.replace(re, (m, pre, name) => `${pre}${name} ${value}/${of}`);
    const t = cell.replace(/\s+$/, '');
    return t ? `${t}, ${habit} ${value}/${of}` : `${habit} ${value}/${of}`;
  }
  // 표 한 줄 "| 날짜 | 한 습관 |"에서 둘째 칸만 바꿈 (칸 사이 공백·뒤 글자는 그대로)
  function setInRow(rowText, habit, value, of) {
    const m = /^(\s*\|[^|]*\|)([^|]*)(\|.*)$/.exec(rowText);
    if (!m) return null;
    const lead = /^\s*/.exec(m[2])[0], trail = /\s*$/.exec(m[2])[0];
    const core = m[2].slice(lead.length, m[2].length - trail.length);
    return m[1] + (lead || ' ') + setInCell(core, habit, value, of) + (trail || ' ') + m[3];
  }

  // 물 n/of로 정하기. -> { text, line, inserted, before, after } (쓸 것이 없으면 text 그대로, changed false)
  function setSlots(text, opt) {
    const habit = opt.habit, value = opt.value, of = opt.of, date = opt.date;
    if (!Number.isInteger(value) || !Number.isInteger(of) || of < 1 || value < 0 || value > of) throw new Error('값 오류');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('날짜 오류');
    const nl = /\r\n/.test(text) ? '\r\n' : '\n';
    const lines = String(text).split(/\r?\n/);
    const T = recordsTable(lines); if (!T) throw new Error('습관 기록 표 없음');
    const hit = T.rows.find((r) => Md.dateOf(r.date) === Md.dateOf(date));
    if (hit) {
      const after = setInRow(lines[hit.line], habit, value, of); if (after == null) throw new Error('줄 모양 오류');
      if (after === lines[hit.line]) return { text, changed: false, line: hit.line };
      const before = lines[hit.line]; lines[hit.line] = after;
      return { text: lines.join(nl), changed: true, line: hit.line, inserted: false, before, after };
    }
    const row = `| ${date} | ${habit} ${value}/${of} |`;
    const desc = order(T.rows) === 'desc';
    const at = desc ? (T.sepLine != null ? T.sepLine + 1 : T.headLine + 1) : T.endLine;
    lines.splice(at, 0, row);
    return { text: lines.join(nl), changed: true, line: at, inserted: true, before: null, after: row };
  }

  // 안전 검사 (메인이 쓰기 직전에 다시 확인): 옛 글 -> 새 글이 "습관 기록 표 안 한 줄 바꿈" 또는 "그 표 안에 한 줄 더함"인지
  function onlyRecordsRowChanged(oldText, newText) {
    const a = String(oldText).split(/\r?\n/), b = String(newText).split(/\r?\n/);
    const T = recordsTable(a); if (!T) return false;
    const rowLine = (s) => /^\s*\|.*\|\s*$/.test(s) && !/^\s*\|?\s*:?-{3,}/.test(s);
    if (a.length === b.length) {
      const diff = a.map((x, i) => (x === b[i] ? -1 : i)).filter((i) => i >= 0);
      if (diff.length !== 1) return diff.length === 0;
      const i = diff[0];
      return T.rows.some((r) => r.line === i) && rowLine(b[i]) && cellsOf(a[i])[0] === cellsOf(b[i])[0]; // 날짜 칸은 그대로
    }
    if (b.length !== a.length + 1) return false;
    let i = 0; while (i < a.length && a[i] === b[i]) i++;
    if (a.slice(i).join('\n') !== b.slice(i + 1).join('\n')) return false;
    const lo = T.sepLine != null ? T.sepLine + 1 : T.headLine + 1;
    return i >= lo && i <= T.endLine && rowLine(b[i]) && cellsOf(b[i]).length === 2 && Md.dateOf(cellsOf(b[i])[0]) != null;
  }
  function cellsOf(l) { return l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim()); }

  const W = { ymd, recordsTable, order, setInCell, setInRow, setSlots, onlyRecordsRowChanged };
  root.PHLifeWrite = W;
  if (typeof module !== 'undefined' && module.exports) module.exports = W;
})(typeof window !== 'undefined' ? window : globalThis);

};
RT.MODS["/app/js/life_log.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 생활 기록 쓰기 2 (두부 대화창): ## 수면 / ## 식사 / ## 한마디 표. 그림·파일 접근 없음: 글(text)을 받아 새 글을 돌려준다.
// Electron 메인(electron/life_log_ipc.js)과 화면(dialog_flow.js, life_log_view.js), Node 시험(tests/test_dialog.js)이 같이 쓴다.
// 원칙은 물컵(life_write.js)과 같다: "정해진 섹션 안 오늘 줄 하나만 바꾸거나 한 줄 더함". 섹션이 없으면 ## 버킷리스트 앞에 새로 만듦.
// 다른 줄은 한 글자도 안 바뀐다. 메인은 쓰기 직전에 onlyLogChanged로 다시 확인한다.
(function (root) {
  'use strict';
  const Md = root.PHLifeMd || (typeof require !== 'undefined' ? require('./life_md.js') : null);
  // ## 식사 표는 식사 일지(js/meal_log.js, logs 브랜치 2026-10-04)가 넓힌 표를 같이 씀: 읽기·쓰기·검사를 그쪽에 맡김 (부를 때 찾음)
  const ML = () => root.PHMealLog || (typeof require !== 'undefined' ? require('./meal_log.js') : null);

  // 섹션 이름·표 머리 (파일에 들어가는 글자. 바꾸면 여기만)
  const SECTIONS = {
    sleep: { name: '수면', head: ['날짜', '잔 시각', '깬 시각', '메모'] }, // 대화창·두부 펫이 새로 만드는 머리. 선잠을 적으면 SLEEP_HEAD_WIDE (아래 "잠 구간")
    meal: { name: '식사', head: ['날짜', '시각', '끼니', '메뉴', '만족도', '양%', '메모'] }, // 2026-10-04 식사 일지로 넓힘 (옛 머리 날짜|끼니|내용 줄도 읽음, js/meal_log.js)
    note: { name: '한마디', head: ['날짜', '내용', '기분'] }, // 기분 칸 = D 기분 4칸 (2026-10-03 interact). 맨 끝에 붙여서 옛 2칸 줄도 그대로 읽힘
    // 안전장치 주간 확인 (js/life_check.js). 날짜 칸 = 그 주 월요일, 한 주·한 항목 한 줄 (다시 고르면 그 줄을 고침)
    safety: { name: '안전장치 확인', head: ['주 시작일', '항목', '결과'] },
  };
  // 옛 표 머리 (이 머리로 된 표에 쓸 때는 머리·구분선 두 줄만 새 머리로 바꾸고, 옛 줄은 그대로 둠 = 기분 빈칸)
  const OLD_HEADS = { note: [['날짜', '내용']] };
  // 기분 칸에 적는 값 (부기 MVP 대사 v01 mood.label: 칸 이름만 적음). js/data/interactions.js MOODS의 label과 같아야 함 (시험으로 확인)
  const MOODS = ['반짝', '포근', '노곤', '까슬'];
  const isOldHead = (kind, head) => (OLD_HEADS[kind] || []).some((h) => h.join('|') === head.join('|'));
  const MEALS = ['아침', '점심', '저녁', '간식'];
  const MULTI_MEAL = '간식'; // 간식만 하루에 여러 줄 (아침·점심·저녁은 하루 한 줄, 다시 적으면 그 줄을 고침). 토리 결정 2026-10-03
  const BEFORE = '버킷리스트'; // 새 섹션은 이 섹션 바로 앞에 (없으면 파일 끝)
  const MAX_LEN = 100;         // 글자 수 제한 (내용·메모)

  const pad = (n) => String(n).padStart(2, '0');
  // 기록 날짜: 하루의 경계 = startHour시 (settings.DAY_START_HOUR, 기본 6). 01~06시에 적으면 전날 날짜. 함수는 life_md.js 하나 (물컵·습관 체크와 같음)
  const ymd = Md.ymd, logDay = Md.logDay;

  // ---- 값 다듬기·검사 ----
  // 표를 깨는 글자: | -> ｜(전각), 줄바꿈·탭·제어 문자 -> 띄어쓰기. 앞뒤 공백 정리, 겹친 공백 하나로
  function clean(s) {
    return String(s == null ? '' : s).replace(/\|/g, '｜').replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const len = (s) => Array.from(s).length;
  function text(s, opt) { // 다듬은 글. 너무 길거나(필수인데) 비었으면 오류
    if (s != null && typeof s !== 'string') throw new Error('글 형식 오류');
    const t = clean(s), max = (opt && opt.max) || MAX_LEN;
    if (len(t) > max) throw new Error('글이 너무 김 (' + max + '자까지)');
    if (opt && opt.required && !t) throw new Error('빈 글');
    return t;
  }
  const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
  function isTime(s) { return typeof s === 'string' && TIME_RE.test(s); }
  function isDate(s) { return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s); }

  // 사람이 적은 시각 -> 'HH:MM' 목록. "1:30", "01:30", "1시", "1시 30분", "0시 반", "오후 11시", "23시", "130"(숫자만 3~4자리)
  //   한 글에 시각이 둘이면 둘 다 ("0시 반에 자서 8시 10분에 깸" -> ['00:30', '08:10']). 못 읽으면 []
  function parseTimes(s) {
    const src = String(s == null ? '' : s).replace(/\s+/g, ' ').trim(), out = [];
    const re = /(오전|오후|밤|새벽|아침)?\s*(\d{1,2})\s*(?::\s*(\d{2})|시(?:\s*(반)|\s*(\d{1,2})\s*분?)?)/g;
    let m;
    while ((m = re.exec(src))) {
      let h = Number(m[2]); const mm = m[3] != null ? Number(m[3]) : m[4] ? 30 : m[5] != null ? Number(m[5]) : 0;
      if ((m[1] === '오후' || m[1] === '밤') && h >= 1 && h < 12) h += 12;
      if ((m[1] === '오전' || m[1] === '새벽' || m[1] === '아침') && h === 12) h = 0;
      if (h === 24) h = 0;
      if (h > 23 || mm > 59) return [];
      out.push(pad(h) + ':' + pad(mm));
    }
    if (!out.length) { const d = /^(\d{1,2})(\d{2})$/.exec(src); if (d && Number(d[1]) < 24 && Number(d[2]) < 60) out.push(pad(Number(d[1])) + ':' + d[2]); }
    return out;
  }
  function parseTime(s) { const t = parseTimes(s); return t.length === 1 ? t[0] : null; }
  // 'HH:MM' -> 화면 글자 "0시", "1시 30분" (부기 원고 {bed} {wake} 규칙)
  function fmtTime(s) { if (!isTime(s)) return String(s || ''); const h = Number(s.slice(0, 2)), m = Number(s.slice(3)); return h + '시' + (m ? ' ' + m + '분' : ''); }

  // ---- 읽기 ----
  const cellsOf = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  const isRow = (l) => /^\s*\|/.test(l);
  const isSep = (l) => /^\s*\|?\s*:?-{3,}/.test(l);
  // 섹션 한 곳 찾기 (같은 이름이 둘 이상이면 오류: 어느 쪽에 쓸지 모름)
  function findSection(lines, kind) {
    const all = Md.sections(lines).filter((s) => s.name === SECTIONS[kind].name);
    if (all.length > 1) throw new Error('같은 섹션이 둘: ' + SECTIONS[kind].name);
    return all[0] || null;
  }
  // 섹션 안 표 범위 { headLine, sepLine, rows: [{ line, cells }], endLine } 또는 null
  function tableOf(lines, sec) {
    const t = Md.table(lines, sec); if (!t) return null;
    let sep = t.line + 1; if (!(sep < sec.end && isSep(lines[sep]))) sep = null;
    let end = (sep == null ? t.line : sep) + 1;
    while (end < sec.end && isRow(lines[end])) end++;
    return { headLine: t.line, head: t.head, sepLine: sep, rows: t.rows.map((r) => ({ line: r.line, cells: r.raw })), endLine: end };
  }
  // 글 -> { sleep: [{ line, date, bed, wake, memo, kind, light, start, end }], meal: [{ line, date, kind, text }], note: [{ line, date, text }] } (파일 순서)
  function parse(src) {
    const lines = Array.isArray(src) ? src : String(src).replace(/\r\n?/g, '\n').split('\n');
    const out = { sleep: [], meal: [], note: [], safety: [] };
    Object.keys(SECTIONS).forEach((k) => {
      if (k === 'meal') { // 식사 일지 표 (새 줄·옛 줄 둘 다). 대화창·모아 보기가 쓰는 모양 { line, date, kind, text } + 일지 칸
        ML().parse(lines).rows.forEach((r) => out.meal.push(Object.assign({ text: r.menu }, r)));
        return;
      }
      const sec = Md.sections(lines).find((s) => s.name === SECTIONS[k].name); if (!sec) return;
      const t = tableOf(lines, sec); if (!t) return;
      const col = (name) => t.head.indexOf(name);
      t.rows.forEach((r) => {
        const c = (name) => { const i = col(name); return i < 0 ? '' : (r.cells[i] || ''); };
        if (k === 'sleep') out.sleep.push(sleepRow({ line: r.line, date: c('날짜'), bed: c('잔 시각'), wake: c('깬 시각'), memo: c('메모'), kind: c('종류') }));
        if (k === 'meal') out.meal.push({ line: r.line, date: c('날짜'), kind: c('끼니'), text: c('내용') });
        if (k === 'note') out.note.push({ line: r.line, date: c('날짜'), text: c('내용'), mood: c('기분') });
        if (k === 'safety') out.safety.push({ line: r.line, week: c('주 시작일'), item: c('항목'), result: c('결과') });
      });
    });
    return out;
  }
  // 그날 기록만: { sleep(대표 줄 또는 null, mainSleep), sleeps(그날 줄 전부), meals: { 아침: {...}, ... , 간식: [...] }, notes: [...] }
  function dayOf(parsed, date) {
    const D = Md.dateOf(date), same = (r) => Md.dateOf(r.date) === D;
    const meals = { 간식: [] };
    parsed.meal.filter(same).forEach((r) => { if (r.kind === MULTI_MEAL) meals[MULTI_MEAL].push(r); else meals[r.kind] = r; });
    const sl = parsed.sleep.filter(same);
    return { sleep: mainSleep(sl), sleeps: sl, meals, notes: parsed.note.filter(same) };
  }
  // 날짜별 묶음 (최근 날짜 먼저, 기록 보관 탭): [{ date, day, sleep, meals: [...], notes: [...] }]
  function byDate(parsed) {
    const m = new Map(), get = (d) => { if (!m.has(d)) m.set(d, { date: d, day: Md.dateOf(d), sleep: null, sleeps: [], meals: [], notes: [] }); return m.get(d); };
    parsed.sleep.forEach((r) => { const g = get(r.date); g.sleeps.push(r); g.sleep = mainSleep(g.sleeps); });
    parsed.meal.forEach((r) => get(r.date).meals.push(r));
    parsed.note.forEach((r) => get(r.date).notes.push(r));
    const rank = (k) => { const i = MEALS.indexOf(k); return i < 0 ? 9 : i; };
    return [...m.values()].map((g) => { g.meals.sort((a, b) => rank(a.kind) - rank(b.kind) || a.line - b.line); return g; }).sort((a, b) => (b.day || 0) - (a.day || 0));
  }

  // ---- 쓰기 계획 ----
  const rowText = (cells) => '| ' + cells.join(' | ') + ' |';
  const sepText = (n) => '|' + Array(n).fill('---').join('|') + '|'; // 파일의 다른 표와 같은 모양 |---|---|
  // 표 순서: 날짜가 내려가면 desc(최신 위), 아니면 asc(최신 아래, 기본)
  function order(rows) {
    const ds = rows.map((r) => Md.dateOf(r.cells[0])).filter((d) => d != null);
    if (ds.length < 2) return 'asc';
    return ds[0] > ds[ds.length - 1] ? 'desc' : 'asc';
  }
  // kind 표에 cells 줄 쓰기. match(cells, line) = 바꿀 줄 고르기 (없으면 새 줄). 칸이 표 머리보다 적으면 뒤를 빈칸으로 채움 (넓은 수면 표) pickLast = 맞는 줄이 여럿이면 파일상 마지막(asc)/처음(desc)
  //   cells가 함수면 cells(바꿀 줄의 옛 칸 또는 null) -> 새 칸 (고칠 때 옛 칸 값을 이어받기: 한마디 고치기의 기분)
  //   -> { text, changed, line, inserted, created(섹션 새로 만듦), upgraded(옛 머리를 새 머리로), before, after }
  function upsert(src, kind, cellsIn, match) {
    const nl = /\r\n/.test(src) ? '\r\n' : '\n';
    const lines = String(src).split(/\r?\n/), S = SECTIONS[kind];
    const cellsOf2 = (old) => (typeof cellsIn === 'function' ? cellsIn(old) : cellsIn);
    let row = rowText(cellsOf2(null));
    const sec = findSection(lines, kind);
    if (!sec) { // 섹션 새로: ## 버킷리스트 앞 (없으면 파일 끝)
      const block = ['## ' + S.name, rowText(S.head), sepText(S.head.length), row, ''];
      const bi = Md.sections(lines).find((s) => s.name === BEFORE);
      let at;
      if (bi) at = bi.line;
      else { at = lines.length; while (at > 0 && lines[at - 1] === '') at--; block.unshift(''); block.pop(); } // 끝: 빈 줄 하나 띄우고 붙임 (끝 빈 줄은 그대로)
      lines.splice(at, 0, ...block);
      return { text: lines.join(nl), changed: true, line: at + block.indexOf(row), inserted: true, created: true, before: null, after: row };
    }
    let t = tableOf(lines, sec), upgraded = false;
    if (t && isOldHead(kind, t.head)) { // 옛 머리: 머리·구분선만 새 모양으로 (옛 줄은 칸이 모자란 채 그대로 = 빈칸)
      lines[t.headLine] = rowText(S.head); if (t.sepLine != null) lines[t.sepLine] = sepText(S.head.length);
      t = tableOf(lines, sec); upgraded = true;
    }
    if (!t) { // 섹션은 있는데 표가 없음: 섹션 글 끝(빈 줄 앞)에 머리·구분선·줄
      let at = sec.end; while (at > sec.start && lines[at - 1].trim() === '') at--;
      lines.splice(at, 0, rowText(S.head), sepText(S.head.length), row);
      return { text: lines.join(nl), changed: true, line: at + 2, inserted: true, created: false, before: null, after: row };
    }
    if (!okHead(kind, t.head)) throw new Error('표 머리가 달라서 멈춤: ## ' + S.name);
    const n = t.head.length, fit = (c) => (c.length < n ? c.concat(Array(n - c.length).fill('')) : c);
    const desc = order(t.rows) === 'desc';
    const hits = match ? t.rows.filter((r) => match(r.cells, r.line)) : [];
    const hit = hits.length ? (desc ? hits[0] : hits[hits.length - 1]) : null;
    row = rowText(fit(cellsOf2(null)));
    if (hit) {
      row = rowText(fit(cellsOf2(hit.cells)));
      if (lines[hit.line] === row && !upgraded) return { text: src, changed: false, line: hit.line };
      const before = lines[hit.line]; lines[hit.line] = row;
      return { text: lines.join(nl), changed: true, line: hit.line, inserted: false, created: false, upgraded, before, after: row };
    }
    // 새 줄: asc = 표 끝, desc = 구분선 바로 아래. desc에서 같은 날짜 줄이 이미 있으면 그 줄들 위(그날 안에서도 최신 위)
    const at = desc ? (t.sepLine != null ? t.sepLine + 1 : t.headLine + 1) : t.endLine;
    lines.splice(at, 0, row);
    return { text: lines.join(nl), changed: true, line: at, inserted: true, created: false, upgraded, before: null, after: row };
  }
  const sameDate = (date) => (c) => Md.dateOf(c[0]) === Md.dateOf(date);

  // 잠 (대화창·두부 펫): 그날(깬 날) 대표 줄 하나(mainSleep)를 고치거나, 없으면 한 줄 더함. 잔·깬 시각은 'HH:MM' (둘 중 하나는 비어도 됨, 둘 다 비면 오류)
  //   그날 줄이 하나뿐이던 옛 파일은 예전과 똑같이 그 줄을 고침. 칠하기로 구간이 여럿이면 대표 줄만 고치고 다른 구간(낮잠·선잠)은 그대로
  //   넓은 표(종류 칸)면 종류 칸은 빈칸(보통 잠)으로 씀
  function setSleep(src, o) {
    if (!isDate(o.date)) throw new Error('날짜 오류');
    const bed = o.bed == null ? '' : o.bed, wake = o.wake == null ? '' : o.wake;
    if ((bed !== '' && !isTime(bed)) || (wake !== '' && !isTime(wake))) throw new Error('시각 형식 오류 (HH:MM)');
    if (bed === '' && wake === '') throw new Error('시각이 비었음');
    const memo = text(o.memo);
    const main = mainSleep(parse(src).sleep.filter((r) => Md.dateOf(r.date) === Md.dateOf(o.date)));
    return upsert(src, 'sleep', [o.date, bed, wake, memo], main ? (c, line) => line === main.line : null);
  }
  // 식사: 아침·점심·저녁은 그날 그 끼니 한 줄(있으면 고침), 간식은 늘 한 줄 더함
  function addMeal(src, o) {
    if (!isDate(o.date)) throw new Error('날짜 오류');
    if (!MEALS.includes(o.kind)) throw new Error('끼니 오류');
    const body = text(o.text, { required: true });
    // 식사 일지 표에 씀 (js/meal_log.js dialogMeal): 아침·점심·저녁 = 그날 그 끼니 마지막 줄의 메뉴만 고침, 간식 = 더함. o.time = 적은 시각 'HH:MM'(없으면 빈칸)
    if (o.time != null && o.time !== '' && !isTime(o.time)) throw new Error('시각 형식 오류 (HH:MM)');
    return ML().dialogMeal(src, { date: o.date, kind: o.kind, text: body, time: o.time || '' });
  }
  // 한마디: 기본은 한 줄 더함(하루 여러 줄), fix = 그날 마지막 한마디를 고침 (없으면 더함)
  //   mood = 기분 칸 (MOODS 중 하나, 없으면 빈칸). 기분이 있으면 내용은 비어도 됨 (D: "한 줄 더 적을래요?"를 건너뜀)
  //   고칠 때 mood를 안 보내면 그 줄의 기분을 그대로 둠
  function setNote(src, o) {
    if (!isDate(o.date)) throw new Error('날짜 오류');
    if (o.mood != null && o.mood !== '' && !MOODS.includes(o.mood)) throw new Error('기분 값 오류');
    const mood = o.mood || '';
    const body = text(o.text, { required: !mood });
    const cells = (old) => [o.date, body, o.mood == null && old ? (old[2] || '') : mood];
    return upsert(src, 'note', cells, o.fix ? sameDate(o.date) : null);
  }

  // ---- 잠 구간 (2026-10-08 잠 기록 살리기: 하루에 구간 여러 개 + 선잠) ----
  // ## 수면 표 한 줄 = 잠 구간 하나. 하루에 줄 여러 개(밤잠·낮잠·선잠)를 둘 수 있다. 시각은 분 단위 'HH:MM'
  //   날짜 = 깬 날. 잔 시각 > 깬 시각이면 전날 잔 것 (| 2026-10-08 | 23:30 | 07:00 | = 10-07 23:30 ~ 10-08 07:00)
  //   종류 칸 = '선잠'이면 선잠, 빈칸이면 보통 잠. 종류 칸은 선잠을 처음 적을 때 머리에 붙음(SLEEP_HEAD_WIDE). 옛 4칸 줄은 종류 빈칸으로 읽힘
  //   대화창·두부 펫(setSleep)은 지금처럼 4칸 표를 만들고, 넓은 표에선 5칸으로 씀
  // 시각 계산은 "1970-01-01 00:00부터 몇 분"(시간대·서머타임 없음, 달력 그대로). toMin / fromMin
  const SLEEP_HEAD_WIDE = ['날짜', '잔 시각', '깬 시각', '메모', '종류'];
  const LIGHT = '선잠';
  const SLEEP_GRID_HOUR = 18; // 모눈 한 줄 시작 시각 기본값 (제작자 2026-10-08 "저녁부터", 정확한 값은 무늬 시안에서. sleepGrid startHour로 바꿈)
  const MAX_SEGS = 96;        // 한 번에 쓰는 구간 수 상한 (15분 칸 24시간 = 96)
  const okHead = (kind, head) => (kind === 'sleep' ? [SECTIONS.sleep.head, SLEEP_HEAD_WIDE] : [SECTIONS[kind].head]).some((h) => h.join('|') === head.join('|'));
  function dayNum(date) { // 'YYYY-MM-DD' -> 1970-01-01부터 며칠 (없는 날짜면 null)
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date)); if (!m) return null;
    const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3] ? Math.round(d.getTime() / 86400000) : null;
  }
  const hm = (s) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
  function toMin(s) { // 'YYYY-MM-DD HH:MM' -> 분, 못 읽으면 null
    const m = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})$/.exec(String(s == null ? '' : s).trim()); if (!m || !isTime(m[2])) return null;
    const d = dayNum(m[1]); return d == null ? null : d * 1440 + hm(m[2]);
  }
  function fromMin(n) { // 분 -> 'YYYY-MM-DD HH:MM'
    const d = Math.floor(n / 1440), r = n - d * 1440, t = new Date(d * 86400000);
    return t.getUTCFullYear() + '-' + pad(t.getUTCMonth() + 1) + '-' + pad(t.getUTCDate()) + ' ' + pad(Math.floor(r / 60)) + ':' + pad(r % 60);
  }
  // 표 한 줄 -> 구간 { start, end } (분). 잔·깬 시각이 다 있어야 함. 같은 시각(0분)이면 null
  function segOf(date, bed, wake) {
    const d = dayNum(date); if (d == null || !isTime(bed) || !isTime(wake)) return null;
    const end = d * 1440 + hm(wake); let start = d * 1440 + hm(bed);
    if (start > end) start -= 1440;
    return start === end ? null : { start, end };
  }
  function sleepRow(r) { // parse 한 줄에 light·start·end 붙임 (구간이 아니면 start·end = null: 잔 시각만·깬 시각만 적은 줄)
    const s = segOf(r.date, r.bed, r.wake);
    return Object.assign(r, { light: String(r.kind || '').includes(LIGHT), start: s ? s.start : null, end: s ? s.end : null });
  }
  // 그날 줄들 중 대표 줄 (대화창·두부 펫이 "오늘 잠"으로 보여 주고 고치는 줄): 선잠 아닌 줄 우선, 그중 가장 긴 것, 같으면 파일상 뒤
  //   줄이 하나면 그 줄 (옛 파일은 예전과 같음). 없으면 null
  function mainSleep(rows) {
    if (!rows || !rows.length) return null;
    const pool = rows.some((r) => !r.light) ? rows.filter((r) => !r.light) : rows;
    const span = (r) => (r.start != null ? r.end - r.start : 0);
    return pool.reduce((best, r) => (span(r) >= span(best) ? r : best));
  }
  // 구간들 -> 겹침·맞닿음 정리: 겹치면 보통 잠이 선잠보다 앞섬, 같은 종류로 맞닿으면 하나로. 메모는 다른 것끼리 ' · '로 이음(100자까지)
  //   segs = [{ start, end, light, memo }] (분) -> 같은 모양, 시작 순
  function normalize(segs) {
    const pts = [...new Set(segs.flatMap((s) => [s.start, s.end]))].sort((x, y) => x - y), out = [];
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], b = pts[i + 1], cov = segs.filter((s) => s.start <= a && s.end >= b); if (!cov.length) continue;
      const deep = cov.filter((s) => !s.light), from = deep.length ? deep : cov, light = !deep.length;
      const memos = from.map((s) => s.memo || '').filter(Boolean), last = out[out.length - 1];
      if (last && last.end === a && last.light === light) { last.end = b; memos.forEach((m) => { if (!last.memos.includes(m)) last.memos.push(m); }); }
      else out.push({ start: a, end: b, light, memos: [...new Set(memos)] });
    }
    return out.map((s) => ({ start: s.start, end: s.end, light: s.light, memo: Array.from(s.memos.join(' · ')).slice(0, MAX_LEN).join('').trim() }));
  }
  // 창 { w0, w1 } (분). from = 'YYYY-MM-DD HH:MM', hours = 1~max (기본 24)
  function windowOf(from, hours, max) {
    const w0 = toMin(from); if (w0 == null) throw new Error('창 시작 형식 오류 (YYYY-MM-DD HH:MM)');
    const h = hours == null ? 24 : hours;
    if (!Number.isInteger(h) || h < 1 || h > (max || 48)) throw new Error('창 길이 오류 (1~' + (max || 48) + '시간)');
    return { w0, w1: w0 + h * 60 };
  }
  // 구간 하나를 화면에 넘기는 모양 (a·b = 창 시작부터 몇 분, 창 밖으로 나간 쪽은 잘라서. cutStart·cutEnd = 잘렸는지)
  function segView(s, W, row) {
    const o = { start: fromMin(s.start), end: fromMin(s.end), a: Math.max(s.start, W.w0) - W.w0, b: Math.min(s.end, W.w1) - W.w0, light: !!s.light, memo: s.memo || '', cutStart: s.start < W.w0, cutEnd: s.end > W.w1 };
    if (row) Object.assign(o, { line: row.line, date: row.date, bed: row.bed, wake: row.wake });
    return o;
  }
  // 읽기: 기준 시각 from부터 hours시간 창에 걸친 잠
  //   -> { from, to, segments: 표 줄 그대로(겹칠 수 있음, 줄 번호 포함), merged: 칠하기용으로 정리한 구간(겹침 없음), open: 잔 시각·깬 시각 하나만 적힌 줄(그 시각이 창 안) }
  //   src = 글 또는 parse() 결과
  function sleepWindow(src, from, hours) {
    const P = src && Array.isArray(src.sleep) ? src : parse(src), W = windowOf(from, hours, 48);
    const rows = P.sleep.filter((r) => r.start != null && r.start < W.w1 && r.end > W.w0).sort((x, y) => x.start - y.start || x.line - y.line);
    const merged = normalize(rows.map((r) => ({ start: r.start, end: r.end, light: r.light, memo: r.memo }))).filter((s) => s.start < W.w1 && s.end > W.w0);
    const open = openRowsIn(P, W).map(({ r, at }) => ({ line: r.line, date: r.date, bed: r.bed, wake: r.wake, memo: r.memo, at, a: toMin(at) - W.w0, side: isTime(r.bed) ? 'bed' : 'wake' }));
    return { from: fromMin(W.w0), to: fromMin(W.w1), segments: rows.map((r) => segView(r, W, r)), merged: merged.map((s) => segView(s, W)), open };
  }
  // 모눈용: firstDate부터 days줄. 줄 하나 = 그 날짜 startHour시부터 hours시간 (기본 18시 ~ 다음날 18시). 줄 이름 date = 창이 시작하는 날
  //   -> [{ date, from, to, segments, merged, open }]
  function sleepGrid(src, o) {
    o = o || {};
    const P = src && Array.isArray(src.sleep) ? src : parse(src);
    const d0 = dayNum(o.from); if (d0 == null) throw new Error('날짜 오류');
    const days = o.days == null ? 7 : o.days, h0 = o.startHour == null ? SLEEP_GRID_HOUR : o.startHour;
    if (!Number.isInteger(days) || days < 1 || days > 400) throw new Error('줄 수 오류 (1~400)');
    if (!Number.isInteger(h0) || h0 < 0 || h0 > 23) throw new Error('시작 시각 오류 (0~23)');
    const out = [];
    for (let i = 0; i < days; i++) {
      const date = fromMin((d0 + i) * 1440).slice(0, 10);
      out.push(Object.assign({ date }, sleepWindow(P, date + ' ' + pad(h0) + ':00', o.hours)));
    }
    return out;
  }
  // 그날(깬 날) 구간: dayOf(..).sleeps 와 같은 줄 + 분. 칠하기가 아니라 날짜 기준으로 볼 때
  function sleepDay(src, date) {
    const P = src && Array.isArray(src.sleep) ? src : parse(src), D = Md.dateOf(date);
    return P.sleep.filter((r) => Md.dateOf(r.date) === D);
  }

  // 쓰기에 들어온 구간 검사 -> [{ start, end, light, memo }] (분, 창 안)
  //   한 구간 = { start: 'YYYY-MM-DD HH:MM', end: '…' } 또는 { a, b } (창 시작부터 몇 분, 정수). light = true면 선잠. memo = 100자까지
  function cleanSegs(list, W) {
    if (!Array.isArray(list)) throw new Error('구간 목록 형식 오류');
    if (list.length > MAX_SEGS) throw new Error('구간이 너무 많음 (' + MAX_SEGS + '개까지)');
    return list.map((x) => {
      if (!x || typeof x !== 'object') throw new Error('구간 형식 오류');
      let s, e;
      if (x.a != null || x.b != null) {
        if (!Number.isInteger(x.a) || !Number.isInteger(x.b)) throw new Error('구간 분 형식 오류 (정수)');
        s = W.w0 + x.a; e = W.w0 + x.b;
      } else {
        if (typeof x.start !== 'string' || typeof x.end !== 'string') throw new Error('구간 시각 형식 오류');
        s = toMin(x.start); e = toMin(x.end);
        if (s == null || e == null) throw new Error('구간 시각 형식 오류 (YYYY-MM-DD HH:MM)');
      }
      if (!(s < e)) throw new Error('구간 끝이 시작보다 앞섬');
      if (s < W.w0 || e > W.w1) throw new Error('구간이 창 밖으로 나감');
      if (x.light != null && typeof x.light !== 'boolean') throw new Error('선잠 값 형식 오류');
      return { start: s, end: e, light: x.light === true, memo: text(x.memo) };
    });
  }
  // 잔 시각만·깬 시각만 적은 줄 중 그 시각이 창 안인 것: [{ r, at: 'YYYY-MM-DD HH:MM' }] (sleepWindow open과 같은 규칙)
  function openRowsIn(P, W) {
    const out = [];
    P.sleep.forEach((r) => {
      if (r.start != null) return;
      const d = dayNum(r.date), t = isTime(r.bed) ? r.bed : isTime(r.wake) ? r.wake : null; if (d == null || !t) return;
      const at = d * 1440 + hm(t); if (at >= W.w0 && at < W.w1) out.push({ r, at: fromMin(at) });
    });
    return out;
  }
  function cleanDrop(list) {
    if (list == null) return [];
    if (!Array.isArray(list) || list.length > MAX_SEGS || !list.every((x) => typeof x === 'string' && toMin(x) != null)) throw new Error('지울 줄 형식 오류');
    return list.map((x) => fromMin(toMin(x)));
  }
  // 한 줄에 못 적는 긴 구간(24시간 이상: 잔 시각 = 깬 시각이 됨)을 창 경계에서, 그래도 길면 반으로 나눔
  function splitLong(segs, W) {
    const out = [];
    const cut = (s) => {
      if (s.end - s.start < 1440) { out.push(s); return; }
      const at = [W.w0, W.w1].find((p) => p > s.start && p < s.end);
      const m = at != null ? at : s.start + Math.floor((s.end - s.start) / 2);
      cut(Object.assign({}, s, { end: m })); cut(Object.assign({}, s, { start: m }));
    };
    segs.forEach(cut);
    return out;
  }
  const segCells = (s, wide) => { const e = fromMin(s.end), b = fromMin(s.start); const c = [e.slice(0, 10), b.slice(11), e.slice(11), s.memo || '']; if (wide) c.push(s.light ? LIGHT : ''); return c; };

  // 쓰기: 창(from부터 hours시간, 1~24) 안 잠을 segments로 통째로 바꿈 (칠하기 "기록하기")
  //   - 창에 걸친 줄은 다 지우고, 창 밖으로 나가 있던 부분은 남김 (밤잠 17:00~19:00에서 18:00 창을 고치면 17:00~18:00은 그대로)
  //   - 남은 부분과 새 구간이 같은 종류로 맞닿으면 한 줄로 이음. 창에 안 걸친 줄(잔 시각만 적은 줄 포함)은 한 글자도 안 바뀜
  //   - 새 줄 자리 = 지운 줄 중 맨 위 자리 (없으면 날짜 순서에 맞는 자리). 선잠이 있으면 표 머리에 종류 칸을 붙임(머리·구분선 두 줄만 바뀜)
  //   - 섹션이 없으면 ## 버킷리스트 앞에 새로. segments = [] 이면 창 안 잠을 지움
  //   - dropOpen = 지울 "잔 시각만·깬 시각만" 줄의 시각 목록 ['YYYY-MM-DD HH:MM', …] (sleepWindow().open[].at). 창 안에 있는 것만 지움 (2026-10-09 칠하기 창: 칠한 잠이 덮었거나 [지우기])
  //   -> { text, changed, removed, added, created, widened, from, to, dropped }
  function setSleepWindow(src, o) {
    o = o || {};
    const W = windowOf(o.from, o.hours, 24), painted = cleanSegs(o.segments, W), drop = cleanDrop(o.dropOpen);
    const nl = /\r\n/.test(src) ? '\r\n' : '\n', lines = String(src).split(/\r?\n/), S = SECTIONS.sleep;
    const sec = findSection(lines, 'sleep'), t = sec ? tableOf(lines, sec) : null;
    if (t && !okHead('sleep', t.head)) throw new Error('표 머리가 달라서 멈춤: ## ' + S.name);
    const P = parse(lines);
    const hit = t ? P.sleep.filter((r) => r.start != null && r.start < W.w1 && r.end > W.w0) : [];
    const dropRows = t ? openRowsIn(P, W).filter((x) => drop.includes(x.at)).map((x) => x.r) : [];
    const rest = [];
    hit.forEach((r) => {
      if (r.start < W.w0) rest.push({ start: r.start, end: W.w0, light: r.light, memo: r.memo });
      if (r.end > W.w1) rest.push({ start: W.w1, end: r.end, light: r.light, memo: r.memo });
    });
    const segs = splitLong(normalize(rest.concat(painted)), W).sort((x, y) => x.start - y.start);
    const res = (text, x) => Object.assign({ text, from: fromMin(W.w0), to: fromMin(W.w1), removed: hit.length, added: segs.length, created: false, widened: false, dropped: x && x.changed ? dropRows.length : 0 }, x);
    const anyLight = segs.some((s) => s.light);
    if (!t && !segs.length) return res(src, { changed: false, removed: 0, added: 0 });
    const wide = t ? (t.head.length === SLEEP_HEAD_WIDE.length || anyLight) : anyLight, head = wide ? SLEEP_HEAD_WIDE : S.head;
    if (!sec) { // 섹션 새로: ## 버킷리스트 앞 (없으면 파일 끝) = upsert와 같은 자리
      const block = ['## ' + S.name, rowText(head), sepText(head.length)].concat(segs.map((s) => rowText(segCells(s, wide))), ['']);
      const bi = Md.sections(lines).find((s) => s.name === BEFORE);
      let at;
      if (bi) at = bi.line;
      else { at = lines.length; while (at > 0 && lines[at - 1] === '') at--; block.unshift(''); block.pop(); }
      lines.splice(at, 0, ...block);
      return res(lines.join(nl), { changed: true, created: true, widened: wide });
    }
    if (!t) { // 섹션은 있는데 표가 없음: 섹션 글 끝(빈 줄 앞)에 머리·구분선·줄
      let at = sec.end; while (at > sec.start && lines[at - 1].trim() === '') at--;
      lines.splice(at, 0, rowText(head), sepText(head.length), ...segs.map((s) => rowText(segCells(s, wide))));
      return res(lines.join(nl), { changed: true, widened: wide });
    }
    const newRows = segs.map((s) => rowText(segCells(s, wide)));
    const oldRows = hit.map((r) => lines[r.line]);
    const widen = wide && t.head.length !== SLEEP_HEAD_WIDE.length;
    if (!widen && !dropRows.length && newRows.slice().sort().join('\n') === oldRows.slice().sort().join('\n')) return res(src, { changed: false });
    const desc = order(t.rows) === 'desc';
    if (desc) newRows.reverse(); // 최신 위 표면 새 줄도 최신 위
    let at;
    if (hit.length) at = Math.min(...hit.map((r) => r.line));
    else if (segs.length) {
      const dOf = (s) => Md.dateOf(fromMin(s.end).slice(0, 10)), lo = Math.min(...segs.map(dOf)), hi = Math.max(...segs.map(dOf));
      const r = t.rows.find((x) => { const d = Md.dateOf(x.cells[0]); return d != null && (desc ? d < lo : d > hi); });
      at = r ? r.line : t.endLine;
    } else at = t.endLine;
    const gone = hit.concat(dropRows).map((r) => r.line);
    at -= gone.filter((i) => i < at).length; // 지운 줄이 새 자리보다 위에 있으면 그만큼 당김
    gone.sort((x, y) => y - x).forEach((i) => lines.splice(i, 1));
    lines.splice(at, 0, ...newRows);
    if (widen) { lines[t.headLine] = rowText(SLEEP_HEAD_WIDE); if (t.sepLine != null) lines[t.sepLine] = sepText(SLEEP_HEAD_WIDE.length); }
    return res(lines.join(nl), { changed: true, widened: widen });
  }

  // 안전 검사 (메인이 쓰기 직전에, setSleepWindow 결과): 옛 글 -> 새 글이
  //   ## 수면 밖 한 글자도 같음 / 섹션 안 표 밖 글 같음 / 표 머리는 그대로 또는 4칸 -> 5칸(종류)만 /
  //   창에 안 걸친 옛 줄은 순서·글자 그대로 다 남음 / 새로 생긴 줄은 모두 올바른 구간 줄 /
  //   창 밖 잠(보통·선잠)은 지운 줄과 새 줄이 똑같음 (창 밖 기록을 바꾸지 않음)
  //   dropOpen (setSleepWindow와 같은 값): 창 안 "잔 시각만·깬 시각만" 줄 중 이 목록에 든 것은 지워져도 됨 (그 밖의 옛 줄은 다 남아야 함)
  function onlySleepWindowChanged(oldText, newText, from, hours, dropOpen) {
    try {
      const W = windowOf(from, hours, 24), S = SECTIONS.sleep, drop = cleanDrop(dropOpen);
      const a = String(oldText).split(/\r?\n/), b = String(newText).split(/\r?\n/);
      const sa = findSection(a, 'sleep'), sb = findSection(b, 'sleep');
      if (!sb) return false;
      const outA = sa ? a.slice(0, sa.line).concat(a.slice(sa.end)) : a, outB = b.slice(0, sb.line).concat(b.slice(sb.end));
      const endPad = !sa && sb.end === b.length && outB.length === outA.length + 1 && outB[outB.length - 1] === '' && outA.length && outA[outA.length - 1] !== '';
      if (outA.join('\n') !== (endPad ? outB.slice(0, -1) : outB).join('\n')) return false;
      const tb = tableOf(b, sb); if (!tb || !okHead('sleep', tb.head)) return false;
      const ta = sa ? tableOf(a, sa) : null; if (ta && !okHead('sleep', ta.head)) return false;
      if (ta && ta.head.length > tb.head.length) return false;
      const strip = (L, s0, t0) => L.slice(s0.line, t0 ? t0.headLine : s0.end).concat(t0 ? L.slice(t0.endLine, s0.end) : []);
      if (sa) {
        if (strip(a, sa, ta).join('\n') !== strip(b, sb, tb).join('\n')) return false;
        if (ta && ta.headLine - sa.line !== tb.headLine - sb.line) return false;
      } else {
        const next = Md.sections(b).find((s) => s.line === sb.end);
        if (!(sb.end === b.length || (next && next.name === BEFORE))) return false;
        if (b[sb.line] !== '## ' + S.name || tb.headLine !== sb.line + 1) return false;
        if (b.slice(tb.endLine, sb.end).some((l) => l.trim() !== '')) return false;
      }
      if (ta && tb.head.length === ta.head.length) { // 머리 그대로: 머리·구분선 두 줄 글자 그대로
        if (b[tb.headLine] !== a[ta.headLine] || (ta.sepLine == null ? tb.sepLine != null : b[tb.sepLine] !== a[ta.sepLine])) return false;
      } else if (b[tb.headLine] !== rowText(tb.head) || tb.sepLine !== tb.headLine + 1 || b[tb.sepLine] !== sepText(tb.head.length)) return false; // 새 표·넓힌 머리 = 정해진 모양
      const PA = parse(a), hitLines = new Set(PA.sleep.filter((r) => r.start != null && r.start < W.w1 && r.end > W.w0).map((r) => r.line));
      const dropLines = new Set(openRowsIn(PA, W).filter((x) => drop.includes(x.at)).map((x) => x.r.line));
      const rowsA = ta ? ta.rows : [], kept = rowsA.filter((r) => !hitLines.has(r.line) && !dropLines.has(r.line)).map((r) => a[r.line]);
      const removed = PA.sleep.filter((r) => hitLines.has(r.line));
      let k = 0; const added = [];
      tb.rows.forEach((r) => { if (k < kept.length && b[r.line] === kept[k]) k++; else added.push(cellsOf(b[r.line])); });
      if (k !== kept.length) return false;
      const addSegs = [];
      for (const c of added) {
        if (c.length !== tb.head.length || !isDate(c[0])) return false;
        if (c.length === SLEEP_HEAD_WIDE.length && !['', LIGHT].includes(c[4])) return false;
        if (len(c[3]) > MAX_LEN) return false;
        const s = segOf(c[0], c[1], c[2]); if (!s) return false;
        addSegs.push({ start: s.start, end: s.end, light: c[4] === LIGHT });
      }
      const outside = (list) => normalize(list.flatMap((s) => [s.start < W.w0 ? { start: s.start, end: Math.min(s.end, W.w0), light: s.light } : null, s.end > W.w1 ? { start: Math.max(s.start, W.w1), end: s.end, light: s.light } : null].filter(Boolean)))
        .map((s) => [s.start, s.end, s.light].join()).join('|');
      return outside(removed) === outside(addSegs);
    } catch (e) { return false; }
  }

  // ---- 안전 검사 (메인이 쓰기 직전에) ----
  // 옛 글 -> 새 글이 "kind 섹션 표 안에서 date 줄 하나 바꿈 / date 줄 하나 더함 / (표 없던 섹션에) 머리+구분선+줄 / (섹션 없던 파일에) 새 섹션 한 덩이"인지.
  // 섹션 밖은 한 글자도 다르면 안 됨. 바뀌거나 더해진 줄은 표 줄이고, 칸 수 = 머리 칸 수, 날짜 칸 = date
  function onlyLogChanged(oldText, newText, kind, date) {
    try {
      const S = SECTIONS[kind]; if (!S || !isDate(date)) return false;
      if (kind === 'meal') return ML().onlyMealChanged(oldText, newText, 'upsert', { dialog: true, date }); // 식사 일지 표 규칙 (js/meal_log.js)
      const a = String(oldText).split(/\r?\n/), b = String(newText).split(/\r?\n/);
      const sa = findSection(a, kind), sb = findSection(b, kind);
      // 옛 머리 표(한마디 2칸)를 새 머리로 바꾼 쓰기: 옛 글의 머리·구분선을 새 모양으로 바꿔 놓고 나머지를 같은 규칙으로 봄
      if (sa) { const ta0 = tableOf(a, sa); if (ta0 && isOldHead(kind, ta0.head)) { a[ta0.headLine] = rowText(S.head); if (ta0.sepLine != null) a[ta0.sepLine] = sepText(S.head.length); } }
      if (!sb) return false;
      const outA = sa ? a.slice(0, sa.line).concat(a.slice(sa.end)) : a, outB = b.slice(0, sb.line).concat(b.slice(sb.end));
      // 파일 끝에 새 섹션을 붙일 때 앞에 띄운 빈 줄 하나는 허용 (원래 끝 줄이 빈 줄이 아니었을 때)
      const endPad = !sa && sb.end === b.length && outB.length === outA.length + 1 && outB[outB.length - 1] === '' && outA.length && outA[outA.length - 1] !== '';
      if (outA.join('\n') !== (endPad ? outB.slice(0, -1) : outB).join('\n')) return false;
      const tb = tableOf(b, sb); if (!tb || !okHead(kind, tb.head)) return false;
      const okRow = (i) => tb.rows.some((r) => r.line === i) && cellsOf(b[i]).length === tb.head.length && cellsOf(b[i])[0] === date && !isSep(b[i]);
      const bodyA = sa ? a.slice(sa.line, sa.end) : [], bodyB = b.slice(sb.line, sb.end);
      if (!sa) { // 새 섹션: 정해진 모양 그대로 + 자리 = 버킷리스트 바로 앞 또는 파일 끝
        const next = Md.sections(b).find((s) => s.line === sb.end);
        if (!(sb.end === b.length || (next && next.name === BEFORE))) return false;
        const want = ['## ' + S.name, rowText(S.head), sepText(S.head.length)];
        if (bodyB.slice(0, 3).join('\n') !== want.join('\n')) return false;
        const rest = bodyB.slice(4); if (rest.some((l) => l.trim() !== '')) return false;
        return okRow(sb.line + 3);
      }
      if (bodyA[0] !== bodyB[0]) return false; // 제목 줄 그대로
      if (bodyA.length === bodyB.length) {
        const diff = bodyA.map((x, i) => (x === bodyB[i] ? -1 : i)).filter((i) => i >= 0);
        if (diff.length === 0) return true;
        if (diff.length !== 1) return false;
        const i = sb.line + diff[0], ta = tableOf(a, sa);
        if (!ta || !ta.rows.some((r) => r.line === sa.line + diff[0])) return false; // 옛 줄도 표 데이터 줄
        if (cellsOf(bodyA[diff[0]])[0] !== date) return false;                       // 옛 줄도 그날 줄
        if ((kind === 'meal' || kind === 'safety') && cellsOf(bodyA[diff[0]])[1] !== cellsOf(bodyB[diff[0]])[1]) return false; // 끼니·항목은 그대로
        return okRow(i);
      }
      const k = bodyB.length - bodyA.length;
      if (k !== 1 && k !== 3) return false;
      let p = 0; while (p < bodyA.length && bodyA[p] === bodyB[p]) p++;
      if (bodyA.slice(p).join('\n') !== bodyB.slice(p + k).join('\n')) return false;
      if (k === 1) return okRow(sb.line + p);
      // k = 3: 표가 없던 섹션에 머리+구분선+줄
      if (tableOf(a, sa)) return false;
      return b[sb.line + p] === rowText(S.head) && b[sb.line + p + 1] === sepText(S.head.length) && okRow(sb.line + p + 2);
    } catch (e) { return false; }
  }

  const LL = { SECTIONS, OLD_HEADS, MOODS, MEALS, MULTI_MEAL, MAX_LEN, ymd, logDay, clean, text, isTime, parseTimes, parseTime, fmtTime, parse, dayOf, byDate, setSleep, addMeal, setNote, onlyLogChanged, upsert,
    // 잠 구간 (2026-10-08): 칠하기 화면이 부르는 것
    SLEEP_HEAD_WIDE, LIGHT, SLEEP_GRID_HOUR, toMin, fromMin, mainSleep, sleepDay, sleepWindow, sleepGrid, setSleepWindow, onlySleepWindowChanged };
  root.PHLifeLog = LL;
  if (typeof module !== 'undefined' && module.exports) module.exports = LL;
})(typeof window !== 'undefined' ? window : globalThis);

};
RT.MODS["/app/js/meal_log.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 식사 일지 (2026-10-04 비트, logs 브랜치). 그림·파일 접근 없음: 글을 받아 새 글을 돌려준다. 공통 규칙은 js/log_table.js
// 생활 기록 파일 ## 식사 표 = 두부 대화창이 쓰던 표를 넓힘:
//   새 머리 | 날짜 | 시각 | 끼니 | 메뉴 | 만족도 | 양% | 메모 |   (옛 머리 | 날짜 | 끼니 | 내용 |)
//   옛 머리 표에 처음 쓸 때 머리·구분선 두 줄만 새 모양으로 바꾸고, 옛 줄(칸 3개)은 그대로 둠. 읽을 때 칸 3개 줄 = 옛 줄(끼니·내용 -> 끼니·메뉴)
//   만족도 = 1~5(비면 안 고름), 양% = 25·50·75·100(비면 안 고름), 메뉴·메모 = 안전 표시(js/log_table.js encode)
//   날짜 = 기록 날짜(하루 경계 6시), 시각 = HH:MM
// 쓰는 곳 둘
//   - 식사 일지 창(js/log_modal.js): addMeal2 / updateMeal / removeMeal (줄 고르기 key { sig } = 읽은 그 줄의 글)
//   - 두부 대화창(js/life_log.js addMeal -> dialogMeal): 아침·점심·저녁은 그날 그 끼니 마지막 줄의 메뉴만 고침(없으면 더함), 간식은 늘 더함 (전과 같은 규칙)
// 식사 일지 창으로 처음 더할 때 생활습관 표에 "| 식사 | 기록 | 식탁에서 기록 | - |" 한 줄 (없을 때만)
// 나중의 분석용: parse().rows -> byDate (날짜별, 기록한 순서) / entries
(function (root) {
  'use strict';
  const LT = root.PHLogTable || (typeof require !== 'undefined' ? require('./log_table.js') : null);

  const SEC = '식사';
  const HEAD = ['날짜', '시각', '끼니', '메뉴', '만족도', '양%', '메모'];
  const OLD_HEAD = ['날짜', '끼니', '내용'];
  const KINDS = ['아침', '점심', '저녁', '간식'];
  const MULTI = '간식';
  const AMOUNTS = [25, 50, 75, 100];
  const MENU_MAX = 100, MEMO_MAX = 1000; // 메뉴 100자 = 대화창 글 제한(life_log.js MAX_LEN)과 같게
  const HABIT = { name: '식사', target: '식탁에서 기록' };
  // 끼니 기본값 = 시각대 (시 기준, from 이상 to 미만). 그 밖은 간식
  const BANDS = [{ kind: '아침', from: 5, to: 11 }, { kind: '점심', from: 11, to: 16 }, { kind: '저녁', from: 17, to: 22 }];
  function kindAt(time) { const h = Number(String(time || '').slice(0, 2)); const b = BANDS.find((x) => h >= x.from && h < x.to); return b ? b.kind : MULTI; }

  // ---- 값 검사 ----
  function check(e) {
    if (!e || typeof e !== 'object') throw new Error('기록 형식 오류');
    if (!LT.isDate(e.date)) throw new Error('날짜 오류 (YYYY-MM-DD)');
    const time = e.time == null ? '' : e.time;
    if (time !== '' && !LT.isTime(time)) throw new Error('시각 오류 (HH:MM)');
    if (!KINDS.includes(e.kind)) throw new Error('끼니 오류');
    const menu = LT.oneline(e.menu, MENU_MAX, '메뉴');
    if (!menu) throw new Error('메뉴가 비었음');
    let rating = e.rating; if (rating === '' || rating == null) rating = null; else { rating = Number(rating); if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error('만족도 오류 (1~5)'); }
    let amount = e.amount; if (amount === '' || amount == null) amount = null; else { amount = Number(amount); if (!AMOUNTS.includes(amount)) throw new Error('먹은 양 오류'); }
    const memo = LT.multiline(e.memo, MEMO_MAX, '메모');
    return { date: e.date, time, kind: e.kind, menu, rating, amount, memo };
  }
  const cellsFor = (e) => [e.date, e.time, e.kind, LT.encode(e.menu), e.rating == null ? '' : String(e.rating), e.amount == null ? '' : String(e.amount), LT.encode(e.memo)];
  const keyOf = (c) => (c.length <= 3 ? (c[0] || '') + ' ' : (c[0] || '') + ' ' + (c[1] || ''));

  // ---- 읽기 ----
  // 줄 하나 -> { line, sig, date, time, kind, menu, rating, amount, memo, old }
  function rowOf(c, line, raw, oldTable) {
    const base = { line, sig: String(raw).trim() };
    if (oldTable || c.length <= 3) return Object.assign(base, { date: c[0] || '', time: '', kind: c[1] || '', menu: c[2] || '', rating: null, amount: null, memo: '', old: true });
    const r = /^[1-5]$/.test(c[4] || '') ? Number(c[4]) : null, a = AMOUNTS.includes(Number(c[5])) && /^\d+$/.test(c[5] || '') ? Number(c[5]) : null;
    return Object.assign(base, { date: c[0] || '', time: c[1] || '', kind: c[2] || '', menu: LT.decode(c[3] || ''), rating: r, amount: a, memo: LT.decode(c[6] || ''), old: false });
  }
  // 글 -> { rows: [...파일 순], hasSection, oldHead, error }
  function parse(src) {
    const lines = Array.isArray(src) ? src : LT.splitLines(src);
    let sec;
    try { sec = LT.findSection(lines, SEC); } catch (e) { return { rows: [], error: String(e.message) }; }
    const t = LT.tableOf(lines, sec); if (!t) return { rows: [], hasSection: !!sec };
    const oldHead = t.head.join('|') === OLD_HEAD.join('|');
    if (!oldHead && t.head.join('|') !== HEAD.join('|')) return { rows: [], hasSection: true, error: '## 식사 표 머리가 달라요' };
    return { rows: t.rows.map((r) => rowOf(r.cells, r.line, lines[r.line], oldHead)), hasSection: true, oldHead };
  }
  // 날짜별 { 'YYYY-MM-DD': [줄... 기록한 순서 = 파일 순] } (달력에 메뉴가 기록한 대로 쌓임)
  function byDate(rows) {
    const out = {};
    (rows || []).filter((r) => LT.isDate(r.date)).forEach((r) => { (out[r.date] = out[r.date] || []).push(r); });
    return out;
  }
  function entries(rows) { return (rows || []).filter((r) => LT.isDate(r.date)).map((r) => ({ date: r.date, time: r.time || null, kind: r.kind, menu: r.menu, rating: r.rating, amount: r.amount, hasMemo: !!r.memo, old: r.old })); }
  function summary(rows, today) {
    const ok = (rows || []).filter((r) => LT.isDate(r.date));
    const k = (r) => r.date + ' ' + (r.time || '00:00') + ' ' + String(r.line).padStart(6, '0');
    const last = ok.slice().sort((x, y) => (k(x) < k(y) ? -1 : 1)).pop() || null;
    return { today: ok.filter((r) => r.date === today).length, last };
  }

  // ---- 쓰기 ----
  const out = (src, lines, extra) => Object.assign({ text: lines.join(LT.nlOf(src)), changed: true }, extra);
  function table(lines) { return LT.prepare(lines, SEC, HEAD, [OLD_HEAD]); }
  function findRow(t, key) {
    const sig = key && typeof key.sig === 'string' ? key.sig.trim() : null;
    const hits = t && sig ? t.rows.filter((r) => r.cells.join('|') === LT.cells(sig).join('|')) : [];
    if (!hits.length) throw new Error('기록 없음 (파일이 바뀌었을 수 있음)');
    return hits[hits.length - 1];
  }
  function insertRow(lines, p, e) {
    const row = LT.rowText(cellsFor(e));
    if (!p) return { line: LT.placeSection(lines, SEC, HEAD, row), created: true, row };
    // 기록한 순서대로 쌓이게 표 끝에 (같은 날 메뉴 순서 = 적은 순서). 지난 날짜를 적으면 그 날짜 줄들 바로 뒤
    const later = p.t.rows.find((r) => LT.isDate(r.cells[0]) && r.cells[0] > e.date);
    const line = later ? later.line : p.t.endLine;
    lines.splice(line, 0, row); return { line, created: false, row };
  }
  function addMeal2(src, entry) {
    const e = check(entry), lines = LT.splitLines(src);
    const habitLine = LT.ensureHabit(lines, HABIT);
    const p = table(lines), r = insertRow(lines, p, e);
    return out(src, lines, { op: 'add', line: r.line, created: r.created, upgraded: !!(p && p.upgraded), habitAdded: habitLine >= 0, entry: e, after: r.row });
  }
  function current(lines, r) { return rowOf(r.cells, r.line, lines[r.line], false); }
  function updateMeal(src, key, patch) {
    const lines = LT.splitLines(src), p = table(lines); if (!p) throw new Error('## 식사 표 없음');
    const r = findRow(p.t, key), cur = current(lines, r);
    const next = check(Object.assign({ date: cur.date, time: cur.time, kind: cur.kind, menu: cur.menu, rating: cur.rating, amount: cur.amount, memo: cur.memo }, patch || {}));
    const after = LT.rowText(cellsFor(next));
    if (after === lines[r.line] && !p.upgraded) return { text: src, changed: false, op: 'update', line: r.line, entry: next };
    const before = lines[r.line]; lines[r.line] = after;
    return out(src, lines, { op: 'update', line: r.line, entry: next, before, after, upgraded: p.upgraded });
  }
  function removeMeal(src, key) {
    const lines = LT.splitLines(src), p = table(lines); if (!p) throw new Error('## 식사 표 없음');
    const r = findRow(p.t, key), removed = current(lines, r);
    lines.splice(r.line, 1);
    return out(src, lines, { op: 'remove', line: r.line, removed, before: removed.sig, upgraded: p.upgraded });
  }
  // 두부 대화창: { date, time('' 가능), kind, text(대화창이 다듬은 한 줄) }
  function dialogMeal(src, o) {
    if (!LT.isDate(o.date)) throw new Error('날짜 오류');
    if (!KINDS.includes(o.kind)) throw new Error('끼니 오류');
    const lines = LT.splitLines(src), p = table(lines);
    const hits = p && o.kind !== MULTI ? p.t.rows.filter((r) => { const x = current(lines, r); return x.date === o.date && x.kind === o.kind; }) : [];
    if (hits.length) { // 그 끼니 마지막 줄: 메뉴만 바꿈 (시각·만족도·양·메모는 그대로, 옛 줄은 새 모양으로)
      const r = hits[hits.length - 1], cur = current(lines, r);
      const next = check({ date: cur.date, time: cur.time, kind: cur.kind, menu: o.text, rating: cur.rating, amount: cur.amount, memo: cur.memo });
      const after = LT.rowText(cellsFor(next));
      if (after === lines[r.line] && !p.upgraded) return { text: src, changed: false, line: r.line };
      const before = lines[r.line]; lines[r.line] = after;
      return out(src, lines, { line: r.line, inserted: false, created: false, upgraded: p.upgraded, before, after });
    }
    const e = check({ date: o.date, time: o.time || '', kind: o.kind, menu: o.text, rating: null, amount: null, memo: '' });
    const r = insertRow(lines, p, e);
    return out(src, lines, { line: r.line, inserted: true, created: r.created, upgraded: !!(p && p.upgraded), before: null, after: r.row });
  }
  function rowOk(c) {
    if (!LT.isDate(c[0]) || !(c[1] === '' || LT.isTime(c[1])) || !KINDS.includes(c[2])) return false;
    const menu = LT.decode(c[3]); if (!menu.trim() || /\n/.test(menu) || LT.len(menu) > MENU_MAX || LT.encode(menu) !== c[3]) return false;
    if (c[4] !== '' && !/^[1-5]$/.test(c[4])) return false;
    if (c[5] !== '' && !AMOUNTS.map(String).includes(c[5])) return false;
    const m = LT.decode(c[6]); return LT.len(m) <= MEMO_MAX && LT.encode(m) === c[6];
  }
  // op: add / update / remove (식사 일지 창), upsert (대화창: 날짜 = 오늘, 끼니 그대로)
  function onlyMealChanged(oldText, newText, op, opt) {
    const o = opt || {};
    const kindOf = (c) => (c.length <= 3 ? c[1] : c[2]);
    return LT.checkChange(oldText, newText, { sec: SEC, head: HEAD, oldHeads: [OLD_HEAD], op, habit: o.dialog ? null : HABIT, rowOk, date: o.date || null,
      sameRow: o.dialog ? (a, b) => kindOf(a) === kindOf(b) && a[0] === b[0] : null });
  }

  const ML = { SEC, HEAD, OLD_HEAD, KINDS, MULTI, AMOUNTS, MENU_MAX, MEMO_MAX, HABIT, BANDS, kindAt, check, parse, byDate, entries, summary, addMeal2, updateMeal, removeMeal, dialogMeal, onlyMealChanged, rowOk };
  root.PHMealLog = ML;
  if (typeof module !== 'undefined' && module.exports) module.exports = ML;
})(typeof window !== 'undefined' ? window : globalThis);

};
RT.MODS["/app/js/log_table.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 일지 표 공통 (대변 관찰 일지 js/poop_log.js · 식사 일지 js/meal_log.js, 2026-10-04 비트, logs 브랜치). 그림·파일 접근 없음: 글을 받아 새 글을 돌려준다.
// Electron 메인(electron/logs_ipc.js), 화면, Node 시험(tests/test_logs.js)이 같이 쓴다.
// 하는 일
//   - 칸 글 안전 표시: & -> &amp;, < -> &lt;, | -> &#124;, 줄바꿈 -> <br>. 읽을 때 그대로 되돌림 (왕복해도 한 글자도 안 바뀜)
//     독서 표(js/book_write.js)의 \| 방식과 다르게 HTML 글자 표시를 쓴 이유: 파일 안에 맨 | 가 남지 않아서
//     칸을 단순히 | 로 나누는 다른 코드(js/life_md.js cells, 다른 브랜치의 표 읽기)도 칸 수를 틀리지 않음. 마크다운 보기에서도 | · 줄바꿈으로 보임
//   - 섹션·표 찾기, 새 섹션 자리(## 버킷리스트 바로 앞, 없으면 파일 끝), 생활습관 표에 "기록" 줄 하나 더하기(없을 때만)
//   - 안전 검사 checkChange: 그 섹션 표 안에서 정해진 만큼(더하기 1 / 고치기 1 / 빼기 1)만 바뀌었는지, 섹션 밖은 한 글자도 같은지
(function (root) {
  'use strict';
  const Md = root.PHLifeMd || (typeof require !== 'undefined' ? require('./life_md.js') : null);
  const BEFORE = '버킷리스트';
  const HABITS = '생활습관';
  const HABIT_HEAD = ['습관', '종류', '기준', '주기'];

  // ---- 칸 글 안전 표시 ----
  function encode(s) {
    return String(s == null ? '' : s).replace(/\r\n?/g, '\n').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\|/g, '&#124;').replace(/\n/g, '<br>');
  }
  function decode(s) {
    return String(s == null ? '' : s).replace(/<br\s*\/?>|&amp;|&lt;|&#124;/gi, (m) => (m[0] === '<' ? '\n' : m === '&amp;' ? '&' : m === '&lt;' ? '<' : '|'));
  }

  // ---- 값 ----
  const pad = (n) => String(n).padStart(2, '0');
  function isDate(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const [y, m, d] = s.split('-').map(Number), x = new Date(y, m - 1, d);
    return x.getFullYear() === y && x.getMonth() === m - 1 && x.getDate() === d;
  }
  const isTime = (s) => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
  const hm = (ms) => { const x = new Date(ms); return pad(x.getHours()) + ':' + pad(x.getMinutes()); };
  const len = (s) => Array.from(String(s)).length;
  // 여러 줄 글 (메모): 줄바꿈·탭은 살리고 다른 제어 문자는 뺌. 앞뒤 빈칸·빈 줄 정리 (칸 앞뒤 공백은 표에서 사라지므로)
  function multiline(s, max, what) {
    if (s != null && typeof s !== 'string') throw new Error((what || '글') + ' 형식 오류');
    const t = String(s == null ? '' : s).replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b-\u001f\u007f\u2028\u2029]/g, '').trim();
    if (len(t) > max) throw new Error((what || '글') + '이 너무 김 (' + max + '자까지)');
    return t;
  }
  // 한 줄 글 (메뉴 이름): 줄바꿈·제어 문자 -> 띄어쓰기, 겹친 공백 하나로
  function oneline(s, max, what) {
    if (s != null && typeof s !== 'string') throw new Error((what || '글') + ' 형식 오류');
    const t = String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (len(t) > max) throw new Error((what || '글') + '이 너무 김 (' + max + '자까지)');
    return t;
  }

  // ---- 표 ----
  const splitLines = (src) => String(src).split(/\r?\n/);
  const nlOf = (src) => (/\r\n/.test(src) ? '\r\n' : '\n');
  const cells = (l) => String(l).trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  const rowText = (c) => '| ' + c.join(' | ') + ' |';
  const sepText = (n) => '|' + Array(n).fill('---').join('|') + '|';
  const isRow = (l) => /^\s*\|/.test(l);
  const isSep = (l) => /^\s*\|?\s*:?-{3,}/.test(l);
  const same = (a, b) => a.join('|') === b.join('|');
  function findSection(lines, name) {
    const all = Md.sections(lines).filter((s) => s.name === name);
    if (all.length > 1) throw new Error('같은 섹션이 둘: ## ' + name);
    return all[0] || null;
  }
  // 섹션 안 첫 표 { headLine, head, sepLine, rows: [{ line, cells }], endLine } 또는 null
  function tableOf(lines, sec) {
    if (!sec) return null;
    let i = sec.start; while (i < sec.end && !isRow(lines[i])) i++;
    if (i >= sec.end) return null;
    const head = cells(lines[i]);
    let sep = i + 1; if (!(sep < sec.end && isSep(lines[sep]))) sep = null;
    let end = (sep == null ? i : sep) + 1;
    const rows = [];
    while (end < sec.end && isRow(lines[end])) { if (!isSep(lines[end])) rows.push({ line: end, cells: cells(lines[end]) }); end++; }
    return { headLine: i, head, sepLine: sep, rows, endLine: end };
  }
  // 새 섹션 한 덩이 넣기: ## 버킷리스트 바로 앞 (없으면 파일 끝, 빈 줄 하나 띄우고). -> 넣은 첫 데이터 줄 번호
  function placeSection(lines, name, head, row) {
    const block = ['## ' + name, rowText(head), sepText(head.length), row, ''];
    const bi = findSection(lines, BEFORE);
    let at;
    if (bi) at = bi.line;
    else { at = lines.length; while (at > 0 && lines[at - 1] === '') at--; block.unshift(''); block.pop(); }
    lines.splice(at, 0, ...block);
    return at + block.indexOf(row);
  }
  // 섹션 표 준비: 없으면 null(부른 쪽이 placeSection), 옛 머리면 머리·구분선만 새 모양으로(옛 줄은 그대로), 표가 없으면 머리·구분선을 넣음
  //   -> { sec, t, upgraded } / 머리가 다르면 오류
  function prepare(lines, name, head, oldHeads) {
    const sec = findSection(lines, name); if (!sec) return null;
    let t = tableOf(lines, sec), upgraded = false;
    if (!t) {
      let at = sec.end; while (at > sec.start && lines[at - 1].trim() === '') at--;
      lines.splice(at, 0, rowText(head), sepText(head.length));
      return { sec: findSection(lines, name), t: tableOf(lines, findSection(lines, name)), upgraded: false, madeTable: true };
    }
    if ((oldHeads || []).some((h) => same(h, t.head))) {
      lines[t.headLine] = rowText(head);
      if (t.sepLine != null) lines[t.sepLine] = sepText(head.length); else lines.splice(t.headLine + 1, 0, sepText(head.length));
      t = tableOf(lines, findSection(lines, name)); upgraded = true;
    }
    if (!same(t.head, head)) throw new Error('## ' + name + ' 표 머리가 달라서 멈춤');
    if (t.sepLine == null) { lines.splice(t.headLine + 1, 0, sepText(head.length)); t = tableOf(lines, findSection(lines, name)); }
    return { sec: findSection(lines, name), t, upgraded };
  }
  // 날짜·시각 순 자리: key(cells) 보다 큰 첫 줄 앞 (없으면 표 끝). 같은 값이면 뒤에
  function sortedAt(t, key, keyOf) {
    const hit = t.rows.find((r) => keyOf(r.cells) > key);
    return hit ? hit.line : t.endLine;
  }

  // ---- 생활습관 표 "기록" 줄 (없을 때만 표 끝에 한 줄) ----
  const habitRow = (h) => rowText([h.name, '기록', h.target, '-']);
  function habitsTable(lines) {
    const s = Md.sections(lines).filter((x) => x.name === HABITS); if (s.length !== 1) return null;
    const t = tableOf(lines, s[0]); return t && same(t.head, HABIT_HEAD) ? t : null;
  }
  function hasHabit(lines, name) { const t = habitsTable(lines); return !!t && t.rows.some((r) => r.cells[0] === name); }
  // -> 넣은 줄 번호 또는 -1 (표가 없거나 이미 있음)
  function ensureHabit(lines, h) {
    if (!h) return -1;
    const t = habitsTable(lines); if (!t || t.rows.some((r) => r.cells[0] === h.name)) return -1;
    lines.splice(t.endLine, 0, habitRow(h));
    return t.endLine;
  }

  // ---- 안전 검사 (메인이 쓰기 직전에) ----
  // spec = { sec, head, oldHeads, op: 'add' | 'update' | 'remove' | 'upsert'(더하기 또는 고치기), habit: { name, target } | null,
  //          rowOk(cells) -> bool (새로 생기거나 바뀐 줄), date: 'YYYY-MM-DD'(주면 바뀐 줄 날짜 칸이 이 값이어야 함),
  //          sameRow(oldCells, newCells) -> bool (고치기에서 옛 줄과 새 줄이 지켜야 할 것, 예: 끼니 그대로) }
  function checkChange(oldText, newText, spec) {
    try {
      const a = splitLines(oldText); let b = splitLines(newText);
      // 1) 생활습관 "기록" 줄: 옛 글에 없고 새 글 생활습관 표 끝에 정해진 모양 한 줄이면 빼고 봄 (더하기만)
      if (spec.habit && (spec.op === 'add' || spec.op === 'upsert') && !hasHabit(a, spec.habit.name)) {
        const tb = habitsTable(b), hits = tb ? tb.rows.filter((r) => r.cells[0] === spec.habit.name) : [];
        if (hits.length === 1 && b[hits[0].line] === habitRow(spec.habit) && hits[0].line === tb.endLine - 1) b = b.slice(0, hits[0].line).concat(b.slice(hits[0].line + 1));
      }
      const sa = findSection(a, spec.sec), sb = findSection(b, spec.sec); if (!sb) return false;
      // 2) 섹션 밖은 그대로 (새 섹션을 파일 끝에 붙일 때 띄운 빈 줄 하나만 허용)
      const outA = sa ? a.slice(0, sa.line).concat(a.slice(sa.end)) : a, outB = b.slice(0, sb.line).concat(b.slice(sb.end));
      const trimEnd = (arr) => { const c = arr.slice(); while (c.length && c[c.length - 1].trim() === '') c.pop(); return c; };
      const atEnd = !sa && sb.end === b.length; // 새 섹션을 파일 끝에 붙임: 끝의 빈 줄 수만 달라질 수 있음
      if ((atEnd ? trimEnd(outA) : outA).join('\n') !== (atEnd ? trimEnd(outB) : outB).join('\n')) return false;
      const tb = tableOf(b, sb); if (!tb || !same(tb.head, spec.head) || tb.sepLine == null) return false;
      const good = (line) => { const c = cells(line); return c.length === spec.head.length && rowText(c) === line.trim() && (!spec.date || c[0] === spec.date) && !!spec.rowOk(c); };
      const prose = (L, s, t) => trimEnd(L.slice(s.line, s.end).filter((l, i) => !(t && s.line + i >= t.headLine && s.line + i < t.endLine)));
      // 3) 새 섹션: 정해진 모양 그대로 + 자리 = 버킷리스트 바로 앞 또는 파일 끝
      if (!sa) {
        if (spec.op !== 'add' && spec.op !== 'upsert') return false;
        const next = Md.sections(b).find((s) => s.line === sb.end);
        if (!(sb.end === b.length || (next && next.name === BEFORE))) return false;
        if (prose(b, sb, tb).join('\n') !== '## ' + spec.sec || tb.rows.length !== 1) return false;
        return good(b[tb.rows[0].line]);
      }
      // 4) 섹션 안: 글줄 그대로, 표 머리 = 새 머리(옛 머리에서 바뀐 것은 허용), 데이터 줄은 op만큼
      if (prose(a, sa, tableOf(a, sa)).join('\n') !== prose(b, sb, tb).join('\n')) return false;
      const ta = tableOf(a, sa);
      if (ta && !same(ta.head, spec.head) && !(spec.oldHeads || []).some((h) => same(h, ta.head))) return false;
      const ra = ta ? ta.rows.map((r) => a[r.line]) : [], rb = tb.rows.map((r) => b[r.line]);
      const minus = (xs, i) => xs.slice(0, i).concat(xs.slice(i + 1));
      const eq = (x, y) => x.join('\n') === y.join('\n');
      const isAdd = () => { if (rb.length !== ra.length + 1) return false; for (let i = 0; i < rb.length; i++) if (eq(minus(rb, i), ra)) return good(rb[i]); return false; };
      const isUpdate = () => {
        if (rb.length !== ra.length) return false;
        const d = ra.map((x, i) => (x === rb[i] ? -1 : i)).filter((i) => i >= 0);
        if (d.length === 0) return true;
        if (d.length !== 1) return false;
        if (spec.date && cells(ra[d[0]])[0] !== spec.date) return false;
        if (spec.sameRow && !spec.sameRow(cells(ra[d[0]]), cells(rb[d[0]]))) return false;
        return good(rb[d[0]]);
      };
      const isRemove = () => { if (rb.length !== ra.length - 1) return false; for (let i = 0; i < ra.length; i++) if (eq(minus(ra, i), rb)) return true; return false; };
      if (spec.op === 'add') return isAdd();
      if (spec.op === 'update') return isUpdate();
      if (spec.op === 'remove') return isRemove();
      if (spec.op === 'upsert') return isAdd() || isUpdate();
      return false;
    } catch (e) { return false; }
  }

  const LT = { BEFORE, HABITS, encode, decode, isDate, isTime, hm, len, multiline, oneline, splitLines, nlOf, cells, rowText, sepText, findSection, tableOf, placeSection, prepare, sortedAt, habitRow, hasHabit, ensureHabit, checkChange, logDay: (ms, h) => Md.logDay(ms, h) };
  root.PHLogTable = LT;
  if (typeof module !== 'undefined' && module.exports) module.exports = LT;
})(typeof window !== 'undefined' ? window : globalThis);

};
RT.MODS["/app/js/habit_cycle.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 습관 주기 읽기·세기 (2026-10-04 비트, 습관 편집). 그림·파일 접근 없음. 메인·화면·Node 시험이 같이 쓴다.
//   주기 칸 글: "매일" (= 매일 1회) / "매일 3회" / "주 2회" / "월 4회" / "-" (기록 습관, 주기 없음)
//   체크 칸:
//     매일 1회     = 오늘 한 칸. 오늘 줄에 이름만 ("설거지"), 누르면 뒤집기 (주 N회와 같은 쓰기)
//     매일 n회(n>=2) = 오늘 n칸. 오늘 줄에 "습관 k/n" (물 6칸과 같은 방식)
//     주 n회       = 이번 주(월요일 시작) n칸, "이번 주 k/n". 하루에 한 번 = 한 칸
//     월 n회       = 이번 달 n칸, "이번 달 k/n". 하루에 한 번 = 한 칸
//   물(settings.WATER_HABIT)은 주기가 "매일"이어도 기준 칸 "6칸"으로 6칸 (지금 그대로)
(function (root) {
  'use strict';
  const Md = root.PHLifeMd || (typeof require !== 'undefined' ? require('./life_md.js') : null);
  const LC = root.PHLifeCheck || (typeof require !== 'undefined' ? require('./life_check.js') : null);

  const MAX = { day: 12, week: 7, month: 31 }; // n 상한 (매일 12칸, 주 7회, 월 31회)
  const PER_NAME = { day: '매일', week: '주', month: '월' };

  // "매일 3회" -> { per: 'day', n: 3 } / "주 2회" -> { per: 'week', n: 2 } / "월 4회" -> { per: 'month', n: 4 } / "매일" -> { per: 'day', n: 1 } / 그 밖 null
  function parseCycle(s) {
    const t = String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
    let m = /^매일(?:\s*(\d{1,2})\s*회)?$/.exec(t);
    if (m) { const n = m[1] ? Number(m[1]) : 1; return n >= 1 && n <= MAX.day ? { per: 'day', n } : null; }
    m = /^주\s*(\d{1,2})\s*회$/.exec(t);
    if (m) { const n = Number(m[1]); return n >= 1 && n <= MAX.week ? { per: 'week', n } : null; }
    m = /^월\s*(\d{1,2})\s*회$/.exec(t);
    if (m) { const n = Number(m[1]); return n >= 1 && n <= MAX.month ? { per: 'month', n } : null; }
    return null;
  }
  // { per, n } -> 주기 칸 글. 매일 1회는 지금 파일처럼 "매일"
  function formatCycle(per, n) {
    if (!MAX[per] || !Number.isInteger(n) || n < 1 || n > MAX[per]) throw new Error('주기 오류');
    if (per === 'day') return n === 1 ? '매일' : `매일 ${n}회`;
    return `${PER_NAME[per]} ${n}회`;
  }

  function monthStart(date) { return String(date).slice(0, 8) + '01'; }
  function nextMonth(date) { const d = new Date(Md.dateOf(monthStart(date))); d.setMonth(d.getMonth() + 1); return Md.ymd(d); }
  // 그 칸 항목이 "했음"인지: 이름이 같고, "습관 0/n"이 아님
  const did = (it, habit) => it.name === habit && !(it.of && it.value === 0);

  // [from, to) 안에서 이 습관을 한 날 수 + 오늘 했는지
  function daysIn(records, habit, from, to, today) {
    const a = Md.dateOf(from), b = Md.dateOf(to), t = Md.dateOf(today), days = new Set(); let todayDone = false;
    (records || []).forEach((r) => {
      const d = Md.dateOf(r.date); if (d == null || d < a || d >= b) return;
      if (!r.items.some((it) => did(it, habit))) return;
      days.add(d); if (d === t) todayDone = true;
    });
    return { count: days.size, todayDone };
  }
  // 이번 달 한 날 수 (기록 날짜 기준 달, 1일부터)
  function monthCount(records, habit, today) { return Object.assign(daysIn(records, habit, monthStart(today), nextMonth(today), today), { month: monthStart(today) }); }
  // 오늘 "습관 k/n"의 k (없으면 0)
  function todaySlots(records, habit, today) {
    const t = Md.dateOf(today); let v = 0;
    (records || []).forEach((r) => { if (Md.dateOf(r.date) !== t) return; r.items.forEach((it) => { if (it.name === habit && it.of) v = it.value; else if (it.name === habit && !it.of && it.value == null && !v) v = 1; }); });
    return v;
  }
  // 이 습관의 칸 상태 { per, n(칸 수), count(찬 칸 수, 넘칠 수 있음), todayDone, slots(true = "k/n" 칸) } / 칸 없는 주기면 null
  function countFor(records, row, today) {
    const cy = parseCycle(row && row.cycle); if (!cy) return null;
    if (cy.per === 'day' && cy.n > 1) { const k = todaySlots(records, row.name, today); return { per: 'day', n: cy.n, count: k, todayDone: k > 0, slots: true }; }
    if (cy.per === 'day') { const w = daysIn(records, row.name, today, Md.addDays(today, 1), today); return { per: 'day', n: 1, count: w.count, todayDone: w.todayDone, slots: false }; }
    const w = cy.per === 'week' ? LC.weekCount(records, row.name, today) : monthCount(records, row.name, today);
    return { per: cy.per, n: cy.n, count: w.count, todayDone: w.todayDone, slots: false };
  }
  // 오늘 이름을 더하고 빼는(뒤집기) 주기인지: 매일 1회 / 주 n회 / 월 n회
  function isToggle(cycle) { const cy = parseCycle(cycle); return !!cy && !(cy.per === 'day' && cy.n > 1); }
  // "k/n" 칸 주기인지: 매일 n회 (n >= 2)
  function slotsOf(cycle) { const cy = parseCycle(cycle); return cy && cy.per === 'day' && cy.n > 1 ? cy.n : 0; }
  // 칸 옆 글: "오늘 2/3" / "이번 주 1/2" / "이번 달 3/4" / "오늘"(매일 1회)
  function note(c) {
    if (!c) return '';
    if (c.per === 'day') return c.slots ? `오늘 ${c.count}/${c.n}` : (c.todayDone ? '오늘 했어요' : '오늘');
    return `${c.per === 'week' ? '이번 주' : '이번 달'} ${c.count}/${c.n}`;
  }

  const HC = { MAX, parseCycle, formatCycle, monthStart, monthCount, todaySlots, countFor, isToggle, slotsOf, note };
  root.PHHabitCycle = HC;
  if (typeof module !== 'undefined' && module.exports) module.exports = HC;
})(typeof window !== 'undefined' ? window : globalThis);

};
RT.MODS["/app/js/household.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 살림 계산 (인벤토리·사야 할 것·청소 습관). 그림·파일 접근 없음: 글(text)을 받아 새 글을 돌려준다.
// Electron 메인(electron/household_ipc.js)과 화면(inventory.js·fridge_memo.js·household_card.js), Node 시험(tests/test_household.js)이 같이 쓴다.
//   ## 살림 물건 | 분류 | 알약 | 이름 | 수량 | 필수 | 메모 |   (화장품 색 = 메모 "색 코랄")
//   ## 사야 할 것 | 이름 | 더한 날 | 출처 |                    (출처 = 자동 / 직접)
//   청소 습관 = ## 생활습관 표 종류 "살림" 줄 (처음 체크할 때 기본 다섯 줄을 표 끝에 더함), 체크 = 습관 기록 오늘 줄 (life_check.js toggleWeekly와 같음)
// 쓰기 원칙: 정해진 섹션 안 줄만 바꾸고(한 줄 고침·더함·뺌), 섹션이 없으면 ## 버킷리스트 앞에 새로 만듦. 다른 줄은 한 글자도 안 바뀐다.
//   기본 아이템은 파일에 섹션이 없을 때 화면에만 보이고, 처음 바꿀 때 섹션을 만들며 기본 줄 + 바뀐 값을 같이 씀.
//   생활필수품 수량이 0이면 사야 할 것에 "자동" 줄이 생기고, 1 이상이거나 필수가 풀리면 "자동" 줄만 빠짐 (직접 적은 줄은 안 건드림)
(function (root) {
  'use strict';
  const req = (n) => (typeof require !== 'undefined' ? require(n) : null);
  const Md = root.PHLifeMd || req('./life_md.js');
  const LC = root.PHLifeCheck || req('./life_check.js');
  const LW = root.PHLifeWrite || req('./life_write.js');
  const HC = root.PHHabitCycle || req('./habit_cycle.js');
  const H = root.PH_HOUSEHOLD || req('./data/household.js');

  const SEC = {
    items: { name: '살림 물건', head: ['분류', '알약', '이름', '수량', '필수', '메모'] },
    shop: { name: '사야 할 것', head: ['이름', '더한 날', '출처'] },
  };
  const BEFORE = '버킷리스트';
  const MAX_ROW_CHANGES = 4; // 한 번 쓰기에서 바뀌는 표 줄 수 상한 (섹션을 새로 만들 때는 기본 줄 수만큼)

  const catById = (id) => H.CATS.find((c) => c.id === id) || null;
  const catByName = (n) => H.CATS.find((c) => c.name === n) || null;
  const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
  const cellsOf = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  const isRow = (l) => /^\s*\|/.test(l);
  const isSep = (l) => /^\s*\|?\s*:?-{3,}/.test(l);
  const rowText = (cells) => '| ' + cells.join(' | ') + ' |';
  const sepText = (n) => '|' + Array(n).fill('---').join('|') + '|';
  const splitLines = (t) => String(t).split(/\r?\n/);
  const nlOf = (t) => (/\r\n/.test(t) ? '\r\n' : '\n');

  // ---- 이름 검사: 표를 깨는 글자(| 줄바꿈 탭 제어 문자)는 바꾸지 않고 막음. 앞뒤 공백·겹친 공백만 정리 ----
  function checkName(s) {
    if (typeof s !== 'string') throw new Error('이름 형식 오류');
    if (/[|｜\u0000-\u001f\u007f\u2028\u2029]/.test(s)) throw Object.assign(new Error('이름에 표 글자'), { code: 'badName' });
    const t = s.replace(/\s+/g, ' ').trim();
    if (!t) throw Object.assign(new Error('빈 이름'), { code: 'badName' });
    if (Array.from(t).length > H.MAX_NAME) throw Object.assign(new Error('이름이 너무 김'), { code: 'badName' });
    if (/^-{3,}$|^:?-+:?$/.test(t)) throw Object.assign(new Error('이름 모양 오류'), { code: 'badName' });
    return t;
  }

  // ---- 섹션·표 찾기 ----
  function findSec(lines, kind) {
    const all = Md.sections(lines).filter((s) => s.name === SEC[kind].name);
    if (all.length > 1) throw new Error('같은 섹션이 둘: ' + SEC[kind].name);
    return all[0] || null;
  }
  function tableOf(lines, sec) {
    const t = Md.table(lines, sec); if (!t) return null;
    let sep = t.line + 1; if (!(sep < sec.end && isSep(lines[sep]))) sep = null;
    let end = (sep == null ? t.line : sep) + 1;
    while (end < sec.end && isRow(lines[end])) end++;
    return { headLine: t.line, head: t.head, sepLine: sep, rows: t.rows.map((r) => ({ line: r.line, cells: r.raw })), endLine: end };
  }

  // ---- 읽기 ----
  function itemOf(cells, line) {
    const c = catByName(cells[0]); const q = Number(cells[3]);
    const memo = cells[5] || '';
    return { line, cat: c ? c.id : null, catName: cells[0], pill: cells[1] || '', name: cells[2] || '', qty: /^\d+$/.test(cells[3] || '') ? q : 0,
      need: (cells[4] || '') === H.ESSENTIAL_MARK, memo, color: colorOf(memo) };
  }
  function colorOf(memo) { const m = new RegExp('^' + H.COLOR_MEMO.trim() + '\\s*(\\S+)').exec(String(memo || '').trim()); return m ? m[1] : ''; }
  function defaultItems() {
    return H.DEFAULT_ITEMS.map(([cat, pill, name]) => ({ line: null, cat, catName: catById(cat).name, pill, name, qty: H.DEFAULT_QTY, need: H.DEFAULT_ESSENTIALS.includes(name), memo: '', color: '' }));
  }
  // 글 -> { items, itemsDefault(섹션 없음 = 기본값), shop, chores, choresDefault }
  function view(text, parsed) { // parsed = 이미 읽은 Md.parse(text) (화면이 다시 그릴 때 한 번 더 안 읽게)
    const lines = parsed && parsed.lines ? parsed.lines : splitLines(text);
    const out = { items: [], itemsDefault: false, shop: [], chores: [], choresDefault: false };
    const is = findSec(lines, 'items'), it = is && tableOf(lines, is);
    if (!is) { out.items = defaultItems(); out.itemsDefault = true; }
    else if (it) out.items = it.rows.map((r) => itemOf(r.cells, r.line)).filter((x) => x.cat && x.name);
    const ss = findSec(lines, 'shop'), st = ss && tableOf(lines, ss);
    if (st) out.shop = st.rows.map((r) => ({ line: r.line, name: r.cells[0] || '', date: r.cells[1] || '', src: r.cells[2] || '', auto: (r.cells[2] || '') === H.SHOP_SRC.auto })).filter((x) => x.name);
    const hab = (parsed || Md.parse(text)).habits, rows = hab ? hab.rows.filter((r) => r.kind === H.CHORE_KIND) : [];
    if (rows.length) out.chores = rows.map((r) => ({ name: r.name, cycle: r.cycle, target: r.target, line: r.line, key: (H.CHORES.find((c) => c.name === r.name) || {}).key || null }));
    else { out.chores = H.CHORES.map((c) => Object.assign({ line: null }, c)); out.choresDefault = true; }
    return out;
  }
  // 그 날(오늘) 기준 청소 습관 칸: 주 N회 = 이번 주 n/N, 매일 = 오늘 한 칸
  function choreState(text, today, parsed, v0) {
    const d = parsed || Md.parse(text), v = v0 || view(text, d), records = d.records || [];
    return v.chores.map((c) => {
      // 2026-10-04 습관 편집: 주기 = 매일 n회 / 주 n회 / 월 n회 (js/habit_cycle.js). 모르는 주기는 매일 1회처럼 (전과 같음)
      const k = HC.countFor(records, c, today) || HC.countFor(records, { name: c.name, cycle: '매일' }, today);
      return Object.assign({}, c, { daily: k.per === 'day', per: k.per, slots: k.slots, of: k.n, count: k.count, todayDone: k.todayDone });
    });
  }

  // ---- 섹션 만들기·줄 쓰기 ----
  function itemCells(i) { return [catById(i.cat).name, i.pill || '', i.name, String(i.qty), i.need ? H.ESSENTIAL_MARK : '', i.memo || '']; }
  // kind 섹션이 없으면 ## 버킷리스트 앞(없으면 파일 끝)에 머리 + rows. -> 새 lines (제자리)
  function ensureSec(lines, kind, rows) {
    if (findSec(lines, kind)) return false;
    const S = SEC[kind], block = ['## ' + S.name, rowText(S.head), sepText(S.head.length)].concat(rows.map(rowText), ['']);
    const bi = Md.sections(lines).find((s) => s.name === BEFORE);
    let at;
    if (bi) at = bi.line;
    else { at = lines.length; while (at > 0 && lines[at - 1] === '') at--; block.unshift(''); block.pop(); }
    lines.splice(at, 0, ...block);
    return true;
  }
  function itemsTable(lines) {
    const sec = findSec(lines, 'items'); if (!sec) return null;
    const t = tableOf(lines, sec);
    if (!t) { // 섹션만 있고 표가 없음: 섹션 글 끝에 머리·구분선
      let at = sec.end; while (at > sec.start && lines[at - 1].trim() === '') at--;
      lines.splice(at, 0, rowText(SEC.items.head), sepText(SEC.items.head.length));
      return itemsTable(lines);
    }
    if (t.head.join('|') !== SEC.items.head.join('|')) throw new Error('표 머리가 달라서 멈춤: ## ' + SEC.items.name);
    return t;
  }
  function shopTable(lines) {
    ensureSec(lines, 'shop', []);
    const sec = findSec(lines, 'shop'); let t = tableOf(lines, sec);
    if (!t) { let at = sec.end; while (at > sec.start && lines[at - 1].trim() === '') at--; lines.splice(at, 0, rowText(SEC.shop.head), sepText(SEC.shop.head.length)); t = tableOf(lines, findSec(lines, 'shop')); }
    if (t.head.join('|') !== SEC.shop.head.join('|')) throw new Error('표 머리가 달라서 멈춤: ## ' + SEC.shop.name);
    return t;
  }
  function findItem(t, cat, name) {
    const cn = catById(cat).name;
    return t.rows.find((r) => r.cells[0] === cn && r.cells[2] === name) || null;
  }
  // 필수품 0개 -> 자동 줄 / 아니면 자동 줄 빼기. -> 'added' | 'removed' | null
  //   이름이 같은 줄이 이미 있으면(직접 적은 것 포함) 자동 줄을 또 만들지 않음. 빼는 것은 "자동" 줄만
  function syncShop(lines, item, date) {
    const want = !!(item && item.need && item.qty === 0);
    const sec = findSec(lines, 'shop'), t = sec && tableOf(lines, sec);
    const same = t ? t.rows.filter((r) => r.cells[0] === item.name) : [];
    if (want) {
      if (same.length) return null;
      const st = shopTable(lines);
      lines.splice(st.endLine, 0, rowText([item.name, date, H.SHOP_SRC.auto]));
      return 'added';
    }
    const autos = same.filter((r) => r.cells[2] === H.SHOP_SRC.auto);
    if (!autos.length) return null;
    // 같은 이름 다른 분류에 필수품 0개가 또 있으면 남김
    autos.slice().reverse().forEach((r) => lines.splice(r.line, 1));
    return 'removed';
  }


  // 인벤토리 바꾸기. op = { type: 'qty'|'need'|'add'|'remove'|'restore'|'color', cat, name, ... }, date = 오늘(메인)
  //   -> { text, changed, item(바뀐 뒤 물건 또는 null), shop: 'added'|'removed'|null, created }
  function applyInv(text, op, date) {
    if (!op || typeof op !== 'object') throw new Error('요청 형식 오류');
    if (!isDate(date)) throw new Error('날짜 오류');
    const cat = catById(op.cat); if (!cat) throw new Error('분류 오류');
    const nl = nlOf(text), lines = splitLines(text);
    const created = ensureSec(lines, 'items', defaultItems().map(itemCells));
    let t = itemsTable(lines);
    const name = checkName(op.name);
    let hit = findItem(t, op.cat, name), item = hit ? itemOf(hit.cells, hit.line) : null;
    const put = (i) => { lines[hit.line] = rowText(itemCells(i)); };
    if (op.type === 'add' || op.type === 'restore') {
      if (hit) throw Object.assign(new Error('같은 이름이 있음'), { code: 'dupName' });
      const pill = String(op.pill || '');
      if (cat.pills.length ? !cat.pills.includes(pill) : pill !== '') throw new Error('알약 오류');
      const qty = op.type === 'restore' ? op.qty : H.DEFAULT_QTY;
      if (!Number.isInteger(qty) || qty < 0 || qty > H.MAX_QTY) throw new Error('수량 오류');
      const memo = op.type === 'restore' ? String(op.memo || '') : '';
      if (/[|\r\n]/.test(memo) || memo.length > 40) throw new Error('메모 오류');
      item = { cat: op.cat, catName: cat.name, pill, name, qty, need: op.type === 'restore' ? !!op.need : false, memo, color: colorOf(memo) };
      // 자리: 되돌리기 = 원래 다음 물건 앞(op.before), 아니면 같은 분류 끝, 없으면 표 끝
      const sameCat = t.rows.filter((r) => r.cells[0] === cat.name);
      const nextRow = op.type === 'restore' && op.before ? sameCat.find((r) => r.cells[2] === op.before) : null;
      const at = nextRow ? nextRow.line : sameCat.length ? sameCat[sameCat.length - 1].line + 1 : t.endLine;
      lines.splice(at, 0, rowText(itemCells(item)));
    } else {
      if (!hit) throw new Error('물건 없음: ' + name);
      if (op.type === 'qty') {
        if (!Number.isInteger(op.qty) || op.qty < 0 || op.qty > H.MAX_QTY) throw new Error('수량 오류');
        item.qty = op.qty; put(item);
      } else if (op.type === 'need') {
        if (typeof op.need !== 'boolean') throw new Error('필수 값 오류');
        item.need = op.need; put(item);
      } else if (op.type === 'color') {
        const kind = H.COLOR_ITEMS[name], list = kind ? H.COLORS[kind] : null;
        if (!list || !list.some((c) => c.name === op.color)) throw new Error('색 오류');
        item.memo = H.COLOR_MEMO + op.color; item.color = op.color; put(item);
      } else if (op.type === 'remove') {
        lines.splice(hit.line, 1);
        const left = { name, need: false, qty: 1 }; // 빠진 물건의 자동 줄도 뺌 (다른 분류에 같은 이름 필수 0개가 있으면 남김)
        const keep = itemsTable(lines).rows.some((r) => r.cells[2] === name && r.cells[4] === H.ESSENTIAL_MARK && r.cells[3] === '0');
        const shop = keep ? null : syncShop(lines, left, date);
        const out = lines.join(nl);
        return { text: out, changed: out !== text, item: null, removed: item, shop, created };
      } else throw new Error('모르는 바꾸기: ' + op.type);
    }
    // 같은 이름 다른 분류에 필수 0개가 있으면 자동 줄은 그대로
    const zeroElsewhere = itemsTable(lines).rows.some((r) => r.cells[2] === name && r.cells[0] !== cat.name && r.cells[4] === H.ESSENTIAL_MARK && r.cells[3] === '0');
    const shop = zeroElsewhere && !(item.need && item.qty === 0) ? null : syncShop(lines, item, date);
    const out = lines.join(nl);
    return { text: out, changed: out !== text, item, shop, created };
  }

  // 사야 할 것. op = { type: 'add', name } | { type: 'bought', name }
  //   bought: 인벤토리에 같은 이름이 있으면 그 물건 +1 (필수품 먼저, 섹션이 없으면 기본값으로 만들며) 그리고 줄을 뺌. 없으면 줄만 뺌
  function applyShop(text, op, date) {
    if (!op || typeof op !== 'object') throw new Error('요청 형식 오류');
    if (!isDate(date)) throw new Error('날짜 오류');
    const nl = nlOf(text), lines = splitLines(text), name = checkName(op.name);
    if (op.type === 'add') {
      const sec = findSec(lines, 'shop'), t = sec && tableOf(lines, sec);
      if (t && t.rows.some((r) => r.cells[0] === name)) throw Object.assign(new Error('같은 이름이 있음'), { code: 'dupName' });
      const st = shopTable(lines);
      lines.splice(st.endLine, 0, rowText([name, date, H.SHOP_SRC.manual]));
      const out = lines.join(nl);
      return { text: out, changed: true, name };
    }
    if (op.type !== 'bought') throw new Error('모르는 바꾸기: ' + op.type);
    const sec = findSec(lines, 'shop'), t = sec && tableOf(lines, sec), row = t && t.rows.find((r) => r.cells[0] === name);
    if (!row) throw new Error('사야 할 것에 없음: ' + name);
    lines.splice(row.line, 1);
    // 인벤토리 물건 (화면에 보이는 것과 같게: 섹션이 없으면 기본값)
    const v = view(text), match = v.items.filter((i) => i.name === name).sort((a, b) => (b.need ? 1 : 0) - (a.need ? 1 : 0))[0];
    let item = null, created = false;
    if (match) {
      created = ensureSec(lines, 'items', defaultItems().map(itemCells));
      const it = itemsTable(lines), hit = findItem(it, match.cat, name);
      item = itemOf(hit.cells, hit.line);
      item.qty = Math.min(H.MAX_QTY, item.qty + 1);
      lines[hit.line] = rowText(itemCells(item));
    }
    const out = lines.join(nl);
    return { text: out, changed: true, name, item, created };
  }

  // 청소 습관 기본 줄: ## 생활습관 표에 종류 "살림" 줄이 하나도 없으면 다섯 줄을 표 끝에 더함 (이름이 이미 있는 습관은 건너뜀)
  function ensureChores(text) {
    const nl = nlOf(text), lines = splitLines(text), d = Md.parse(text);
    if (!d.habits) throw new Error('## 생활습관 표 없음');
    if (d.habits.rows.some((r) => r.kind === H.CHORE_KIND)) return { text, changed: false };
    const sec = Md.sections(lines).find((s) => s.name === Md.NAMES.habits), t = Md.table(lines, sec);
    if (!t) throw new Error('## 생활습관 표 없음');
    let end = t.line + 1; while (end < sec.end && isRow(lines[end])) end++;
    const have = new Set(d.habits.rows.map((r) => r.name));
    const add = H.CHORES.filter((c) => !have.has(c.name)).map((c) => rowText([c.name, H.CHORE_KIND, c.target, c.cycle]));
    lines.splice(end, 0, ...add);
    return { text: lines.join(nl), changed: add.length > 0, added: add.length };
  }
  // 청소 습관 오늘 했음/안 했음 뒤집기 (주 N회·매일 모두 오늘 줄에 이름을 더하거나 뺌). -> { text, mid(기본 줄 더한 뒤), done, count, of, daily }
  function toggleChore(text, o) {
    const habit = String(o.habit || '');
    const base = ensureChores(text), d = Md.parse(base.text);
    const row = d.habits.rows.find((r) => r.name === habit && r.kind === H.CHORE_KIND);
    if (!row) throw new Error('살림 습관이 아님: ' + habit);
    if (HC.slotsOf(row.cycle)) throw new Error('매일 n회 살림은 칸 쓰기로: ' + habit); // "k/n" 칸 = ph:habitSetDaily
    const r = LC.toggleWeekly(base.text, { habit: row.name, date: o.date });
    const k = HC.countFor(Md.parse(r.text).records, row, o.date) || HC.countFor(Md.parse(r.text).records, { name: row.name, cycle: '매일' }, o.date);
    return Object.assign(r, { mid: base.text, choresAdded: base.changed, habit: row.name, done: r.done, daily: k.per === 'day', per: k.per, of: k.n, count: k.count, changed: r.changed || base.changed });
  }

  // ---- 안전 검사 (메인이 쓰기 직전에) ----
  // 옛 글 -> 새 글이 "## 살림 물건 / ## 사야 할 것 섹션 안 표 줄만 바뀜"인지. 섹션 밖은 한 글자도 같아야 함
  //   새로 생긴 섹션은 정해진 모양(제목·머리·구분선·줄·빈 줄)이고 자리는 ## 버킷리스트 바로 앞 또는 파일 끝
  //   바뀌거나 더해진 줄은 칸 수·값 검사(분류·알약·이름·수량·필수 / 이름·날짜·출처). 줄 수 변화는 MAX_ROW_CHANGES 이하(새 섹션은 기본 줄 수까지)
  function onlyHouseChanged(oldText, newText) {
    try {
      const a = splitLines(oldText), b = splitLines(newText);
      const cut = (lines) => {
        const keep = lines.slice(), secs = Md.sections(lines).filter((s) => s.name === SEC.items.name || s.name === SEC.shop.name);
        secs.slice().reverse().forEach((s) => keep.splice(s.line, s.end - s.line));
        return keep;
      };
      const ra = cut(a), rb = cut(b), trim = (x) => { const y = x.slice(); while (y.length && y[y.length - 1] === '') y.pop(); return y.join('\n'); };
      if (trim(ra) !== trim(rb)) return false; // 섹션 밖은 그대로 (파일 끝에 새 섹션을 붙일 때 띄운 빈 줄만 허용)
      for (const kind of ['items', 'shop']) {
        const sa = findSec(a, kind), sb = findSec(b, kind);
        if (!sb) { if (sa) return false; continue; }
        if (!sa) { // 새 섹션: 자리 + 모양
          const next = Md.sections(b).find((s) => s.line === sb.end);
          if (!(sb.end === b.length || (next && [BEFORE, SEC.items.name, SEC.shop.name].includes(next.name)))) return false;
          const body = b.slice(sb.line, sb.end);
          if (body[1] !== rowText(SEC[kind].head) || body[2] !== sepText(SEC[kind].head.length)) return false;
          let i = 3; while (i < body.length && isRow(body[i])) { if (!okRow(kind, cellsOf(body[i]))) return false; i++; }
          if (body.slice(i).some((l) => l.trim() !== '')) return false;
          const n = i - 3, limit = kind === 'items' ? H.DEFAULT_ITEMS.length + 1 : MAX_ROW_CHANGES;
          if (n > limit) return false;
          continue;
        }
        const ba = a.slice(sa.line, sa.end), bb = b.slice(sb.line, sb.end);
        if (ba[0] !== bb[0]) return false;
        // 표 아닌 글줄(설명)은 그대로
        const prose = (x) => x.slice(1).filter((l) => !isRow(l) && l.trim() !== '').join('\n');
        if (prose(ba) !== prose(bb)) return false;
        const ta = tableOf(a, sa), tb = tableOf(b, sb);
        if (!tb || tb.head.join('|') !== SEC[kind].head.join('|')) return false;
        if (ta && ta.head.join('|') !== tb.head.join('|')) return false;
        const rowsA = ta ? ta.rows.map((r) => a[r.line]) : [], rowsB = tb.rows.map((r) => b[r.line]);
        const left = rowsA.slice(); const added = [];
        rowsB.forEach((r) => { const i = left.indexOf(r); if (i >= 0) left.splice(i, 1); else added.push(r); });
        if (left.length + added.length > MAX_ROW_CHANGES) return false;
        if (added.some((r) => !okRow(kind, cellsOf(r)))) return false;
        // 표 밖 줄(빈 줄 등) 수는 그대로 (표 머리가 새로 생긴 경우만 2줄)
        const nonRow = (x) => x.filter((l) => !isRow(l)).length;
        if (nonRow(ba) !== nonRow(bb)) return false;
      }
      // 이름 겹침 없음 (물건 = 분류+이름, 사야 할 것 = 이름)
      const sb = findSec(b, 'items'), tb = sb && tableOf(b, sb);
      if (tb) { const k = tb.rows.map((r) => r.cells[0] + '|' + r.cells[2]); if (new Set(k).size !== k.length) return false; }
      const ss = findSec(b, 'shop'), ts = ss && tableOf(b, ss);
      if (ts) { const k = ts.rows.map((r) => r.cells[0]); if (new Set(k).size !== k.length) return false; }
      return true;
    } catch (e) { return false; }
  }
  function okRow(kind, c) {
    const nameOk = (s) => { try { return checkName(s) === s; } catch (e) { return false; } };
    if (kind === 'items') {
      if (c.length !== SEC.items.head.length) return false;
      const cat = catByName(c[0]); if (!cat) return false;
      if (cat.pills.length ? !cat.pills.includes(c[1]) : c[1] !== '') return false;
      if (!nameOk(c[2])) return false;
      if (!/^\d{1,3}$/.test(c[3]) || Number(c[3]) > H.MAX_QTY) return false;
      if (c[4] !== '' && c[4] !== H.ESSENTIAL_MARK) return false;
      return true;
    }
    if (c.length !== SEC.shop.head.length) return false;
    return nameOk(c[0]) && isDate(c[1]) && (c[2] === H.SHOP_SRC.auto || c[2] === H.SHOP_SRC.manual);
  }
  // ## 생활습관 표 끝에 "살림" 기본 줄만 더해졌는지 (청소 습관 처음 체크)
  function onlyChoreRowsAdded(oldText, newText) {
    try {
      const a = splitLines(oldText), b = splitLines(newText);
      if (a.join('\n') === b.join('\n')) return true;
      const k = b.length - a.length; if (k < 1 || k > H.CHORES.length) return false;
      const sec = Md.sections(a).find((s) => s.name === Md.NAMES.habits), t = Md.table(a, sec);
      let end = t.line + 1; while (end < sec.end && isRow(a[end])) end++;
      if (a.slice(0, end).join('\n') !== b.slice(0, end).join('\n') || a.slice(end).join('\n') !== b.slice(end + k).join('\n')) return false;
      if (Md.parse(oldText).habits.rows.some((r) => r.kind === H.CHORE_KIND)) return false;
      return b.slice(end, end + k).every((l) => { const c = cellsOf(l); return c.length === 4 && c[1] === H.CHORE_KIND && H.CHORES.some((x) => x.name === c[0] && x.cycle === c[3] && x.target === c[2]); });
    } catch (e) { return false; }
  }

  // 아이콘 그림 키 (무늬 item_<키>, 없으면 item_unknown)
  function iconKey(name) { return H.ICON_PREFIX + (H.ICONS[name] || H.UNKNOWN_ICON); }

  const HH = { SEC, MAX_ROW_CHANGES, catById, catByName, checkName, view, choreState, defaultItems, applyInv, applyShop, ensureChores, toggleChore, onlyHouseChanged, onlyChoreRowsAdded, okRow, iconKey, colorOf };
  root.PHHousehold = HH;
  if (typeof module !== 'undefined' && module.exports) module.exports = HH;
})(typeof window !== 'undefined' ? window : globalThis);

};
RT.MODS["/app/js/data/household.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 살림 (인벤토리·사야 할 것·청소 습관·냉장고 메모지) 설정 표 (2026-10-03 제작자 지시, 토리 기본값 = 기획/20261003_pixel-house_인벤토리_살림_v01.md)
//   파일에 들어가는 글자(분류·알약·출처·종류)는 여기서만 바꾼다. 계산은 js/household.js, 화면은 js/inventory.js·js/fridge_memo.js·js/household_card.js
(function (root) {
  'use strict';
  const H = {
    // 위쪽 큰 탭 4개 (제작자 2026-10-03: 큰 탭 "주방"을 없애고 생활용품 > 주방 알약으로 합침) (id = 화면·대사 키, name = 파일 "분류" 칸 글자). pills = 안쪽 알약 (파일 "알약" 칸). 알약 없는 탭은 알약 칸이 빈칸
    CATS: [
      { id: 'food', name: '식재료', pills: ['냉장고', '냉동실', '실온', '조미료'] }, // 조미료·약통 알약: 2026-10-04 제작자 물건 목록
      { id: 'living', name: '생활용품', pills: ['생활', '욕실', '주방', '청소', '약통'] },
      { id: 'cosmetic', name: '화장품', pills: [] },
      { id: 'misc', name: '잡화', pills: [] },
    ],
    // 비어 있으면 숨기는 알약 (없음. 생활용품 "주방"은 제작자 결정으로 퐁퐁·고무장갑·수세미가 들어감)
    HIDE_EMPTY_PILLS: {},
    // 가구 -> 처음 열리는 탭. part = 그림 안 일부만 누르는 곳 (y0 = 그림 높이에 대한 비율, 그 아래 전부). 세트마다 그림 크기가 달라 비율로
    //   거울(mirror_oval): 위쪽 거울 = 옷장 창(그대로), 하단 서랍(28/46 줄부터) = 화장품
    //   TV장(tv_cabinet): 위쪽 TV = 켜기·끄기(그대로), 아래 장(22/42) = 잡화
    //   거실 수납선반(shelf_unit): 위 선반 = 흔들림(그대로), 하단장(33/56) = 생활용품
    //   주방장(kitchen_cabinet): 전체 = 생활용품 탭의 주방 알약 (위 정수기는 따로 놓인 물건이라 그대로 물 창)
    //   냉장고(fridge): 메모지 창이 먼저 (js/fridge_memo.js), 그 안 "냉장고 열기" = 식재료
    FURNITURE: {
      shelf_unit: { cat: 'living', part: { y0: 33 / 56 } },
      tv_cabinet: { cat: 'misc', part: { y0: 22 / 42 } },
      mirror_oval: { cat: 'cosmetic', part: { y0: 28 / 46 } },
      kitchen_cabinet: { cat: 'living', pill: '주방' },
      fridge: { cat: 'food', memo: true },
    },
    // 기본 아이템 (제작자 원문 목록 전부, 수량 1). 파일에 ## 살림 물건이 없으면 화면에만 이것을 보여 주고, 처음 바꿀 때 섹션을 만들며 씀
    DEFAULT_ITEMS: [
      ['food', '냉장고', '달걀'], ['food', '냉장고', '김치'], ['food', '실온', '햇반'], ['food', '냉동실', '버터'], ['food', '냉동실', '명란'],
      ['living', '생활', '화장지'], ['living', '생활', '탈취제'], ['living', '생활', '세제'], ['living', '생활', '섬유유연제'],
      ['living', '욕실', '샴푸'], ['living', '욕실', '린스'], ['living', '욕실', '바디워시'], ['living', '욕실', '핸드워시'], ['living', '욕실', '가그린'], ['living', '욕실', '칫솔'], ['living', '욕실', '치약'],
      ['living', '청소', '정전기 청소포'], ['living', '청소', '물티슈 청소포'],
      ['living', '주방', '퐁퐁'], ['living', '주방', '고무장갑'], ['living', '주방', '수세미'],
      ['cosmetic', '', '립스틱'], ['cosmetic', '', '볼터치'],
      ['misc', '', '가위'], ['misc', '', '테이프'], ['misc', '', 'A4 용지 묶음'],
    ],
    DEFAULT_QTY: 1,
    // 생활필수품 기본 (토리 기본값, 제작자이 바꿀 수 있음)
    DEFAULT_ESSENTIALS: ['화장지', '세제', '샴푸', '치약', '칫솔', '퐁퐁', '햇반', '달걀'],
    ESSENTIAL_MARK: '예',   // 파일 "필수" 칸 글자 (아니면 빈칸)
    SHOP_SRC: { auto: '자동', manual: '직접' }, // 파일 "출처" 칸
    MAX_QTY: 999, MAX_NAME: 30,
    // 화장품 색 칩 = 무늬 item_lipstick·item_blush의 swap 6색 (X = 본색, 9 = 그늘). 두 물건이 같은 6색을 씀. 메모 칸에 "색 코랄"로 적음, 얼굴 반영은 나중
    //   메모가 비어 있으면 기본색(립스틱 코랄, 볼터치 피치)을 지금 색으로 보여 줌 (파일에는 안 씀)
    COLOR_ITEMS: { 립스틱: 'lip', 볼터치: 'blush' },
    SWAP: [
      { name: '코랄', X: '#E8806A', 9: '#B8604F' }, { name: '로즈', X: '#D6687E', 9: '#A84E62' }, { name: '누드', X: '#C9927C', 9: '#9B6E5D' },
      { name: '레드', X: '#C93B3F', 9: '#982B30' }, { name: '피치', X: '#F2A585', 9: '#C27F66' }, { name: '베리', X: '#A04A6B', 9: '#783751' },
    ],
    COLOR_DEFAULT: { lip: '코랄', blush: '피치' },
    COLOR_MEMO: '색 ', // 메모 칸 "색 코랄"
    // 청소 습관 (## 생활습관 표, 종류 "살림"). 파일에 살림 줄이 하나도 없으면 화면에만 이것을 보여 주고, 처음 체크할 때 다섯 줄을 표 끝에 더함
    //   key = 부기 대사 chore.done.<key> (토리 결정 2026-10-03)
    CHORE_KIND: '살림',
    CHORES: [
      { name: '청소기', key: 'vacuum', target: '-', cycle: '주 2회' },
      { name: '화장실 청소', key: 'bathroom', target: '-', cycle: '주 1회' },
      { name: '빨래', key: 'laundry', target: '-', cycle: '주 2회' },
      { name: '설거지', key: 'dishes', target: '-', cycle: '매일' },
      { name: '분리수거', key: 'recycle', target: '-', cycle: '주 1회' },
    ],
    // 아이템 아이콘: 이름 -> 무늬 그림 키 (디자인/에셋/20261003_pixel-house_item_<키>_v01.json, sync로 묶이면 바로 씀).
    //   2026-10-03 무늬 item_*_v01 파일 이름에 맞춤 (대응표 문서가 오기 전, 이름으로 맞춤. 대응표가 오면 다시 확인). 그림이 없으면 "알 수 없는 물건"(item_unknown, 그것도 없으면 화면 임시 그림)
    ICONS: {
      달걀: 'egg', 김치: 'kimchi', 햇반: 'rice', 버터: 'butter', 명란: 'myeongran',
      화장지: 'toilet_paper', 탈취제: 'deodorizer', 세제: 'detergent', 섬유유연제: 'softener',
      샴푸: 'shampoo', 린스: 'conditioner', 바디워시: 'bodywash', 핸드워시: 'handwash', 가그린: 'mouthwash', 칫솔: 'toothbrush', 치약: 'toothpaste',
      '정전기 청소포': 'dry_wipe', '물티슈 청소포': 'wet_wipe',
      퐁퐁: 'dish_soap', 고무장갑: 'rubber_gloves', 수세미: 'sponge',
      립스틱: 'lipstick', 볼터치: 'blush',
      가위: 'scissors', 테이프: 'tape', 'A4 용지 묶음': 'a4_paper',
      // 2026-10-04 제작자 물건 목록 84개 (크린백 = 롤 위생백, 지퍼백 따로: 제작자 결정. 대응표 = 기획/20261004_pixel-house_인벤토리아이콘_추가목록_v01.md, 무늬 item_*_v01)
      // 식재료: 실온 / 냉장고 / 조미료 / 냉동실
      생수: 'water_bottle', 컵라면: 'cup_ramen', 김: 'gim', 김가루: 'gim_flakes', 커피: 'coffee', 그래놀라: 'granola', '단백질 쉐이크': 'protein_shake',
      우유: 'milk', 미역: 'seaweed', 마요네즈: 'mayonnaise', 케챱: 'ketchup', 파슬리: 'parsley', 치즈: 'cheese', 두부: 'tofu', 맥주: 'beer', 소주: 'soju', 다진마늘: 'minced_garlic', 꿀: 'honey',
      양조간장: 'soy_brewed', 진간장: 'soy_dark', 국간장: 'soy_soup', 쯔유: 'tsuyu', 참기름: 'sesame_oil', 들기름: 'perilla_oil', 식초: 'vinegar', 사과식초: 'apple_vinegar',
      굴소스: 'oyster_sauce', 치킨스톡: 'chicken_stock', 코인육수: 'broth_coin', 알룰로오스: 'allulose', 설탕: 'sugar', 소금: 'salt', 핑크솔트: 'pink_salt', 후추: 'pepper',
      통아이스크림: 'ice_cream_tub', 하드: 'ice_bar', 쮸쮸바: 'tube_ice', 닭가슴살: 'chicken_breast', 만두: 'dumpling',
      // 생활용품: 생활 / 욕실 / 주방 / 청소 / 약통
      모기퇴치제: 'mosquito_repellent', 물티슈: 'wet_tissue', '소독 스프레이': 'sanitizer_spray', 마스크: 'mask', 수건: 'towel',
      '생리대(대형)': 'pad_large', '생리대(소형)': 'pad_small', '생리대(중형)': 'pad_medium', '초파리 퇴치제': 'fruitfly_trap', '브리타 필터': 'water_filter', 키친타올: 'kitchen_towel', 쓰레기봉투: 'trash_bag',
      비누: 'soap', 폼클랜징: 'foam_cleanser',
      크린백: 'roll_bag', 지퍼백: 'zip_bag', 비닐장갑: 'vinyl_gloves', '음식물쓰레기 봉투': 'food_waste_bag', 베이킹소다: 'baking_soda', 과탄산소다: 'oxygen_bleach',
      글라스클리너: 'glass_cleaner',
      소화제: 'digestive', 밴드: 'bandage', '오메가-3': 'omega3', '비타민-c': 'vitamin_c', '비타민-d': 'vitamin_d', 칼슘마그네슘: 'calcium_magnesium', 히알루론산: 'hyaluronic',
      // 화장품 (알약 없음, 색 바꾸기 없음)
      스킨: 'toner', 앰플: 'ampoule', 로션: 'lotion', 크림: 'cream', 아이라이너: 'eyeliner', 뷰러: 'eyelash_curler', 팩트: 'compact', 파운데이션: 'foundation',
      프라이머: 'primer', 아이쉐도우: 'eyeshadow', 아이브로우: 'eyebrow', 쉐딩: 'contour', 하이라이터: 'highlighter', 브러쉬: 'brush', 마스카라: 'mascara', 클렌징워터: 'cleansing_water', 클렌징오일: 'cleansing_oil',
    },
    ICON_PREFIX: 'item_', UNKNOWN_ICON: 'unknown',
  };
  H.COLORS = { lip: H.SWAP.map((c) => ({ name: c.name, hex: c.X })), blush: H.SWAP.map((c) => ({ name: c.name, hex: c.X })) };
  root.PH_HOUSEHOLD = H;
  if (typeof module !== 'undefined' && module.exports) module.exports = H;
})(typeof window !== 'undefined' ? window : globalThis);

};
RT.MODS["/app/js/study_write.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 공부 간트 쓰기 (2026-10-03 비트 B, study 브랜치). 그림·파일 접근 없음: 글(text)을 받아 새 글을 돌려준다.
// Electron 메인(electron/study_ipc.js), 화면(js/study_gantt.js: 미리 보기·검사), Node 시험(tests/test_study.js)이 같이 쓴다.
// 바꾸는 곳은 셋뿐: ## 공부 표, ## 공부 보관 표(없으면 ## 공부 바로 뒤에 만듦), ## 습관 기록 표의 오늘 줄.
// 이름 바꾸기만 ## 습관 기록 지난 줄의 그 공부 항목 이름도 같이 바꿈 (2026-10-04 제작자 결정, js/record_rename.js).
// 원칙은 물컵·대화창과 같다: 그 줄만 바꾸거나 한 줄 더하거나 한 줄 옮김. 다른 줄은 한 글자도 안 바뀐다.
// 메인은 쓰기 직전에 onlyStudyChanged / onlyStudyLogChanged로 다시 확인한다.
(function (root) {
  'use strict';
  const Md = root.PHLifeMd || (typeof require !== 'undefined' ? require('./life_md.js') : null);
  const RR = () => root.PHRecordRename || (typeof require !== 'undefined' ? require('./record_rename.js') : null); // 이름 바꾸기 때 지난 기록 이름도 (2026-10-04)

  const STUDY = '공부';
  const ARCHIVE = '공부 보관';
  const RECORDS = '습관 기록';
  const HEAD = ['공부', '시작', '끝', '메모'];
  const ARCHIVE_HEAD = ['공부', '시작', '끝', '메모', '보관한 날'];
  const NAME_MAX = 30, MEMO_MAX = 100, HOURS_MAX = 24;
  const UNIT = '시간'; // 습관 기록에 "깃허브 1시간"

  const pad = (n) => String(n).padStart(2, '0');
  function ymd(d) { const x = new Date(d); return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`; }
  // 기록 날짜: 하루의 경계 = startHour시 (settings.DAY_START_HOUR, 기본 6). 01~06시는 전날. life_log.js logDay와 같은 식
  function logDay(ms, startHour) { const h = Number.isFinite(startHour) ? startHour : 6; return ymd(ms - h * 3600000); }
  // 'YYYY-MM-DD'이면서 실제로 있는 날짜 (2026-02-30 같은 것은 거름)
  function isDate(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const [y, m, d] = s.split('-').map(Number), x = new Date(y, m - 1, d);
    return x.getFullYear() === y && x.getMonth() === m - 1 && x.getDate() === d;
  }
  // 날짜 더하기 (하루 단위, 기기 시간대. 서머타임에도 안전하게 정오 기준)
  function addDays(s, n) { const [y, m, d] = s.split('-').map(Number); return ymd(new Date(y, m - 1, d + n, 12)); }
  function diffDays(a, b) { const t = (s) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); }; return Math.round((t(b) - t(a)) / 86400000); }

  // ---- 값 다듬기·검사 ----
  // 메모: 표를 깨는 글자만 바꿈 (| -> ｜, 줄바꿈·제어 문자 -> 띄어쓰기)
  function clean(s) { return String(s == null ? '' : s).replace(/\|/g, '｜').replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  const len = (s) => Array.from(s).length;
  // 이름: 습관 기록 칸에 "이름 1시간"으로 들어가므로 쉼표·빗금도 막음. 바꾸지 않고 오류 (이름이 몰래 바뀌면 안 되니까)
  const NAME_BAD = /[|,，/\\`*#\[\]<>]/;
  function checkName(s) {
    if (typeof s !== 'string') throw new Error('이름 형식 오류');
    const t = s.replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!t) throw new Error('이름이 비었음');
    if (NAME_BAD.test(t)) throw new Error('이름에 쓸 수 없는 글자 (| , / \\ ` * # [ ] < >)');
    if (/^\d/.test(t)) throw new Error('이름은 숫자로 시작할 수 없음');
    if (len(t) > NAME_MAX) throw new Error('이름이 너무 김 (' + NAME_MAX + '자까지)');
    return t;
  }
  function checkMemo(s) {
    if (s != null && typeof s !== 'string') throw new Error('메모 형식 오류');
    const t = clean(s); if (len(t) > MEMO_MAX) throw new Error('메모가 너무 김 (' + MEMO_MAX + '자까지)');
    return t;
  }
  // 한 줄이 올바른지: 시작 = 날짜, 끝 = 비었거나 시작 이후 날짜
  function validDates(start, end) { return isDate(start) && (end === '' || (isDate(end) && end >= start)); }

  // ---- 읽기 ----
  const cellsOf = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  const isRow = (l) => /^\s*\|/.test(l);
  const isSep = (l) => /^\s*\|?\s*:?-{3,}/.test(l);
  const rowText = (cells) => '| ' + cells.join(' | ') + ' |';
  const sepText = (n) => '|' + Array(n).fill('---').join('|') + '|';
  function splitLines(src) { return String(src).split(/\r?\n/); }
  function findSection(lines, name) {
    const all = Md.sections(lines).filter((s) => s.name === name);
    if (all.length > 1) throw new Error('같은 섹션이 둘: ## ' + name);
    return all[0] || null;
  }
  // 섹션 안 첫 표: { headLine, head, sepLine, rows: [{ line, cells }], endLine(표 다음 줄) } 또는 null
  function tableOf(lines, sec) {
    if (!sec) return null;
    const t = Md.table(lines, sec); if (!t) return null;
    let sep = t.line + 1; if (!(sep < sec.end && isSep(lines[sep]))) sep = null;
    let end = (sep == null ? t.line : sep) + 1;
    while (end < sec.end && isRow(lines[end])) end++;
    return { headLine: t.line, head: t.head, sepLine: sep, rows: t.rows.map((r) => ({ line: r.line, cells: r.raw })), endLine: end };
  }
  const obj = (c) => ({ name: c[0] || '', start: c[1] || '', end: c[2] || '', memo: c[3] || '', archived: c[4] || '' });
  // 글 -> { study: [{ line, name, start, end, memo }], archive: [... archived] }
  function parse(src) {
    const lines = Array.isArray(src) ? src : splitLines(src);
    const t = tableOf(lines, findSection(lines, STUDY)), a = tableOf(lines, findSection(lines, ARCHIVE));
    return { study: t ? t.rows.map((r) => Object.assign({ line: r.line }, obj(r.cells))) : [], archive: a ? a.rows.map((r) => Object.assign({ line: r.line }, obj(r.cells))) : [] };
  }
  // 습관 기록에서 공부 시간: { 'YYYY-MM-DD': 시간 } (그 공부 이름 항목만, 0보다 클 때)
  function loggedDays(records, name) {
    const out = {};
    (records || []).forEach((r) => (r.items || []).forEach((it) => {
      if (it.name === name && it.value > 0 && (!it.unit || it.unit === UNIT)) { const d = Md.dateOf(r.date); if (d != null) { const k = ymd(d); out[k] = (out[k] || 0) + it.value; } }
    }));
    return out;
  }

  // ---- 쓰기: ## 공부 / ## 공부 보관 ----
  function studyTable(lines) {
    const sec = findSection(lines, STUDY); if (!sec) throw new Error('## 공부 섹션 없음');
    const t = tableOf(lines, sec); if (!t) throw new Error('## 공부 표 없음');
    if (t.head.join('|') !== HEAD.join('|')) throw new Error('## 공부 표 머리가 달라서 멈춤');
    return { sec, t };
  }
  function findRow(t, name, what) {
    const hits = t.rows.filter((r) => r.cells[0] === name);
    if (!hits.length) throw new Error((what || '공부') + ' 없음: ' + name);
    if (hits.length > 1) throw new Error('같은 이름이 둘이라 멈춤: ' + name);
    return hits[0];
  }
  // 생활습관 습관 이름과 같으면 기록이 헷갈림 (예: 독서)
  function habitNames(src) { try { const d = Md.parse(src); return d.habits ? d.habits.rows.map((r) => r.name) : []; } catch (e) { return []; } }
  function nameFree(src, lines, t, name, except) {
    if (t.rows.some((r) => r.cells[0] === name && r.cells[0] !== except)) throw new Error('같은 이름의 공부가 이미 있음: ' + name);
    if (habitNames(src).includes(name)) throw new Error('생활습관 이름과 같아서 안 됨: ' + name);
  }
  const out = (src, lines, extra) => Object.assign({ text: lines.join(/\r\n/.test(src) ? '\r\n' : '\n'), changed: true }, extra);

  // 더하기: 표 끝에 | 이름 | 시작 | (빈칸) | 메모 |
  function addStudy(src, o) {
    o = o || {};
    const lines = splitLines(src), { t } = studyTable(lines);
    const name = checkName(o.name), memo = checkMemo(o.memo), start = o.start;
    if (!isDate(start)) throw new Error('시작 날짜 오류 (YYYY-MM-DD)');
    const end = o.end == null ? '' : o.end;
    if (end !== '' && !validDates(start, end)) throw new Error('끝 날짜 오류');
    nameFree(src, lines, t, name);
    // 지난 기록에만 남은 이름으로 새로 더하기도 막음 (제작자 결정 2026-10-04, 습관과 같은 규칙)
    if (RR() && RR().usedInRecords(src, name)) throw RR().usedErr(src, name, 'study');
    const row = rowText([name, start, end, memo]);
    lines.splice(t.endLine, 0, row);
    return out(src, lines, { op: 'add', line: t.endLine, name, after: row });
  }
  // 고치기: patch = { start, end, memo, newName } (없는 값 = 그대로, end '' = 진행 중으로)
  function updateStudy(src, name, patch) {
    const p = patch || {};
    const lines = splitLines(src), { t } = studyTable(lines), row = findRow(t, name);
    const c = row.cells.slice(0, 4); while (c.length < 4) c.push('');
    const next = c.slice();
    if (p.newName != null) { next[0] = checkName(p.newName); if (next[0] !== c[0]) nameFree(src, lines, t, next[0], c[0]); }
    if (p.start != null) { if (!isDate(p.start)) throw new Error('시작 날짜 오류 (YYYY-MM-DD)'); next[1] = p.start; }
    if (p.end != null) { if (p.end !== '' && !isDate(p.end)) throw new Error('끝 날짜 오류 (YYYY-MM-DD)'); next[2] = p.end; }
    if (p.memo != null) next[3] = checkMemo(p.memo);
    if (!validDates(next[1], next[2])) throw new Error('날짜 순서 오류 (시작 <= 끝)');
    const after = rowText(next);
    if (next.join('|') === c.join('|') && row.cells.length === 4) return { text: src, changed: false, op: 'update', line: row.line, name: next[0] };
    const renamed = next[0] !== c[0];
    // 지난 기록에만 남은 이름(지운 공부·습관의 옛 기록)으로는 안 바꿈: 섞이면 되돌릴 수 없어서
    if (renamed && RR().usedInRecords(src, next[0])) throw RR().usedErr(src, next[0], 'study');
    const before = lines[row.line]; lines[row.line] = after;
    // 1단계 = ## 공부 표 한 줄(mid), 2단계 = ## 습관 기록의 "옛 이름 n시간" -> "새 이름 n시간" (2026-10-04 제작자 결정). 메인이 단계마다 따로 검사
    const mid = out(src, lines, {}).text, rn = renamed ? RR().renameInRecords(mid, c[0], next[0]) : { text: mid, records: 0, items: 0 };
    return { text: rn.text, changed: true, mid, op: 'update', line: row.line, name: next[0], oldName: c[0], prev: obj(c), before, after, renamedRecords: { records: rn.records, items: rn.items } };
  }
  // 보관: ## 공부에서 그 줄을 빼고 ## 공부 보관 표 끝에 (보관한 날 = date). 보관 섹션이 없으면 ## 공부 바로 뒤에 만듦
  function archiveStudy(src, name, o) {
    const date = o && o.date; if (!isDate(date)) throw new Error('날짜 오류');
    const lines = splitLines(src), { sec, t } = studyTable(lines), row = findRow(t, name);
    const c = row.cells.slice(0, 4); while (c.length < 4) c.push('');
    const moved = rowText(c.concat([date])), before = lines[row.line];
    lines.splice(row.line, 1);
    const aSec = findSection(lines, ARCHIVE), at = tableOf(lines, aSec);
    let line, created = false;
    if (aSec && at) {
      if (at.head.join('|') !== ARCHIVE_HEAD.join('|')) throw new Error('## 공부 보관 표 머리가 달라서 멈춤');
      line = at.endLine; lines.splice(line, 0, moved);
    } else if (aSec) { // 섹션은 있는데 표가 없음: 섹션 글 끝에 머리·구분선·줄
      let p = aSec.end; while (p > aSec.start && lines[p - 1].trim() === '') p--;
      lines.splice(p, 0, rowText(ARCHIVE_HEAD), sepText(ARCHIVE_HEAD.length), moved); line = p + 2;
    } else { // ## 공부 섹션 바로 뒤 (그 끝 빈 줄 다음)
      const s2 = findSection(lines, STUDY);
      let p = s2.end; const atEnd = p === lines.length;
      let q = p; while (q > s2.start && lines[q - 1].trim() === '') q--;
      const block = ['## ' + ARCHIVE, rowText(ARCHIVE_HEAD), sepText(ARCHIVE_HEAD.length), moved];
      if (atEnd) { lines.splice(q, 0, '', ...block); line = q + 4; }
      else { if (q === p) { block.unshift(''); } block.push(''); lines.splice(p, 0, ...block); line = p + block.indexOf(moved); }
      created = true;
    }
    return out(src, lines, { op: 'archive', name, from: row.line, line, created, before, after: moved });
  }
  // 되돌리기: ## 공부 보관에서 그 이름의 마지막 줄을 빼고 ## 공부 표 끝에 (보관한 날 칸은 버림)
  function restoreStudy(src, name) {
    const lines = splitLines(src);
    const aSec = findSection(lines, ARCHIVE), at = tableOf(lines, aSec); if (!at) throw new Error('## 공부 보관 표 없음');
    const hits = at.rows.filter((r) => r.cells[0] === name); if (!hits.length) throw new Error('보관한 공부 없음: ' + name);
    const row = hits[hits.length - 1];
    const { t } = studyTable(lines);
    nameFree(src, lines, t, name);
    const c = row.cells.slice(0, 4); while (c.length < 4) c.push('');
    const before = lines[row.line], back = rowText(c);
    lines.splice(row.line, 1);
    const t2 = studyTable(lines).t;
    lines.splice(t2.endLine, 0, back);
    return out(src, lines, { op: 'restore', name, from: row.line, line: t2.endLine, before, after: back });
  }

  // ---- 쓰기: ## 습관 기록 오늘 줄 "이름 n시간" ----
  const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function itemRe(name) { return new RegExp('(^|[,，]\\s*)' + reEsc(name) + '\\s+(\\d+(?:\\.\\d+)?)\\s*' + UNIT + '(?=\\s*(?:[,，]|$))'); }
  function hoursIn(cell, name) { const m = itemRe(name).exec(cell || ''); return m ? Number(m[2]) : 0; }
  // 한 칸 글에서 그 공부 항목만 바꿈. 0시간 = 항목을 뺌 (앞뒤 쉼표 정리)
  function setHoursInCell(cell, name, hours) {
    const re = itemRe(name), core = String(cell || '').trim();
    if (re.test(core)) {
      if (hours > 0) return core.replace(re, (m, pre) => `${pre}${name} ${hours}${UNIT}`);
      return core.replace(re, '').replace(/^\s*[,，]\s*/, '').replace(/\s*[,，]\s*$/, '').trim();
    }
    if (hours <= 0) return core;
    return core ? `${core}, ${name} ${hours}${UNIT}` : `${name} ${hours}${UNIT}`;
  }
  function recordsTable(lines) {
    const sec = findSection(lines, RECORDS); if (!sec) throw new Error('## 습관 기록 섹션 없음');
    const t = tableOf(lines, sec); if (!t) throw new Error('## 습관 기록 표 없음');
    if (t.head[0] !== '날짜' || t.head[1] !== '한 습관' || t.head.length !== 2) throw new Error('## 습관 기록 표 머리가 달라서 멈춤');
    return t;
  }
  function recOrder(rows) { const ds = rows.map((r) => Md.dateOf(r.cells[0])).filter((d) => d != null); return ds.length >= 2 && ds[0] > ds[ds.length - 1] ? 'desc' : 'asc'; }
  // 오늘 그 공부를 add시간 더함 (add = 1 또는 -1). 이름은 ## 공부 표에 있어야 함. 결과 0~24시간
  function logStudyToday(src, name, o) {
    const date = o && o.date, add = o && o.add;
    if (!isDate(date)) throw new Error('날짜 오류');
    if (add !== 1 && add !== -1) throw new Error('시간 오류 (1 또는 -1)');
    const lines = splitLines(src);
    findRow(studyTable(lines).t, name); // 표에 있는 공부만
    const t = recordsTable(lines);
    const hits = t.rows.filter((r) => r.cells[0] === date);
    const hit = hits.length ? (recOrder(t.rows) === 'desc' ? hits[0] : hits[hits.length - 1]) : null;
    const cur = hit ? hoursIn(hit.cells[1], name) : 0;
    const hours = Math.max(0, Math.min(HOURS_MAX, cur + add));
    if (hours === cur) return { text: src, changed: false, op: 'log', name, hours, date };
    if (hit) {
      const m = /^(\s*\|[^|]*\|)([^|]*)(\|.*)$/.exec(lines[hit.line]); if (!m) throw new Error('줄 모양 오류');
      const before = lines[hit.line]; lines[hit.line] = m[1] + ' ' + setHoursInCell(m[2], name, hours) + ' ' + m[3];
      return out(src, lines, { op: 'log', name, hours, date, line: hit.line, inserted: false, before, after: lines[hit.line] });
    }
    const row = rowText([date, `${name} ${hours}${UNIT}`]);
    const at = recOrder(t.rows) === 'desc' ? (t.sepLine != null ? t.sepLine + 1 : t.headLine + 1) : t.endLine;
    lines.splice(at, 0, row);
    return out(src, lines, { op: 'log', name, hours, date, line: at, inserted: true, before: null, after: row });
  }

  // ---- 안전 검사 (메인이 쓰기 직전에) ----
  // 공부·공부 보관 섹션 밖은 한 글자도 같아야 함. 섹션 안 글 줄(기준 등)도 그대로. 데이터 줄은 op에 맞게 하나만 빠지고/더해짐
  function onlyStudyChanged(oldText, newText, op) {
    try {
      const a = splitLines(oldText), b = splitLines(newText);
      const pick = (L) => {
        const s = findSection(L, STUDY), x = findSection(L, ARCHIVE); if (!s) return null;
        const secs = [s, x].filter(Boolean).sort((p, q) => q.line - p.line);
        let rest = L.slice(); secs.forEach((z) => { rest = rest.slice(0, z.line).concat(rest.slice(z.end)); });
        const body = (z) => (z ? L.slice(z.line, z.end) : []);
        const t = tableOf(L, s), at = tableOf(L, x);
        return { s, x, rest, prose: (z, tt) => body(z).filter((l, i) => !(tt && z.line + i >= tt.headLine && z.line + i < tt.endLine)), t, at,
          rows: t ? t.rows.map((r) => lines(L, r)) : [], arows: at ? at.rows.map((r) => lines(L, r)) : [] };
      };
      const lines = (L, r) => L[r.line];
      const A = pick(a), B = pick(b); if (!A || !B || !B.t) return false;
      // 섹션 밖 그대로 (보관 섹션을 새로 만들 때 생긴 빈 줄 하나는 섹션 안으로 들어가므로 rest에 안 남음)
      const restB = B.rest.slice(), restA = A.rest.slice();
      if (restA.join('\n') !== restB.join('\n')) {
        // 파일 끝에 붙일 때 앞에 띄운 빈 줄 하나: ## 공부 섹션 안 끝 빈 줄로 들어감
        return false;
      }
      // 섹션 안 글 줄 (표 밖) 그대로. 공부 섹션은 끝 빈 줄 하나 차이까지 허용 (보관 섹션 앞 띄움)
      const trimEnd = (arr) => { const c = arr.slice(); while (c.length && c[c.length - 1].trim() === '') c.pop(); return c; };
      if (trimEnd(A.prose(A.s, A.t)).join('\n') !== trimEnd(B.prose(B.s, B.t)).join('\n')) return false;
      if (A.x && trimEnd(A.prose(A.x, A.at)).join('\n') !== trimEnd(B.prose(B.x, B.at)).join('\n')) return false;
      if (!A.x && B.x && trimEnd(B.prose(B.x, B.at)).join('\n') !== '## ' + ARCHIVE) return false;
      if (B.t.head.join('|') !== HEAD.join('|')) return false;
      if (B.at && B.at.head.join('|') !== ARCHIVE_HEAD.join('|')) return false;
      if (A.t && B.t.sepLine == null) return false;
      // 데이터 줄 비교 (여러 개 담는 묶음)
      const diff = (xs, ys) => { const m = new Map(); xs.forEach((v) => m.set(v, (m.get(v) || 0) + 1)); const extra = []; ys.forEach((v) => { if (m.get(v)) m.set(v, m.get(v) - 1); else extra.push(v); }); return extra; };
      const goneS = diff(B.rows, A.rows), newS = diff(A.rows, B.rows), goneA = diff(B.arows, A.arows), newA = diff(A.arows, B.arows);
      const okStudy = (l) => { const c = cellsOf(l); return c.length === 4 && !!c[0] && validDates(c[1], c[2]); };
      const sig = (l) => cellsOf(l).slice(0, 4).join('|');
      const want = { add: [0, 1, 0, 0], update: [1, 1, 0, 0], archive: [1, 0, 0, 1], restore: [0, 1, 1, 0] }[op];
      if (!want) return false;
      if (goneS.length !== want[0] || newS.length !== want[1] || goneA.length !== want[2] || newA.length !== want[3]) return false;
      const dup = (rows) => { const n = rows.map((l) => cellsOf(l)[0]); return new Set(n).size !== n.length; };
      if (dup(B.rows) && !dup(A.rows)) return false; // 이름이 겹치게 되면 멈춤 (원래 겹쳐 있던 파일은 그대로 둠)
      if (op === 'add') return okStudy(newS[0]);
      if (op === 'update') { // 같은 자리에서 바뀜 (줄 번호 같음)
        const ia = A.rows.indexOf(goneS[0]), ib = B.rows.indexOf(newS[0]);
        return ia === ib && okStudy(newS[0]);
      }
      if (op === 'archive') { const c = cellsOf(newA[0]); return c.length === 5 && isDate(c[4]) && sig(newA[0]) === (() => { const g = cellsOf(goneS[0]).slice(0, 4); while (g.length < 4) g.push(''); return g.join('|'); })(); }
      if (op === 'restore') { const c = cellsOf(newS[0]); return c.length === 4 && sig(newS[0]) === cellsOf(goneA[0]).slice(0, 4).join('|'); }
      return false;
    } catch (e) { return false; }
  }
  // 습관 기록: 오늘(date) 줄 하나만 바뀌거나(날짜 칸 그대로) 오늘 줄 하나 더해짐. 다른 줄은 그대로
  function onlyStudyLogChanged(oldText, newText, date) {
    try {
      const a = splitLines(oldText), b = splitLines(newText), t = recordsTable(a);
      const okRow = (l) => { const c = cellsOf(l); return isRow(l) && !isSep(l) && c.length === 2 && c[0] === date; };
      if (a.length === b.length) {
        const d = a.map((x, i) => (x === b[i] ? -1 : i)).filter((i) => i >= 0);
        if (d.length !== 1) return d.length === 0;
        return t.rows.some((r) => r.line === d[0]) && cellsOf(a[d[0]])[0] === date && okRow(b[d[0]]);
      }
      if (b.length !== a.length + 1) return false;
      let i = 0; while (i < a.length && a[i] === b[i]) i++;
      if (a.slice(i).join('\n') !== b.slice(i + 1).join('\n')) return false;
      const lo = t.sepLine != null ? t.sepLine + 1 : t.headLine + 1;
      return i >= lo && i <= t.endLine && okRow(b[i]);
    } catch (e) { return false; }
  }

  const SW = { STUDY, ARCHIVE, HEAD, ARCHIVE_HEAD, NAME_MAX, MEMO_MAX, HOURS_MAX, UNIT, ymd, logDay, isDate, addDays, diffDays, clean, checkName, checkMemo, validDates,
    parse, loggedDays, hoursIn, setHoursInCell, addStudy, updateStudy, archiveStudy, restoreStudy, logStudyToday, onlyStudyChanged, onlyStudyLogChanged };
  root.PHStudyWrite = SW;
  if (typeof module !== 'undefined' && module.exports) module.exports = SW;
})(typeof window !== 'undefined' ? window : globalThis);

};
RT.MODS["/app/js/record_rename.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 이름 바꾸기 때 지난 기록 이름도 같이 바꾸기 (2026-10-04 비트, 제작자 결정 "습관 이름을 바꾸면 지난 기록의 이름도 같이 바뀐다").
// 그림·파일 접근 없음: 글(text)을 받아 새 글을 돌려준다. habit_edit.js(updateHabit)·study_write.js(updateStudy)와 메인 검사가 같이 쓴다.
//   ## 습관 기록 | 날짜 | 한 습관 |   칸 "물 3/6, 요가, 스트레칭 1/2, 독서 20쪽, 깃허브 1시간"에서 이름이 정확히 같은 항목만
//     ("요가"를 바꿀 때 "요가 매트"는 그대로. 항목 이름은 life_md.js recordItems로 읽음: "이름", "이름 k/n", "이름 20쪽")
//   ## 안전장치 확인 | 주 시작일 | 항목 | 결과 |   항목 칸이 정확히 같은 줄만
// 쓰기 원칙: 항목 글자 앞쪽 이름만 바꿈. 양·단위·구분자(쉼표, 띄어쓰기)·날짜·결과는 한 글자도 안 바뀐다.
(function (root) {
  'use strict';
  const req = (n) => (typeof require !== 'undefined' ? require(n) : null);
  const Md = root.PHLifeMd || req('./life_md.js');
  const LW = root.PHLifeWrite || req('./life_write.js');

  const SAFETY = '안전장치 확인'; // life_log.js SECTIONS.safety.name 과 같음 (시험으로 확인)
  const ROW_RE = /^(\s*\|[^|]*\|)([^|]*)(\|.*)$/; // | 날짜 | 한 습관 | ... -> 앞 / 한 습관 칸 / 뒤
  const isRow = (l) => /^\s*\|/.test(l);
  const isSep = (l) => /^\s*\|?\s*:?-{3,}/.test(l);
  const splitLines = (t) => String(t).split(/\r?\n/);
  const nlOf = (t) => (/\r\n/.test(t) ? '\r\n' : '\n');

  // 항목 글자(앞뒤 공백 없음)의 이름
  const itemName = (t) => { const it = Md.recordItems(t)[0]; return it ? it.name : t; };
  // 칸 글 -> 항목·구분자 (구분자는 원래 모양 그대로)
  function splitCell(core) {
    const parts = String(core).split(/(\s*[,，]\s*)/), items = [], seps = [];
    parts.forEach((p, i) => (i % 2 ? seps : items).push(p));
    return { items, seps };
  }
  function joinCell(c) { let s = ''; c.items.forEach((it, i) => { s += it; if (i < c.seps.length) s += c.seps[i]; }); return s; }
  // 항목 하나: 이름이 정확히 from이면 앞 이름만 to로 (앞뒤 공백 그대로). 아니면 null
  function renameItem(raw, from, to) {
    const lead = /^\s*/.exec(raw)[0], t = raw.trim(), trail = raw.slice(lead.length + t.length);
    if (!t || itemName(t) !== from || t.slice(0, from.length) !== from) return null;
    return lead + to + t.slice(from.length) + trail;
  }

  // 표 범위 (섹션이 없거나 표가 없으면 null): { rows: [줄 번호] }
  function recordRows(lines) { const T = LW.recordsTable(lines); return T ? T.rows.map((r) => r.line) : []; }
  function safetyRows(lines) {
    const secs = Md.sections(lines).filter((s) => s.name === SAFETY), out = [];
    secs.forEach((sec) => {
      const t = Md.table(lines, sec); if (!t || t.head[1] !== '항목') return;
      t.rows.forEach((r) => out.push(r.line));
    });
    return out;
  }
  // 안전장치 확인 한 줄: 셋째 조각(항목 칸)이 정확히 from이면 그 칸 이름만 to로
  function renameSafetyLine(l, from, to) {
    const seg = l.split('|'); if (seg.length < 4) return null;
    if (seg[2].trim() !== from) return null;
    const lead = /^\s*/.exec(seg[2])[0], trail = seg[2].slice(lead.length + from.length);
    seg[2] = lead + to + trail;
    return seg.join('|');
  }
  // 습관 기록 한 줄: 한 습관 칸에서 이름이 from인 항목만
  function renameRecordLine(l, from, to) {
    const m = ROW_RE.exec(l); if (!m) return null;
    const c = splitCell(m[2]); let hit = 0;
    c.items = c.items.map((it) => { const n = renameItem(it, from, to); if (n == null) return it; hit++; return n; });
    return hit ? { line: m[1] + joinCell(c) + m[3], hits: hit } : null;
  }

  // 이름 바꾸기: -> { text, changed, records(바뀐 기록 줄 수), items(바뀐 항목 수), safety(바뀐 안전장치 확인 줄 수) }
  function renameInRecords(text, from, to) {
    if (typeof from !== 'string' || typeof to !== 'string' || !from || !to || /[|,，\r\n]/.test(from + to)) throw new Error('이름 형식 오류');
    if (from === to) return { text, changed: false, records: 0, items: 0, safety: 0 };
    const lines = splitLines(text);
    let records = 0, items = 0, safety = 0;
    recordRows(lines).forEach((i) => { const r = renameRecordLine(lines[i], from, to); if (r) { lines[i] = r.line; records++; items += r.hits; } });
    safetyRows(lines).forEach((i) => { const r = renameSafetyLine(lines[i], from, to); if (r != null) { lines[i] = r; safety++; } });
    if (!records && !safety) return { text, changed: false, records: 0, items: 0, safety: 0 };
    return { text: lines.join(nlOf(text)), changed: true, records, items, safety };
  }
  // 지난 기록(습관 기록·안전장치 확인)에 이 이름이 쓰였는지 (지운 습관의 옛 기록 등)
  function usedInRecords(text, name) {
    const lines = splitLines(text);
    if (recordRows(lines).some((i) => { const m = ROW_RE.exec(lines[i]); return m && splitCell(m[2]).items.some((it) => it.trim() && itemName(it.trim()) === name); })) return true;
    return safetyRows(lines).some((i) => { const seg = lines[i].split('|'); return seg.length >= 4 && seg[2].trim() === name; });
  }

  // 그 이름이 지난 기록에 마지막으로 나온 날 (습관 기록 날짜, 안전장치 확인은 주 시작일). 없으면 null (2026-10-04 usedName 안내용)
  function lastUsed(text, name) {
    const lines = splitLines(text), day = (c) => { const m = /\d{4}-\d{2}-\d{2}/.exec(c || ''); return m ? m[0] : null; };
    let last = null; const see = (d) => { if (d && (!last || d > last)) last = d; };
    recordRows(lines).forEach((i) => { const m = ROW_RE.exec(lines[i]); if (m && splitCell(m[2]).items.some((it) => it.trim() && itemName(it.trim()) === name)) see(day(lines[i].split('|')[1])); });
    safetyRows(lines).forEach((i) => { const seg = lines[i].split('|'); if (seg.length >= 4 && seg[2].trim() === name) see(day(seg[1])); });
    return last;
  }
  // 막을 때 쓰는 오류 (code usedName + 마지막 날). kind = 'habit' | 'study'
  function usedErr(text, name, kind) {
    const e = new Error('지난 기록에 같은 이름이 있어서 섞일 수 있음: ' + name);
    return Object.assign(e, { code: 'usedName', usedName: name, lastDate: lastUsed(text, name), usedKind: kind || 'habit' });
  }

  // ---- 안전 검사 (메인이 쓰기 직전에): 옛 글 -> 새 글이 "기록 표 안 from 항목이 to로 바뀐 것"뿐인지 ----
  //   줄 수 같음. 바뀐 줄은 모두 습관 기록 표 줄 또는 안전장치 확인 표 줄. 그 줄 안에서도 날짜·양·구분자·결과는 그대로
  function onlyNamesRenamed(oldText, newText, from, to) {
    try {
      if (typeof from !== 'string' || typeof to !== 'string' || !from || !to || from === to || /[|,，\r\n]/.test(from + to)) return false;
      const a = splitLines(oldText), b = splitLines(newText);
      if (a.length !== b.length) return false;
      const rec = new Set(recordRows(a)), saf = new Set(safetyRows(a));
      for (let i = 0; i < a.length; i++) {
        if (a[i] === b[i]) continue;
        if (rec.has(i)) { if (!okRecordLine(a[i], b[i], from, to)) return false; }
        else if (saf.has(i)) { if (renameSafetyLine(a[i], from, to) !== b[i]) return false; }
        else return false;
      }
      return true;
    } catch (e) { return false; }
  }
  // 기록 한 줄: 앞(날짜)·뒤 그대로, 구분자 그대로, 항목은 같거나 from -> to (나머지 글자 그대로)
  function okRecordLine(x, y, from, to) {
    const m = ROW_RE.exec(x), n = ROW_RE.exec(y); if (!m || !n || m[1] !== n[1] || m[3] !== n[3]) return false;
    if (!isRow(y) || isSep(y)) return false;
    const c = splitCell(m[2]), d = splitCell(n[2]);
    if (c.items.length !== d.items.length || c.seps.join('\u0000') !== d.seps.join('\u0000')) return false;
    return c.items.every((it, k) => it === d.items[k] || renameItem(it, from, to) === d.items[k]);
  }

  const RR = { SAFETY, itemName, renameItem, renameInRecords, usedInRecords, lastUsed, usedErr, onlyNamesRenamed };
  root.PHRecordRename = RR;
  if (typeof module !== 'undefined' && module.exports) module.exports = RR;
})(typeof window !== 'undefined' ? window : globalThis);

};
RT.MODS["/app/js/features.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 가구 ↔ 기능 연결표 (2026-10-04 비트, 제작자 "가구에 기능을 직접 연결" + 집 짓기 2단계 토대). 그림·파일 접근 없음.
// 화면(js/interact.js·js/furnish_ui.js·js/logs_view.js), 메인(electron/furnish_ipc.js·logs_ipc.js·habit_ipc.js), Node 시험이 같이 쓴다.
//
// 1) 기능 목록 FEATURES: 집에서 가구를 눌러 여는 기능 하나 = id 하나. go = js/interact.js activate가 여는 입구 (전에는 interactions.js 물건마다 적었음)
//    habit = 그 기능이 딸린 생활습관 표 줄 이름. 줄이 없으면 기능이 꺼짐(가구는 일반 반응, 연결 목록에서 회색)
//    fnHabit = 일지 기능 습관(대변·식사·독서): 생활습관 표에 한 번도 없었으면 화면에 기본으로 보이고 첫 저장 때 한 번만 표에 더함.
//              한 번이라도 표에 있었으면(seen) 그 뒤로는 저절로 다시 생기지 않음 (제작자 결정 2026-10-04)
//    모든 기능은 가구 하나에만 (옮기면 원래 가구에서 빠짐). 2026-10-04 제작자: 옷 갈아입기도 하나로 ("여러 곳 가능" 없앰)
// 2) 가구 key: 그림 세트 배치표 물건 type (집에 하나뿐이면 type, 여럿이면 type#1, type#2 … 배치표 순서). 그림 아래쪽 칸(하단장·서랍) = key + '.part'
//    세트(v08·v09·v10·v12)마다 배치표 번호는 달라도 key는 같음 (정수기 purifier는 v12에만)
// 3) 기본 연결 DEFAULT_LINKS (key -> 기능 id) + 사용자 바꾼 것 overrides (key -> 기능 id | 'none'). 앱 설정(userData/features.json)에 저장, 생활 기록 파일 아님
(function (root) {
  'use strict';
  const FEATURES = [
    { id: 'poop', label: '대변 일지', short: '대변', go: 'poopLog', habit: '대변', fnHabit: true, target: '변기에서 기록', lines: ['obj', 'toilet', 'go'] },
    { id: 'meal', label: '식사 일지', short: '식사', go: 'mealLog', habit: '식사', fnHabit: true, target: '식탁에서 기록', lines: ['obj', 'table_two', 'go'] },
    { id: 'study', label: '공부', short: '공부', go: 'study', lines: ['obj', 'table_long', 'go'] },
    { id: 'reading', label: '독서 책꽂이', short: '독서', go: 'bookModal', habit: '독서', fnHabit: true, target: '책꽂이에 기록', oldTargets: ['쪽'], lines: ['obj', 'bookshelf', 'go'] }, // 2026-10-04 제작자: 독서 줄을 지우면 책꽂이도 꺼짐 (대변·식사와 같은 규칙). 2026-10-08 제작자: 쪽수 완전히 뺌 -> 기준 '쪽' -> '책꽂이에 기록' (옛 줄은 앱이 켤 때 옮김, js/habit_edit.js migrateFnRows)
    { id: 'record', label: '영화 기록', short: '영화', go: 'recordModal' }, // 2026-10-08 제작자: 한 가구에 한 기능 -> TV = 영화만. 연극은 rk:연극으로 따로 연동. 영화 칸을 지우면 꺼짐 (js/furnish.js state)
    { id: 'water', label: '물 기록 (정수기 창)', short: '물', go: 'waterModal' },
    { id: 'water_cup', label: '물 한 잔 (바로 +1)', short: '물 +1', go: 'water' },
    { id: 'yoga', label: '요가', short: '요가', go: 'yoga', habit: '요가' },
    { id: 'memo', label: '약속 (냉장고 메모)', short: '약속', go: 'fridgeMemo' },
    { id: 'inv_kitchen', label: '살림: 생활용품 주방', short: '주방', go: 'inventory', cat: 'living', pill: '주방', say: 'kitchen' },
    { id: 'inv_living', label: '살림: 생활용품', short: '생활', go: 'inventory', cat: 'living' },
    { id: 'inv_misc', label: '살림: 잡화', short: '잡화', go: 'inventory', cat: 'misc' },
    { id: 'inv_cosmetic', label: '살림: 화장품', short: '화장품', go: 'inventory', cat: 'cosmetic' },
    { id: 'wardrobe', label: '옷 갈아입기', short: '옷', go: 'wardrobe' },
    { id: 'close', label: '하루 마감 (잠자리)', short: '마감', go: 'close' },
    { id: 'bucket', label: '버킷리스트 (벽 메모지)', short: '버킷', go: 'bucketMemo' }, // 2026-10-08 제작자 피드백 4: 벽 메모지 = 가구 하나, 기본 기능 = 버킷리스트 메모지 창 (js/bucket_memo.js)
    { id: 'calendar', label: '약속 달력', short: '달력', go: 'meetings', houseOnly: true }, // 2026-10-08 공용 원룸 벽 달력 (무늬 공용판원룸 v01 3절): 약속 탭 달력 열기. houseOnly = 가구 자리가 있는 집(공용)의 연동 목록에만 (제작자 집 목록은 그대로)
  ];
  const BY_ID = {}; FEATURES.forEach((f) => { BY_ID[f.id] = f; });
  const NONE = 'none';
  // 기록 칸 기능 (2026-10-08 피드백 4: 기록 편집 + 추가로 만든 칸도 가구 연동): id = 'rk:' + 칸 이름 (## 기록 항목). 누르면 그 칸 기록 창 (js/record_modal.js)
  //   목록이 정해지지 않아 FEATURES에 없고 get()이 만들어 줌. 켜짐 = 그 칸이 있을 때 (js/furnish.js state). 칸을 지워도 연결은 남음 (같은 이름을 다시 만들면 다시 열림)
  //   영화는 따로 칸 기능을 만들지 않고 record(TV)가 맡음. 연극은 다른 칸처럼 rk:연극
  const RK = 'rk:', RK_RE = /^rk:[가-힣ㄱ-ㅎㅏ-ㅣA-Za-z ]{1,12}$/;
  const rkId = (name) => RK + String(name);
  function rkFeature(id) { const n = id.slice(RK.length); return { id, label: n + ' 기록', short: n, go: 'recordModal', kind: n, rk: true }; }
  const getF = (id) => BY_ID[id] || (typeof id === 'string' && RK_RE.test(id) && id.trim() === id ? rkFeature(id) : null);
  // 기본 연결 = 2026-10-04까지 interactions.js에 물건마다 적혀 있던 것 그대로
  //   공용 집(배치표에 가구 자리가 있는 집)은 자리마다 붙는 기능으로 바꿈 (js/house_slots.js PH_HOUSE_LINKS)
  const DEFAULT_LINKS = root.PH_HOUSE_LINKS ? Object.assign({}, root.PH_HOUSE_LINKS) : {
    toilet: 'poop', table_two: 'meal', table_long: 'study', bookshelf: 'reading',
    purifier: 'water', sink_v: 'water_cup', rug_round: 'yoga', fridge: 'memo', bed: 'close',
    kitchen_cabinet: 'inv_kitchen', 'shelf_unit.part': 'inv_living', 'tv_cabinet.part': 'inv_misc', 'mirror_oval.part': 'inv_cosmetic',
    wardrobe_side: 'wardrobe', tv_cabinet: 'record', memo_bucket: 'bucket', // memo_bucket = 벽 메모지 (js/house_slots.js addMemo가 MEMO_WALL_SLOTS 자리에 넣음) // 옷 갈아입기 = 오른쪽 벽 세로 옷장 하나 (2026-10-04 임시 기본, 제작자 답 오면 바꿈). 긴 거울·위쪽 옷장은 일반 반응
  };
  // 연결 모드 목록에 보일 가구 이름 (없으면 type 그대로). 아래 칸 = "OO 아래 칸"
  const NAMES = {
    toilet: '변기', bath_cabinet: '욕실장', bath_mirror: '욕실 거울', bathmat: '욕실 매트', washbasin: '세면대', laundry_basket: '빨래 바구니',
    frame_lemon: '레몬 액자', kitchen_cabinet: '주방장', purifier: '정수기', sink_v: '싱크대', plant_olive: '올리브 화분', clock: '시계',
    rug_persian: '페르시안 러그', shelf_unit: '거실 수납선반', fridge: '냉장고', floorlamp_round: '둥근 스탠드', chair_brown: '갈색 의자',
    table_two: '거실 2인 테이블', shoe_cabinet_ivory: '아이보리 신발장', shoes: '신발', shoe_cabinet_wood: '나무 신발장', gate: '현관문',
    rug_round: '둥근 카펫', mirror_oval: '긴 거울', wardrobe_top: '위쪽 옷장', wardrobe_side: '벽쪽 옷장', floorlamp: '스탠드', frame_cat: '고양이 액자',
    bookshelf: '책꽂이', plant_bird: '극락조 화분', tv_cabinet: 'TV장', bed: '침대', chair_side: '침실 의자', table_long: '침실 긴 테이블', memo_bucket: '벽 메모지',
  };
  const PART_NAMES = { shelf_unit: '하단장', tv_cabinet: 'TV장 아래 장', mirror_oval: '거울 아래 서랍' };
  function nameOf(key) {
    const k = String(key), part = /\.part$/.test(k), base = k.replace(/\.part$/, ''), m = base.match(/^(.*?)(?:#(\d+))?$/), t = m[1], n = m[2];
    const HN = root.PH_HOUSE_NAMES || {}; // 공용 집: 그 자리에 고른 후보 이름 (js/house_slots.js)
    if (part) return PART_NAMES[t] || (HN[t] || NAMES[t] || t) + ' 아래 칸';
    return (HN[t] || NAMES[t] || t) + (n ? ' ' + n : '');
  }
  const KEY_RE = /^[a-z][a-z0-9_]{0,40}(#\d{1,3})?(\.part)?$/;
  const MAX_LINKS = 300;

  // ---- 가구 key ----
  // objects = 배치표 물건 목록 (L.objects). -> 같은 순서의 key 배열
  function keysOf(objects) {
    const count = {}, seen = {};
    (objects || []).forEach((o) => { count[o.type] = (count[o.type] || 0) + 1; });
    return (objects || []).map((o) => { seen[o.type] = (seen[o.type] || 0) + 1; return count[o.type] > 1 ? o.type + '#' + seen[o.type] : o.type; });
  }
  const partKey = (k) => k + '.part';
  const baseKey = (k) => String(k).replace(/\.part$/, '');

  // ---- 저장 값 다듬기 (메인·화면 같이): 모양이 맞는 key, 아는 기능 id 또는 'none'만 ----
  function cleanLinks(o) {
    const out = {};
    if (!o || typeof o !== 'object' || Array.isArray(o)) return out;
    Object.keys(o).slice(0, MAX_LINKS).forEach((k) => { const v = o[k]; if (KEY_RE.test(k) && (v === NONE || getF(v))) out[k] = v; });
    return out;
  }
  function cleanSeen(a) { return Array.isArray(a) ? Array.from(new Set(a.filter((x) => BY_ID[x] && BY_ID[x].fnHabit))) : []; }

  // ---- 연결표 풀기: keys = 지금 집에 있는 key 목록(본체 + 아래 칸) -> { key: 기능 id } ----
  //   기본 연결 위에 사용자 바꾼 것. 한 기능이 둘 이상에 걸리면 사용자가 고른 쪽이 남음 (예전 여러 곳 저장 값도 여기서 하나로)
  function resolve(keys, overrides) {
    const has = new Set(keys || []), o = cleanLinks(overrides), map = {};
    Object.keys(DEFAULT_LINKS).forEach((k) => { if (has.has(k)) map[k] = DEFAULT_LINKS[k]; });
    Object.keys(o).forEach((k) => { if (!has.has(k)) return; if (o[k] === NONE) delete map[k]; else map[k] = o[k]; });
    Array.from(new Set(Object.values(map))).forEach((fid) => { // 정해진 기능 + 기록 칸 기능(rk:)
      const f = { id: fid };
      const ks = Object.keys(map).filter((k) => map[k] === f.id); if (ks.length <= 1) return;
      const keep = ks.find((k) => o[k] === f.id) || ks[0];
      ks.forEach((k) => { if (k !== keep) delete map[k]; });
    });
    return map;
  }
  // 한 가구에 기능 하나 붙이기 (fid = null | 'none' = 없음) -> 새 overrides. 기능은 원래 가구에서 빠짐
  function setLink(keys, overrides, key, fid) {
    if (!KEY_RE.test(String(key))) throw new Error('가구 key 오류');
    if (fid != null && fid !== NONE && !getF(fid)) throw new Error('모르는 기능: ' + fid);
    const cur = resolve(keys, overrides), o = cleanLinks(overrides), v = fid == null ? NONE : fid;
    o[key] = v;
    if (v !== NONE) Object.keys(cur).forEach((k) => { if (k !== key && cur[k] === v) o[k] = NONE; });
    Object.keys(o).forEach((k) => { if ((DEFAULT_LINKS[k] || NONE) === o[k]) delete o[k]; }); // 기본과 같으면 적지 않음
    return o;
  }
  // 기능 -> 붙은 key 목록
  function keysWith(map, fid) { return Object.keys(map).filter((k) => map[k] === fid); }

  // ---- 습관 줄에 따른 켜짐 ----
  // names = 생활습관 표 습관 이름들, seen = 표에 한 번이라도 있었던 일지 기능 id (앱 설정)
  //   -> 'on' (켜짐) | 'virtual' (일지 기능: 아직 표에 없고 한 번도 없었음 = 화면에 기본으로 보이고 첫 저장 때 표에 더함) | 'off' (꺼짐)
  function stateOf(fid, names, seen) {
    const f = getF(fid); if (!f) return 'off';
    if (!f.habit) return 'on'; // 기록 칸(rk:)·record 는 칸이 있는지 = js/furnish.js 가 생활 기록을 보고 정함
    const has = names instanceof Set ? names.has(f.habit) : (names || []).includes(f.habit);
    if (has) return 'on';
    if (f.fnHabit && !(seen || []).includes(f.id)) return 'virtual';
    return 'off';
  }
  const isOn = (fid, names, seen) => stateOf(fid, names, seen) !== 'off';
  function states(names, seen) { const out = {}; FEATURES.forEach((f) => { out[f.id] = stateOf(f.id, names, seen); }); return out; }
  // 생활습관 표에 있는 일지 기능 -> seen에 더할 것
  function seenFrom(names) { const n = names instanceof Set ? names : new Set(names || []); return FEATURES.filter((f) => f.fnHabit && n.has(f.habit)).map((f) => f.id); }
  const fnHabits = () => FEATURES.filter((f) => f.fnHabit);
  const byHabit = (name) => FEATURES.find((f) => f.fnHabit && f.habit === name) || null;

  const FX = { FEATURES, BY_ID, NONE, RK_RE, rkId, isRk: (id) => !!getF(id) && !!getF(id).rk, DEFAULT_LINKS, NAMES, nameOf, KEY_RE, keysOf, partKey, baseKey, cleanLinks, cleanSeen, resolve, setLink, keysWith, stateOf, isOn, states, seenFrom, fnHabits, byHabit, get: (id) => getF(id) };
  root.PHFeatures = FX;
  if (typeof module !== 'undefined' && module.exports) module.exports = FX;
})(typeof window !== 'undefined' ? window : globalThis);

};
RT.MODS["/app/electron/house_path.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 기록 폴더 안 .md 경로 검사 (C1 윈도우판 2026-10-14 비트: electron/main.js resolveSafe 에서 떼어 냄 — 윈도우 경로(path.win32)로도 시험하려고)
// 하우스 폴더 안쪽 상대 경로만, .md만. 상위 폴더(..)·숨김 이름(.)·비밀 파일·_to_delete 는 막는다 (pixel-office resolveSafe·fence.js 와 같은 방식)
// 윈도우: \ 구분자·드라이브(C:)·널 글자는 통째로 거절 (\ 가 섞이면 / 로만 나눈 숨김·상위 검사를 지나칠 수 있음)
'use strict';
const nodePath = require('path');
const SECRET = /^\.env|\.(pem|key)$|^id_rsa/i;
// house = 기록 폴더 절대 경로, rel = 화면이 보낸 상대 경로('/' 구분), P = path 모듈(시험에서 path.win32)
function safeMd(house, rel, P) {
  P = P || nodePath;
  if (!house) throw new Error('기록 폴더 없음 (온보딩 중)');
  if (typeof rel !== 'string' || !rel) throw new Error('경로 오류');
  if (/[\\:\0]/.test(rel)) throw new Error('허용 안 됨: ' + rel);
  const segs = rel.split('/').filter((s) => s !== '');
  if (!segs.length || segs.some((s) => s === '..' || s.startsWith('.') || SECRET.test(s) || s === '_to_delete')) throw new Error('허용 안 됨: ' + rel);
  if (!/\.md$/i.test(segs[segs.length - 1])) throw new Error('md만 읽음: ' + rel);
  const base = P.resolve(house);
  const full = P.join(base, ...segs);
  if (!full.startsWith(base + P.sep)) throw new Error('허용 안 됨: ' + rel);
  return full;
}
module.exports = { safeMd, SECRET };

};
RT.MODS["/app/js/data/settings.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 바꾸기 쉬운 기준값을 한곳에 모은다. (토리 지시 2026-10-02: 시간대·"오랜만" 기준은 상수로)
// 대사 출처: (제작 문서) (부기 제안, 제작자 확인 필요)
(function (root) {
  'use strict';
  const PH_SETTINGS = {
    // 시간대 인사. from 이상 ~ to 미만(시). from > to 이면 자정을 넘는 구간(밤 21~1시)
    TIME_BANDS: [
      { id: 'morning', name: '아침', from: 6, to: 11 },
      { id: 'day', name: '낮', from: 11, to: 17 },
      { id: 'evening', name: '저녁', from: 17, to: 21 },
      { id: 'night', name: '밤', from: 21, to: 1 },
      { id: 'dawn', name: '새벽', from: 1, to: 6 },
    ],
    // 낮·밤 (제작자 확정 2026-10-02: 18~06시는 밤, 자동). 밤 = NIGHT_FROM시 ~ NIGHT_TO시 미만, 맥 시계 기준, 즉시 바꿈(페이드 없음)
    //   DAY_NIGHT: 'auto' = 시각대로 / 'day' = 늘 낮 / 'night' = 늘 밤
    DAY_NIGHT: 'auto',
    NIGHT_FROM: 18,
    NIGHT_TO: 6,
    // 입장할 때 천천히 밝아지기 (제작자 결정, 부기 원고 v02 1-5). 방법 = 무늬 가이드 v03 3장: 단계 팔레트(fade 표, 반투명 막 없음)
    //   2026-10-02 제작자: 낮에는 어둠 없이 바로 밝게. 밤에는 어둡지만 집 윤곽이 보이는 밝기(start)에서 인사 ->
    //   스탠드가 켜지며 은은하게 원래 밤 색까지. 뚝뚝 끊기지 않게 steps 단계로 잘게, ms 동안. 두부도 같은 밝기
    //   밝기 t: 0 = 먹색, 1 = 원래 색 (무늬 fade 표의 0~4단계 = t 0, .25, .5, .75, 1과 같은 식)
    INTRO_NIGHT: { start: 0.45, steps: 18, ms: 2400 },
    // 입장 순서: true = 다 밝아진 뒤 두부가 나타나 인사 (무늬 가이드 v03 3장, 토리 전달) / false = 부기 원고 순서(어둠 속 인사 -> 밝아짐)
    INTRO_DUBU_AFTER_FADE: false,
    // 입장 때 제작자 캐릭터가 계단을 올라오는 장면 (다음 판). 그림(player_*)은 다른 무늬가 그리는 중. 지금은 자리만 (game.js CUES.playerClimb)
    // 그림 세트 (제작자 2026-10-03: 판을 앱에 넣어 보고 정함 -> "중간 굵기" v10으로 결정, 화면의 토글 버튼은 없앰)
    //   바꾸기는 앱 메뉴 "보기 > 집 그림"만 (되돌리기용). 고른 값은 저장 (electron/main.js prefs.json). 메뉴 순서 = 아래 적은 순서
    //   기본 = ART_SET_DEFAULT (그 세트가 아직 없으면 있는 것 중 가장 새 판). 세트 = scripts/sync_assets.py SETS
    //   chars = 세트마다 캐릭터 그림 표 { 캐릭터 id: { sprite: 그림 이름 앞부분, scale: 정수 배율 } }
    //     sprite 그림이 아직 없으면 fallback으로 (예: 큰 판 플레이어 playerL이 오기 전에는 player를 2배)
    //     scale = 정수 배 nearest-neighbor, 발바닥 = 칸 바닥(foot = 그림 맨 아래에서 발바닥 줄까지 px), 가로 = 칸 가운데. 걷기 칸은 1칸 그대로
    //     표에 없는 캐릭터는 js/data/actors.js의 sprite, 배율 1
    //   모든 세트 확대 없이 1:1 (제작자 2026-10-03). 두부 클릭 판정·쉬는 자리도 그 세트 두부 그림 크기에서 읽음 (game.js spriteSize)
    //   2026-10-03 제작자: "중간" = v12 (v10 + 주방 정수기, 올리브 화분·빨래 바구니 뺌). v10은 되돌리기용으로 메뉴에 남김 (v11은 바로 v12로 바뀌어 안 묶음)
    //   2026-10-08 설정 묶음(js/profile.js, profiles/*): 아래는 공용 기본값 (원룸 room1). 제작자 판(v12 등 세트·캐릭터)은 profiles/player가 통째로 바꿈
    //   공용판 캐릭터 그림(chars.player.sprite)은 온보딩에서 고른 아바타로 바뀜 (js/profile.js)
    ART_SET_DEFAULT: 'room1',
    ROOM_PASS_QUIET: ['living'], // 다른 방 가는 길에 지나가기만 하면 공간 대사를 안 하는 공간 (부기 새 방 v01 4절: 투룸·쓰리룸 거실)
    ART_SETS: {
      room1: { label: '원룸', chars: { player: { sprite: 'avatar1' }, dubu: { sprite: 'dubuM', fallback: { sprite: 'dubu' } } } }, // 무늬 공용판원룸 v01 (256x240)
      room2: { label: '투룸', chars: { player: { sprite: 'avatar1' }, dubu: { sprite: 'dubuM', fallback: { sprite: 'dubu' } } } }, // 무늬 공용판투룸쓰리룸 v01 (336x256)
      room3: { label: '쓰리룸', chars: { player: { sprite: 'avatar1' }, dubu: { sprite: 'dubuM', fallback: { sprite: 'dubu' } } } }, // 같은 문서 (384x320)
    },
    INTRO_PLAYER: true, // 2026-10-03 토리 전달: 제작자 캐릭터 v02로 입장 장면 넣음
    // 입장 뒤 조작 (제작자 결정 2026-10-03: "입장 후 플레이어가 움직이고, 두부는 그냥 돌아다녀")
    //   방향키·바닥 클릭 = 제작자 캐릭터. 두부 = 스스로 돌아다님 (pixel-office 오리 걷기처럼 천천히, 사람 칸은 피함)
    //   idle/sit/rest = 멈춰 있는 시간 범위(ms), stepMs = 두부 한 칸 걷는 시간, weights = 다음에 할 일 고르는 비율
    WANDER: { on: true, idle: [3000, 8000], sit: [6000, 12000], rest: [15000, 30000], stepMs: 240, weights: { walk: 0.5, sit: 0.25, table: 0.25 } }, // 제작자 결정 2026-10-02: B안 = 부기 원고 순서 (어두운 현관에서 두부가 먼저 인사 -> 집이 밝아짐)
    // 생활 탭 자료 파일 (PixelHouse 폴더 안 상대 경로). 파일이 옮겨지면 이 한 줄만 고친다. 첫 판은 읽기만
    //   2026-10-02 토리가 만든 하우스 전용 기록 파일로 바꿈 (옛 파일 자료/20261002_계획판에서_옮긴_생활자료_v01.md는 그대로 둠)
    //   2026-10-08: 공용 기본 = 기록 폴더 맨 위 파일 하나 (온보딩이 빈 틀로 만듦). 제작자 판 경로는 profiles/player
    LIFE_FILE: 'PixelHouse_생활기록.md',
    BRAND: 'Pixel House', TITLE: 'Pixel House', // 사이드바 맨 위 이름·창 제목 (설정 묶음이 바꿈)
    // 설정 화면 (공용판 피드백 1, 2026-10-08 무늬 설정화면 v01): 사이드바 맨 아래 설정 버튼 + 펫·하우스 이름·내 모습·사이드바 탭. 제작자 판은 false (profiles/player)
    //   TABS_HIDDEN = 숨긴 사이드바 탭 (사용자 값, js/profile.js userSettings). 우리집(home)은 늘 보임
    SETTINGS_SCREEN: true, TABS_HIDDEN: [],
    // 사이드바 탭 이름. archive 탭 = 생활일지 (제작자 2026-10-03: 기록 보관 -> 생활일지. 안쪽 키 archive는 그대로)
    TAB_NAMES: { home: '우리집', habits: '생활 습관', meetings: '약속', bucket: '버킷리스트', archive: '생활일지' },
    // 생활일지 안 탭 (js/journal.js). habit = 습관 기록의 습관 이름(그 습관이 있는 날만 한 줄씩), books = 독서 책꽂이, all = 옛 기록 보관 화면(잠·식사·한마디 포함)
    //   모양: 'folder' 겹친 폴더 | 'pill' 알약 | 'dropdown' 드롭다운 (제작자 결정 2026-10-03: 겹친 폴더)
    JOURNAL_TAB_STYLE: 'folder',
    JOURNAL_TABS: [
      { id: 'water', label: '물', habit: '물' }, { id: 'yoga', label: '요가', habit: '요가' }, { id: 'run', label: '러닝', habit: '러닝' },
      { id: 'reading', label: '독서', books: true },
      { id: 'poop', label: '대변', poop: true }, { id: 'meal', label: '식사', meal: true }, // 2026-10-04 logs: 대변 관찰·식사 일지 달력 (js/logs_view.js)
      { id: 'sleep', label: '잠', sleep: true }, // 2026-10-09: 잠 한 달 모눈 + 칠하기 창 (js/sleep_view.js, 무늬 잠기록 v01)
      { id: 'movie', label: '영화·연극', records: ['영화', '연극'] }, // 2026-10-08: 영화·연극 리스트 (js/record_list.js). 사용자가 만든 기록 항목 탭은 이 뒤에 저절로 붙음
      { id: 'study', label: '공부', grass: true }, // 2026-10-08: 과목 고르기 -> 잔디 (js/study_grass.js)
      { id: 'all', label: '모아 보기', all: true },
    ],
    // 책 표지색 칩 (하우스 팔레트 css/app.css 값). 파일에는 이름만 적음. 이름은 js/book_write.js COLORS에 있는 것만 (거기서 검사)
    BOOK_COLORS: [
      { name: '벽돌', hex: '#A65446' }, { name: '주황', hex: '#E08A3C' }, { name: '겨자', hex: '#C99A4E' }, { name: '잎', hex: '#86B07E' }, { name: '숲', hex: '#5C8458' },
      { name: '민트', hex: '#C4DCD8' }, { name: '남색', hex: '#3E4B69' }, { name: '분홍', hex: '#E9A9A0' }, { name: '나무', hex: '#B07A4F' }, { name: '호두', hex: '#5A3B2A' },
    ],
    // 버킷리스트 자리: 'auto' = 항목이 있으면 탭, 비었으면 생활 습관 맨 아래 칸 / 'tab' = 늘 탭 / 'inline' = 늘 생활 습관 아래
    BUCKET_TAB: 'auto',
    STUDY_VIEW: 'month', // 공부 간트 처음 보기: 'month' 그달 / 'week' 월~일 (2026-10-08, js/study_gantt.js)
    // 벽 버킷리스트 메모지 붙일 자리 (그림 세트마다, 메모지 그림 왼쪽 위 집 px). 무늬 기록기능디자인 v01 2-1. 목록 첫 자리 = 처음 값. 자리가 없는 세트는 메모지 안 그림
    // 벽 메모지 자리 (세트마다, 설정 묶음이 채움). 2026-10-08 제작자: 자리 고르기 없앰, 메모지 = 가구 하나 (js/house_slots.js addMemo). 공용 집은 배치표 memo_bucket 물건 그대로
    MEMO_WALL_SLOTS: {},
    // 공용 집 자리 기본 후보 바꾸기 (그림 세트 -> { 자리 id: 그림 이름 }). 배치표(무늬)는 후보 첫째가 기본인데, 여기 적은 세트·자리는 이 그림이 기본 (js/house_slots.js apply)
    //   2026-10-14 제작자 결정 (D4 ①): 기본 원룸 물 자리 = 정수기 (물컵은 친구 확인 때 물 입구로 안 보였음). 사용자가 고른 값(profile.json furniture)이 있으면 그대로
    SLOT_DEFAULTS: { room1: { water: 'purifier' } },
    // 쓰기 (첫 판): 생활 습관 "오늘" 카드에서 이 습관의 칸만 눌러 체크 (LIFE_FILE ## 습관 기록 표 오늘 줄). 다른 것은 읽기 전용
    WATER_HABIT: '물',
    // 두부 대화창 (2026-10-03). 기록 날짜의 하루 경계 = DAY_START_HOUR시: 01~06시에 적은 식사·한마디·잠은 전날 날짜 (토리 결정)
    //   물컵(WATER_HABIT)의 "오늘"은 아직 자정 기준 그대로 (electron/main.js today). 맞출지는 제작자 결정 대기
    DAY_START_HOUR: 6,
    //   시각 칩: 잔 시각 / 깬 시각 (무늬 대화창 디자인 v01 4-5, 한 줄 6개). 그 밖의 시각은 입력창에 직접 적기
    DIALOG: { BED_HOURS: [22, 23, 0, 1, 2, 3], WAKE_HOURS: [6, 7, 8, 9, 10, 11], MAX_LEN: 100 },
    // 공부 간트 기간: 이번 주 월요일부터 MIN주, 막대 끝이 더 뒤면 MAX주까지 늘림
    GANTT_WEEKS: { min: 4, max: 12 },
    // 입장 화면 "입장하기" 버튼 (제작자 픽셀 시안 2026-10-05, 입장 그림 px). 크기 w·h = enter_button.js size(), 자리 = 그림의 button_zone 가운데 (entrance v04: x110 y245 76x19)
    //   button_zone이 없는 옛 그림이면 y, x 생략 = 가로 가운데
    ENTER_BUTTON: { y: 226, w: 77, h: 15 },
    // 입장 화면 v02 (2026-10-03): 벤치 이웃. 입장 화면을 열 때 GUEST_CHANCE 확률로 나옴, 같은 날(DAY_START_HOUR 경계)은 처음 정한 대로.
    //   GUEST_QUIET 시각(22시 ~ 6시 미만)에는 안 나옴. 한 장 ms·순서는 그림 파일 anim
    GUEST_CHANCE: 0, // 공용 기본 = 안 나옴 (그림도 없음). 제작자 판은 profiles/player
    GUEST_QUIET: { from: 22, to: 6 },
    GUEST_KEY: 'pixel-house.guest', // 이 컴퓨터 저장소: { date, show, told }
    // 입장 화면에서 누를 수 있는 곳 (그림 px). 말 = lines.js entrance.idle.<id>
    //   그림 파일에 spots([{ id, px, py, w, h }])가 있으면 그것을 씀. 없으면 아래 표에서 그림 판(version)으로 찾음. 둘 다 없으면 누를 곳 없음(틀린 자리를 쓰지 않게)
    //   2 = entrance_v02, 3 = entrance_v03, 4 = entrance_v04 (제작자 확정), 5 = entrance_v05 (지금 쓰는 판, 잔디). 확인판 버튼자리 x3에서 비트가 잼. 그림 판이 바뀌면 무늬가 spots를 넣거나 여기 한 판 추가
    ENTRANCE_SPOTS: {}, // 입장 그림 판마다 누를 곳 (설정 묶음이 채움. 공용판은 입장 그림이 없어 비어 있음)
    // "오랜만" = 마지막 방문에서 이만큼(일) 이상 지남
    LONG_ABSENCE_DAYS: 3,
    // 방문 기록을 두는 브라우저 저장소 키 (이 컴퓨터 안에만, 밖으로 보내지 않음)
    VISIT_KEY: 'pixel-house.lastVisit',
    // 걷기: 한 칸 가는 시간(ms), 걷기 그림 한 장 시간(ms). pixel-office와 같은 값
    STEP_MS: 140,
    WALK_FRAME_MS: 130,
    // 말풍선이 떠 있는 시간(ms), 대화창 글자 나오는 간격(ms)
    BUBBLE_MS: 3200,
    TYPE_MS: 35,
    // 되돌리기 띠("… 지웠어요 [되돌리기]")가 떠 있는 시간(ms). 지나면 저절로 사라짐. 창 닫기·탭 옮기기 때도 사라짐 (2026-10-08 제작자, js/undo_bar.js)
    UNDO_MS: 5000,
  };
  const PF = (root.PHProfile || (typeof module !== 'undefined' && typeof require === 'function' ? require('../profile.js') : null)); // 설정 묶음 (js/profile.js)
  if (PF) PF.patch('PH_SETTINGS', PH_SETTINGS);
  root.PH_SETTINGS = PH_SETTINGS;
  if (typeof module !== 'undefined' && module.exports) module.exports = PH_SETTINGS;
})(typeof window !== 'undefined' ? window : globalThis);

};
RT.MODS["/app/js/profile.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 설정 묶음 (profile). 2026-10-08 로드맵 4단계 "제작자 정보 분리" (기획/20261008_pixel-house_공용판기획_v01.md 2절)
//   코드는 하나. 집·캐릭터·대사 속 이름·기록 경로처럼 사람마다 다른 값은 묶음 파일 profiles/<id>/profile.json 이 덮는다.
//     { id, user: 기본 이름, houseDir: 기록 폴더(메인이 씀), patch: { 전역 이름(PH_SETTINGS, PH_LINES …): 덮을 값 } }
//   코드 기본값 = 공용판(원룸, 아바타, 이웃 없음). profiles/default 는 비어 있고, 사용자가 온보딩에서 고른 값(userData/profile.json)을 더함
//   덮는 법: 객체는 안쪽까지 합침, 배열·글은 통째로 바꿈, "키!" = 그 키를 통째로 바꿈.
//   대사 속 {user} = 사용자 이름 (이름을 아직 모르면 그대로 둠: 온보딩 전). 습관·공부 이름 자리 {name}과 겹치지 않게 따로 씀 (부기 3-1)
// 어느 묶음인지
//   화면: 메인(electron/profile_main.js)이 preload로 넘긴 window.PHProfileBoot = { id, bundle, user }
//   Node(메인 프로세스·시험·두부 펫): 환경변수 PH_PROFILE. 없으면 profiles/player 가 있으면 player, 없으면 default
//     (제작자 컴퓨터의 두부 펫·시험은 지금처럼 제작자 값을 그대로 씀. 공개 저장소에는 profiles/player 가 없어 공용값)
// 데이터 파일(settings.js, lines.js …)이 맨 끝에서 PHProfile.patch(이름, 값)를 부른다. 그래서 index.html 에서 settings.js 보다 먼저 읽는다
(function (root) {
  'use strict';
  const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
  const clone = (v) => (v == null ? v : JSON.parse(JSON.stringify(v)));
  function merge(dst, src) {
    Object.keys(src || {}).forEach((k) => {
      const v = src[k];
      if (k.endsWith('!')) { dst[k.slice(0, -1)] = clone(v); return; }
      if (isObj(v) && isObj(dst[k])) merge(dst[k], v); else dst[k] = clone(v);
    });
    return dst;
  }
  // 모든 글 안 {user} -> 이름 (제자리에서 바꿈: 다른 파일이 이미 잡아 둔 객체도 같이 바뀜)
  //   {cat} = 고양이 이름 (2026-10-08 3-1단계: 공용판은 온보딩에서 사용자가 지음, 기본 두부). {cat|이} {cat|이에요} {cat|은} {cat|으로} = 받침 따라 조사
  //   {pet} = {cat} 별칭 (부기 문구_공용판2 v01: 새 줄은 {pet}으로 씀, 2026-10-08 펫 고르기)
  const CAT_DEFAULT = '두부', CAT_RE = /\{(?:cat|pet)(?:\|([^}]+))?\}/g;
  function josa(word, kind) {
    const c = String(word).slice(-1).charCodeAt(0), han = c >= 0xAC00 && c <= 0xD7A3, jong = han ? (c - 0xAC00) % 28 : 0;
    if (kind === '으로') return word + (jong && jong !== 8 ? '으로' : '로');
    if (kind === '이에요') return word + (jong ? '이에요' : '예요');
    if (kind === '은') return word + (jong ? '은' : '는');
    if (kind === '이') return word + (jong ? '이' : '가');
    return word;
  }
  const fillCat = (s, cat) => s.replace(CAT_RE, (m, j) => (j ? josa(cat, j) : cat));
  function fillUser(o, name, cat) {
    if (!name && !cat) return o;
    const f = (s) => { let t = cat ? fillCat(s, cat) : s; if (name) t = t.split('{user}').join(name); return t; };
    (function walk(x) {
      if (Array.isArray(x)) x.forEach((v, i) => { if (typeof v === 'string') x[i] = f(v); else if (v && typeof v === 'object') walk(v); });
      else if (isObj(x)) Object.keys(x).forEach((k) => { const v = x[k]; if (typeof v === 'string') x[k] = f(v); else if (v && typeof v === 'object') walk(v); });
    })(o);
    return o;
  }
  const AVATAR_RE = /^avatar\d{1,2}$/;
  const P = { id: 'default', bundle: {}, user: {}, boot: null, merge, fillUser, AVATAR_RE };
  // 펫 고르기 (공용판 설정 화면, 2026-10-08): PH_PETS·PH_PET_KIND = js/data/pet_lines.js (profile.js 바로 뒤에 읽음). 없거나 모르는 값이면 흰 고양이(두부)
  const PETS = () => root.PH_PETS || {}, KINDS = () => root.PH_PET_KIND || {};
  P.pet = () => (P.user && typeof P.user.pet === 'string' && PETS()[P.user.pet] ? P.user.pet : 'cat_white');
  P.petKind = () => (PETS()[P.pet()] || {}).kind || 'cat';
  P.petDefault = (kind) => ((KINDS()[kind || P.petKind()] || {}).defaultName) || CAT_DEFAULT;
  P.userName = () => (P.user && typeof P.user.name === 'string' && P.user.name) || P.bundle.user || '';
  P.catName = () => (P.user && typeof P.user.cat === 'string' && P.user.cat.trim()) || P.bundle.cat || P.petDefault();
  P.fillCat = fillCat; P.josa = josa; P.CAT_DEFAULT = CAT_DEFAULT;
  P.isOnboard = () => !!(P.boot && P.boot.onboard);
  P.init = function (boot) {
    const b = boot || {};
    P.boot = b; P.id = typeof b.id === 'string' ? b.id : 'default';
    P.bundle = isObj(b.bundle) ? b.bundle : {}; P.user = isObj(b.user) ? b.user : {};
    return P;
  };
  // 공용판 사용자 값: 고른 집 = 그림 세트, 고른 아바타 = 집 안 내 캐릭터 그림
  //   설정 화면 (2026-10-08): 고른 펫 = 집 안 펫 그림(chars.dubu), 하우스 이름 = BRAND·TITLE, 숨긴 사이드바 탭 = TABS_HIDDEN
  const TAB_IDS = ['habits', 'meetings', 'bucket', 'archive'];
  function userSettings(S) {
    const u = P.user || {};
    const pet = typeof u.pet === 'string' && PETS()[u.pet];
    if (pet) Object.keys(S.ART_SETS || {}).forEach((k) => { const c = S.ART_SETS[k].chars && S.ART_SETS[k].chars.dubu; if (c && c.sprite === 'dubuM') c.sprite = pet.sprite; });
    if (typeof u.brand === 'string' && u.brand.trim()) { S.BRAND = u.brand.trim(); S.TITLE = u.brand.trim(); }
    if (Array.isArray(u.tabsHidden)) S.TABS_HIDDEN = u.tabsHidden.filter((t) => TAB_IDS.includes(t));
    if (typeof u.house === 'string' && S.ART_SETS && S.ART_SETS[u.house]) S.ART_SET_DEFAULT = u.house;
    if (typeof u.avatar === 'string' && AVATAR_RE.test(u.avatar)) {
      Object.keys(S.ART_SETS || {}).forEach((k) => { const c = S.ART_SETS[k].chars && S.ART_SETS[k].chars.player; if (c && AVATAR_RE.test(c.sprite || '')) c.sprite = u.avatar; });
    }
  }
  P.patch = function (name, obj) {
    if (!obj) return obj;
    const pt = P.bundle.patch && P.bundle.patch[name];
    if (pt) merge(obj, pt);
    if (name === 'PH_SETTINGS') userSettings(obj); else fillUser(obj, P.userName(), P.catName());
    return obj;
  };

  // 강아지면 대사 묶음 전체: "냥~" -> "멍~" 다음 PH_PET_LINES.dog 덮기 (부기 문구_공용판2 v01 3-1). 화면이 다 읽힌 뒤 한 번 (js/main.js init 맨 앞)
  //   글은 제자리에서 바꾸고, 덮는 배열도 제자리에서 바꿈 (다른 모듈이 잡아 둔 배열도 같이 바뀌게). 덮는 줄의 {user}·{pet}도 채움
  function overlay(dst, src) {
    Object.keys(src || {}).forEach((k) => {
      const v = src[k];
      if (Array.isArray(v) && Array.isArray(dst[k])) dst[k].splice(0, dst[k].length, ...clone(v));
      else if (isObj(v) && isObj(dst[k])) overlay(dst[k], v);
      else dst[k] = clone(v);
    });
  }
  function dogText(o) {
    (function walk(x) {
      if (Array.isArray(x)) x.forEach((v, i) => { if (typeof v === 'string') x[i] = v.split('냥~').join('멍~'); else if (v && typeof v === 'object') walk(v); });
      else if (isObj(x)) Object.keys(x).forEach((k) => { const v = x[k]; if (typeof v === 'string') x[k] = v.split('냥~').join('멍~'); else if (v && typeof v === 'object') walk(v); });
    })(o);
  }
  P.applyPet = function (R) {
    const W = R || root; if (P.petKind() !== 'dog' || P.petApplied) return false;
    const names = Object.keys(W).filter((k) => /^PH_(\w+_)?LINES$/.test(k) && k !== 'PH_PET_LINES' && W[k] && typeof W[k] === 'object');
    names.forEach((k) => dogText(W[k]));
    const dog = (W.PH_PET_LINES || {}).dog || {};
    Object.keys(dog).forEach((k) => { if (W[k]) overlay(W[k], fillUser(clone(dog[k]), P.userName(), P.catName())); });
    P.petApplied = names; return true;
  };

  if (root.PHProfileBoot) P.init(root.PHProfileBoot); // 화면 (Electron preload)
  else if (typeof require === 'function' && typeof module !== 'undefined' && typeof process !== 'undefined' && process.versions && process.versions.node) { // Node (시험은 global.window = global 을 쓰기도 함)
    const fs = require('fs'), path = require('path');
    const ROOT = path.resolve(__dirname, '..');
    const file = (id) => path.join(ROOT, 'profiles', id, 'profile.json');
    P.ID_RE = /^[a-z][a-z0-9_-]{0,20}$/;
    P.has = (id) => P.ID_RE.test(String(id)) && fs.existsSync(file(id));
    P.load = (id) => { if (!P.ID_RE.test(String(id))) return null; try { const v = JSON.parse(fs.readFileSync(file(id), 'utf8')); return isObj(v) ? v : null; } catch (e) { return null; } };
    const want = P.ID_RE.test(process.env.PH_PROFILE || '') ? process.env.PH_PROFILE : (P.has('player') ? 'player' : 'default');
    let user = {};
    try { const u = process.env.PH_PROFILE_USER ? JSON.parse(process.env.PH_PROFILE_USER) : null; if (isObj(u)) user = u; } catch (e) { /* 시험 값이 깨졌으면 없음 */ }
    P.init({ id: want, bundle: P.load(want) || {}, user });
  }

  root.PHProfile = P;
  if (typeof module !== 'undefined' && module.exports) module.exports = P;
})(typeof window !== 'undefined' ? window : globalThis);

};
RT.MODS["/app/electron/outfit_ipc.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 옷 갈아입기 차림 저장 (wardrobe 브랜치 2026-10-03, 비트). 생활 기록 파일이 아니라 앱 설정 폴더의 outfit.json 한 파일
//   위치: app.getPath('userData')/outfit.json (= ~/Library/Application Support/Pixel House/outfit.json). 시험(PH_SHOTS)은 임시 사용자 폴더
//   화면은 차림 값만 보낸다 (경로를 보낼 수 없음). 칸·값은 여기서 다시 검사: 정해진 칸만, 번호 1~99 정수 또는 null (한벌만 0 = 처음 옷)
//   쓰기: 임시 파일에 쓰고 이름 바꾸기 (쓰다 끊겨도 옛 파일이 남음)
// main.js에서 한 번 부른다: require('./outfit_ipc.js')({ ipcMain, app })
'use strict';
const fs = require('fs');
const path = require('path');

const SLOTS = ['top', 'bottom', 'outer', 'bag', 'hat', 'onepiece'];
function clean(o) {
  if (!o || typeof o !== 'object' || Array.isArray(o)) throw new Error('차림 형식 오류');
  const out = {};
  Object.keys(o).forEach((k) => {
    if (!SLOTS.includes(k)) throw new Error('모르는 칸: ' + k);
    const v = o[k];
    if (v === null) { if (k === 'top' || k === 'bottom') throw new Error('상의·하의는 비울 수 없음'); out[k] = null; return; }
    if (k === 'onepiece' && v === 0) { out[k] = 0; return; } // 한벌 0번 = 공용판 아바타 "처음 옷" (원래 그림, js/outfit.js OWN)
    if (!Number.isInteger(v) || v < 1 || v > 99) throw new Error('번호 오류: ' + k);
    out[k] = v;
  });
  return out;
}

module.exports = function register(o) {
  const { ipcMain, app } = o;
  const file = () => path.join(app.getPath('userData'), 'outfit.json');
  ipcMain.handle('ph:outfitGet', () => {
    try { const v = JSON.parse(fs.readFileSync(file(), 'utf8')); return { ok: true, outfit: clean(v && v.outfit ? v.outfit : v) }; }
    catch (e) { return { ok: true, outfit: null, missing: e.code === 'ENOENT' }; } // 없거나 깨졌으면 기본 차림 (화면이 정함)
  });
  ipcMain.handle('ph:outfitSet', (e, req) => {
    const outfit = clean(req);
    const f = file(), tmp = f + '.tmp';
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(tmp, JSON.stringify({ outfit, savedAt: new Date().toISOString() }, null, 2));
    fs.renameSync(tmp, f);
    return { ok: true, outfit };
  });
  return { clean, file };
};
module.exports.clean = clean;

};
RT.MODS["/app/electron/life_backup.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 생활 기록 쓰기 직전 사본 (메인 프로세스). 2026-10-04 main.js에서 떼어 냄: 두부 펫(~/dev/dubu-pet)도 같은 함수를 씀
//   사본 = <dir()>/<날짜시각_밀리초>_<파일이름>, 같은 파일 사본은 최근 keep개만 남김 (이 함수가 만든 이름만 정리)
//   dir은 함수: 부를 때 정함 (픽셀 하우스는 시험 때 userData를 나중에 바꿈)
// 쓰는 법: const backup = require('./life_backup.js')({ dir: () => path.join(app.getPath('userData'), 'backup'), file, keep: 10 })
//          backup(지금 글) -> 사본 폴더 경로
'use strict';
const fs = require('fs');
const path = require('path');

module.exports = function makeBackup(o) {
  const keep = Number.isInteger(o.keep) && o.keep > 0 ? o.keep : 10;
  const base = path.basename(o.file);
  return function backup(text) {
    const dir = o.dir();
    fs.mkdirSync(dir, { recursive: true });
    const n = new Date(), p2 = (x) => String(x).padStart(2, '0');
    const stamp = `${n.getFullYear()}${p2(n.getMonth() + 1)}${p2(n.getDate())}_${p2(n.getHours())}${p2(n.getMinutes())}${p2(n.getSeconds())}_${String(n.getMilliseconds()).padStart(3, '0')}`;
    fs.writeFileSync(path.join(dir, stamp + '_' + base), text);
    const old = fs.readdirSync(dir).filter((f) => f.endsWith('_' + base)).sort();
    old.slice(0, Math.max(0, old.length - keep)).forEach((f) => fs.unlinkSync(path.join(dir, f))); // 앱이 만든 사본만 정리
    return dir;
  };
};

};
RT.MODS["/app/electron/water_ipc.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 물 칸 쓰기 (메인 프로세스, ph:setWater). 2026-10-04 main.js에서 떼어 냄: 두부 펫(~/dev/dubu-pet)도 같은 코드로 씀
//   대상 파일·습관 이름·칸 수·오늘 날짜는 모두 메인이 정한다 (화면은 "몇 잔"과 "읽은 시각"만 보냄 = 경로를 보낼 수 없음)
//   앱이 읽은 뒤 파일이 바뀌었으면 쓰지 않고 새 글을 돌려줌 (conflict). 쓰기 전 백업, 바뀐 줄 검사(onlyRecordsRowChanged)
// main.js에서 한 번 부른다: require('./water_ipc.js')({ ipcMain, file, backup, settings, today, guard })
'use strict';
const fs = require('fs');
const path = require('path');

module.exports = function register(o) {
  const Md = require(path.join(__dirname, '..', 'js', 'life_md.js'));
  const LW = require(path.join(__dirname, '..', 'js', 'life_write.js'));
  const { ipcMain, file, backup, settings, today, guard } = o;
  ipcMain.handle('ph:setWater', (e, req) => {
    if (guard) guard();
    const value = req && req.value, seen = req && req.lastModified;
    const cur = fs.readFileSync(file, 'utf8'), mtime = fs.statSync(file).mtimeMs;
    // 앱이 읽은 뒤 파일이 바뀌었으면 쓰지 않고 새 글을 돌려줌 (화면이 다시 읽고 반영)
    if (typeof seen !== 'number' || Math.abs(seen - mtime) > 1) return { ok: false, conflict: true, text: cur, lastModified: mtime };
    const habit = settings.WATER_HABIT || '물';
    const row = (Md.parse(cur).habits || { rows: [] }).rows.find((r) => r.name === habit && r.slots > 0);
    if (!row) throw new Error('칸 습관 없음: ' + habit);
    if (!Number.isInteger(value) || value < 0 || value > row.slots) throw new Error('값 오류');
    const r = LW.setSlots(cur, { habit, value, of: row.slots, date: today() });
    if (!r.changed) return { ok: true, unchanged: true, text: cur, lastModified: mtime, date: today() };
    if (!LW.onlyRecordsRowChanged(cur, r.text)) throw new Error('습관 기록 표 밖이 바뀌려 해서 멈춤');
    const dir = backup(cur);
    fs.writeFileSync(file, r.text);
    return { ok: true, text: r.text, lastModified: fs.statSync(file).mtimeMs, date: today(), line: r.line, inserted: r.inserted, backupDir: dir };
  });
};

};
RT.MODS["/app/electron/furnish_ipc.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 가구 연결·일지 기능 표시 저장 (메인 프로세스, 2026-10-04 비트). 생활 기록 파일이 아니라 앱 설정 폴더의 features.json 한 파일
//   위치: app.getPath('userData')/features.json (= ~/Library/Application Support/Pixel House/features.json). 시험(PH_SHOTS)은 임시 사용자 폴더
//   { links: { 가구 key: 기능 id | 'none' } (기본과 다른 것만), seen: [표에 한 번이라도 있었던 일지 기능 id (대변·식사·독서)] }
//   규칙·계산은 js/features.js. 화면은 key·기능 id만 보냄 (경로를 보낼 수 없음). 여기서 다시 다듬음(cleanLinks·cleanSeen)
//   seen: 기능을 읽을 때(ph:featuresGet) 생활 기록 파일 생활습관 표를 읽기만 해서, 표에 대변·식사 줄이 있으면 더함. 쓰지는 않음
//         일지·책을 처음 저장해 줄이 생길 때(logs_ipc·book_ipc), 화면에만 보이던 줄을 지울 때(ph:featuresHide)도 더함
//   쓰기: 임시 파일에 쓰고 이름 바꾸기 (outfit.json과 같음)
// 여는 함수: ph:featuresGet, ph:featuresSetLinks(통째로, 화면이 js/features.js setLink로 만든 값), ph:featuresReset(기본으로), ph:featuresHide(일지 기능 끄기)
// main.js에서 한 번 부른다: const FS = require('./furnish_ipc.js')({ ipcMain, app, file }) -> FS.isSeen(id), FS.markSeen(id) (logs_ipc·habit_ipc가 씀)
'use strict';
const fs = require('fs');
const path = require('path');

module.exports = function register(o) {
  const FX = require(path.join(__dirname, '..', 'js', 'features.js'));
  const Md = require(path.join(__dirname, '..', 'js', 'life_md.js'));
  const { ipcMain, app, file } = o;
  const store = () => path.join(app.getPath('userData'), 'features.json');
  function read() {
    try { const v = JSON.parse(fs.readFileSync(store(), 'utf8')); return { links: FX.cleanLinks(v && v.links), seen: FX.cleanSeen(v && v.seen) }; }
    catch (e) { return { links: {}, seen: [] }; } // 없거나 깨졌으면 기본
  }
  function write(v) {
    const f = store(), tmp = f + '.tmp', out = { links: FX.cleanLinks(v.links), seen: FX.cleanSeen(v.seen), savedAt: new Date().toISOString() };
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(tmp, JSON.stringify(out, null, 2));
    fs.renameSync(tmp, f);
    return { links: out.links, seen: out.seen };
  }
  // 생활습관 표 이름들 (읽기만). 못 읽으면 null
  function habitNames(text) {
    try { const d = Md.parse(text != null ? text : fs.readFileSync(file, 'utf8')); return d.habits ? d.habits.rows.map((r) => r.name) : []; } catch (e) { return null; }
  }
  function syncSeen(text) {
    const v = read(), names = habitNames(text); if (!names) return v;
    const add = FX.seenFrom(names).filter((id) => !v.seen.includes(id));
    return add.length ? write({ links: v.links, seen: v.seen.concat(add) }) : v;
  }
  const isSeen = (id) => read().seen.includes(id);
  function markSeen(id) { const v = read(); if (!FX.get(id) || !FX.get(id).fnHabit || v.seen.includes(id)) return v; return write({ links: v.links, seen: v.seen.concat([id]) }); }

  ipcMain.handle('ph:featuresGet', () => Object.assign({ ok: true }, syncSeen()));
  ipcMain.handle('ph:featuresSetLinks', (e, req) => {
    if (!req || typeof req !== 'object' || !req.links || typeof req.links !== 'object') throw new Error('요청 형식 오류');
    const v = read(); return Object.assign({ ok: true }, write({ links: req.links, seen: v.seen }));
  });
  ipcMain.handle('ph:featuresReset', () => { const v = read(); return Object.assign({ ok: true }, write({ links: {}, seen: v.seen })); });
  // 화면에만 보이던 일지 기능 줄(아직 표에 한 번도 없음)을 지움 = 꺼짐 표시만 (생활 기록 파일은 그대로)
  ipcMain.handle('ph:featuresHide', (e, req) => {
    const id = req && req.id; if (!FX.get(id) || !FX.get(id).fnHabit) throw new Error('일지 기능만 끌 수 있음');
    return Object.assign({ ok: true }, markSeen(id));
  });
  return { read, isSeen, markSeen, syncSeen, store };
};

};
RT.MODS["/app/electron/life_log_ipc.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 두부 대화창 쓰기 (메인 프로세스): 수면·식사·한마디. 물컵(ph:setWater, electron/main.js)과 같은 안전 규칙.
//   - 대상 파일·섹션·날짜는 모두 메인이 정한다. 화면은 값과 "읽은 시각"만 보낸다 (경로를 보낼 수 없음)
//   - 앱이 읽은 뒤 파일이 바뀌었으면 쓰지 않고 새 글을 돌려줌 (conflict)
//   - 값 검사(시각 형식, 끼니 4종, 100자, | 와 줄바꿈 바꾸기)는 js/life_log.js
//   - 쓰기 직전 백업(main.js backup), 바뀐 줄 검사(onlyLogChanged)를 통과해야 씀
// 식사 일지 끄기 (2026-10-04 제작자): 생활습관 표에 "식사" 줄이 없고 전에 있었으면(features.isSeen('meal')) 대화창 식사 적기도 거절 { ok: false, off: true }
//   (화면 대화창도 식사 선택지를 빼지만, 메인에서 한 번 더 막음. 잠·한마디는 습관 줄이 없어 그대로)
// 잠 칠하기 (2026-10-08 잠 기록 살리기): ph:setSleepWindow = 창(from부터 hours시간) 안 잠 구간을 통째로 바꿈 (js/life_log.js setSleepWindow).
//   같은 규칙: 읽은 시각 검사(conflict), 값 검사, 바뀐 줄 검사(onlySleepWindowChanged = 창 밖 잠·다른 섹션은 그대로), 쓰기 직전 백업. 날짜는 화면이 고른 창(지난 날도 고칠 수 있음)
// main.js에서 한 번 부른다: require('./life_log_ipc.js')({ ipcMain, file, backup, settings, fixedDay, guard, features })
'use strict';
const fs = require('fs');
const path = require('path');

module.exports = function register(o) {
  const LL = require(path.join(__dirname, '..', 'js', 'life_log.js'));
  const LT = require(path.join(__dirname, '..', 'js', 'log_table.js'));
  const FX = require(path.join(__dirname, '..', 'js', 'features.js'));
  const { ipcMain, file, backup, settings, fixedDay, guard, features } = o;
  const OFF_FID = { meal: 'meal' }; // 대화창 쓰기 중 습관 줄과 이어진 것 = 식사뿐
  const isOff = (kind, cur) => { const fid = OFF_FID[kind]; if (!features || !fid) return false; return !LT.hasHabit(LT.splitLines(cur), FX.get(fid).habit) && features.isSeen(fid); };
  // 기록 날짜: 하루의 경계 settings.DAY_START_HOUR(기본 6시). 시험(PH_SHOTS + PH_TODAY)에서만 고정 날짜
  const day = () => (fixedDay && fixedDay()) || LL.logDay(Date.now(), settings.DAY_START_HOUR);
  const str = (v) => (v == null ? '' : v);

  // verify(옛 글, 새 글, 날짜) = 바뀐 줄 검사. 없으면 onlyLogChanged (오늘 줄 하나)
  function write(kind, req, plan, verify) {
    if (guard) guard();
    if (!req || typeof req !== 'object') throw new Error('요청 형식 오류');
    const seen = req.lastModified;
    const cur = fs.readFileSync(file, 'utf8'), mtime = fs.statSync(file).mtimeMs;
    if (typeof seen !== 'number' || Math.abs(seen - mtime) > 1) return { ok: false, conflict: true, text: cur, lastModified: mtime };
    const date = day();
    if (isOff(kind, cur)) return { ok: false, off: true, text: cur, lastModified: mtime, date };
    const r = plan(cur, date);
    if (!r.changed) return { ok: true, unchanged: true, text: cur, lastModified: mtime, date };
    if (!(verify ? verify(cur, r.text, date) : LL.onlyLogChanged(cur, r.text, kind, date))) throw new Error('## ' + LL.SECTIONS[kind].name + ' 표 밖이 바뀌려 해서 멈춤');
    const dir = backup(cur);
    fs.writeFileSync(file, r.text);
    return { ok: true, text: r.text, lastModified: fs.statSync(file).mtimeMs, date, line: r.line, inserted: r.inserted, created: r.created, backupDir: dir };
  }
  const isStr = (v) => v == null || typeof v === 'string';
  function check(...vals) { if (!vals.every(isStr)) throw new Error('값 형식 오류'); }

  ipcMain.handle('ph:setSleep', (e, req) => write('sleep', req, (cur, date) => {
    check(req.bed, req.wake, req.memo);
    return LL.setSleep(cur, { date, bed: str(req.bed), wake: str(req.wake), memo: str(req.memo) });
  }));
  // req = { from: 'YYYY-MM-DD HH:MM', hours: 1~24(기본 24), segments: [{ a, b, light, memo } 또는 { start, end, light, memo }], dropOpen: ['YYYY-MM-DD HH:MM'](없어도 됨), lastModified }
  //   dropOpen = 창 안 "잔 시각만·깬 시각만" 줄 중 지울 것 (2026-10-09 칠하기 창). 창 밖이나 구간 줄은 이 목록으로 못 지움 (js/life_log.js)
  ipcMain.handle('ph:setSleepWindow', (e, req) => write('sleep', req, (cur) => {
    if (typeof req.from !== 'string' || !(req.hours == null || Number.isInteger(req.hours)) || !Array.isArray(req.segments) || !(req.dropOpen == null || Array.isArray(req.dropOpen))) throw new Error('값 형식 오류');
    return LL.setSleepWindow(cur, { from: req.from, hours: req.hours, segments: req.segments, dropOpen: req.dropOpen });
  }, (cur, next) => LL.onlySleepWindowChanged(cur, next, req.from, req.hours, req.dropOpen)));
  ipcMain.handle('ph:addMeal', (e, req) => write('meal', req, (cur, date) => {
    check(req.kind, req.text);
    // 시각 = 지금 시계 'HH:MM' (식사 일지 표 시각 칸, logs 브랜치 2026-10-04). 날짜는 위 하루 경계 6시 기준 그대로
    const n = new Date(), p2 = (x) => String(x).padStart(2, '0');
    return LL.addMeal(cur, { date, kind: req.kind, text: str(req.text), time: p2(n.getHours()) + ':' + p2(n.getMinutes()) });
  }));
  ipcMain.handle('ph:setNote', (e, req) => write('note', req, (cur, date) => {
    check(req.text, req.mood);
    // mood = 기분 칸 (D 기분 4칸, life_log.js MOODS 중 하나). 안 보내면(undefined/null) 고칠 때 그 줄 기분 그대로, 새 줄은 빈칸
    return LL.setNote(cur, { date, text: str(req.text), fix: req.fix === true, mood: req.mood == null ? undefined : req.mood });
  }));
};

};
RT.MODS["/app/electron/life_check_ipc.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 생활 습관 체크 쓰기 (메인 프로세스): 주 N회 칸, 기록 습관 양, 안전장치 주간 확인. 물컵(ph:setWater)과 같은 안전 규칙.
//   - 대상 파일·섹션·날짜(오늘·이번 주)는 모두 메인이 정한다. 화면은 습관 이름·값과 "읽은 시각"만 보낸다 (경로를 보낼 수 없음)
//   - 습관 이름은 파일의 ## 생활습관 표에 있는 것만, 종류·주기도 메인이 다시 확인
//   - 앱이 읽은 뒤 파일이 바뀌었으면 쓰지 않고 새 글을 돌려줌 (conflict)
//   - 쓰기 직전 백업(main.js backup), 바뀐 줄 검사(습관 기록 = onlyRecordsRowChanged, 안전장치 확인 = onlyLogChanged)
// main.js에서 한 번 부른다: require('./life_check_ipc.js')({ ipcMain, file, backup, settings, fixedDay, guard })
'use strict';
const fs = require('fs');
const path = require('path');

module.exports = function register(o) {
  const J = (f) => require(path.join(__dirname, '..', 'js', f));
  const Md = J('life_md.js'), LW = J('life_write.js'), LL = J('life_log.js'), LC = J('life_check.js'), HC = J('habit_cycle.js');
  const { ipcMain, file, backup, settings, fixedDay, guard } = o;
  // 기록 날짜: 하루 경계 settings.DAY_START_HOUR(6시). 시험(PH_SHOTS + PH_TODAY)에서만 고정 날짜
  const day = () => (fixedDay && fixedDay()) || Md.logDay(Date.now(), settings.DAY_START_HOUR);

  // kind: 'records' (습관 기록 표 오늘 줄) | 'safety' (안전장치 확인 표). plan(cur, date, parsed) -> { text, changed, ... }
  function write(kind, req, plan) {
    if (guard) guard();
    if (!req || typeof req !== 'object') throw new Error('요청 형식 오류');
    const seen = req.lastModified;
    const cur = fs.readFileSync(file, 'utf8'), mtime = fs.statSync(file).mtimeMs;
    if (typeof seen !== 'number' || Math.abs(seen - mtime) > 1) return { ok: false, conflict: true, text: cur, lastModified: mtime };
    const date = day();
    const r = plan(cur, date, Md.parse(cur));
    if (r.stale) return Object.assign({ ok: false, text: cur, lastModified: mtime, date }, r);
    const extra = { date, line: r.line, inserted: r.inserted, created: r.created };
    ['done', 'value', 'prev', 'week', 'item', 'result', 'habit'].forEach((k) => { if (r[k] !== undefined) extra[k] = r[k]; });
    if (!r.changed) return Object.assign({ ok: true, unchanged: true, text: cur, lastModified: mtime }, extra);
    const safe = kind === 'safety' ? LL.onlyLogChanged(cur, r.text, 'safety', r.week) : LW.onlyRecordsRowChanged(cur, r.text);
    if (!safe) throw new Error((kind === 'safety' ? '## 안전장치 확인' : '## 습관 기록') + ' 표 밖이 바뀌려 해서 멈춤');
    const dir = backup(cur);
    fs.writeFileSync(file, r.text);
    return Object.assign({ ok: true, text: r.text, lastModified: fs.statSync(file).mtimeMs, backupDir: dir }, extra);
  }
  const habitRow = (d, name) => ((d.habits && d.habits.rows) || []).find((r) => r.name === name);
  const isName = (v) => typeof v === 'string' && v.length > 0 && v.length <= 40;

  // E 주 N회: 오늘 했음/안 했음 뒤집기. 목표 습관(주기 "주 N회") 또는 "오늘" 카드로 올라온 안전장치(주 N회)만
  ipcMain.handle('ph:toggleWeekly', (e, req) => write('records', req, (cur, date, d) => {
    if (!isName(req.habit)) throw new Error('습관 이름 오류');
    const row = habitRow(d, req.habit);
    // 2026-10-04 습관 편집: 목표 습관은 주 N회 + 월 N회 + 매일 1회(오늘 한 칸)도 뒤집기 (js/habit_cycle.js isToggle). 올라온 안전장치는 주 N회만 (그대로)
    const up = row && LC.weeklyOf(row.cycle) && LC.promoted(d.habits.rows, LC.safetyRows(cur), date).some((p) => p.name === row.name);
    if (!row || !(up || (row.kind === LC.KIND.goal && !row.slots && HC.isToggle(row.cycle)))) throw new Error('오늘 카드에서 뒤집는 습관이 아님: ' + req.habit);
    const r = LC.toggleWeekly(cur, { habit: row.name, date });
    const after = HC.countFor(Md.parse(r.text).records, row, date);
    return Object.assign(r, { habit: row.name, value: after.count });
  }));

  // 기록 습관 양: 종류 "기록", 단위 = 기준 칸. mode 'add' | 'set'
  ipcMain.handle('ph:addAmount', (e, req) => write('records', req, (cur, date, d) => {
    if (!isName(req.habit)) throw new Error('습관 이름 오류');
    const row = habitRow(d, req.habit), unit = row && LC.unitOf(row.target);
    if (!row || row.kind !== LC.KIND.log || !unit) throw new Error('양을 적는 기록 습관이 아님: ' + req.habit);
    const r = LC.addAmount(cur, { habit: row.name, unit, value: req.value, mode: req.mode, date });
    return Object.assign(r, { habit: row.name });
  }));

  // I 안전장치 확인: week = 화면이 보고 있던 주(월요일). 메인의 이번 주와 다르면(그사이 주가 바뀜) 쓰지 않고 stale
  ipcMain.handle('ph:setSafetyCheck', (e, req) => write('safety', req, (cur, date, d) => {
    const week = Md.weekStart(date);
    if (req.week !== week) return { stale: true, week };
    if (!isName(req.item)) throw new Error('항목 오류');
    const row = habitRow(d, req.item);
    if (!row || row.kind !== LC.KIND.safety) throw new Error('안전장치 항목이 아님: ' + req.item);
    if (!LC.RESULTS[req.result]) throw new Error('결과 오류');
    const r = LC.setSafetyCheck(cur, { week, item: row.name, result: req.result });
    return Object.assign(r, { week, item: row.name, result: req.result });
  }));
};

};
RT.MODS["/app/electron/study_ipc.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 공부 간트 쓰기 (메인 프로세스, 2026-10-03 비트 B). 물컵·대화창(electron/life_log_ipc.js)과 같은 안전 규칙.
//   - 대상 파일(settings.LIFE_FILE)·섹션·오늘 날짜는 메인이 정한다. 화면은 공부 이름·값·"읽은 시각"만 보낸다 (경로를 보낼 수 없음)
//   - 앱이 읽은 뒤 파일이 바뀌었으면 쓰지 않고 새 글을 돌려줌 (conflict -> 화면이 다시 그림)
//   - 값 검사(날짜 YYYY-MM-DD, 이름에 | , / 금지, 메모 | -> ｜, 길이)는 js/study_write.js
//   - 쓰기 직전 백업(main.js backup), 바뀐 줄 검사(onlyStudyChanged / onlyStudyLogChanged)를 통과해야 씀
//   - 이름 바꾸기는 ## 공부 표 한 줄 + 지난 기록 이름(record_rename.js onlyNamesRenamed)만. 지난 기록에만 남은 이름이면 { ok: false, code: 'usedName' }
// 여는 함수 (정해진 것만): addStudy, updateStudy(이름, {start, end, memo, newName}), archiveStudy, restoreStudy(보관 되돌리기), logStudyToday
// main.js에서 한 번 부른다: require('./study_ipc.js')({ ipcMain, file, backup, settings, fixedDay, guard })
'use strict';
const fs = require('fs');
const path = require('path');

module.exports = function register(o) {
  const SW = require(path.join(__dirname, '..', 'js', 'study_write.js'));
  const RR = require(path.join(__dirname, '..', 'js', 'record_rename.js'));
  require(path.join(__dirname, '..', 'js', 'table_section.js'));
  const SP = require(path.join(__dirname, '..', 'js', 'study_parts.js'));
  const SPL = require(path.join(__dirname, '..', 'js', 'study_plan.js'));
  const { ipcMain, file, backup, settings, fixedDay, guard } = o;
  const day = () => (fixedDay && fixedDay()) || SW.logDay(Date.now(), settings.DAY_START_HOUR);

  // kind: 'study' = ## 공부·## 공부 보관만 / 'log' = ## 습관 기록 오늘 줄만
  function write(kind, op, req, plan) {
    if (guard) guard();
    if (!req || typeof req !== 'object') throw new Error('요청 형식 오류');
    if (typeof req.name !== 'string') throw new Error('이름 형식 오류');
    const seen = req.lastModified;
    const cur = fs.readFileSync(file, 'utf8'), mtime = fs.statSync(file).mtimeMs;
    if (typeof seen !== 'number' || Math.abs(seen - mtime) > 1) return { ok: false, conflict: true, text: cur, lastModified: mtime };
    const date = day();
    let r;
    try { r = plan(cur, date); } catch (e) { if (e.code) return { ok: false, code: e.code, message: e.message, text: cur, lastModified: mtime, date, usedName: e.usedName || null, lastDate: e.lastDate || null, plans: e.plans || null }; throw e; } // plans = 기간 밖 세부 계획 (planOut). usedName: 막은 이름·마지막 기록 날 (안내용)
    if (!r.changed) return { ok: true, unchanged: true, text: cur, lastModified: mtime, date, name: r.name, hours: r.hours };
    // 고치기: 1단계(## 공부 표 한 줄)와 2단계(지난 기록 이름 oldName -> name)를 따로 검사
    const staged = typeof r.mid === 'string';
    const safe = kind === 'log' ? SW.onlyStudyLogChanged(cur, r.text, date)
      : staged ? SW.onlyStudyChanged(cur, r.mid, op) && (r.text === r.mid || (!!r.oldName && RR.onlyNamesRenamed(r.mid, r.text, r.oldName, r.name)))
      : SW.onlyStudyChanged(cur, r.text, op);
    if (!safe) throw new Error((kind === 'log' ? '## 습관 기록 오늘 줄' : '## 공부 표') + ' 밖이 바뀌려 해서 멈춤');
    // 3단계 (2026-10-08): 과목 이름이 바뀌면 ## 공부 단원 표의 과목 칸도 따라감 (그 칸만 바뀌었는지 따로 검사)
    if (staged && r.oldName && r.name && r.oldName !== r.name) {
      const t3 = SP.renameSubject(r.text, r.oldName, r.name);
      if (t3.changed) { if (!SP.onlySubjectRenamed(r.text, t3.text, r.oldName, r.name)) throw new Error('## 공부 단원 표 밖이 바뀌려 해서 멈춤'); r.text = t3.text; }
    }
    const dir = backup(cur);
    fs.writeFileSync(file, r.text);
    return { ok: true, text: r.text, lastModified: fs.statSync(file).mtimeMs, date, op: r.op, name: r.name, oldName: r.oldName, prev: r.prev, renamedRecords: r.renamedRecords, hours: r.hours, line: r.line, created: r.created, backupDir: dir };
  }
  const isStr = (v) => v == null || typeof v === 'string';
  function cleanPatch(p) { // 정해진 칸만 (start, end, memo, newName), 모두 글자
    if (!p || typeof p !== 'object' || Array.isArray(p)) throw new Error('고칠 값 형식 오류');
    const out = {};
    Object.keys(p).forEach((k) => {
      if (!['start', 'end', 'memo', 'newName'].includes(k)) throw new Error('모르는 칸: ' + k);
      if (!isStr(p[k])) throw new Error('값 형식 오류: ' + k);
      if (p[k] != null) out[k] = p[k];
    });
    return out;
  }

  ipcMain.handle('ph:studyAdd', (e, req) => write('study', 'add', req, (cur, date) => {
    if (!isStr(req.start) || !isStr(req.memo)) throw new Error('값 형식 오류');
    return SW.addStudy(cur, { name: req.name, start: req.start || date, memo: req.memo || '' });
  }));
  // 고치기 (기간 띠 끌기·키보드). 2026-10-08: 세부 계획이 새 기간 밖으로 나가면 막음 (code planOut)
  ipcMain.handle('ph:studyUpdate', (e, req) => write('study', 'update', req, (cur) => {
    const p = cleanPatch(req.patch), r = SW.updateStudy(cur, req.name, p);
    if (r.changed && (p.start != null || p.end != null)) { const row = SW.parse(r.text).study.find((x) => x.name === r.name); if (row) SPL.checkInside(cur, req.name, row.start, row.end); }
    return r;
  }));
  ipcMain.handle('ph:studyArchive', (e, req) => write('study', 'archive', req, (cur, date) => SW.archiveStudy(cur, req.name, { date })));
  ipcMain.handle('ph:studyRestore', (e, req) => write('study', 'restore', req, (cur) => SW.restoreStudy(cur, req.name)));
  // 공부 [추가 | 수정] 창 한 번 저장 (2026-10-08 3-1단계): ## 공부 줄 + ## 공부 단원(세부 계획) 여러 줄을 쓰기 한 번에. 단계마다 섹션 검사는 js/study_plan.js save
  ipcMain.handle('ph:studySave', (e, req) => {
    if (guard) guard();
    if (!req || typeof req !== 'object') throw new Error('요청 형식 오류');
    const seen = req.lastModified;
    const cur = fs.readFileSync(file, 'utf8'), mtime = fs.statSync(file).mtimeMs;
    if (typeof seen !== 'number' || Math.abs(seen - mtime) > 1) return { ok: false, conflict: true, text: cur, lastModified: mtime };
    const q = { mode: req.mode, name: typeof req.name === 'string' ? req.name : '', study: cleanStudy(req.study), plans: cleanPlans(req.plans), removed: cleanSigs(req.removed) };
    let r;
    try { r = SPL.save(cur, q); } catch (x) { if (x.code) return { ok: false, code: x.code, message: x.message, plans: x.plans || null, part: x.part || null, text: cur, lastModified: mtime, usedName: x.usedName || null, lastDate: x.lastDate || null }; throw x; }
    if (!r.changed) return { ok: true, unchanged: true, text: cur, lastModified: mtime, name: r.name };
    const dir = backup(cur);
    fs.writeFileSync(file, r.text);
    return { ok: true, text: r.text, lastModified: fs.statSync(file).mtimeMs, name: r.name, oldName: r.oldName, steps: r.steps, backupDir: dir };
  });
  // 세부 계획 막대 끌기 (2026-10-08 3-1단계 피드백 2): ## 공부 단원 한 줄의 기간만. 상위 공부 기간 밖이면 code planOut (안 씀)
  ipcMain.handle('ph:planMove', (e, req) => {
    if (guard) guard();
    if (!req || typeof req !== 'object') throw new Error('요청 형식 오류');
    if (typeof req.sig !== 'string' || req.sig.length > 4000 || typeof req.from !== 'string' || typeof req.to !== 'string' || req.from.length > 20 || req.to.length > 20) throw new Error('값 형식 오류');
    const seen = req.lastModified;
    const cur = fs.readFileSync(file, 'utf8'), mtime = fs.statSync(file).mtimeMs;
    if (typeof seen !== 'number' || Math.abs(seen - mtime) > 1) return { ok: false, conflict: true, text: cur, lastModified: mtime };
    let r;
    try { r = SPL.movePlan(cur, req.sig, req.from, req.to); } catch (x) { if (x.code) return { ok: false, code: x.code, message: x.message, plans: x.plans || null, part: x.part || null, start: x.start || null, end: x.end || null, text: cur, lastModified: mtime }; throw x; }
    if (!r.changed) return { ok: true, unchanged: true, text: cur, lastModified: mtime, part: r.part };
    if (!SP.onlyPartsChanged(cur, r.text, 'update')) throw new Error('## 공부 단원 표 밖이 바뀌려 해서 멈춤');
    const dir = backup(cur);
    fs.writeFileSync(file, r.text);
    return { ok: true, text: r.text, lastModified: fs.statSync(file).mtimeMs, part: r.part, subject: r.subject, backupDir: dir };
  });
  const s200 = (v) => typeof v === 'string' && v.length <= 200;
  function cleanStudy(o) { if (!o || typeof o !== 'object' || Array.isArray(o)) throw new Error('공부 값 형식 오류'); ['name', 'start', 'end', 'memo'].forEach((k) => { if (o[k] != null && !s200(o[k])) throw new Error('값 형식 오류: ' + k); }); return { name: o.name || '', start: o.start || '', end: o.end || '', memo: o.memo || '' }; }
  function cleanPlans(a) { if (a == null) return []; if (!Array.isArray(a) || a.length > 30) throw new Error('세부 계획 형식 오류'); return a.map((p) => { if (!p || typeof p !== 'object') throw new Error('세부 계획 형식 오류'); ['sig', 'part', 'from', 'to'].forEach((k) => { if (p[k] != null && !(typeof p[k] === 'string' && p[k].length <= 4000)) throw new Error('값 형식 오류: ' + k); }); return { sig: p.sig || null, part: p.part || '', from: p.from || '', to: p.to || '' }; }); }
  function cleanSigs(a) { if (a == null) return []; if (!Array.isArray(a) || a.length > 30 || a.some((x) => typeof x !== 'string' || x.length > 4000)) throw new Error('줄 고르기 형식 오류'); return a; }
  ipcMain.handle('ph:studyLog', (e, req) => write('log', 'log', req, (cur, date) => {
    if (req.add !== 1 && req.add !== -1) throw new Error('시간 오류');
    return SW.logStudyToday(cur, req.name, { date, add: req.add });
  }));
};

};
RT.MODS["/app/js/table_section.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 생활 기록 파일의 "표 하나짜리 섹션" 쓰기 공용 도구 (2026-10-08 비트, 기록 기능 넓히기). 그림·파일 접근 없음: 글을 받아 새 글을 돌려준다.
// 쓰는 곳: js/record_write.js (## 기록, ## 기록 항목), js/study_parts.js (## 공부 단원). 메인(electron/record_ipc.js)·화면·Node 시험이 같이 쓴다.
// 원칙은 독서·약속 쓰기와 같다: 한 줄 더하기 / 그 줄만 바꾸기 / 한 줄 빼기. 다른 줄은 한 글자도 안 바뀐다. 메인은 쓰기 직전에 onlyRowsChanged로 다시 확인한다.
//   spec = { name: '기록', head: ['항목', '날짜', '제목', '요약'], before: ['버킷리스트'] (섹션이 없을 때 만들 자리: 이 섹션들 중 처음 것 바로 앞, 없으면 파일 끝) }
//   줄 고르기 = 읽은 그 줄 글(sig, 앞뒤 공백 뺀 것). 같은 글이 둘이면 마지막 줄 (어느 쪽이든 파일 글은 같음. 약속 쓰기와 같은 규칙)
// 칸 글 안전 표시 (독서 book_write.js와 같음): 쓸 때 \ -> \\, | -> \|, < -> \<, 줄바꿈 -> <br>. 읽을 때 되돌림
(function (root) {
  'use strict';
  const Md = root.PHLifeMd || (typeof require !== 'undefined' ? require('./life_md.js') : null);

  function encode(s) { return String(s).replace(/\r\n?/g, '\n').replace(/[\\|<]/g, (c) => '\\' + c).replace(/\n/g, '<br>'); }
  function decode(s) {
    let out = ''; const t = String(s);
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (c === '\\' && i + 1 < t.length) { out += t[i + 1]; i++; continue; }
      if (c === '<' && t.slice(i, i + 4).toLowerCase() === '<br>') { out += '\n'; i += 3; continue; }
      out += c;
    }
    return out;
  }
  function splitRow(l) {
    let t = String(l).trim();
    if (t.startsWith('|')) t = t.slice(1);
    const out = []; let cur = '';
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (c === '\\' && i + 1 < t.length) { cur += c + t[i + 1]; i++; continue; }
      if (c === '|') { out.push(cur.trim()); cur = ''; continue; }
      cur += c;
    }
    if (cur.trim() !== '') out.push(cur.trim());
    return out;
  }
  const rowText = (cells) => '| ' + cells.join(' | ') + ' |';
  const sepText = (n) => '|' + Array(n).fill('---').join('|') + '|';
  const isRow = (l) => /^\s*\|/.test(l);
  const isSep = (l) => /^\s*\|?\s*:?-{3,}/.test(l);
  const splitLines = (src) => String(src).split(/\r?\n/);
  const nlOf = (src) => (/\r\n/.test(src) ? '\r\n' : '\n');
  const err = (code, msg) => { const e = new Error(msg || code); e.code = code; return e; };

  function findSection(lines, name) {
    const all = Md.sections(lines).filter((s) => s.name === name);
    if (all.length > 1) throw err('dupSection', '같은 섹션이 둘: ## ' + name);
    return all[0] || null;
  }
  function tableOf(lines, sec) {
    if (!sec) return null;
    let i = sec.start; while (i < sec.end && !isRow(lines[i])) i++;
    if (i >= sec.end) return null;
    const head = splitRow(lines[i]);
    let sep = i + 1; if (!(sep < sec.end && isSep(lines[sep]))) sep = null;
    let end = (sep == null ? i : sep) + 1;
    const rows = [];
    while (end < sec.end && isRow(lines[end])) { if (!isSep(lines[end])) rows.push({ line: end, raw: lines[end], cells: splitRow(lines[end]) }); end++; }
    return { headLine: i, head, sepLine: sep, rows, endLine: end };
  }
  function locate(lines, spec) {
    const sec = findSection(lines, spec.name); if (!sec) return { sec: null, t: null };
    const t = tableOf(lines, sec);
    if (t && t.head.join('|') !== spec.head.join('|')) throw err('badHead', '## ' + spec.name + ' 표 머리가 달라서 멈춤');
    return { sec, t };
  }
  // 읽기: [{ line, raw(앞뒤 공백 뺀 줄 글 = sig), cells: { 머리: 풀어 쓴 값 } }] 파일 순서
  function read(src, spec) {
    const lines = Array.isArray(src) ? src : splitLines(src);
    let loc; try { loc = locate(lines, spec); } catch (e) { return { rows: [], error: e.message, has: true }; }
    if (!loc.t) return { rows: [], has: !!loc.sec };
    return { has: true, rows: loc.t.rows.map((r) => { const c = {}; spec.head.forEach((h, k) => { c[h] = decode(r.cells[k] == null ? '' : r.cells[k]); }); return { line: r.line, raw: r.raw.trim(), cells: c }; }) };
  }
  const out = (src, lines, extra) => Object.assign({ text: lines.join(nlOf(src)), changed: true }, extra);
  function findRow(t, sig) {
    const hits = t ? t.rows.filter((r) => r.raw.trim() === String(sig).trim()) : [];
    if (!hits.length) throw err('notFound', '줄 없음');
    return hits[hits.length - 1];
  }
  // 더하기: 표 끝 (opt.before = 그 줄 글 앞에 끼움, 지우기 되돌리기용. 못 찾으면 표 끝). opt.raw = 되돌리기 때 원래 줄 글자 그대로
  function addRow(src, spec, cells, opt) {
    opt = opt || {};
    const lines = splitLines(src), { sec, t } = locate(lines, spec);
    const row = opt.raw != null ? String(opt.raw).trim() : rowText(cells);
    if (!sec) {
      const block = ['## ' + spec.name, rowText(spec.head), sepText(spec.head.length), row, ''];
      const bs = (spec.before || []).map((n) => findSection(lines, n)).filter(Boolean).sort((a, b) => a.line - b.line)[0];
      let at;
      if (bs) at = bs.line;
      else { at = lines.length; while (at > 0 && lines[at - 1] === '') at--; block.unshift(''); block.pop(); }
      lines.splice(at, 0, ...block);
      return out(src, lines, { op: 'add', line: at + block.indexOf(row), created: true, after: row });
    }
    if (!t) {
      let at = sec.end; while (at > sec.start && lines[at - 1].trim() === '') at--;
      lines.splice(at, 0, rowText(spec.head), sepText(spec.head.length), row);
      return out(src, lines, { op: 'add', line: at + 2, created: false, after: row });
    }
    let at = t.endLine;
    if (opt.before != null) { const b = t.rows.filter((r) => r.raw.trim() === String(opt.before).trim()); if (b.length) at = b[0].line; }
    lines.splice(at, 0, row);
    return out(src, lines, { op: 'add', line: at, created: false, after: row });
  }
  // 고치기: 같은 자리 그 줄만. cells(encode된 칸) 또는 opt.raw(되돌리기: 이전 줄 글자 그대로)
  function updateRow(src, spec, sig, cells, opt) {
    opt = opt || {};
    const lines = splitLines(src), { t } = locate(lines, spec), r = findRow(t, sig);
    const after = opt.raw != null ? String(opt.raw).trim() : rowText(cells), before = lines[r.line].trim();
    if (after === before) return { text: src, changed: false, op: 'update', line: r.line, before, after };
    lines[r.line] = after;
    return out(src, lines, { op: 'update', line: r.line, before, after });
  }
  // 빼기: 그 줄만. next = 뒤 줄 글 (되돌리기 때 그 앞에 다시 끼움, 마지막 줄이면 null)
  function removeRow(src, spec, sig) {
    const lines = splitLines(src), { t } = locate(lines, spec), r = findRow(t, sig);
    const i = t.rows.indexOf(r), next = t.rows[i + 1] ? t.rows[i + 1].raw.trim() : null, before = lines[r.line].trim();
    lines.splice(r.line, 1);
    return out(src, lines, { op: 'remove', line: r.line, before, next });
  }

  // ---- 안전 검사 (메인이 쓰기 직전에) ----
  //   섹션 밖은 한 글자도 같음 (새 섹션을 만들 때만 끝 빈 줄 차이 허용), 섹션 안 표 아닌 줄·머리도 같음
  //   줄 수 변화가 op와 맞음: add = 한 줄 생김 / update = 같은 자리 한 줄 / remove = 한 줄 빠짐. 생기거나 바뀐 줄은 okCells(풀어 쓴 칸 배열)를 통과
  function onlyRowsChanged(oldText, newText, spec, op, okCells) {
    try {
      const a = splitLines(oldText), b = splitLines(newText);
      const A = findSection(a, spec.name), B = findSection(b, spec.name);
      if (!B) return false;
      const cut = (L, s) => (s ? L.slice(0, s.line).concat(L.slice(s.end)) : L.slice());
      const ra = cut(a, A), rb = cut(b, B), trim = (x) => { const c = x.slice(); while (c.length && c[c.length - 1].trim() === '') c.pop(); return c; };
      if (ra.join('\n') !== rb.join('\n')) { if (A || trim(ra).join('\n') !== trim(rb).join('\n')) return false; }
      if (!A) { // 새로 만든 섹션: before 섹션 바로 앞이거나 파일 끝
        const secs = Md.sections(b), next = secs.find((z) => z.line === B.end), want = (spec.before || []).filter((n) => secs.some((z) => z.name === n));
        if (want.length ? !(next && want.includes(next.name)) : B.end !== b.length) return false;
      }
      const ta = A ? tableOf(a, A) : null, tb = tableOf(b, B); if (!tb || tb.head.join('|') !== spec.head.join('|') || tb.sepLine == null) return false;
      const prose = (L, s, t) => (s ? trim(L.slice(s.line, s.end).filter((l, i) => !(t && s.line + i >= t.headLine && s.line + i < t.endLine))).join('\n') : '## ' + spec.name);
      if (prose(a, A, ta) !== prose(b, B, tb)) return false;
      const ra2 = ta ? ta.rows.map((r) => r.raw.trim()) : [], rb2 = tb.rows.map((r) => r.raw.trim());
      const diff = (xs, ys) => { const m = new Map(); xs.forEach((v) => m.set(v, (m.get(v) || 0) + 1)); const extra = []; ys.forEach((v) => { if (m.get(v)) m.set(v, m.get(v) - 1); else extra.push(v); }); return extra; };
      const gone = diff(rb2, ra2), added = diff(ra2, rb2);
      // seed = 섹션이 없던 파일에 섹션을 새로 만들며 줄 0~8개 (기록 항목: 기본 칸을 실제 줄로 적을 때, 2026-10-08 피드백 4. 0개 = 기본 영화 한 칸을 지움). 기존 섹션에는 못 씀
      const want = op === 'seed' ? (A || added.length > 8 ? null : [0, added.length]) : { add: [0, 1], update: [1, 1], remove: [1, 0] }[op]; if (!want) return false;
      if (gone.length !== want[0] || added.length !== want[1]) return false;
      const ok = (l) => { if (/[\r\n]/.test(l)) return false; const c = splitRow(l); return c.length === spec.head.length && !!okCells(c.map(decode)); };
      if (op === 'update' && ra2.indexOf(gone[0]) !== rb2.indexOf(added[0])) return false;
      return added.every(ok);
    } catch (e) { return false; }
  }

  const TS = { encode, decode, splitRow, rowText, sepText, splitLines, nlOf, findSection, tableOf, locate, read, addRow, updateRow, removeRow, onlyRowsChanged, err };
  root.PHTableSection = TS;
  if (typeof module !== 'undefined' && module.exports) module.exports = TS;
})(typeof window !== 'undefined' ? window : globalThis);

};
RT.MODS["/app/js/study_parts.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 공부 단원 (2026-10-08 비트, 로드맵 3단계 "공부"). 그림·파일 접근 없음. 메인(electron/record_ipc.js)·화면(js/study_gantt.js, js/study_grass.js)·Node 시험이 같이 쓴다.
// 제작자 2026-10-08: 과목마다 시작일·끝일(기존 ## 공부 표 그대로), 과목 안에서 쪼개기(1단원, 1단원 복습 …),
//   막대는 끊겨도 됨, 막대 있음 = 공부함(계획이자 기록), "공부했어요·끝냈어요" 버튼 없음 -> 칸을 눌러 칠하고 다시 누르면 지움
// 새 섹션 하나 (기존 파서 js/life_md.js는 모르는 섹션을 건너뜀):
//   ## 공부 단원   | 과목 | 단원 | 한 날 |
//     과목 = ## 공부 표 이름, 단원 = 쪼갠 이름 (쪼개지 않은 과목은 "전체" 한 줄), 한 날 = 칠한 날 "2026-10-01~2026-10-03, 2026-10-05" (이어진 날은 ~로 묶음)
//   새로 만들 자리: ## 습관 기록 바로 앞 (없으면 ## 약속·## 버킷리스트 앞, 다 없으면 파일 끝)
// 과목 이름을 바꾸면 이 표의 과목 칸도 같이 바뀜 (electron/study_ipc.js). 과목을 보관·삭제해도 단원 줄은 남음 (되돌리면 다시 보임)
(function (root) {
  'use strict';
  const TS = root.PHTableSection || (typeof require !== 'undefined' ? require('./table_section.js') : null);
  const SPEC = { name: '공부 단원', head: ['과목', '단원', '한 날'], before: ['습관 기록', '약속', 'Meeting', '버킷리스트'] };
  const WHOLE = '전체', PART_MAX = 20, MAX_DAYS = 3000;
  // 과목 색 (무늬 기록기능디자인 v01 5-1: 추가한 순서대로 6색 돌려 씀). bg = 막대 바탕, deep = 짙은 쪽(잔디 3단)
  const COLORS = [
    { name: '잎', bg: '#8DB583', deep: '#5F8A5A' }, { name: '하늘', bg: '#6F8FB5', deep: '#4E6E96' }, { name: '귤', bg: '#E59A4F', deep: '#BC8456' },
    { name: '장미', bg: '#CF8E8E', deep: '#A85E5E' }, { name: '겨자', bg: '#E9C35C', deep: '#C79A3E' }, { name: '이끼', bg: '#6F8E79', deep: '#4F6954' },
  ];
  const colorOf = (i) => COLORS[((i % COLORS.length) + COLORS.length) % COLORS.length];

  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  function isDate(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const [y, m, d] = s.split('-').map(Number), x = new Date(y, m - 1, d);
    return x.getFullYear() === y && x.getMonth() === m - 1 && x.getDate() === d;
  }
  function addDays(s, n) { const [y, m, d] = s.split('-').map(Number); return ymd(new Date(y, m - 1, d + n, 12)); }
  function diffDays(a, b) { const [y1, m1, d1] = a.split('-').map(Number), [y2, m2, d2] = b.split('-').map(Number); return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000); }
  const bad = (code, msg) => TS.err(code, msg);

  // ---- 한 날 칸 ----
  // "2026-10-01~2026-10-03, 2026-10-05" -> ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-05'] (못 읽는 조각은 bad에)
  function parseDays(s) {
    const set = new Set(), badParts = [];
    String(s || '').split(/[,，]/).map((x) => x.trim()).filter(Boolean).forEach((p) => {
      const m = /^(\d{4}-\d{2}-\d{2})(?:\s*~\s*(\d{4}-\d{2}-\d{2}))?$/.exec(p);
      if (!m || !isDate(m[1]) || (m[2] && (!isDate(m[2]) || m[2] < m[1]))) { badParts.push(p); return; }
      if (!m[2]) { set.add(m[1]); return; }
      const n = diffDays(m[1], m[2]); if (n > MAX_DAYS) { badParts.push(p); return; }
      for (let i = 0; i <= n; i++) set.add(addDays(m[1], i));
    });
    return { days: [...set].sort(), bad: badParts };
  }
  // 날짜 목록 -> 이어진 날 묶음 [{ from, to }]
  function runs(days) {
    const d = [...new Set(days)].sort(), out = [];
    d.forEach((x) => { const r = out[out.length - 1]; if (r && addDays(r.to, 1) === x) r.to = x; else out.push({ from: x, to: x }); });
    return out;
  }
  function formatDays(days) { return runs(days).map((r) => (r.from === r.to ? r.from : r.from + '~' + r.to)).join(', '); }
  function toggleDay(daysText, date) {
    const P = parseDays(daysText); if (P.bad.length) throw bad('badDays', '한 날 칸을 못 읽음');
    const has = P.days.includes(date);
    return { text: formatDays(has ? P.days.filter((x) => x !== date) : P.days.concat([date])), on: !has };
  }

  // ---- 읽기 ----
  // -> { parts: [{ subject, part, days, bad, sig, line, review }], error }
  function parse(src) {
    const R = TS.read(src, SPEC);
    const parts = R.rows.map((r) => { const P = parseDays(r.cells['한 날']); return { subject: r.cells['과목'].trim(), part: r.cells['단원'].trim(), days: P.days, bad: P.bad, daysText: r.cells['한 날'].trim(), sig: r.raw, line: r.line, review: /복습/.test(r.cells['단원']) }; });
    return { parts, error: R.error || null, has: R.has };
  }
  const partsOf = (P, subject) => P.parts.filter((p) => p.subject === subject);
  // 한 과목의 날짜별 칠한 단원 수 (잔디 단계): { 'YYYY-MM-DD': [단원 이름...] }. logged = 옛 "이름 n시간" 기록 날(있으면 한 칸으로 셈)
  function dayMap(P, subject, logged) {
    const m = {};
    partsOf(P, subject).forEach((p) => p.days.forEach((d) => { (m[d] = m[d] || []).push(p.part); }));
    Object.keys(logged || {}).forEach((d) => { if (logged[d] > 0 && !m[d]) m[d] = ['기록']; });
    return m;
  }
  const level = (n) => (n <= 0 ? 0 : n >= 3 ? 3 : n);

  // ---- 쓰기 ----
  function checkPart(s) {
    if (typeof s !== 'string') throw bad('badPart', '형식 오류');
    const t = s.replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!t || Array.from(t).length > PART_MAX || /[|\\<>,]/.test(t)) throw bad('badPart', '이름 오류');
    return t;
  }
  const cells = (subject, part, daysText) => [TS.encode(subject), TS.encode(part), daysText];
  function addPart(src, subject, part, opt) {
    if (opt && opt.raw != null) return TS.addRow(src, SPEC, null, { before: opt.before, raw: opt.raw });
    const s = String(subject || '').trim(); if (!s) throw bad('badPart', '과목 없음');
    const n = checkPart(part);
    if (partsOf(parse(src), s).some((p) => p.part === n)) throw bad('dupPart', '같은 이름이 있음');
    return Object.assign(TS.addRow(src, SPEC, cells(s, n, '')), { subject: s, part: n });
  }
  function renamePart(src, sig, newName) {
    const p = parse(src).parts.find((x) => x.sig === String(sig).trim()); if (!p) throw bad('notFound', '줄 없음');
    const n = checkPart(newName);
    if (n !== p.part && partsOf(parse(src), p.subject).some((x) => x.part === n)) throw bad('dupPart', '같은 이름이 있음');
    return Object.assign(TS.updateRow(src, SPEC, sig, cells(p.subject, n, p.daysText)), { subject: p.subject, part: n, old: p.part });
  }
  function removePart(src, sig) { return TS.removeRow(src, SPEC, sig); }
  // 칸 칠하기·지우기. 단원 줄이 없으면(쪼개지 않은 과목의 "전체") 먼저 만듦 -> op 'add'
  function toggle(src, subject, part, date) {
    if (!isDate(date)) throw bad('badDate', '날짜 오류');
    const p = partsOf(parse(src), subject).find((x) => x.part === part);
    if (!p) {
      if (part !== WHOLE) throw bad('notFound', '단원 없음');
      return Object.assign(TS.addRow(src, SPEC, cells(subject, WHOLE, date)), { on: true, date, subject, part });
    }
    const t = toggleDay(p.daysText, date);
    return Object.assign(TS.updateRow(src, SPEC, p.sig, cells(p.subject, p.part, t.text)), { on: t.on, date, subject, part });
  }
  // 과목 이름 바꾸기 따라가기 (study_ipc가 ## 공부 표를 고친 뒤 부름). 바꿀 줄이 없으면 그대로
  function renameSubject(src, oldName, newName) {
    const lines = TS.splitLines(src); let n = 0;
    let loc; try { loc = TS.locate(lines, SPEC); } catch (e) { return { text: src, changed: false, n: 0 }; }
    if (!loc.t) return { text: src, changed: false, n: 0 };
    loc.t.rows.forEach((r) => { if (TS.decode(r.cells[0]) === oldName) { const c = r.cells.slice(0, 3); while (c.length < 3) c.push(''); c[0] = TS.encode(newName); lines[r.line] = TS.rowText(c); n++; } });
    return n ? { text: lines.join(TS.nlOf(src)), changed: true, n } : { text: src, changed: false, n: 0 };
  }
  function onlySubjectRenamed(a, b, oldName, newName) {
    try {
      const A = TS.splitLines(a), B = TS.splitLines(b); if (A.length !== B.length) return false;
      const la = TS.locate(A, SPEC), lb = TS.locate(B, SPEC); if (!la.t || !lb.t) return a === b;
      const rowsA = new Map(la.t.rows.map((r) => [r.line, r]));
      for (let i = 0; i < A.length; i++) {
        if (A[i] === B[i]) continue;
        const r = rowsA.get(i); if (!r || TS.decode(r.cells[0]) !== oldName) return false;
        const c = TS.splitRow(B[i]); if (TS.decode(c[0]) !== newName || c.slice(1).join('|') !== r.cells.slice(1).join('|')) return false;
      }
      return true;
    } catch (e) { return false; }
  }
  const okCells = (c) => !!c[0].trim() && (() => { try { return checkPart(c[1]) === c[1]; } catch (e) { return false; } })() && !parseDays(c[2]).bad.length;
  function onlyPartsChanged(oldText, newText, op) { return TS.onlyRowsChanged(oldText, newText, SPEC, op, okCells); }

  const SP = { SPEC, WHOLE, PART_MAX, COLORS, colorOf, isDate, addDays, diffDays, parseDays, runs, formatDays, toggleDay, parse, partsOf, dayMap, level, checkPart,
    addPart, renamePart, removePart, toggle, renameSubject, onlySubjectRenamed, onlyPartsChanged };
  root.PHStudyParts = SP;
  if (typeof module !== 'undefined' && module.exports) module.exports = SP;
})(typeof window !== 'undefined' ? window : globalThis);

};
RT.MODS["/app/js/study_plan.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 공부 [추가 | 수정] 창 저장 + 세부 계획 (2026-10-08 비트, 로드맵 3-1단계 제작자 피드백). 그림·파일 접근 없음.
//   메인(electron/study_ipc.js ph:studySave)·화면(js/study_modal.js, js/study_gantt.js, js/study_grass.js)·Node 시험(tests/test_study_plan.js)이 같이 쓴다.
// 제작자 2026-10-08:
//   - 공부 = ## 공부 표 한 줄 (이름·시작일·끝일·메모). 추가할 때 끝일(전체 기간)도 정함
//   - 세부 계획 = ## 공부 단원 표 한 줄 (과목 = 공부 이름, 단원 = 세부 계획 이름, 한 날 = "시작~끝"). 파일 모양은 3단계 그대로 (옛 칠한 날도 그대로 읽힘)
//   - 세부 계획 기간은 상위 공부의 전체 기간 안에서만. 밖이면 막음 (code 'planOut')
//   - 공부함/안 함 체크 없음: 계획을 쓴 것 = 공부한 것. 잔디 = 계획 막대가 있는 날 (세부 계획이 있으면 세부 계획 날, 없으면 공부 전체 기간)
// 한 번 저장 = 여러 줄이 바뀌어도 쓰기 한 번 (사본 한 번). 바뀌는 단계마다 섹션 안전 검사를 따로 통과해야 함 (study_write onlyStudyChanged, study_parts onlyPartsChanged …)
(function (root) {
  'use strict';
  const req = (n) => (typeof require !== 'undefined' ? require(n) : null);
  const SW = root.PHStudyWrite || req('./study_write.js');
  const SP = root.PHStudyParts || req('./study_parts.js');
  const TS = root.PHTableSection || req('./table_section.js');
  const RR = () => root.PHRecordRename || req('./record_rename.js');
  const LABEL = () => ((root.PH_STUDY_PLAIN || {}).plan) || '세부 계획'; // 이름은 data/study_lines.js 한 곳 (제작자 확인 대기)
  const MAX_PLANS = 30;
  const bad = (code, msg, extra) => Object.assign(TS.err(code, msg), extra || {});

  // 옛 자료: 쪼개지 않은 과목의 빈 "전체" 줄(칠하기 때 생긴 것)은 세부 계획으로 안 봄
  const isPlan = (p) => !(p.part === SP.WHOLE && !p.days.length && !p.bad.length);
  // 세부 계획 목록: [{ sig, part, from, to, days, gaps(끊긴 날이 있는 옛 줄), line }]
  function plansOf(src, subject) {
    return SP.partsOf(SP.parse(src), subject).filter(isPlan).map((p) => ({ sig: p.sig, part: p.part, from: p.days[0] || '', to: p.days[p.days.length - 1] || '', days: p.days, gaps: SP.runs(p.days).length > 1, bad: p.bad.length > 0, line: p.line, review: p.review }));
  }
  const span = (from, to) => (from === to ? from : from + '~' + to);
  function checkPeriod(start, end) {
    if (!SW.isDate(start)) throw bad('badStart', '시작일 오류');
    if (!SW.isDate(end)) throw bad('badEnd', '끝일 오류');
    if (end < start) throw bad('badOrder', '끝일이 시작일보다 앞');
  }
  // 세부 계획이 상위 기간 [start, end] 안인지 (end 빈칸 = 끝 없음 옛 줄: 시작만 봄)
  function inside(days, start, end) { return days.every((d) => d >= start && (!end || d <= end)); }
  function checkInside(src, subject, start, end) {
    const out = plansOf(src, subject).filter((p) => !inside(p.days, start, end));
    if (out.length) throw bad('planOut', LABEL() + ' 기간이 공부 기간 밖: ' + out.map((p) => p.part).join(', '), { plans: out.map((p) => p.part) });
  }

  // ---- 세부 계획 한 줄 ----
  function addPlan(src, subject, part, from, to) {
    const n = SP.checkPart(part); checkPeriod(from, to);
    if (SP.partsOf(SP.parse(src), subject).some((p) => p.part === n)) throw bad('dupPart', '같은 이름이 있음', { part: n });
    return Object.assign(TS.addRow(src, SP.SPEC, [TS.encode(subject), TS.encode(n), span(from, to)]), { subject, part: n });
  }
  // 고치기: 이름·기간이 그대로면 줄도 그대로 (끊긴 날이 있는 옛 줄을 함부로 이어 붙이지 않음)
  function setPlan(src, sig, part, from, to) {
    const p = SP.parse(src).parts.find((x) => x.sig === String(sig).trim()); if (!p) throw bad('notFound', '줄 없음');
    const n = SP.checkPart(part); checkPeriod(from, to);
    if (n !== p.part && SP.partsOf(SP.parse(src), p.subject).some((x) => x.part === n)) throw bad('dupPart', '같은 이름이 있음', { part: n });
    const same = p.days.length && p.days[0] === from && p.days[p.days.length - 1] === to;
    const daysText = same ? p.daysText : span(from, to);
    return Object.assign(TS.updateRow(src, SP.SPEC, p.sig, [TS.encode(p.subject), TS.encode(n), daysText]), { subject: p.subject, part: n });
  }

  // ---- 세부 계획 막대 끌기 (2026-10-08 3-1단계 피드백 2 제작자: "공부 세부 계획도 막대기에서 길이 조정") ----
  //   sig 줄의 기간만 from~to로. 이름은 그대로. 상위 공부 전체 기간 밖이면 막음 (code planOut, 공부 막대·[수정] 창과 같은 규칙)
  //   끝 없는 옛 공부(끝일 빈칸)는 시작만 봄 (checkInside와 같음)
  function movePlan(src, sig, from, to) {
    const p = SP.parse(src).parts.find((x) => x.sig === String(sig == null ? '' : sig).trim()); if (!p) throw bad('notFound', LABEL() + ' 줄 없음');
    if (!SW.isDate(from) || !SW.isDate(to) || to < from) throw bad('planDate', LABEL() + ' 날짜 오류', { part: p.part });
    const row = SW.parse(src).study.find((x) => x.name === p.subject); if (!row || !SW.isDate(row.start)) throw bad('notFound', '공부 줄 없음');
    if (!inside([from, to], row.start, SW.isDate(row.end) ? row.end : '')) throw bad('planOut', LABEL() + ' 기간이 공부 기간 밖: ' + p.part, { plans: [p.part], start: row.start, end: row.end });
    return setPlan(src, p.sig, p.part, from, to);
  }

  // ---- 한 번 저장 ----
  //   q = { mode: 'add' | 'edit', name(edit: 지금 이름), study: { name, start, end, memo }, plans: [{ sig?, part, from, to }], removed: [sig] }
  //   -> { text, changed, name, oldName, steps: [op...] }. 값이 틀리면 code 오류 (badStart·badEnd·badOrder·planOut·dupPart·badPart·planDate·usedName …)
  function save(src, q) {
    if (!q || typeof q !== 'object') throw new Error('요청 형식 오류');
    const st = q.study || {}, plans = Array.isArray(q.plans) ? q.plans : [], removed = Array.isArray(q.removed) ? q.removed : [];
    if (plans.length > MAX_PLANS || removed.length > MAX_PLANS) throw new Error('세부 계획이 너무 많음');
    let name; try { name = SW.checkName(st.name); } catch (e) { throw bad('badName', e.message); }
    let memo; try { memo = SW.checkMemo(st.memo || ''); } catch (e) { throw bad('badMemo', e.message); }
    checkPeriod(st.start, st.end);
    // 세부 계획 값 먼저 검사 (이름·날짜·기간 안·같은 이름)
    const seen = new Set();
    plans.forEach((p) => {
      if (!p || typeof p !== 'object') throw new Error('세부 계획 형식 오류');
      let n; try { n = SP.checkPart(String(p.part == null ? '' : p.part)); } catch (e) { throw bad('badPart', LABEL() + ' 이름 오류', { part: String(p.part || '') }); }
      if (!SW.isDate(p.from) || !SW.isDate(p.to) || p.to < p.from) throw bad('planDate', LABEL() + ' 날짜 오류', { part: n });
      if (p.from < st.start || p.to > st.end) throw bad('planOut', LABEL() + ' 기간이 공부 기간 밖: ' + n, { plans: [n] });
      if (seen.has(n)) throw bad('dupPart', '같은 이름이 있음', { part: n }); seen.add(n);
    });
    let t = src; const steps = [];
    const step = (r, ok, op) => { if (!r.changed) return; if (!ok(t, r)) throw new Error('정해진 섹션 밖이 바뀌려 해서 멈춤 (' + op + ')'); t = r.text; steps.push(op); };
    const partOk = (op) => (a, r) => SP.onlyPartsChanged(a, r.text, op);
    const applyPlans = (subject) => {
      removed.forEach((sig) => { if (typeof sig !== 'string') throw new Error('줄 고르기 형식 오류'); step(SP.removePart(t, sig), partOk('remove'), 'plan:remove'); });
      plans.filter((p) => p.sig).forEach((p) => step(setPlan(t, p.sig, p.part, p.from, p.to), partOk('update'), 'plan:update'));
      plans.filter((p) => !p.sig).forEach((p) => step(addPlan(t, subject, p.part, p.from, p.to), partOk('add'), 'plan:add'));
    };
    let oldName = null;
    // 공부 표 쓰기 오류(같은 이름 등)는 글만 있는 오류라 code를 달아 화면이 칸 오류로 보이게
    const named = (f) => { try { return f(); } catch (e) { if (!e.code) e.code = /같은 이름|이름과 같아서/.test(e.message) ? 'dupName' : /이름/.test(e.message) ? 'badName' : e.code; throw e; } };
    if (q.mode === 'add') {
      step(named(() => SW.addStudy(t, { name, start: st.start, end: st.end, memo })), (a, r) => SW.onlyStudyChanged(a, r.text, 'add'), 'study:add');
      applyPlans(name);
    } else if (q.mode === 'edit') {
      oldName = String(q.name || '');
      // 세부 계획 먼저 (지금 이름으로), 그다음 공부 줄 (이름이 바뀌면 지난 기록·세부 계획 과목 칸도 따라감)
      applyPlans(oldName);
      const r = named(() => SW.updateStudy(t, oldName, { newName: name, start: st.start, end: st.end, memo }));
      step(r, (a, x) => SW.onlyStudyChanged(a, x.mid, 'update') && (x.text === x.mid || (!!x.oldName && RR().onlyNamesRenamed(x.mid, x.text, x.oldName, x.name))), 'study:update');
      if (r.changed && r.oldName && r.oldName !== r.name) {
        const t3 = SP.renameSubject(t, r.oldName, r.name);
        step(t3, (a, x) => SP.onlySubjectRenamed(a, x.text, r.oldName, r.name), 'plan:subject');
      }
    } else throw new Error('모드 오류');
    checkInside(t, name, st.start, st.end); // 손대지 않은 옛 줄까지 모두 기간 안
    return { text: t, changed: t !== src, name, oldName, steps };
  }

  // ---- 잔디: 그날 계획 막대 수 ----
  //   { 'YYYY-MM-DD': [이름...] }. 세부 계획이 있으면 그 날들, 없으면 공부 전체 기간(끝 없음 = 오늘까지). 옛 "이름 n시간" 기록 날도 한 칸
  function dayMap(src, row, records, today) {
    const m = {}, add = (d, n) => { (m[d] = m[d] || []).push(n); };
    const ps = plansOf(src, row.name);
    if (ps.length) ps.forEach((p) => p.days.forEach((d) => add(d, p.part)));
    else if (SW.isDate(row.start)) {
      const end = SW.isDate(row.end) ? row.end : today;
      for (let d = row.start, i = 0; d <= end && i < 3700; d = SW.addDays(d, 1), i++) add(d, row.name);
    }
    const logged = SW.loggedDays(records, row.name);
    Object.keys(logged).forEach((d) => { if (logged[d] > 0 && !m[d]) m[d] = ['기록']; });
    return m;
  }
  // 그 달(YYYY-MM)에 걸친 공부만 (기간이 그 달과 겹치거나, 그 달에 잔디 날이 있음)
  function inMonth(src, row, records, ym, today) {
    const first = ym + '-01', last = SW.addDays(SW.ymd(new Date(Number(ym.slice(0, 4)), Number(ym.slice(5, 7)), 1, 12).getTime()), -1);
    if (SW.isDate(row.start) && row.start <= last && (!SW.isDate(row.end) ? (row.end ? false : today >= first) : row.end >= first)) return true;
    return Object.keys(dayMap(src, row, records, today)).some((d) => d.slice(0, 7) === ym);
  }

  const SPL = { MAX_PLANS, isPlan, plansOf, span, checkPeriod, inside, checkInside, addPlan, setPlan, movePlan, save, dayMap, inMonth, LABEL };
  root.PHStudyPlan = SPL;
  if (typeof module !== 'undefined' && module.exports) module.exports = SPL;
})(typeof window !== 'undefined' ? window : globalThis);

};
RT.MODS["/app/electron/book_ipc.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 독서 책꽂이 쓰기 (메인 프로세스, 2026-10-03 비트, journal 브랜치). 물컵·공부(electron/study_ipc.js)와 같은 안전 규칙.
//   - 대상 파일(settings.LIFE_FILE)·섹션·오늘 날짜는 메인이 정한다. 화면은 책 값과 "읽은 시각"만 보낸다 (경로를 보낼 수 없음)
//   - 앱이 읽은 뒤 파일이 바뀌었으면 쓰지 않고 새 글을 돌려줌 (conflict -> 화면이 다시 그림)
//   - 값 검사(날짜, 제목 60자, 요약 2000자, 표지색 이름, 칸 글 안전 표시)는 js/book_write.js
//   - 쓰기 직전 백업(main.js backup), 바뀐 줄 검사(onlyBookChanged)를 통과해야 씀
// 여는 함수 (정해진 것만): addBook, updateBook, archiveBook, restoreBook
// 독서 기능 끄기 (2026-10-04 제작자 결정, 대변·식사 일지와 같은 규칙. features = electron/furnish_ipc.js):
//   생활습관 표에 "독서" 줄이 없고 전에 한 번이라도 있었으면(features.isSeen('reading')) 책 더하기를 거절 { ok: false, off: true }.
//   한 번도 없었으면 첫 책 더하기 때 표 끝에 "| 독서 | 기록 | 쪽 | - |" 한 줄을 같이 더하고 seen에 적음. 고치기·빼기·되돌리기는 그대로 (화면에서 들어갈 곳이 없어짐)
//   안전 검사: 더한 습관 줄 한 줄을 빼고 보면 onlyBookChanged를 통과해야 함 (js/log_table.js checkChange와 같은 방식)
// main.js에서 한 번 부른다: require('./book_ipc.js')({ ipcMain, file, backup, settings, fixedDay, guard, features })
'use strict';
const fs = require('fs');
const path = require('path');

module.exports = function register(o) {
  const BW = require(path.join(__dirname, '..', 'js', 'book_write.js'));
  const LT = require(path.join(__dirname, '..', 'js', 'log_table.js'));
  const FX = require(path.join(__dirname, '..', 'js', 'features.js'));
  const { ipcMain, file, backup, settings, fixedDay, guard, features } = o;
  const RF = FX.get('reading'), HAB = { name: RF.habit, target: RF.target };
  // 새 글에서 표 끝에 더한 독서 습관 줄 하나를 뺀 글 (없으면 null)
  function withoutHabit(oldText, newText) {
    const a = LT.splitLines(oldText), b = LT.splitLines(newText);
    if (LT.hasHabit(a, HAB.name)) return null;
    const t = LT.findSection(b, LT.HABITS) && LT.tableOf(b, LT.findSection(b, LT.HABITS));
    const hits = t ? t.rows.filter((r) => r.cells[0] === HAB.name) : [];
    if (hits.length !== 1 || b[hits[0].line] !== LT.habitRow(HAB) || hits[0].line !== t.endLine - 1) return null;
    return b.slice(0, hits[0].line).concat(b.slice(hits[0].line + 1)).join(LT.nlOf(newText));
  }
  const day = () => (fixedDay && fixedDay()) || BW.logDay(Date.now(), settings.DAY_START_HOUR);

  function write(op, req, plan) {
    if (guard) guard();
    if (!req || typeof req !== 'object') throw new Error('요청 형식 오류');
    const seen = req.lastModified;
    const cur = fs.readFileSync(file, 'utf8'), mtime = fs.statSync(file).mtimeMs;
    if (typeof seen !== 'number' || Math.abs(seen - mtime) > 1) return { ok: false, conflict: true, text: cur, lastModified: mtime };
    const date = day();
    const noHabit = !LT.hasHabit(LT.splitLines(cur), HAB.name);
    if (op === 'add' && features && noHabit && features.isSeen(RF.id)) return { ok: false, off: true, text: cur, lastModified: mtime, date, op };
    const r = plan(cur, date);
    if (!r.changed) return { ok: true, unchanged: true, text: cur, lastModified: mtime, date, op: r.op, book: r.book };
    let text = r.text, habitAdded = false;
    if (op === 'add' && features && noHabit) { // 독서 줄이 한 번도 없었음: 첫 책과 함께 한 번만
      const L = LT.splitLines(text);
      if (LT.ensureHabit(L, HAB) >= 0) { text = L.join(LT.nlOf(text)); habitAdded = true; }
    }
    const bookOnly = habitAdded ? withoutHabit(cur, text) : text;
    if (bookOnly == null || !BW.onlyBookChanged(cur, bookOnly, op)) throw new Error('## 독서 표 밖이 바뀌려 해서 멈춤');
    const dir = backup(cur);
    fs.writeFileSync(file, text);
    if (features && LT.hasHabit(LT.splitLines(text), HAB.name)) features.markSeen(RF.id);
    return { ok: true, text, lastModified: fs.statSync(file).mtimeMs, date, op: r.op, book: r.book, line: r.line, created: r.created, habitAdded, backupDir: dir };
  }
  const isStr = (v) => v == null || typeof v === 'string';
  function key(k) { // 책 고르기 = { date, title } (둘 다 글자)
    if (!k || typeof k !== 'object' || typeof k.date !== 'string' || typeof k.title !== 'string') throw new Error('책 고르기 형식 오류');
    return { date: k.date, title: k.title };
  }
  function cleanBook(b, partial) { // 정해진 칸만 (date, title, color, summary), 모두 글자
    if (!b || typeof b !== 'object' || Array.isArray(b)) throw new Error('책 값 형식 오류');
    const out = {};
    Object.keys(b).forEach((k) => {
      if (!['date', 'title', 'color', 'summary'].includes(k)) throw new Error('모르는 칸: ' + k);
      if (!isStr(b[k])) throw new Error('값 형식 오류: ' + k);
      if (b[k] != null && (b[k] !== '' || k === 'summary' || !partial)) out[k] = b[k];
    });
    return out;
  }

  ipcMain.handle('ph:bookAdd', (e, req) => write('add', req, (cur, date) => {
    const b = cleanBook(req.book, false);
    return BW.addBook(cur, { date: b.date || date, title: b.title, color: b.color, summary: b.summary || '' }); // 날짜를 안 고르면 오늘 (하루 경계 6시)
  }));
  ipcMain.handle('ph:bookUpdate', (e, req) => write('update', req, (cur) => BW.updateBook(cur, key(req.key), cleanBook(req.patch, true))));
  ipcMain.handle('ph:bookArchive', (e, req) => write('archive', req, (cur, date) => BW.archiveBook(cur, key(req.key), { date })));
  ipcMain.handle('ph:bookRestore', (e, req) => write('restore', req, (cur) => BW.restoreBook(cur, key(req.key))));
};

};
RT.MODS["/app/js/book_write.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 독서 책꽂이 쓰기 (2026-10-03 비트, journal 브랜치). 그림·파일 접근 없음: 글(text)을 받아 새 글을 돌려준다.
// Electron 메인(electron/book_ipc.js), 화면(js/bookshelf.js: 읽기), Node 시험(tests/test_journal.js)이 같이 쓴다.
// 바꾸는 곳은 둘뿐: ## 독서 표, ## 독서 보관 표. 없으면 만든다 (## 독서 = ## 버킷리스트 바로 앞, 없으면 파일 끝 / ## 독서 보관 = ## 독서 바로 뒤).
// 원칙은 물컵·공부와 같다: 한 줄 더하기 / 그 줄만 바꾸기 / 한 줄 옮기기. 다른 줄은 한 글자도 안 바뀐다.
// 메인은 쓰기 직전에 onlyBookChanged로 다시 확인한다.
//
// 표: | 날짜 | 제목 | 표지색 | 요약 |   보관: | 날짜 | 제목 | 표지색 | 요약 | 보관한 날 |
//   책 하나 = (날짜, 제목). 같은 날 같은 제목은 둘 둘 수 없음 (고르기·고치기·빼기에서 어느 줄인지 헷갈리지 않게)
//   표지색 = 이름 (BOOK_COLORS의 key, 예: 벽돌). 파일을 사람이 읽어도 알 수 있게 색 이름으로 적음
// 칸 글 안전 표시 (제목·요약): 쓸 때 \ -> \\, | -> \|, < -> \<, 줄바꿈 -> <br>. 읽을 때 그대로 되돌림 (왕복해도 한 글자도 안 바뀜)
//   마크다운 보기에서도 \| \< \\ 는 글자로, <br>은 줄바꿈으로 보임
(function (root) {
  'use strict';
  const Md = root.PHLifeMd || (typeof require !== 'undefined' ? require('./life_md.js') : null);

  const SEC = '독서';
  const ARCHIVE = '독서 보관';
  const BEFORE = '버킷리스트';
  const HEAD = ['날짜', '제목', '표지색', '요약'];
  const ARCHIVE_HEAD = ['날짜', '제목', '표지색', '요약', '보관한 날'];
  const TITLE_MAX = 60, SUMMARY_MAX = 2000;
  // 표지색 (하우스 팔레트 css/app.css 값). 순서 = 칩 순서. 파일에는 이름만
  const COLORS = [
    { name: '벽돌', hex: '#A65446' }, { name: '주황', hex: '#E08A3C' }, { name: '겨자', hex: '#C99A4E' }, { name: '잎', hex: '#86B07E' },
    { name: '숲', hex: '#5C8458' }, { name: '민트', hex: '#C4DCD8' }, { name: '남색', hex: '#3E4B69' }, { name: '분홍', hex: '#E9A9A0' },
    { name: '나무', hex: '#B07A4F' }, { name: '호두', hex: '#5A3B2A' },
  ];
  const COLOR_NAMES = COLORS.map((c) => c.name);

  const pad = (n) => String(n).padStart(2, '0');
  function ymd(d) { const x = new Date(d); return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`; }
  function logDay(ms, startHour) { const h = Number.isFinite(startHour) ? startHour : 6; return ymd(ms - h * 3600000); }
  function isDate(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const [y, m, d] = s.split('-').map(Number), x = new Date(y, m - 1, d);
    return x.getFullYear() === y && x.getMonth() === m - 1 && x.getDate() === d;
  }

  // ---- 칸 글 안전 표시 ----
  function encode(s) {
    return String(s).replace(/\r\n?/g, '\n').replace(/[\\|<]/g, (c) => '\\' + c).replace(/\n/g, '<br>');
  }
  function decode(s) {
    let out = '';
    const t = String(s);
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (c === '\\' && i + 1 < t.length) { out += t[i + 1]; i++; continue; }
      if (c === '<' && t.slice(i, i + 4).toLowerCase() === '<br>') { out += '\n'; i += 3; continue; }
      out += c;
    }
    return out;
  }
  // 표 한 줄 -> 칸 (\| 는 칸을 나누지 않음). 칸 글은 아직 encode된 그대로 (앞뒤 공백만 뺌)
  function splitRow(l) {
    let t = String(l).trim();
    if (t.startsWith('|')) t = t.slice(1);
    const out = []; let cur = '';
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (c === '\\' && i + 1 < t.length) { cur += c + t[i + 1]; i++; continue; }
      if (c === '|') { out.push(cur.trim()); cur = ''; continue; }
      cur += c;
    }
    if (cur.trim() !== '') out.push(cur.trim()); // 끝 | 가 없을 때 마지막 칸
    return out;
  }
  const rowText = (cells) => '| ' + cells.join(' | ') + ' |';
  const sepText = (n) => '|' + Array(n).fill('---').join('|') + '|';
  const isRow = (l) => /^\s*\|/.test(l);
  const isSep = (l) => /^\s*\|?\s*:?-{3,}/.test(l);
  const splitLines = (src) => String(src).split(/\r?\n/);

  // ---- 값 다듬기·검사 ----
  const len = (s) => Array.from(s).length;
  function checkTitle(s) {
    if (typeof s !== 'string') throw new Error('제목 형식 오류');
    const t = s.replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!t) throw new Error('제목이 비었음');
    if (len(t) > TITLE_MAX) throw new Error('제목이 너무 김 (' + TITLE_MAX + '자까지)');
    return t;
  }
  function checkSummary(s) {
    if (s != null && typeof s !== 'string') throw new Error('요약 형식 오류');
    // 줄바꿈·탭은 살리고 다른 제어 문자만 뺌. 앞뒤 빈 줄은 정리
    const t = String(s == null ? '' : s).replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b-\u001f\u007f\u2028\u2029]/g, '').trim(); // 칸 앞뒤 공백은 표에서 사라지므로 미리 정리
    if (len(t) > SUMMARY_MAX) throw new Error('요약이 너무 김 (' + SUMMARY_MAX + '자까지)');
    return t;
  }
  function checkColor(s) { if (!COLOR_NAMES.includes(s)) throw new Error('표지색 오류: ' + s); return s; }
  function checkDate(s) { if (!isDate(s)) throw new Error('날짜 오류 (YYYY-MM-DD)'); return s; }
  const hexOf = (name) => { const c = COLORS.find((x) => x.name === name); return c ? c.hex : null; };

  // ---- 읽기 ----
  function findSection(lines, name) {
    const all = Md.sections(lines).filter((s) => s.name === name);
    if (all.length > 1) throw new Error('같은 섹션이 둘: ## ' + name);
    return all[0] || null;
  }
  // 섹션 안 첫 표: { headLine, head, sepLine, rows: [{ line, cells(encode된 칸) }], endLine } 또는 null
  function tableOf(lines, sec) {
    if (!sec) return null;
    let i = sec.start; while (i < sec.end && !isRow(lines[i])) i++;
    if (i >= sec.end) return null;
    const head = splitRow(lines[i]);
    let sep = i + 1; if (!(sep < sec.end && isSep(lines[sep]))) sep = null;
    let end = (sep == null ? i : sep) + 1;
    const rows = [];
    while (end < sec.end && isRow(lines[end])) { if (!isSep(lines[end])) rows.push({ line: end, cells: splitRow(lines[end]) }); end++; }
    return { headLine: i, head, sepLine: sep, rows, endLine: end };
  }
  const book = (r, archived) => {
    const c = r.cells, o = { line: r.line, date: c[0] || '', title: decode(c[1] || ''), color: c[2] || '', summary: decode(c[3] || '') };
    o.hex = hexOf(o.color); o.day = Md.dateOf(o.date);
    if (archived) o.archived = c[4] || '';
    return o;
  };
  // 글 -> { books: [...파일 순서], archive: [...], shelf: [...날짜 순(같은 날은 파일 순)], hasSection }
  function parse(src) {
    const lines = Array.isArray(src) ? src : splitLines(src);
    let s = null, a = null;
    try { s = findSection(lines, SEC); a = findSection(lines, ARCHIVE); } catch (e) { return { books: [], archive: [], shelf: [], error: String(e.message) }; }
    const t = tableOf(lines, s), at = tableOf(lines, a);
    const books = t ? t.rows.map((r) => book(r)) : [], archive = at ? at.rows.map((r) => book(r, true)) : [];
    const shelf = books.map((b, i) => Object.assign({ order: i }, b)).sort((x, y) => (x.day == null ? 1e15 : x.day) - (y.day == null ? 1e15 : y.day) || x.order - y.order);
    return { books, archive, shelf, hasSection: !!s };
  }
  // 이번 달 읽은 쪽: 습관 기록(Md.parse records)의 "독서 n쪽" 합. month = 'YYYY-MM'
  function monthPages(records, month, habit, unit) {
    let n = 0;
    (records || []).forEach((r) => { if (String(r.date || '').slice(0, 7) !== month) return; r.items.forEach((it) => { if (it.name === (habit || '독서') && it.value > 0 && (it.unit || '') === (unit || '쪽')) n += it.value; }); });
    return n;
  }

  // ---- 쓰기 ----
  const out = (src, lines, extra) => Object.assign({ text: lines.join(/\r\n/.test(src) ? '\r\n' : '\n'), changed: true }, extra);
  const same = (c, date, title) => c[0] === date && decode(c[1] || '') === title;
  function bookTable(lines) {
    const sec = findSection(lines, SEC); if (!sec) return { sec: null, t: null };
    const t = tableOf(lines, sec);
    if (t && t.head.join('|') !== HEAD.join('|')) throw new Error('## 독서 표 머리가 달라서 멈춤');
    return { sec, t };
  }
  function findRow(t, date, title) {
    const hits = t ? t.rows.filter((r) => same(r.cells, date, title)) : [];
    if (!hits.length) throw new Error('책 없음: ' + date + ' ' + title);
    if (hits.length > 1) throw new Error('같은 날 같은 제목이 둘이라 멈춤: ' + title);
    return hits[0];
  }
  function free(t, date, title, except) {
    if (t && t.rows.some((r) => same(r.cells, date, title) && r !== except)) throw new Error('같은 날 같은 제목 책이 이미 있음: ' + title);
  }
  const cellsFor = (b) => [b.date, encode(b.title), b.color, encode(b.summary)];
  function pad4(c) { const x = c.slice(0, 4); while (x.length < 4) x.push(''); return x; }

  // 더하기: ## 독서 표 끝. 섹션이 없으면 ## 버킷리스트 앞에 (없으면 파일 끝)
  function addBook(src, o) {
    o = o || {};
    const b = { date: checkDate(o.date), title: checkTitle(o.title), color: checkColor(o.color), summary: checkSummary(o.summary) };
    const lines = splitLines(src), { sec, t } = bookTable(lines), row = rowText(cellsFor(b));
    if (!sec) {
      const block = ['## ' + SEC, rowText(HEAD), sepText(HEAD.length), row, ''];
      const bi = findSection(lines, BEFORE);
      let at;
      if (bi) at = bi.line;
      else { at = lines.length; while (at > 0 && lines[at - 1] === '') at--; block.unshift(''); block.pop(); } // 파일 끝: 빈 줄 하나 띄우고 (끝 빈 줄은 그대로)
      lines.splice(at, 0, ...block);
      return out(src, lines, { op: 'add', line: at + block.indexOf(row), created: true, book: b, after: row });
    }
    if (!t) { // 섹션은 있는데 표가 없음: 섹션 글 끝(빈 줄 앞)에 머리·구분선·줄
      let at = sec.end; while (at > sec.start && lines[at - 1].trim() === '') at--;
      lines.splice(at, 0, rowText(HEAD), sepText(HEAD.length), row);
      return out(src, lines, { op: 'add', line: at + 2, created: false, book: b, after: row });
    }
    free(t, b.date, b.title);
    lines.splice(t.endLine, 0, row);
    return out(src, lines, { op: 'add', line: t.endLine, created: false, book: b, after: row });
  }
  // 고치기: key = { date, title }, patch = { date, title, color, summary } (없는 값 = 그대로)
  function updateBook(src, key, patch) {
    const p = patch || {}, k = key || {};
    const lines = splitLines(src), { t } = bookTable(lines), row = findRow(t, k.date, k.title);
    const c = pad4(row.cells), cur = { date: c[0], title: decode(c[1]), color: c[2], summary: decode(c[3]) };
    const next = Object.assign({}, cur);
    if (p.date != null) next.date = checkDate(p.date);
    if (p.title != null) next.title = checkTitle(p.title);
    if (p.color != null) next.color = checkColor(p.color);
    if (p.summary != null) next.summary = checkSummary(p.summary);
    if (next.date !== cur.date || next.title !== cur.title) free(t, next.date, next.title, row);
    const after = rowText(cellsFor(next));
    if (after === lines[row.line]) return { text: src, changed: false, op: 'update', line: row.line, book: next };
    const before = lines[row.line]; lines[row.line] = after;
    return out(src, lines, { op: 'update', line: row.line, book: next, before, after });
  }
  // 빼기: ## 독서에서 그 줄을 빼고 ## 독서 보관 표 끝에 (보관한 날 = date). 보관 섹션이 없으면 ## 독서 바로 뒤에 만듦
  function archiveBook(src, key, o) {
    const date = o && o.date; checkDate(date);
    const k = key || {};
    const lines = splitLines(src), { t } = bookTable(lines), row = findRow(t, k.date, k.title);
    const moved = rowText(pad4(row.cells).concat([date])), before = lines[row.line];
    lines.splice(row.line, 1);
    const aSec = findSection(lines, ARCHIVE), at = tableOf(lines, aSec);
    let line, created = false;
    if (aSec && at) {
      if (at.head.join('|') !== ARCHIVE_HEAD.join('|')) throw new Error('## 독서 보관 표 머리가 달라서 멈춤');
      line = at.endLine; lines.splice(line, 0, moved);
    } else if (aSec) {
      let p = aSec.end; while (p > aSec.start && lines[p - 1].trim() === '') p--;
      lines.splice(p, 0, rowText(ARCHIVE_HEAD), sepText(ARCHIVE_HEAD.length), moved); line = p + 2;
    } else { // ## 독서 섹션 바로 뒤 (study_write.js archiveStudy와 같은 자리 규칙)
      const s2 = findSection(lines, SEC);
      const p = s2.end, atEnd = p === lines.length;
      let q = p; while (q > s2.start && lines[q - 1].trim() === '') q--;
      const block = ['## ' + ARCHIVE, rowText(ARCHIVE_HEAD), sepText(ARCHIVE_HEAD.length), moved];
      if (atEnd) { lines.splice(q, 0, '', ...block); line = q + 4; }
      else { if (q === p) block.unshift(''); block.push(''); lines.splice(p, 0, ...block); line = p + block.indexOf(moved); }
      created = true;
    }
    return out(src, lines, { op: 'archive', from: row.line, line, created, before, after: moved });
  }
  // 되돌리기: ## 독서 보관에서 (날짜, 제목)의 마지막 줄을 빼고 ## 독서 표 끝에 (보관한 날 칸은 버림)
  function restoreBook(src, key) {
    const k = key || {};
    const lines = splitLines(src);
    const aSec = findSection(lines, ARCHIVE), at = tableOf(lines, aSec); if (!at) throw new Error('## 독서 보관 표 없음');
    const hits = at.rows.filter((r) => same(r.cells, k.date, k.title)); if (!hits.length) throw new Error('보관한 책 없음: ' + k.title);
    const row = hits[hits.length - 1];
    const { t } = bookTable(lines); if (!t) throw new Error('## 독서 표 없음');
    free(t, k.date, k.title);
    const before = lines[row.line], back = rowText(pad4(row.cells));
    lines.splice(row.line, 1);
    const t2 = bookTable(lines).t;
    lines.splice(t2.endLine, 0, back);
    return out(src, lines, { op: 'restore', from: row.line, line: t2.endLine, before, after: back });
  }

  // ---- 안전 검사 (메인이 쓰기 직전에) ----
  // 두 섹션 밖은 한 글자도 같아야 함(새 섹션을 파일 끝에 붙일 때 띄운 빈 줄 하나만 허용). 섹션 안 글 줄도 그대로.
  // 데이터 줄은 op에 맞게: add +1 / update 같은 자리 1줄 / archive 독서 -1·보관 +1 / restore 보관 -1·독서 +1. 새 줄은 칸 수·날짜·제목·색 검사
  function onlyBookChanged(oldText, newText, op) {
    try {
      const a = splitLines(oldText), b = splitLines(newText);
      const pick = (L) => {
        const s = findSection(L, SEC), x = findSection(L, ARCHIVE);
        const secs = [s, x].filter(Boolean).sort((p, q) => q.line - p.line);
        let rest = L.slice(); secs.forEach((z) => { rest = rest.slice(0, z.line).concat(rest.slice(z.end)); });
        const t = tableOf(L, s), at = tableOf(L, x);
        const prose = (z, tt) => (z ? L.slice(z.line, z.end).filter((l, i) => !(tt && z.line + i >= tt.headLine && z.line + i < tt.endLine)) : []);
        return { s, x, rest, t, at, prose, rows: t ? t.rows.map((r) => L[r.line]) : [], arows: at ? at.rows.map((r) => L[r.line]) : [] };
      };
      const A = pick(a), B = pick(b); if (!B.s || !B.t) return false;
      const ra = A.rest.join('\n'), rb = B.rest.join('\n');
      if (ra !== rb) {
        // 새 ## 독서를 파일 끝에 붙임: 앞 섹션 끝에 빈 줄 하나가 더 생김
        const endPad = !A.s && B.rest.length === A.rest.length + 1 && B.rest[B.rest.length - 1] === '' && A.rest.join('\n') === B.rest.slice(0, -1).join('\n');
        if (!endPad) return false;
      }
      // 새로 만든 ## 독서는 버킷리스트 바로 앞 또는 파일 끝
      if (!A.s) { // 버킷리스트가 있으면 그 바로 앞(사이에 독서 보관만 허용), 없으면 파일 끝
        const secsB = Md.sections(b), next = secsB.find((z) => z.line === B.s.end), hasBefore = secsB.some((z) => z.name === BEFORE);
        if (hasBefore ? !(next && (next.name === BEFORE || next.name === ARCHIVE)) : B.s.end !== b.length && !(next && next.name === ARCHIVE)) return false;
      }
      const trimEnd = (arr) => { const c = arr.slice(); while (c.length && c[c.length - 1].trim() === '') c.pop(); return c; };
      if (A.s && trimEnd(A.prose(A.s, A.t)).join('\n') !== trimEnd(B.prose(B.s, B.t)).join('\n')) return false;
      if (!A.s && trimEnd(B.prose(B.s, B.t)).join('\n') !== '## ' + SEC) return false;
      if (A.x && trimEnd(A.prose(A.x, A.at)).join('\n') !== trimEnd(B.prose(B.x, B.at)).join('\n')) return false;
      if (!A.x && B.x && trimEnd(B.prose(B.x, B.at)).join('\n') !== '## ' + ARCHIVE) return false;
      if (A.x && !B.x) return false;
      if (B.t.head.join('|') !== HEAD.join('|')) return false;
      if (B.at && B.at.head.join('|') !== ARCHIVE_HEAD.join('|')) return false;
      if (A.t && B.t.sepLine == null) return false;
      const diff = (xs, ys) => { const m = new Map(); xs.forEach((v) => m.set(v, (m.get(v) || 0) + 1)); const extra = []; ys.forEach((v) => { if (m.get(v)) m.set(v, m.get(v) - 1); else extra.push(v); }); return extra; };
      const goneS = diff(B.rows, A.rows), newS = diff(A.rows, B.rows), goneA = diff(B.arows, A.arows), newA = diff(A.arows, B.arows);
      const want = { add: [0, 1, 0, 0], update: [1, 1, 0, 0], archive: [1, 0, 0, 1], restore: [0, 1, 1, 0] }[op];
      if (!want) return false;
      if (goneS.length !== want[0] || newS.length !== want[1] || goneA.length !== want[2] || newA.length !== want[3]) return false;
      const okBook = (l) => {
        const c = splitRow(l); if (c.length !== 4 || !isDate(c[0]) || !COLOR_NAMES.includes(c[2])) return false;
        const ti = decode(c[1]); if (!ti.trim() || /\n/.test(ti) || len(ti) > TITLE_MAX || len(decode(c[3])) > SUMMARY_MAX) return false;
        return rowText(c) === l.trim(); // 다시 만든 줄과 같아야 함 (칸 사이 이상한 글자 없음)
      };
      const keyOf = (l) => { const c = splitRow(l); return c[0] + '|' + decode(c[1] || ''); };
      const dupKeys = (rows) => { const k = rows.map(keyOf); return new Set(k).size !== k.length; };
      if (dupKeys(B.rows) && !dupKeys(A.rows)) return false;
      const sig4 = (l) => pad4(splitRow(l)).join('|');
      if (op === 'add') return okBook(newS[0]);
      if (op === 'update') return A.rows.indexOf(goneS[0]) === B.rows.indexOf(newS[0]) && okBook(newS[0]);
      if (op === 'archive') { const c = splitRow(newA[0]); return c.length === 5 && isDate(c[4]) && c.slice(0, 4).join('|') === sig4(goneS[0]); }
      if (op === 'restore') return okBook(newS[0]) && sig4(newS[0]) === splitRow(goneA[0]).slice(0, 4).join('|');
      return false;
    } catch (e) { return false; }
  }

  const BW = { SEC, ARCHIVE, HEAD, ARCHIVE_HEAD, TITLE_MAX, SUMMARY_MAX, COLORS, COLOR_NAMES, ymd, logDay, isDate, encode, decode, splitRow, hexOf,
    checkTitle, checkSummary, parse, monthPages, addBook, updateBook, archiveBook, restoreBook, onlyBookChanged };
  root.PHBookWrite = BW;
  if (typeof module !== 'undefined' && module.exports) module.exports = BW;
})(typeof window !== 'undefined' ? window : globalThis);

};
RT.MODS["/app/electron/household_ipc.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 살림 쓰기 (메인 프로세스, 2026-10-03 비트): 인벤토리(## 살림 물건), 사야 할 것(## 사야 할 것), 청소 습관 체크(## 생활습관 "살림" 줄 + 습관 기록 오늘 줄).
//   물컵·습관 체크와 같은 안전 규칙:
//   - 대상 파일(settings.LIFE_FILE)·섹션·오늘 날짜는 메인이 정한다. 화면은 바꾸기 값과 "읽은 시각"만 보낸다 (경로를 보낼 수 없음)
//   - 앱이 읽은 뒤 파일이 바뀌었으면 쓰지 않고 새 글을 돌려줌 (conflict)
//   - 값 검사(분류·알약·이름(표 글자 막음)·수량·색)는 js/household.js
//   - 쓰기 직전 백업(main.js backup), 바뀐 줄 검사(onlyHouseChanged / onlyChoreRowsAdded + onlyRecordsRowChanged)
// 여는 함수(정해진 것만): ph:invOp, ph:shopOp, ph:choreToggle
// main.js에서 한 번 부른다: require('./household_ipc.js')({ ipcMain, file, backup, settings, fixedDay, guard })
'use strict';
const fs = require('fs');
const path = require('path');

module.exports = function register(o) {
  const J = (f) => require(path.join(__dirname, '..', 'js', f));
  const Md = J('life_md.js'), LW = J('life_write.js'); J('life_check.js'); J('data/household.js');
  const HH = J('household.js');
  const { ipcMain, file, backup, settings, fixedDay, guard } = o;
  const day = () => (fixedDay && fixedDay()) || Md.logDay(Date.now(), settings.DAY_START_HOUR);

  function write(req, plan, safe) {
    if (guard) guard();
    if (!req || typeof req !== 'object') throw new Error('요청 형식 오류');
    const seen = req.lastModified;
    const cur = fs.readFileSync(file, 'utf8'), mtime = fs.statSync(file).mtimeMs;
    if (typeof seen !== 'number' || Math.abs(seen - mtime) > 1) return { ok: false, conflict: true, text: cur, lastModified: mtime };
    const date = day();
    let r;
    try { r = plan(cur, date); } catch (e) { if (e.code) return { ok: false, code: e.code, text: cur, lastModified: mtime, date }; throw e; }
    const extra = { date };
    ['item', 'removed', 'shop', 'created', 'name', 'habit', 'done', 'count', 'of', 'daily', 'per', 'choresAdded'].forEach((k) => { if (r[k] !== undefined) extra[k] = r[k]; });
    if (!r.changed) return Object.assign({ ok: true, unchanged: true, text: cur, lastModified: mtime }, extra);
    if (!safe(cur, r)) throw new Error('살림 섹션 밖이 바뀌려 해서 멈춤');
    const dir = backup(cur);
    fs.writeFileSync(file, r.text);
    return Object.assign({ ok: true, text: r.text, lastModified: fs.statSync(file).mtimeMs, backupDir: dir }, extra);
  }
  const OPS_INV = ['qty', 'need', 'add', 'remove', 'restore', 'color'];
  function cleanInv(op) { // 정해진 칸만
    if (!op || typeof op !== 'object' || Array.isArray(op)) throw new Error('바꾸기 형식 오류');
    if (!OPS_INV.includes(op.type)) throw new Error('모르는 바꾸기');
    const out = { type: op.type, cat: String(op.cat || ''), name: op.name };
    if (typeof op.name !== 'string') throw new Error('이름 형식 오류');
    ['pill', 'color', 'memo', 'before'].forEach((k) => { if (op[k] != null) { if (typeof op[k] !== 'string') throw new Error('값 형식 오류: ' + k); out[k] = op[k]; } });
    if (op.qty != null) out.qty = op.qty;
    if (op.need != null) out.need = op.need;
    return out;
  }
  ipcMain.handle('ph:invOp', (e, req) => write(req, (cur, date) => HH.applyInv(cur, cleanInv(req.op), date), (cur, r) => HH.onlyHouseChanged(cur, r.text)));
  ipcMain.handle('ph:shopOp', (e, req) => write(req, (cur, date) => {
    const op = req.op;
    if (!op || typeof op !== 'object' || !['add', 'bought'].includes(op.type) || typeof op.name !== 'string') throw new Error('바꾸기 형식 오류');
    return HH.applyShop(cur, { type: op.type, name: op.name }, date);
  }, (cur, r) => HH.onlyHouseChanged(cur, r.text)));
  ipcMain.handle('ph:choreToggle', (e, req) => write(req, (cur, date) => {
    if (typeof req.habit !== 'string' || !req.habit || req.habit.length > 40) throw new Error('습관 이름 오류');
    return HH.toggleChore(cur, { habit: req.habit, date });
  }, (cur, r) => HH.onlyChoreRowsAdded(cur, r.mid) && LW.onlyRecordsRowChanged(r.mid, r.text)));
};

};
RT.MODS["/app/electron/habit_ipc.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 습관 편집·공부 완전 삭제 쓰기 (메인 프로세스, 2026-10-04 비트). 물컵·습관 체크·살림과 같은 안전 규칙.
//   - 대상 파일(settings.LIFE_FILE)·섹션·오늘 날짜는 메인이 정한다. 화면은 이름·값과 "읽은 시각"만 보낸다 (경로를 보낼 수 없음)
//   - 앱이 읽은 뒤 파일이 바뀌었으면 쓰지 않고 새 글을 돌려줌 (conflict -> 화면이 다시 읽고 그림)
//   - 값 검사(이름·기준·주기, 표를 깨는 글자 막음)는 js/habit_edit.js. 값이 틀리면 쓰지 않고 { ok: false, code } (badName, dupName, badTarget, badCycle, locked, lastChore, notFound)
//   - 쓰기 직전 백업(main.js backup), 바뀐 줄 검사(onlyHabitsChanged / onlyHabitUpdated / onlyStudyRemoved / onlyStudyAdded / onlyRecordsRowChanged)
//   - 고치기(ph:habitUpdate)는 두 단계로 검사: 생활습관 표 한 줄 + 지난 기록 이름(oldName -> name)만 (js/record_rename.js onlyNamesRenamed)
// 여는 함수(정해진 것만): ph:habitAdd, ph:habitUpdate, ph:habitRemove, ph:habitMove, ph:studyRemove, ph:studyUnremove(완전 삭제 되돌리기),
//   ph:habitSetDaily(매일 n회 습관 오늘 k/n, 물컵과 같은 쓰기)
// main.js에서 한 번 부른다: require('./habit_ipc.js')({ ipcMain, file, backup, settings, fixedDay, guard })
'use strict';
const fs = require('fs');
const path = require('path');

module.exports = function register(o) {
  const J = (f) => require(path.join(__dirname, '..', 'js', f));
  const Md = J('life_md.js'), LW = J('life_write.js'); J('life_check.js'); const HC = J('habit_cycle.js'); J('data/household.js'); J('household.js'); J('record_rename.js'); J('study_write.js');
  const HE = J('habit_edit.js');
  const { ipcMain, file, backup, settings, fixedDay, guard, features } = o;
  const FX = J('features.js');
  const day = () => (fixedDay && fixedDay()) || Md.logDay(Date.now(), settings.DAY_START_HOUR);
  const SAFE = { habits: (a, b) => HE.onlyHabitsChanged(a, b), habitUpdate: (a, b, r) => HE.onlyHabitUpdated(a, r) && r.text === b, studyRemove: HE.onlyStudyRemoved, studyAdd: HE.onlyStudyAdded, records: LW.onlyRecordsRowChanged };
  const KEEP = ['op', 'name', 'oldName', 'prev', 'renamedRecords', 'kind', 'row', 'removed', 'before', 'removedText', 'edge', 'choresAdded', 'line', 'value', 'of', 'habit'];

  function write(kind, req, plan) {
    if (guard) guard();
    if (!req || typeof req !== 'object') throw new Error('요청 형식 오류');
    const seen = req.lastModified;
    const cur = fs.readFileSync(file, 'utf8'), mtime = fs.statSync(file).mtimeMs;
    if (typeof seen !== 'number' || Math.abs(seen - mtime) > 1) return { ok: false, conflict: true, text: cur, lastModified: mtime };
    const date = day();
    let r;
    try { r = plan(cur, date); } catch (e) { if (e.code) return { ok: false, code: e.code, message: e.message, text: cur, lastModified: mtime, date, usedName: e.usedName || null, lastDate: e.lastDate || null }; throw e; } // usedName: 막은 이름·마지막 기록 날 (안내용)
    const extra = { date };
    KEEP.forEach((k) => { if (r[k] !== undefined) extra[k] = r[k]; });
    if (!r.changed) return Object.assign({ ok: true, unchanged: true, text: cur, lastModified: mtime }, extra);
    if (!SAFE[kind](cur, r.text, r)) throw new Error('정해진 표 밖이 바뀌려 해서 멈춤 (' + kind + ')');
    const dir = backup(cur);
    fs.writeFileSync(file, r.text);
    // 일지 기능 습관(대변·식사)이 표에 있었으면 seen에 (지운 뒤 일지 저장이 줄을 다시 만들지 않게)
    if (features && r.name && FX.byHabit(r.name)) features.markSeen(FX.byHabit(r.name).id);
    return Object.assign({ ok: true, text: r.text, lastModified: fs.statSync(file).mtimeMs, backupDir: dir }, extra);
  }
  const str = (v) => typeof v === 'string';
  const optStr = (v) => v == null || typeof v === 'string';
  function cleanCycle(c) { // { per, n } 또는 글만
    if (c == null || typeof c === 'string') return c;
    if (typeof c !== 'object' || Array.isArray(c) || !['day', 'week', 'month'].includes(c.per) || !Number.isInteger(c.n)) throw Object.assign(new Error('주기 형식 오류'), { code: 'badCycle' });
    return { per: c.per, n: c.n };
  }
  function cleanHabit(h) { // 정해진 칸만 (kind, name, target, cycle)
    if (!h || typeof h !== 'object' || Array.isArray(h)) throw new Error('습관 형식 오류');
    if (!str(h.kind) || !str(h.name) || !optStr(h.target)) throw new Error('값 형식 오류');
    return { kind: h.kind, name: h.name, target: h.target, cycle: cleanCycle(h.cycle) };
  }
  function cleanPatch(p) { // newName, target, cycle만
    if (!p || typeof p !== 'object' || Array.isArray(p)) throw new Error('고칠 값 형식 오류');
    const out = {};
    Object.keys(p).forEach((k) => {
      if (!['newName', 'target', 'cycle'].includes(k)) throw new Error('모르는 칸: ' + k);
      if (k === 'cycle') { if (p.cycle != null) out.cycle = cleanCycle(p.cycle); } else { if (!optStr(p[k])) throw new Error('값 형식 오류: ' + k); if (p[k] != null) out[k] = p[k]; }
    });
    return out;
  }

  // 습관 더하기 (before = 되돌리기 때 원래 자리: 이 이름 앞)
  ipcMain.handle('ph:habitAdd', (e, req) => write('habits', req, (cur) => {
    if (!optStr(req.before) || !optStr(req.raw)) throw new Error('값 형식 오류');
    return HE.addHabit(cur, Object.assign(cleanHabit(req.habit), { before: req.before, raw: req.raw }));
  }));
  ipcMain.handle('ph:habitUpdate', (e, req) => write('habitUpdate', req, (cur) => { if (!str(req.name)) throw new Error('이름 형식 오류'); return HE.updateHabit(cur, req.name, cleanPatch(req.patch)); }));
  ipcMain.handle('ph:habitRemove', (e, req) => write('habits', req, (cur) => { if (!str(req.name)) throw new Error('이름 형식 오류'); return HE.removeHabit(cur, req.name); }));
  ipcMain.handle('ph:habitMove', (e, req) => write('habits', req, (cur) => { if (!str(req.name)) throw new Error('이름 형식 오류'); return HE.moveHabit(cur, req.name, req.dir); }));
  // 공부: 보관함이 아니라 완전히 빼기 / 되돌리기 (지운 줄 값 + 자리)
  ipcMain.handle('ph:studyRemove', (e, req) => write('studyRemove', req, (cur) => { if (!str(req.name)) throw new Error('이름 형식 오류'); return HE.removeStudy(cur, req.name); }));
  ipcMain.handle('ph:studyUnremove', (e, req) => write('studyAdd', req, (cur) => {
    const r = req.row;
    if (!r || typeof r !== 'object' || Array.isArray(r) || !str(r.name) || !str(r.start) || !optStr(r.end) || !optStr(r.memo) || !optStr(req.before) || !optStr(req.raw)) throw new Error('값 형식 오류');
    return HE.unremoveStudy(cur, { name: r.name, start: r.start, end: r.end || '', memo: r.memo || '' }, req.before, req.raw);
  }));
  // 켤 때 한 번 (electron/main.js startHouse가 부름): 옛 일지 기능 줄 옮기기 (2026-10-08 독서 기준 '쪽' -> '책꽂이에 기록'). 같은 안전 규칙(쓰기 전 사본, 생활습관 표 줄만 바뀌었는지 검사)
  //   시험 실행에서 실제 자료면(guard) 안 씀. 실패해도 앱은 그대로 켜짐 (화면은 독서 줄에 양 적기를 그리지 않음)
  function migrateOnStart() {
    try {
      if (guard) guard();
      const cur = fs.readFileSync(file, 'utf8'), r = HE.migrateFnRows(cur);
      if (!r.changed) return { ok: true, unchanged: true };
      if (!HE.onlyHabitsChanged(cur, r.text, 2 * r.moved.length)) throw new Error('생활습관 표 밖이 바뀌려 해서 멈춤 (migrate)');
      const dir = backup(cur);
      fs.writeFileSync(file, r.text);
      console.log('[habit] 옛 일지 기능 줄 옮김:', r.moved.join(', '), '(사본 ' + dir + ')');
      return { ok: true, moved: r.moved, backupDir: dir };
    } catch (e) { console.log('[habit] 옛 줄 옮기기 안 함:', e.message); return { ok: false, error: e.message }; }
  }
  // 매일 n회(n >= 2) 습관: 오늘 k/n (목표 또는 살림 종류, 물은 ph:setWater). 0 <= value <= n
  ipcMain.handle('ph:habitSetDaily', (e, req) => write('records', req, (cur, date) => {
    if (!str(req.habit) || !req.habit || req.habit.length > 40) throw new Error('습관 이름 오류');
    const d = Md.parse(cur), row = ((d.habits && d.habits.rows) || []).find((x) => x.name === req.habit);
    const n = row ? HC.slotsOf(row.cycle) : 0;
    if (!row || !n || ![HE.KIND.goal, HE.KIND.house].includes(row.kind) || row.name === HE.water()) throw new Error('매일 n회 습관이 아님: ' + req.habit);
    if (!Number.isInteger(req.value) || req.value < 0 || req.value > n) throw new Error('값 오류');
    const prev = HC.todaySlots(d.records, row.name, date);
    const r = LW.setSlots(cur, { habit: row.name, value: req.value, of: n, date });
    return Object.assign(r, { habit: row.name, value: req.value, of: n, prev });
  }));
  return { migrate: migrateOnStart };
};

};
RT.MODS["/app/electron/meeting_ipc.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 약속 쓰기 (메인 프로세스, 2026-10-07 비트). 습관 편집(electron/habit_ipc.js)과 같은 안전 규칙.
//   - 대상 파일(settings.LIFE_FILE)·섹션(## 약속, 옛 이름 ## Meeting)은 메인이 정한다. 화면은 약속 값·고를 줄 글·"읽은 시각"만 보낸다 (경로를 보낼 수 없음)
//   - 앱이 읽은 뒤 파일이 바뀌었으면 쓰지 않고 새 글을 돌려줌 (conflict -> 화면이 새 글로 다시 그림)
//   - 값 검사(날짜·시간·내용, 표를 깨는 글자 막음)는 js/meeting_edit.js. 값이 틀리면 쓰지 않고 { ok: false, code } (badDate, badTime, badText, notFound, noSection)
//   - 쓰기 직전 백업(main.js backup, 최근 10개), 바뀐 줄 검사(onlyMeetingsChanged: ## 약속 표 안 한 줄만)
// 여는 함수(정해진 것만): ph:meetingAdd, ph:meetingUpdate, ph:meetingRemove
// main.js에서 한 번 부른다: require('./meeting_ipc.js')({ ipcMain, file, backup, guard })
'use strict';
const fs = require('fs');
const path = require('path');

module.exports = function register(o) {
  const J = (f) => require(path.join(__dirname, '..', 'js', f));
  J('life_md.js'); J('log_table.js');
  const ME = J('meeting_edit.js');
  const { ipcMain, file, backup, guard } = o;
  const KEEP = ['op', 'meeting', 'prev', 'removed', 'removedText', 'before', 'after', 'line', 'section'];

  function write(op, req, plan) {
    if (guard) guard();
    if (!req || typeof req !== 'object') throw new Error('요청 형식 오류');
    const seen = req.lastModified;
    const cur = fs.readFileSync(file, 'utf8'), mtime = fs.statSync(file).mtimeMs;
    if (typeof seen !== 'number' || Math.abs(seen - mtime) > 1) return { ok: false, conflict: true, text: cur, lastModified: mtime };
    let r;
    try { r = plan(cur); } catch (e) { if (e.code) return { ok: false, code: e.code, message: e.message, text: cur, lastModified: mtime }; throw e; }
    const extra = {};
    KEEP.forEach((k) => { if (r[k] !== undefined) extra[k] = r[k]; });
    if (!r.changed) return Object.assign({ ok: true, unchanged: true, text: cur, lastModified: mtime }, extra);
    if (!ME.onlyMeetingsChanged(cur, r.text, op)) throw new Error('## 약속 표 밖이 바뀌려 해서 멈춤 (' + op + ')');
    const dir = backup(cur);
    fs.writeFileSync(file, r.text);
    return Object.assign({ ok: true, text: r.text, lastModified: fs.statSync(file).mtimeMs, backupDir: dir }, extra);
  }
  const str = (v) => typeof v === 'string';
  const optStr = (v) => v == null || typeof v === 'string';
  const short = (v) => v == null || (typeof v === 'string' && v.length <= 1000);
  function cleanMeeting(m, partial) { // 정해진 칸만 (date, time, text)
    if (!m || typeof m !== 'object' || Array.isArray(m)) throw new Error('약속 형식 오류');
    const out = {};
    Object.keys(m).forEach((k) => {
      if (!['date', 'time', 'text'].includes(k)) throw new Error('모르는 칸: ' + k);
      if (!optStr(m[k]) || !short(m[k])) throw new Error('값 형식 오류: ' + k);
      if (m[k] != null) out[k] = m[k];
    });
    if (!partial && (!str(out.date) || !str(out.text))) throw new Error('값 형식 오류');
    return out;
  }
  function key(k) { // 줄 고르기 = { sig: 읽은 그 줄 글 }
    if (!k || typeof k !== 'object' || !str(k.sig) || k.sig.length > 1000) throw new Error('약속 고르기 형식 오류');
    return { sig: k.sig };
  }
  const cleanOpt = (req) => { if (!optStr(req.before) || !optStr(req.raw) || !short(req.before) || !short(req.raw)) throw new Error('값 형식 오류'); return { before: req.before, raw: req.raw }; };

  // 더하기 (before·raw = 지우기 되돌리기 때 원래 자리·글자)
  ipcMain.handle('ph:meetingAdd', (e, req) => write('add', req, (cur) => ME.addMeeting(cur, cleanMeeting(req.meeting), cleanOpt(req))));
  // 고치기 (raw = 고치기 되돌리기 때 이전 줄 글자)
  ipcMain.handle('ph:meetingUpdate', (e, req) => write('update', req, (cur) => {
    const opt = cleanOpt(req);
    return ME.updateMeeting(cur, key(req.key), req.patch == null && opt.raw != null ? {} : cleanMeeting(req.patch, true), { raw: opt.raw });
  }));
  ipcMain.handle('ph:meetingRemove', (e, req) => write('remove', req, (cur) => ME.removeMeeting(cur, key(req.key))));
};

};
RT.MODS["/app/js/meeting_edit.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 약속 쓰기 (2026-10-07 비트, 제작자 결정 2026-10-07). 그림·파일 접근 없음: 글(text)을 받아 새 글을 돌려준다.
// Electron 메인(electron/meeting_ipc.js)과 화면(js/meeting_edit_ui.js), Node 시험(tests/test_meeting_edit.js)이 같이 쓴다.
//   ## 약속 표 | 날짜 | 시간 | 내용 | (옛 이름 ## Meeting도 같은 표) 한 줄 더하기(addMeeting)·고치기(updateMeeting)·빼기(removeMeeting)
//   더하기 자리 = 날짜·시간 순으로 알맞은 자리 (더 늦은 첫 줄 앞, 같으면 뒤). 날짜 못 읽는 옛 줄은 비교에서 건너뜀
//   고치기 = 같은 자리에서 그 줄만 바꿈 (날짜를 바꿔도 자리는 그대로. 화면은 늘 날짜 순으로 보임)
//   빼기 -> 되돌리기 = 같은 자리(바로 뒤 줄 앞)에 원래 글자 그대로(띄어쓰기까지)
// 줄 고르기 = key { sig: 화면이 읽은 그 줄 글 } (대변·식사 일지와 같은 방식). 같은 글 줄이 여럿이면 마지막 줄 (어느 쪽이든 파일 글은 같음)
// 값 (고치지 않고 막음, code를 붙여 던짐: 'badDate' / 'badTime' / 'badText'):
//   날짜 = YYYY-MM-DD 실제 있는 날 (지난 날도 됨)
//   시간 = 기존 표와 같은 꼴 "10am" "7pm" "7:30pm" (1~12시, 분 00~59). 대소문자·띄어쓰기만 맞춰 줌("7 PM" -> "7pm"), 비우면 시간 없음
//          달력(js/calendar.js timeKey)·입장 대사(js/interact_logic.js timeKey)·냉장고 메모지가 모두 이 꼴을 읽음
//          옛 줄의 다른 꼴("저녁쯤")은 고치기에서 시간을 그대로 두면 그대로 남김 (몰래 바꾸지 않음)
//   내용 = 한 줄, 표를 깨는 글자(| ｜ \ 줄바꿈·제어 문자) 막음, 60자까지
// 쓰기 원칙: ## 약속 표 안 줄만. 다른 줄은 한 글자도 안 바뀐다. 메인이 쓰기 직전에 onlyMeetingsChanged로 다시 확인한다
(function (root) {
  'use strict';
  const req = (n) => (typeof require !== 'undefined' ? require(n) : null);
  const Md = root.PHLifeMd || req('./life_md.js');
  const LT = root.PHLogTable || req('./log_table.js');

  const HEAD = ['날짜', '시간', '내용'];
  const NAMES = [].concat(Md.NAMES.meetings); // ['약속', 'Meeting']
  const TEXT_MAX = 60, TIME_MAX = 20, OLD_MAX = 200; // OLD_MAX = 옛 줄을 그대로 되살릴 때(되돌리기) 내용 길이 상한
  const err = (msg, code) => Object.assign(new Error(msg), code ? { code } : {});
  const len = (s) => Array.from(String(s)).length;
  const BAD = /[|｜\\\u0000-\u001f\u007f\u2028\u2029]/;

  // ---- 값 검사 ----
  function checkDate(s) {
    if (!LT.isDate(s)) throw err('날짜 오류 (YYYY-MM-DD)', 'badDate');
    return s;
  }
  // 시간 꼴: 1~12 (+ :분) + am/pm. "07pm" "7 PM" -> "7pm"
  const TIME_RE = /^0?(1[0-2]|[1-9])(?::([0-5]\d))?\s*(am|pm)$/i;
  function normTime(s) {
    const m = TIME_RE.exec(String(s).trim()); if (!m) return null;
    return m[1] + (m[2] != null ? ':' + m[2] : '') + m[3].toLowerCase();
  }
  // keep = 그대로 두어도 되는 옛 값 (고치기에서 시간을 안 건드림 / 되돌리기)
  function checkTime(s, keep) {
    if (s != null && typeof s !== 'string') throw err('시간 형식 오류', 'badTime');
    const t = String(s == null ? '' : s).trim();
    if (!t) return '';
    if (keep != null && t === keep && okOld(t, TIME_MAX)) return t;
    const n = normTime(t);
    if (!n) throw err('시간은 10am, 7pm, 7:30pm처럼', 'badTime');
    return n;
  }
  function checkText(s, keep) {
    if (typeof s !== 'string') throw err('내용 형식 오류', 'badText');
    if (BAD.test(s)) throw err('내용에 쓸 수 없는 글자 (| \\ 줄바꿈)', 'badText');
    const t = s.replace(/\s+/g, ' ').trim();
    if (!t) throw err('내용이 비었음', 'badText');
    if (keep != null && t === keep && okOld(t, OLD_MAX)) return t;
    if (len(t) > TEXT_MAX) throw err('내용이 너무 김 (' + TEXT_MAX + '자까지)', 'badText');
    return t;
  }
  const okOld = (t, max) => !BAD.test(t) && len(t) <= max;
  function check(m, keep) {
    if (!m || typeof m !== 'object') throw err('약속 형식 오류', 'badText');
    const k = keep || {};
    return { date: checkDate(m.date), time: checkTime(m.time, k.time), text: checkText(m.text, k.text) };
  }

  // ---- 표 ----
  // 약속 섹션 하나 + 표 (없으면 머리·구분선을 넣음, LT.prepare). -> { name, t, lines }
  function meetTable(lines) {
    const secs = Md.sections(lines).filter((s) => NAMES.includes(s.name));
    if (!secs.length) throw err('## 약속 섹션 없음', 'noSection');
    if (secs.length > 1) throw err('## 약속 섹션이 둘이라 멈춤');
    const name = secs[0].name;
    const p = LT.prepare(lines, name, HEAD); // 머리가 다르면 오류
    return { name, t: p.t };
  }
  const sigOf = (l) => String(l).trim();
  function findRow(lines, t, key) {
    const sig = key && typeof key.sig === 'string' ? sigOf(key.sig) : null;
    const hits = sig ? t.rows.filter((r) => sigOf(lines[r.line]) === sig) : [];
    if (!hits.length) throw err('약속 없음 (파일이 바뀌었을 수 있음)', 'notFound');
    return hits[hits.length - 1];
  }
  // 정렬 값: 날짜 + 시간(분, 못 읽으면 하루 끝). 날짜 못 읽으면 null
  function minutes(s) { const n = normTime(s || ''); if (!n) return 9999; const m = /^(\d+)(?::(\d+))?(am|pm)$/.exec(n); let h = Number(m[1]) % 12; if (m[3] === 'pm') h += 12; return h * 60 + Number(m[2] || 0); }
  const sortKey = (c) => (LT.isDate(c[0]) ? c[0] + ' ' + String(minutes(c[1])).padStart(4, '0') : null);
  function sortedAt(t, cells) {
    const k = sortKey(cells), hit = t.rows.find((r) => { const x = sortKey(r.cells); return x != null && x > k; });
    return hit ? hit.line : t.endLine;
  }
  // 되살릴 원래 글: 칸이 검사한 값과 똑같을 때만 (아니면 새로 만든 줄)
  function sameRaw(raw, cells) {
    if (typeof raw !== 'string' || /[\r\n]/.test(raw) || !/^\s*\|/.test(raw)) return null;
    const c = LT.cells(raw); return c.length === cells.length && c.every((x, i) => x === cells[i]) ? raw : null;
  }
  const cellsOf = (m) => [m.date, m.time, m.text];
  const objOf = (c) => ({ date: c[0] || '', time: c[1] || '', text: c[2] || '' });
  const done = (src, lines, extra) => Object.assign({ text: lines.join(LT.nlOf(src)), changed: true }, extra);

  // ---- 더하기: m = { date, time, text }, opt = { before(바로 뒤 줄 글, 되돌리기), raw(원래 줄 글, 되돌리기) } ----
  function addMeeting(text, m, opt) {
    const o = opt || {}, undo = o.raw != null;
    const raw = undo && typeof o.raw === 'string' ? objOf(LT.cells(o.raw)) : null;
    const v = check(m, raw && raw.date === (m && m.date) ? { time: raw.time, text: raw.text } : null); // 되돌리기 = 옛 값 그대로 허용
    const lines = LT.splitLines(text), T = meetTable(lines);
    const c = cellsOf(v), row = (undo && sameRaw(o.raw, c)) || LT.rowText(c);
    let at = null;
    if (o.before != null) { const b = T.t.rows.find((r) => sigOf(lines[r.line]) === sigOf(o.before)); if (b) at = b.line; }
    if (at == null) at = undo && o.before == null ? T.t.endLine : sortedAt(T.t, c); // 되돌리기에서 뒤 줄이 없었으면 = 표 끝 (원래 자리)
    lines.splice(at, 0, row);
    return done(text, lines, { op: 'add', line: at, meeting: v, after: row, section: T.name });
  }
  // ---- 고치기: key = { sig }, patch = { date, time, text } (없는 값 = 그대로). opt.raw = 되돌리기(그 글자 그대로 다시) ----
  function updateMeeting(text, key, patch, opt) {
    const o = opt || {};
    const lines = LT.splitLines(text), T = meetTable(lines), r = findRow(lines, T.t, key);
    const cur = objOf(r.cells), before = lines[r.line];
    let v, after;
    if (o.raw != null) { // 되돌리기: 이전 줄 글 그대로 (값 검사는 옛 값 허용)
      if (typeof o.raw !== 'string') throw err('값 형식 오류');
      const p = objOf(LT.cells(o.raw)); v = check(p, { time: p.time, text: p.text });
      after = sameRaw(o.raw, cellsOf(v)) || LT.rowText(cellsOf(v));
    } else {
      const p = patch || {};
      v = check({ date: p.date != null ? p.date : cur.date, time: p.time != null ? p.time : cur.time, text: p.text != null ? p.text : cur.text }, { time: cur.time, text: cur.text });
      after = LT.cells(before).length === 3 && cellsOf(v).every((x, i) => x === r.cells[i]) ? before : LT.rowText(cellsOf(v));
    }
    if (after === before) return { text, changed: false, op: 'update', line: r.line, meeting: v, prev: cur, section: T.name };
    lines[r.line] = after;
    return done(text, lines, { op: 'update', line: r.line, meeting: v, prev: cur, before, after, section: T.name });
  }
  // ---- 빼기: -> removed(값), removedText(원래 줄 글), before(바로 뒤 줄 글, 되돌리기 자리) ----
  function removeMeeting(text, key) {
    const lines = LT.splitLines(text), T = meetTable(lines), r = findRow(lines, T.t, key);
    const i = T.t.rows.indexOf(r), next = T.t.rows[i + 1], removedText = lines[r.line];
    lines.splice(r.line, 1);
    return done(text, lines, { op: 'remove', line: r.line, removed: objOf(r.cells), removedText, before: next ? sigOf(lines[next.line - 1]) : null, section: T.name });
  }

  // ---- 안전 검사 (메인이 쓰기 직전에): ## 약속 표 줄만 op만큼 바뀌었는지 ----
  //   섹션 밖·섹션 안 글 줄·표 머리·구분선은 한 글자도 같음 (표가 없던 섹션에 머리·구분선을 처음 넣는 것만 허용)
  //   add = 한 줄 생김 / remove = 한 줄 빠짐 / update = 같은 자리 한 줄만 바뀜. 생기거나 바뀐 줄은 칸 3개·날짜·시간·내용 검사
  function rowOk(l) {
    if (!/^\s*\|/.test(l) || /^\s*\|?\s*:?-{3,}/.test(l)) return false;
    const c = LT.cells(l); if (c.length !== 3) return false;
    return LT.isDate(c[0]) && okOld(c[1], TIME_MAX) && !!c[2] && okOld(c[2], OLD_MAX);
  }
  function onlyMeetingsChanged(oldText, newText, op) {
    try {
      const a = LT.splitLines(oldText), b = LT.splitLines(newText);
      const find = (L) => { const s = Md.sections(L).filter((x) => NAMES.includes(x.name)); return s.length === 1 ? s[0] : null; };
      const sa = find(a), sb = find(b); if (!sa || !sb || sa.name !== sb.name) return false;
      if (a.slice(0, sa.line).join('\n') !== b.slice(0, sb.line).join('\n')) return false;
      if (a.slice(sa.end).join('\n') !== b.slice(sb.end).join('\n')) return false;
      const ta = LT.tableOf(a, sa), tb = LT.tableOf(b, sb);
      if (!tb || tb.head.join('|') !== HEAD.join('|') || tb.sepLine == null) return false;
      const inT = (t, s, i) => t && s.line + 1 + i >= t.headLine && s.line + 1 + i < t.endLine;
      const prose = (L, s, t) => { const x = L.slice(s.start, s.end).filter((l, i) => !inT(t, s, i)); while (x.length && !x[x.length - 1].trim()) x.pop(); return x.join('\n'); };
      if (prose(a, sa, ta) !== prose(b, sb, tb)) return false;
      if (ta) { // 머리 그대로, 구분선 그대로(없었으면 새 구분선만)
        if (a[ta.headLine] !== b[tb.headLine]) return false;
        if (ta.sepLine != null ? a[ta.sepLine] !== b[tb.sepLine] : b[tb.sepLine] !== LT.sepText(3)) return false;
      } else if (b[tb.headLine] !== LT.rowText(HEAD) || b[tb.sepLine] !== LT.sepText(3) || op !== 'add') return false;
      const ra = ta ? ta.rows.map((r) => a[r.line]) : [], rb = tb.rows.map((r) => b[r.line]);
      const minus = (xs, i) => xs.slice(0, i).concat(xs.slice(i + 1)), eq = (x, y) => x.join('\n') === y.join('\n');
      if (op === 'add') { if (rb.length !== ra.length + 1) return false; for (let i = 0; i < rb.length; i++) if (eq(minus(rb, i), ra)) return rowOk(rb[i]); return false; }
      if (op === 'remove') { if (rb.length !== ra.length - 1) return false; for (let i = 0; i < ra.length; i++) if (eq(minus(ra, i), rb)) return true; return false; }
      if (op === 'update') {
        if (rb.length !== ra.length) return false;
        const d = ra.map((x, i) => (x === rb[i] ? -1 : i)).filter((i) => i >= 0);
        return d.length === 1 && rowOk(rb[d[0]]);
      }
      return false;
    } catch (e) { return false; }
  }

  const ME = { HEAD, NAMES, TEXT_MAX, TIME_MAX, checkDate, checkTime, checkText, check, normTime, minutes, meetTable, addMeeting, updateMeeting, removeMeeting, onlyMeetingsChanged, rowOk, sigOf };
  root.PHMeetingEdit = ME;
  if (typeof module !== 'undefined' && module.exports) module.exports = ME;
})(typeof window !== 'undefined' ? window : globalThis);

};
RT.MODS["/app/electron/record_ipc.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 기록 넓히기 쓰기 (메인 프로세스, 2026-10-08 비트, 로드맵 3단계). 약속 쓰기(electron/meeting_ipc.js)와 같은 안전 규칙.
//   - 대상 파일(settings.LIFE_FILE)·섹션·오늘 날짜는 메인이 정한다. 화면은 값·고를 줄 글(sig)·"읽은 시각"만 보낸다 (경로를 보낼 수 없음)
//   - 앱이 읽은 뒤 파일이 바뀌었으면 쓰지 않고 새 글을 돌려줌 (conflict)
//   - 값이 틀리면 쓰지 않고 { ok: false, code } (badTitle, badText, badDate, badKind, kindBad, kindDup, badPart, dupPart, notFound, ...)
//   - 쓰기 직전 백업(main.js backup), 바뀐 줄 검사(섹션마다 only…Changed)를 통과해야 씀
// 여는 함수(정해진 것만):
//   기록(## 기록): ph:recordAdd, ph:recordUpdate, ph:recordRemove / 기록 항목(## 기록 항목): ph:recordKindAdd, ph:recordKindRemove
//   버킷리스트(## 버킷리스트 줄): ph:bucketAdd, ph:bucketDone, ph:bucketEdit, ph:bucketRemove
//   공부 단원(## 공부 단원): ph:partAdd, ph:partRename, ph:partRemove, ph:partToggle
// main.js에서 한 번 부른다: require('./record_ipc.js')({ ipcMain, file, backup, settings, fixedDay, guard })
'use strict';
const fs = require('fs');
const path = require('path');

module.exports = function register(o) {
  const J = (f) => require(path.join(__dirname, '..', 'js', f));
  J('life_md.js'); J('table_section.js');
  const RW = J('record_write.js'), BK = J('bucket_write.js'), SP = J('study_parts.js');
  const { ipcMain, file, backup, settings, fixedDay, guard } = o;
  const day = () => (fixedDay && fixedDay()) || J('life_md.js').logDay(Date.now(), settings && settings.DAY_START_HOUR);

  // check(old, new, op) = 그 섹션만 바뀌었는지
  function write(req, check, plan) {
    if (guard) guard();
    if (!req || typeof req !== 'object') throw new Error('요청 형식 오류');
    const seen = req.lastModified;
    const cur = fs.readFileSync(file, 'utf8'), mtime = fs.statSync(file).mtimeMs;
    if (typeof seen !== 'number' || Math.abs(seen - mtime) > 1) return { ok: false, conflict: true, text: cur, lastModified: mtime };
    const date = day();
    let r;
    try { r = plan(cur, date); } catch (e) { if (e.code) return { ok: false, code: e.code, message: e.message, text: cur, lastModified: mtime, date }; throw e; }
    const extra = {};
    ['op', 'before', 'after', 'next', 'line', 'created', 'record', 'kind', 'subject', 'part', 'old', 'on', 'date'].forEach((k) => { if (r[k] !== undefined) extra[k] = r[k]; });
    if (extra.date === undefined) extra.date = date;
    if (!r.changed) return Object.assign({ ok: true, unchanged: true, text: cur, lastModified: mtime }, extra);
    if (!check(cur, r.text, r.op)) throw new Error('정해진 섹션 밖이 바뀌려 해서 멈춤 (' + r.op + ')');
    const dir = backup(cur);
    fs.writeFileSync(file, r.text);
    return Object.assign({ ok: true, text: r.text, lastModified: fs.statSync(file).mtimeMs, backupDir: dir }, extra);
  }
  const str = (v) => typeof v === 'string' && v.length <= 4000;
  const optStr = (v) => v == null || str(v);
  const sig = (v) => { if (!str(v) || v.length > 4000) throw new Error('줄 고르기 형식 오류'); return v; };
  function only(obj, keys) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('값 형식 오류');
    const out = {};
    Object.keys(obj).forEach((k) => { if (!keys.includes(k)) throw new Error('모르는 칸: ' + k); if (!optStr(obj[k])) throw new Error('값 형식 오류: ' + k); if (obj[k] != null) out[k] = obj[k]; });
    return out;
  }
  const undoOpt = (req) => { if (!optStr(req.before) || !optStr(req.raw)) throw new Error('값 형식 오류'); return req.raw != null ? { before: req.before, raw: req.raw } : null; };

  // ---- 기록 (영화·연극·새 항목) ----
  const recCheck = (a, b, op) => RW.onlyRecordChanged(a, b, op);
  ipcMain.handle('ph:recordAdd', (e, req) => write(req, recCheck, (cur, date) => {
    const u = undoOpt(req); if (u) return RW.addRecord(cur, null, u);
    const r = only(req.record, ['kind', 'date', 'title', 'summary']);
    return RW.addRecord(cur, { kind: r.kind, date: r.date || date, title: r.title, summary: r.summary || '' });
  }));
  ipcMain.handle('ph:recordUpdate', (e, req) => write(req, recCheck, (cur, date) => {
    const u = undoOpt(req); if (u) return RW.updateRecord(cur, sig(req.sig), null, u);
    const r = only(req.record, ['kind', 'date', 'title', 'summary']);
    return RW.updateRecord(cur, sig(req.sig), { kind: r.kind, date: r.date || date, title: r.title, summary: r.summary || '' });
  }));
  ipcMain.handle('ph:recordRemove', (e, req) => write(req, recCheck, (cur) => RW.removeRecord(cur, sig(req.sig))));
  const kindCheck = (a, b, op) => RW.onlyKindChanged(a, b, op);
  ipcMain.handle('ph:recordKindAdd', (e, req) => write(req, kindCheck, (cur, date) => {
    const u = undoOpt(req); if (u) return RW.addKind(cur, null, null, u);
    if (!str(req.name)) throw new Error('이름 형식 오류');
    return RW.addKind(cur, req.name, date);
  }));
  ipcMain.handle('ph:recordKindRemove', (e, req) => write(req, kindCheck, (cur, date) => { if (!str(req.name)) throw new Error('이름 형식 오류'); return RW.removeKind(cur, req.name, date); })); // date = 화면에만 있던 영화·연극을 실제 줄로 적을 때 만든 날

  // ---- 버킷리스트 ----
  const bkCheck = (a, b, op) => BK.onlyBucketChanged(a, b, op);
  ipcMain.handle('ph:bucketAdd', (e, req) => write(req, bkCheck, (cur) => { const u = undoOpt(req); if (u) return BK.addItem(cur, null, u); if (!str(req.text)) throw new Error('형식 오류'); return BK.addItem(cur, req.text); }));
  ipcMain.handle('ph:bucketDone', (e, req) => write(req, bkCheck, (cur, date) => { if (typeof req.done !== 'boolean') throw new Error('형식 오류'); return BK.setDone(cur, sig(req.sig), req.done, date); }));
  ipcMain.handle('ph:bucketEdit', (e, req) => write(req, bkCheck, (cur) => { const u = undoOpt(req); if (u) return BK.editItem(cur, sig(req.sig), null, u); if (!str(req.text)) throw new Error('형식 오류'); return BK.editItem(cur, sig(req.sig), req.text); }));
  ipcMain.handle('ph:bucketRemove', (e, req) => write(req, bkCheck, (cur) => BK.removeItem(cur, sig(req.sig))));

  // ---- 공부 단원 ----
  const partCheck = (a, b, op) => SP.onlyPartsChanged(a, b, op);
  ipcMain.handle('ph:partAdd', (e, req) => write(req, partCheck, (cur) => { const u = undoOpt(req); if (u) return SP.addPart(cur, null, null, u); if (!str(req.subject) || !str(req.part)) throw new Error('형식 오류'); return SP.addPart(cur, req.subject, req.part); }));
  ipcMain.handle('ph:partRename', (e, req) => write(req, partCheck, (cur) => { if (!str(req.part)) throw new Error('형식 오류'); return SP.renamePart(cur, sig(req.sig), req.part); }));
  ipcMain.handle('ph:partRemove', (e, req) => write(req, partCheck, (cur) => SP.removePart(cur, sig(req.sig))));
  ipcMain.handle('ph:partToggle', (e, req) => write(req, partCheck, (cur) => {
    if (!str(req.subject) || !str(req.part) || !str(req.date)) throw new Error('형식 오류');
    return SP.toggle(cur, req.subject, req.part, req.date);
  }));
};

};
RT.MODS["/app/js/record_write.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 영화·연극·새 기록 항목 (2026-10-08 비트, 로드맵 3단계 "기록 폼"). 그림·파일 접근 없음. 메인(electron/record_ipc.js)·화면(js/record_list.js)·Node 시험이 같이 쓴다.
// 생활 기록 파일에 새 섹션 두 개 (기존 파서 js/life_md.js는 모르는 섹션을 건너뛰므로 안 깨짐):
//   ## 기록        | 항목 | 날짜 | 제목 | 요약 |   한 줄 = 본 것 하나. 항목 = 영화·연극·(사용자가 만든 항목 이름)
//   ## 기록 항목   | 항목 | 만든 날 |              기록 칸 목록. 생활 습관 > 기록 편집에서 더하고 지움
//   영화·연극 (2026-10-08 제작자 피드백 4: "기본이 아니야, 지울 수 있어야"): 다른 칸과 같이 지울 수 있음.
//     ## 기록 항목 섹션이 아직 없는 파일(이 기능 전 파일·공용판 새 파일)만 영화 한 칸이 있는 것으로 봄 (virtual. 2026-10-08 제작자: 공용판 기본은 영화만).
//     그 파일에서 처음 칸을 더하거나 지울 때 섹션을 만들며 영화를 실제 줄로 적음 (op 'seed'). 섹션이 생긴 뒤에는 적힌 줄만 칸
//   새로 만들 자리: ## 버킷리스트 바로 앞 (없으면 파일 끝). 독서(## 독서)와 같은 규칙
// 기록 항목을 지워도 ## 기록 줄은 남음 (같은 이름을 다시 만들면 다시 보임)
(function (root) {
  'use strict';
  const TS = root.PHTableSection || (typeof require !== 'undefined' ? require('./table_section.js') : null);

  const RECORD = { name: '기록', head: ['항목', '날짜', '제목', '요약'], before: ['버킷리스트'] };
  const KIND = { name: '기록 항목', head: ['항목', '만든 날'], before: ['기록', '버킷리스트'] };
  const DEFAULT_KINDS = [{ id: 'movie', name: '영화' }]; // 섹션 없는 파일에서만 보이는 처음 칸 (잠금 없음). 2026-10-08 제작자: 공용판 기본은 영화만
  const KNOWN_IDS = { 영화: 'movie', 연극: 'play' }; // 예전부터 있던 칸 id (연극은 기본에서 빠졌어도 적힌 파일에서는 그대로)
  const MOVIE_KINDS = ['영화', '연극']; // 생활일지 "영화·연극" 탭이 묶어 보이는 칸 이름
  const TV_KINDS = ['영화']; // TV(features.js record)가 여는 칸. 2026-10-08 제작자: 한 가구에 한 기능 -> 연극은 다른 기록 칸처럼 따로 연동 (rk:연극)
  const TITLE_MAX = 60, SUMMARY_MAX = 2000, KIND_MAX = 12;
  // 기존 생활일지 탭·습관 이름과 겹치면 헷갈려서 막는 이름
  const RESERVED = ['독서', '물', '대변', '식사', '모아 보기', '공부', '약속', '버킷리스트'];

  const len = (s) => Array.from(String(s)).length;
  function isDate(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const [y, m, d] = s.split('-').map(Number), x = new Date(y, m - 1, d);
    return x.getFullYear() === y && x.getMonth() === m - 1 && x.getDate() === d;
  }
  const bad = (code, msg) => TS.err(code, msg);
  function checkTitle(s) {
    if (typeof s !== 'string') throw bad('badTitle', '제목 형식 오류');
    const t = s.replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!t) throw bad('badTitle', '제목이 비었음');
    if (len(t) > TITLE_MAX) throw bad('badTitle', '제목이 너무 김');
    return t;
  }
  function checkSummary(s) {
    if (s != null && typeof s !== 'string') throw bad('badText', '요약 형식 오류');
    const t = String(s == null ? '' : s).replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b-\u001f\u007f\u2028\u2029]/g, '').trim();
    if (len(t) > SUMMARY_MAX) throw bad('badText', '요약이 너무 김');
    return t;
  }
  function checkDate(s) { if (!isDate(s)) throw bad('badDate', '날짜 오류'); return s; }
  // 항목 이름: 글자(한글·영문)와 띄어쓰기만, 1~12자 (부기 kindBad "기호나 숫자를 빼고")
  function cleanKind(s) {
    if (typeof s !== 'string') throw bad('kindBad', '이름 형식 오류');
    const t = s.replace(/\s+/g, ' ').trim();
    if (!t || len(t) > KIND_MAX || !/^[가-힣ㄱ-ㅎㅏ-ㅣA-Za-z ]+$/.test(t)) throw bad('kindBad', '이름 오류');
    return t;
  }

  // ---- 읽기 ----
  // -> { records: [{ kind, date, title, summary, sig, line, i }], kinds: [{ name, id, custom, virtual, sig, made }], seeded, error }
  //   custom = 영화·연극이 아닌 칸 (생활일지에서 따로 탭). virtual = 섹션이 없어 화면에만 있는 영화·연극 (지우기·더하기 때 실제 줄로 적힘)
  const idOf = (n) => KNOWN_IDS[n] || 'k:' + n;
  function parse(src) {
    const R = TS.read(src, RECORD), K = TS.read(src, KIND);
    const kinds = K.has ? [] : DEFAULT_KINDS.map((k) => ({ name: k.name, id: k.id, custom: false, virtual: true }));
    K.rows.forEach((r) => { const n = r.cells['항목'].trim(); if (n && !kinds.some((k) => k.name === n)) kinds.push({ name: n, id: idOf(n), custom: !MOVIE_KINDS.includes(n), sig: r.raw, made: r.cells['만든 날'] }); });
    const records = R.rows.map((r, i) => ({ kind: r.cells['항목'].trim(), date: r.cells['날짜'].trim(), title: r.cells['제목'], summary: r.cells['요약'], sig: r.raw, line: r.line, i }));
    return { records, kinds, seeded: !!K.has, error: R.error || K.error || null };
  }
  // 한 항목의 기록: 최신 날짜 먼저, 같은 날은 나중에 적은 것 먼저. 날짜 못 읽은 줄은 맨 뒤
  function listOf(P, kind) {
    return P.records.filter((r) => r.kind === kind).sort((a, b) => (isDate(b.date) ? b.date : '') .localeCompare(isDate(a.date) ? a.date : '') || b.i - a.i);
  }
  // 달마다 묶기: [{ month: '2026-10', items }]
  function byMonth(list) {
    const m = new Map();
    list.forEach((r) => { const k = isDate(r.date) ? r.date.slice(0, 7) : '?'; if (!m.has(k)) m.set(k, []); m.get(k).push(r); });
    return [...m.entries()].map(([month, items]) => ({ month, items }));
  }
  const kindNames = (src) => parse(src).kinds.map((k) => k.name);

  // ---- 쓰기 ----
  function cellsOf(r) { return [TS.encode(r.kind), r.date, TS.encode(r.title), TS.encode(r.summary)]; }
  function cleanRecord(src, o) {
    o = o || {};
    const kind = String(o.kind || '').trim();
    if (!kindNames(src).includes(kind)) throw bad('badKind', '모르는 기록 항목: ' + kind);
    return { kind, date: checkDate(o.date), title: checkTitle(o.title), summary: checkSummary(o.summary) };
  }
  function addRecord(src, o, opt) {
    if (opt && opt.raw != null) { // 지우기 되돌리기: 원래 글자 그대로 (칸 검사는 안전 검사에서)
      return Object.assign(TS.addRow(src, RECORD, null, { before: opt.before, raw: opt.raw }), {});
    }
    const r = cleanRecord(src, o);
    return Object.assign(TS.addRow(src, RECORD, cellsOf(r)), { record: r });
  }
  function updateRecord(src, sig, o, opt) {
    if (opt && opt.raw != null) return TS.updateRow(src, RECORD, sig, null, { raw: opt.raw });
    const r = cleanRecord(src, o);
    return Object.assign(TS.updateRow(src, RECORD, sig, cellsOf(r)), { record: r });
  }
  function removeRecord(src, sig) { return TS.removeRow(src, RECORD, sig); }
  // 섹션이 없는 파일: 섹션을 만들며 화면에만 있던 칸(영화·연극) 중 keep 을 실제 줄로 적고, 끝에 extra(새 칸) 한 줄. op 'seed'
  function seed(src, keep, extra, date) {
    let text = src, row = null;
    keep.concat(extra ? [extra] : []).forEach((n) => { const r = TS.addRow(text, KIND, [TS.encode(n), date]); text = r.text; row = r.after; });
    if (!row) { const r = TS.addRow(text, KIND, [TS.encode(DEFAULT_KINDS[0].name), date]); text = TS.removeRow(r.text, KIND, r.after).text; } // 남는 칸 0개 (기본 영화 한 칸을 지움): 머리만 있는 빈 섹션 = 다시 virtual 안 됨
    return { text, changed: text !== src, op: 'seed', created: true, after: row };
  }
  function addKind(src, name, date, opt) {
    if (opt && opt.raw != null) return TS.addRow(src, KIND, null, { before: opt.before, raw: opt.raw });
    const n = cleanKind(name);
    if (RESERVED.includes(n)) throw bad('kindBad', '쓸 수 없는 이름');
    const P = parse(src);
    if (P.kinds.some((k) => k.name === n)) throw bad('kindDup', '같은 이름이 있음');
    if (!P.seeded) return Object.assign(seed(src, P.kinds.map((k) => k.name), n, checkDate(date)), { kind: n });
    return Object.assign(TS.addRow(src, KIND, [TS.encode(n), checkDate(date)]), { kind: n });
  }
  // 칸 지우기: ## 기록 항목 줄만 빠짐 (## 기록 줄은 남음). 화면에만 있던 칸(섹션 없음)이면 섹션을 만들며 나머지만 적음 (date = 만든 날)
  //   before = 지운 줄 글, next = 뒤 줄 글 -> 되돌리기 addKind(null, null, { before: next, raw: before })
  function removeKind(src, name, date) {
    const P = parse(src), k = P.kinds.find((x) => x.name === name);
    if (!k) throw bad('notFound', '기록 항목 없음');
    if (k.virtual) {
      const d = checkDate(date), rest = P.kinds.filter((x) => x.name !== name).map((x) => x.name), i = P.kinds.indexOf(k);
      const r = seed(src, rest, null, d), row = (n) => TS.rowText([TS.encode(n), d]);
      return Object.assign(r, { kind: name, before: row(name), next: P.kinds[i + 1] ? row(P.kinds[i + 1].name) : null });
    }
    return Object.assign(TS.removeRow(src, KIND, k.sig), { kind: name });
  }

  // ---- 안전 검사 ----
  const okRecord = (c) => !!c[0].trim() && isDate(c[1]) && !!c[2].trim() && !/\n/.test(c[2]) && len(c[2]) <= TITLE_MAX && len(c[3]) <= SUMMARY_MAX;
  const okKind = (c) => { try { return cleanKind(c[0]) === c[0] && isDate(c[1]); } catch (e) { return false; } };
  function onlyRecordChanged(oldText, newText, op) { return TS.onlyRowsChanged(oldText, newText, RECORD, op, okRecord); }
  function onlyKindChanged(oldText, newText, op) { return TS.onlyRowsChanged(oldText, newText, KIND, op, okKind); } // op 'seed' = 섹션 새로 + 줄 여러 개 (js/table_section.js)

  const RW = { RECORD, KIND, DEFAULT_KINDS, MOVIE_KINDS, TV_KINDS, TITLE_MAX, SUMMARY_MAX, KIND_MAX, RESERVED, isDate, checkTitle, checkSummary, cleanKind, parse, listOf, byMonth,
    addRecord, updateRecord, removeRecord, addKind, removeKind, onlyRecordChanged, onlyKindChanged };
  root.PHRecordWrite = RW;
  if (typeof module !== 'undefined' && module.exports) module.exports = RW;
})(typeof window !== 'undefined' ? window : globalThis);

};
RT.MODS["/app/js/bucket_write.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 버킷리스트 쓰기 (2026-10-08 비트, 로드맵 3단계 "버킷리스트 메모지"). 그림·파일 접근 없음. 메인(electron/record_ipc.js)·화면(js/bucket_memo.js)·Node 시험이 같이 쓴다.
// 기존 모양 그대로: ## 버킷리스트 섹션의 "- [ ] 할 일" / "- [x] 한 일" 줄 (js/life_md.js가 읽는 모양)
//   체크하면 "- [x] 할 일 (완료 2026-10-08)" -> 완료 탭에 끝낸 날로 보임. 옛 "- [x] 줄"(날짜 없음)도 완료로 읽음
//   체크 풀기 = "- [ ] 할 일" (끝낸 날 지움). 자리는 그대로 (줄을 옮기지 않음: 되돌리기가 정확하도록)
//   더하기 = 마지막 체크 줄 바로 뒤 (체크 줄이 없으면 섹션 머리 바로 뒤, 섹션이 없으면 파일 끝에 새로)
//   "(…채우기)"처럼 괄호만 있는 자리 표시 줄은 건드리지 않음 (화면에도 안 나옴)
// 줄 고르기 = 읽은 그 줄 글(sig). 같은 글이 둘이면 마지막 줄
(function (root) {
  'use strict';
  const Md = root.PHLifeMd || (typeof require !== 'undefined' ? require('./life_md.js') : null);
  const TS = root.PHTableSection || (typeof require !== 'undefined' ? require('./table_section.js') : null);
  const SEC = '버킷리스트', TEXT_MAX = 80;
  const ITEM = /^\s*[-*]\s+\[([ xX])\]\s*(.*)$/;
  const DONE = /\s*\(완료 (\d{4}-\d{2}-\d{2})\)\s*$/;
  const len = (s) => Array.from(String(s)).length;
  const isDate = (s) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(String(s))) return false; const [y, m, d] = s.split('-').map(Number), x = new Date(y, m - 1, d); return x.getMonth() === m - 1 && x.getDate() === d; };
  const bad = (code, msg) => TS.err(code, msg);

  // 한 줄 읽기 -> { done, text, doneDate, placeholder } 또는 null
  function item(l) {
    const m = ITEM.exec(l); if (!m) return null;
    let t = m[2].trim(), doneDate = null;
    const d = DONE.exec(t); if (d && m[1] !== ' ') { doneDate = d[1]; t = t.slice(0, d.index).trim(); }
    return { done: m[1] !== ' ', text: t, doneDate, placeholder: /^\(.*\)$/.test(t) || !t };
  }
  function checkText(s) {
    if (typeof s !== 'string') throw bad('badText', '형식 오류');
    const t = s.replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!t || len(t) > TEXT_MAX || /^\(.*\)$/.test(t) || DONE.test(t)) throw bad('badText', '내용 오류');
    return t;
  }
  const lineOf = (done, text, date) => (done ? `- [x] ${text}${date ? ` (완료 ${date})` : ''}` : `- [ ] ${text}`);

  function find(lines) {
    const all = Md.sections(lines).filter((s) => s.name === SEC);
    if (all.length > 1) throw bad('dupSection', '같은 섹션이 둘');
    return all[0] || null;
  }
  // -> { items: [{ line, sig, done, text, doneDate }], has } (자리 표시 줄 빠짐)
  function parse(src) {
    const lines = Array.isArray(src) ? src : TS.splitLines(src);
    let s; try { s = find(lines); } catch (e) { return { items: [], has: true, error: e.message }; }
    if (!s) return { items: [], has: false };
    const items = [];
    for (let i = s.start; i < s.end; i++) { const it = item(lines[i]); if (it && !it.placeholder) items.push(Object.assign({ line: i, sig: lines[i].trim() }, it)); }
    return { items, has: true };
  }
  // 버킷 탭 = 안 한 것(파일 순서), 완료 탭 = 끝낸 날 최신 먼저 (날짜 없는 옛 줄은 뒤)
  function tabs(P) {
    const todo = P.items.filter((x) => !x.done);
    const done = P.items.filter((x) => x.done).map((x, i) => Object.assign({ i }, x)).sort((a, b) => (b.doneDate || '').localeCompare(a.doneDate || '') || b.i - a.i);
    return { todo, done };
  }
  const out = (src, lines, extra) => Object.assign({ text: lines.join(TS.nlOf(src)), changed: true }, extra);
  function pick(lines, s, sig) {
    const hits = []; for (let i = s.start; i < s.end; i++) if (lines[i].trim() === String(sig).trim() && item(lines[i])) hits.push(i);
    if (!hits.length) throw bad('notFound', '줄 없음');
    return hits[hits.length - 1];
  }
  // 더하기 (opt.before = 그 줄 앞에, opt.raw = 되돌리기 원래 글자)
  function addItem(src, text, opt) {
    opt = opt || {};
    const lines = TS.splitLines(src), s = find(lines);
    const row = opt.raw != null ? String(opt.raw).trim() : lineOf(false, checkText(text));
    if (!s) {
      let at = lines.length; while (at > 0 && lines[at - 1] === '') at--;
      lines.splice(at, 0, '', '## ' + SEC, row);
      return out(src, lines, { op: 'add', line: at + 2, created: true, after: row });
    }
    let at = null;
    if (opt.before != null) { for (let i = s.start; i < s.end; i++) if (lines[i].trim() === String(opt.before).trim() && item(lines[i])) { at = i; break; } }
    if (at == null) { at = s.line + 1; for (let i = s.start; i < s.end; i++) if (item(lines[i])) at = i + 1; }
    lines.splice(at, 0, row);
    return out(src, lines, { op: 'add', line: at, after: row });
  }
  // 체크 / 체크 풀기 (date = 끝낸 날, 메인이 정함)
  function setDone(src, sig, done, date) {
    const lines = TS.splitLines(src), s = find(lines); if (!s) throw bad('noSection', '섹션 없음');
    const i = pick(lines, s, sig), it = item(lines[i]), before = lines[i].trim();
    if (done && !isDate(date)) throw bad('badDate', '날짜 오류');
    const after = lineOf(!!done, it.text, done ? (it.done && it.doneDate ? it.doneDate : date) : null);
    if (after === before) return { text: src, changed: false, op: 'update', line: i, before, after };
    lines[i] = after;
    return out(src, lines, { op: 'update', line: i, before, after, text0: it.text });
  }
  // 글 고치기 (체크·끝낸 날 그대로) / 되돌리기 (opt.raw)
  function editItem(src, sig, text, opt) {
    const lines = TS.splitLines(src), s = find(lines); if (!s) throw bad('noSection', '섹션 없음');
    const i = pick(lines, s, sig), it = item(lines[i]), before = lines[i].trim();
    const after = opt && opt.raw != null ? String(opt.raw).trim() : lineOf(it.done, checkText(text), it.doneDate);
    if (after === before) return { text: src, changed: false, op: 'update', line: i, before, after };
    lines[i] = after;
    return out(src, lines, { op: 'update', line: i, before, after });
  }
  function removeItem(src, sig) {
    const lines = TS.splitLines(src), s = find(lines); if (!s) throw bad('noSection', '섹션 없음');
    const i = pick(lines, s, sig), before = lines[i].trim();
    let next = null; for (let j = i + 1; j < s.end; j++) if (item(lines[j])) { next = lines[j].trim(); break; }
    lines.splice(i, 1);
    return out(src, lines, { op: 'remove', line: i, before, next });
  }

  // 안전 검사: 섹션 밖·섹션 안 체크 줄 아닌 줄은 그대로, 체크 줄은 op대로 (add +1 / update 같은 자리 1 / remove -1), 새 줄은 모양 검사
  function onlyBucketChanged(oldText, newText, op) {
    try {
      const a = TS.splitLines(oldText), b = TS.splitLines(newText), A = find(a), B = find(b); if (!B) return false;
      const cut = (L, s) => (s ? L.slice(0, s.line).concat(L.slice(s.end)) : L.slice());
      const trim = (x) => { const c = x.slice(); while (c.length && c[c.length - 1].trim() === '') c.pop(); return c; };
      if (cut(a, A).join('\n') !== cut(b, B).join('\n') && (A || trim(cut(a, A)).join('\n') !== trim(cut(b, B)).join('\n'))) return false;
      if (!A && B.end !== b.length && trim(b.slice(B.line)).length !== b.slice(B.line).length) return false;
      const other = (L, s) => (s ? trim(L.slice(s.line, s.end).filter((l) => !item(l))).join('\n') : '## ' + SEC);
      if (other(a, A) !== other(b, B)) return false;
      const its = (L, s) => (s ? L.slice(s.start, s.end).filter((l) => item(l)).map((l) => l.trim()) : []);
      const xa = its(a, A), xb = its(b, B);
      const diff = (xs, ys) => { const m = new Map(); xs.forEach((v) => m.set(v, (m.get(v) || 0) + 1)); const extra = []; ys.forEach((v) => { if (m.get(v)) m.set(v, m.get(v) - 1); else extra.push(v); }); return extra; };
      const gone = diff(xb, xa), added = diff(xa, xb), want = { add: [0, 1], update: [1, 1], remove: [1, 0] }[op];
      if (!want || gone.length !== want[0] || added.length !== want[1]) return false;
      if (op === 'update' && xa.indexOf(gone[0]) !== xb.indexOf(added[0])) return false;
      return added.every((l) => { const it = item(l); if (!it || it.placeholder || len(it.text) > TEXT_MAX) return false; const d = DONE.exec(ITEM.exec(l)[2]); return !d || isDate(d[1]); });
    } catch (e) { return false; }
  }

  const BKW = { SEC, TEXT_MAX, item, parse, tabs, checkText, addItem, setDone, editItem, removeItem, onlyBucketChanged };
  root.PHBucketWrite = BKW;
  if (typeof module !== 'undefined' && module.exports) module.exports = BKW;
})(typeof window !== 'undefined' ? window : globalThis);

};
RT.MODS["/app/electron/logs_ipc.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 대변 관찰 일지·식사 일지 쓰기 (메인 프로세스, 2026-10-04 비트, logs 브랜치). 물컵·독서(electron/book_ipc.js)와 같은 안전 규칙.
//   - 대상 파일(settings.LIFE_FILE)·섹션은 메인이 정한다. 화면은 기록 값과 "읽은 시각"만 보낸다 (경로를 보낼 수 없음)
//   - 앱이 읽은 뒤 파일이 바뀌었으면 쓰지 않고 새 글을 돌려줌 (conflict)
//   - 값 검사는 js/poop_log.js, js/meal_log.js. 날짜는 오늘(하루 경계 6시)까지만, 비우면 오늘 / 시각을 비우면 지금
//   - 쓰기 직전 백업(main.js backup), 바뀐 줄 검사(onlyPoopChanged / onlyMealChanged)를 통과해야 씀
//   - 건강 기록: 이 파일 밖으로 보내지 않음 (네트워크 없음)
// 여는 함수 (정해진 것만): addPoop, updatePoop, removePoop, addMeal2, updateMeal, removeMeal
// 일지 기능 끄기 (2026-10-04 제작자 결정): 생활습관 표에 대변·식사 줄이 없고, 전에 한 번이라도 있었으면(features.isSeen) 더하기를 거절 { ok: false, off: true }.
//   한 번도 없었으면 지금처럼 첫 저장 때 줄을 더하고 seen에 적음. 고치기·지우기는 그대로 (화면에서 들어갈 곳이 없어짐)
// main.js에서 한 번 부른다: require('./logs_ipc.js')({ ipcMain, file, backup, settings, fixedDay, guard, features })
'use strict';
const fs = require('fs');
const path = require('path');

module.exports = function register(o) {
  const PL = require(path.join(__dirname, '..', 'js', 'poop_log.js'));
  const ML = require(path.join(__dirname, '..', 'js', 'meal_log.js'));
  const LT = require(path.join(__dirname, '..', 'js', 'log_table.js'));
  const { ipcMain, file, backup, settings, fixedDay, guard, features } = o;
  const FID = { poop: 'poop', meal: 'meal' }, HAB = { poop: PL.HABIT, meal: ML.HABIT };
  const day = () => (fixedDay && fixedDay()) || LT.logDay(Date.now(), settings.DAY_START_HOUR);

  function write(kind, op, req, plan) {
    if (guard) guard();
    if (!req || typeof req !== 'object') throw new Error('요청 형식 오류');
    const seen = req.lastModified;
    const cur = fs.readFileSync(file, 'utf8'), mtime = fs.statSync(file).mtimeMs;
    if (typeof seen !== 'number' || Math.abs(seen - mtime) > 1) return { ok: false, conflict: true, text: cur, lastModified: mtime };
    const date = day();
    if (op === 'add' && features && !LT.hasHabit(LT.splitLines(cur), HAB[kind].name) && features.isSeen(FID[kind])) return { ok: false, off: true, text: cur, lastModified: mtime, date, op };
    const r = plan(cur, date);
    if (!r.changed) return { ok: true, unchanged: true, text: cur, lastModified: mtime, date, op, entry: r.entry };
    const safe = kind === 'poop' ? PL.onlyPoopChanged(cur, r.text, op) : ML.onlyMealChanged(cur, r.text, op);
    if (!safe) throw new Error('## ' + (kind === 'poop' ? PL.SEC : ML.SEC) + ' 표 밖이 바뀌려 해서 멈춤');
    const dir = backup(cur);
    fs.writeFileSync(file, r.text);
    if (features && LT.hasHabit(LT.splitLines(r.text), HAB[kind].name)) features.markSeen(FID[kind]);
    return { ok: true, text: r.text, lastModified: fs.statSync(file).mtimeMs, date, op, entry: r.entry || null, removed: r.removed || null, line: r.line, created: !!r.created, habitAdded: !!r.habitAdded, backupDir: dir };
  }
  const FIELDS = { poop: ['date', 'time', 'form', 'amount', 'color', 'memo'], meal: ['date', 'time', 'kind', 'menu', 'rating', 'amount', 'memo'] };
  function clean(kind, v) { // 정해진 칸만, 글자·숫자·null만
    if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('기록 값 형식 오류');
    const out = {};
    Object.keys(v).forEach((k) => {
      if (!FIELDS[kind].includes(k)) throw new Error('모르는 칸: ' + k);
      const x = v[k];
      if (!(x == null || typeof x === 'string' || (typeof x === 'number' && isFinite(x)))) throw new Error('값 형식 오류: ' + k);
      if (typeof x === 'string' && x.length > 5000) throw new Error('값이 너무 김: ' + k);
      out[k] = x;
    });
    return out;
  }
  function key(k) { // 줄 고르기 = { sig: 읽은 그 줄 글 }
    if (!k || typeof k !== 'object' || typeof k.sig !== 'string' || k.sig.length > 10000) throw new Error('기록 고르기 형식 오류');
    return { sig: k.sig };
  }
  function nowHm() { const n = new Date(), p = (x) => String(x).padStart(2, '0'); return p(n.getHours()) + ':' + p(n.getMinutes()); }
  function withDefaults(v, today) { // 날짜 비면 오늘, 시각 비면 지금. 오늘 뒤 날짜는 거절
    const e = Object.assign({}, v);
    if (e.date == null || e.date === '') e.date = today;
    if (e.time == null || e.time === '') e.time = nowHm();
    if (typeof e.date === 'string' && e.date > today) throw new Error('날짜 오류: 오늘 뒤 날짜');
    return e;
  }
  function patchOk(p, today) { if (p.date != null && p.date !== '' && typeof p.date === 'string' && p.date > today) throw new Error('날짜 오류: 오늘 뒤 날짜'); return p; }

  ipcMain.handle('ph:poopAdd', (e, req) => write('poop', 'add', req, (cur, date) => PL.addPoop(cur, withDefaults(clean('poop', req.entry), date))));
  ipcMain.handle('ph:poopUpdate', (e, req) => write('poop', 'update', req, (cur, date) => PL.updatePoop(cur, key(req.key), patchOk(clean('poop', req.patch), date))));
  ipcMain.handle('ph:poopRemove', (e, req) => write('poop', 'remove', req, (cur) => PL.removePoop(cur, key(req.key))));
  ipcMain.handle('ph:mealAdd', (e, req) => write('meal', 'add', req, (cur, date) => ML.addMeal2(cur, withDefaults(clean('meal', req.entry), date))));
  ipcMain.handle('ph:mealUpdate', (e, req) => write('meal', 'update', req, (cur, date) => ML.updateMeal(cur, key(req.key), patchOk(clean('meal', req.patch), date))));
  ipcMain.handle('ph:mealRemove', (e, req) => write('meal', 'remove', req, (cur) => ML.removeMeal(cur, key(req.key))));
};

};
RT.MODS["/app/js/poop_log.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 대변 관찰 일지 (2026-10-04 비트, logs 브랜치). 그림·파일 접근 없음: 글을 받아 새 글을 돌려준다. 공통 규칙은 js/log_table.js
// 생활 기록 파일 ## 대변 표 (없으면 ## 버킷리스트 바로 앞에 만듦):
//   | 날짜 | 시각 | 형태 | 양g | 색 | 메모 |
//   날짜 = 기록 날짜(하루 경계 6시, 새벽 2시 기록은 전날), 시각 = HH:MM(실제 시계), 형태 = "1형"~"7형", 양g = 정수(비면 모름), 색 = 6칩 이름(비면 안 고름), 메모 = 여러 줄(안전 표시)
//   의학 판단 문구는 쓰지 않음. 색 붉은색·검정도 표시 없이 기록만 (지시서)
// 줄 고르기(고치기·지우기) = key { sig }: 화면이 읽은 그 줄의 글 그대로. 같은 글 줄이 여럿이면 마지막 줄 (어느 쪽을 지워도 파일 글은 같음)
// 처음 더할 때 생활습관 표에 "| 대변 | 기록 | 변기에서 기록 | - |" 한 줄 (없을 때만). 생활 습관 탭 기록 카드에 보이게
// 나중의 분석용: parse().rows (파일 순) -> byDate (날짜별) / entries (한 줄 = 한 번, 숫자 값)
(function (root) {
  'use strict';
  const LT = root.PHLogTable || (typeof require !== 'undefined' ? require('./log_table.js') : null);

  const SEC = '대변';
  const HEAD = ['날짜', '시각', '형태', '양g', '색', '메모'];
  const FORMS = [1, 2, 3, 4, 5, 6, 7];
  // 무늬 일지그림 v01 2장 (칩 테두리 #29262F 2px)
  const COLORS = [
    { name: '갈색', hex: '#8E5A2E' }, { name: '짙은 갈색', hex: '#4E3220' }, { name: '연갈색·노랑', hex: '#D8B05A' },
    { name: '초록', hex: '#6C8A35' }, { name: '검정', hex: '#1E1C1B' }, { name: '붉은색', hex: '#B23A32' },
  ];
  const COLOR_NAMES = COLORS.map((c) => c.name);
  const AMOUNT_MAX = 2000, MEMO_MAX = 1000;
  const HABIT = { name: '대변', target: '변기에서 기록' };

  // ---- 값 검사 ----
  function check(e) {
    if (!e || typeof e !== 'object') throw new Error('기록 형식 오류');
    if (!LT.isDate(e.date)) throw new Error('날짜 오류 (YYYY-MM-DD)');
    if (!LT.isTime(e.time)) throw new Error('시각 오류 (HH:MM)');
    const form = Number(e.form);
    if (!FORMS.includes(form)) throw new Error('형태를 골라 주세요');
    let amount = e.amount;
    if (amount === '' || amount == null) amount = null;
    else { if (typeof amount === 'string' && /^\d+$/.test(amount.trim())) amount = Number(amount.trim()); if (!Number.isInteger(amount) || amount < 0 || amount > AMOUNT_MAX) throw new Error('양 오류 (0~' + AMOUNT_MAX + 'g)'); }
    const color = e.color == null ? '' : e.color;
    if (color !== '' && !COLOR_NAMES.includes(color)) throw new Error('색 오류: ' + color);
    const memo = LT.multiline(e.memo, MEMO_MAX, '메모');
    return { date: e.date, time: e.time, form, amount, color, memo };
  }
  const cellsFor = (e) => [e.date, e.time, e.form + '형', e.amount == null ? '' : String(e.amount), e.color, LT.encode(e.memo)];
  const keyOf = (c) => (c[0] || '') + ' ' + (c[1] || '');

  // ---- 읽기 ----
  function rowOf(c, line, raw) {
    const f = /^([1-7])\s*형$/.exec(c[2] || ''), a = /^\d+$/.test(c[3] || '') ? Number(c[3]) : null;
    return { line, sig: String(raw).trim(), date: c[0] || '', time: c[1] || '', form: f ? Number(f[1]) : null, formText: c[2] || '', amount: a, color: c[4] || '', memo: LT.decode(c[5] || '') };
  }
  // 글 -> { rows: [...파일 순], hasSection, error }
  function parse(src) {
    const lines = Array.isArray(src) ? src : LT.splitLines(src);
    let sec;
    try { sec = LT.findSection(lines, SEC); } catch (e) { return { rows: [], error: String(e.message) }; }
    const t = LT.tableOf(lines, sec);
    if (t && t.head.join('|') !== HEAD.join('|')) return { rows: [], hasSection: true, error: '## 대변 표 머리가 달라요' };
    return { rows: t ? t.rows.map((r) => rowOf(r.cells, r.line, lines[r.line])) : [], hasSection: !!sec };
  }
  const sortKey = (r) => r.date + ' ' + (r.time || '99:99') + ' ' + String(r.line).padStart(6, '0');
  // 날짜별 { 'YYYY-MM-DD': [줄... 시각 순] }
  function byDate(rows) {
    const out = {};
    (rows || []).filter((r) => LT.isDate(r.date)).slice().sort((x, y) => (sortKey(x) < sortKey(y) ? -1 : 1)).forEach((r) => { (out[r.date] = out[r.date] || []).push(r); });
    return out;
  }
  // 분석용 한 줄 = 한 번: { date, time, form, amount, color, hasMemo }
  function entries(rows) { return (rows || []).filter((r) => LT.isDate(r.date)).map((r) => ({ date: r.date, time: r.time, form: r.form, amount: r.amount, color: r.color || null, hasMemo: !!r.memo })); }
  // 오늘 몇 번 + 마지막 기록 { today: n, last: 줄 | null }
  function summary(rows, today) {
    const ok = (rows || []).filter((r) => LT.isDate(r.date));
    const last = ok.slice().sort((x, y) => (sortKey(x) < sortKey(y) ? -1 : 1)).pop() || null;
    return { today: ok.filter((r) => r.date === today).length, last };
  }

  // ---- 쓰기 ----
  const out = (src, lines, extra) => Object.assign({ text: lines.join(LT.nlOf(src)), changed: true }, extra);
  function findRow(t, key) {
    const sig = key && typeof key.sig === 'string' ? key.sig.trim() : null;
    const hits = t && sig ? t.rows.filter((r) => LT.rowText(r.cells) === sig || r.cells.join('|') === LT.cells(sig).join('|')) : [];
    if (!hits.length) throw new Error('기록 없음 (파일이 바뀌었을 수 있음)');
    return hits[hits.length - 1];
  }
  function addPoop(src, entry) {
    const e = check(entry), lines = LT.splitLines(src);
    const habitLine = LT.ensureHabit(lines, HABIT);
    const row = LT.rowText(cellsFor(e)), p = LT.prepare(lines, SEC, HEAD);
    let line, created = false;
    if (!p) { line = LT.placeSection(lines, SEC, HEAD, row); created = true; }
    else { line = LT.sortedAt(p.t, keyOf(cellsFor(e)), keyOf); lines.splice(line, 0, row); }
    return out(src, lines, { op: 'add', line, created, habitAdded: habitLine >= 0, entry: e, after: row });
  }
  function updatePoop(src, key, patch) {
    const lines = LT.splitLines(src), p = LT.prepare(lines, SEC, HEAD); if (!p) throw new Error('## 대변 표 없음');
    const r = findRow(p.t, key), cur = rowOf(r.cells, r.line, lines[r.line]);
    const next = check(Object.assign({ date: cur.date, time: cur.time, form: cur.form, amount: cur.amount, color: cur.color, memo: cur.memo }, patch || {}));
    const after = LT.rowText(cellsFor(next));
    if (after === lines[r.line]) return { text: src, changed: false, op: 'update', line: r.line, entry: next };
    const before = lines[r.line]; lines[r.line] = after;
    return out(src, lines, { op: 'update', line: r.line, entry: next, before, after });
  }
  function removePoop(src, key) {
    const lines = LT.splitLines(src), p = LT.prepare(lines, SEC, HEAD); if (!p) throw new Error('## 대변 표 없음');
    const r = findRow(p.t, key), removed = rowOf(r.cells, r.line, lines[r.line]);
    lines.splice(r.line, 1);
    return out(src, lines, { op: 'remove', line: r.line, removed, before: removed.sig });
  }
  // 새 줄·바뀐 줄 검사: 칸 6개, 날짜·시각·형태 맞음, 양 0~2000, 색 이름, 메모 1000자 (되돌린 글 기준)
  function rowOk(c) {
    if (!LT.isDate(c[0]) || !LT.isTime(c[1]) || !/^[1-7]형$/.test(c[2])) return false;
    if (c[3] !== '' && !(/^\d+$/.test(c[3]) && Number(c[3]) <= AMOUNT_MAX)) return false;
    if (c[4] !== '' && !COLOR_NAMES.includes(c[4])) return false;
    const m = LT.decode(c[5]); return LT.len(m) <= MEMO_MAX && LT.encode(m) === c[5];
  }
  function onlyPoopChanged(oldText, newText, op) { return LT.checkChange(oldText, newText, { sec: SEC, head: HEAD, op, habit: HABIT, rowOk }); }

  const PL = { SEC, HEAD, FORMS, COLORS, COLOR_NAMES, AMOUNT_MAX, MEMO_MAX, HABIT, check, parse, byDate, entries, summary, addPoop, updatePoop, removePoop, onlyPoopChanged, rowOk,
    hexOf: (name) => { const c = COLORS.find((x) => x.name === name); return c ? c.hex : null; } };
  root.PHPoopLog = PL;
  if (typeof module !== 'undefined' && module.exports) module.exports = PL;
})(typeof window !== 'undefined' ? window : globalThis);

};
RT.MODS["/app/electron/preload.js"] = function (module, exports, require, __filename, __dirname, window, globalThis, process, global, self) {
// 화면 쪽에 함수 몇 개만 넘긴다 (Node 기능은 넘기지 않음). 경로 검사·쓰기 제한은 main.js
'use strict';
const { contextBridge, ipcRenderer } = require('electron');
// 설정 묶음 (2026-10-08, electron/profile_main.js bootData): 화면 스크립트보다 먼저 동기로 받아 둠 -> js/profile.js
//   { id: 'player' | 'default', bundle: 묶음 대사·설정, onboard: 첫 실행인지, user: { name, avatar, house, furniture } } (기록 폴더 경로는 안 넘김)
//   주소에 pb=1이 있을 때만 묻는다: 이 묶음 코드 전의 메인(이미 떠 있던 앱)에는 받는 곳이 없어 sendSync가 화면을 멈추게 함 (2026-10-08 확인)
let boot = {};
try { if (/[?&]pb=1(&|$)/.test(location.search)) boot = ipcRenderer.sendSync('ph:profileSync') || {}; } catch (e) { boot = {}; }
contextBridge.exposeInMainWorld('PHProfileBoot', boot);
// 플랫폼 (C1 윈도우판 2026-10-14): 화면 글 ⌘ / Ctrl+ 고르기, html class (맥 전용 모양)
contextBridge.exposeInMainWorld('PHPlatform', { os: process.platform, mac: process.platform === 'darwin', win: process.platform === 'win32' });
// 첫 실행 온보딩·집 꾸미기 (electron/profile_main.js). 폴더는 고르기 창에서 고른 것·기본 폴더만 받음
contextBridge.exposeInMainWorld('PHOnboardDesktop', {
  info: () => ipcRenderer.invoke('ph:onboardInfo'),
  checkName: (name) => ipcRenderer.invoke('ph:onboardCheckName', name),
  pickFolder: () => ipcRenderer.invoke('ph:onboardPickFolder'),
  finish: (req) => ipcRenderer.invoke('ph:onboardFinish', req), // req = { name, cat(고양이 이름, 2026-10-08), avatar, house, dir, habits }
  setFurniture: (slot, sprite) => ipcRenderer.invoke('ph:furnitureSet', { slot, sprite }),
  setProfile: (key, value) => ipcRenderer.invoke('ph:profileSet', { key, value }), // 설정 화면 (공용판): pet·cat·brand·avatar·house·tabsHidden·desktopPet 하나씩
  onDeskPet: (cb) => { ipcRenderer.on('ph:deskPet', (e, d) => cb({ on: !!(d && d.on) })); }, // 바탕화면 펫을 펫 메뉴에서 끔 (2026-10-13)
});
contextBridge.exposeInMainWorld('PHDesktop', {
  read: (rel) => ipcRenderer.invoke('ph:read', rel), // 하우스 폴더 안 .md -> { text, lastModified }
  // 물 칸 쓰기: 오늘 물을 value잔으로. 경로를 보낼 수 없음 (파일 = settings.LIFE_FILE, 날짜 = 오늘, 메인이 정함)
  //   lastModified = 화면이 읽은 시각. 그 뒤 파일이 바뀌었으면 { conflict: true, text } (쓰지 않음)
  setWater: (value, lastModified) => ipcRenderer.invoke('ph:setWater', { value, lastModified }),
  // 생활 기록 파일이 바뀜(다른 앱 = 두부 펫이 씀, 또는 창이 앞으로 옴) 알림 { lastModified, why }. 받는 곳 js/life_sync.js (2026-10-04)
  onLifeChanged: (cb) => { ipcRenderer.on('ph:lifeChanged', (e, d) => cb({ lastModified: Number(d && d.lastModified), why: String(d && d.why) })); },
  // 그림 세트 (v10 중간 / v08 자세히 / v09 굵게): 목록·지금 값, 바꾸기(resume = 지금 자리), 메뉴에서 고른 값 받기
  artSets: () => ipcRenderer.invoke('ph:artSets'),
  setArtSet: (set, resume) => ipcRenderer.invoke('ph:setArtSet', { set, resume }),
  onMenuArtSet: (cb) => { ipcRenderer.on('ph:menuArtSet', (e, set) => cb(String(set))); },
  // 두부 대화창 쓰기 (electron/life_log_ipc.js). 파일·섹션·날짜는 메인이 정함. 값과 읽은 시각만 보냄
  setSleep: (bed, wake, memo, lastModified) => ipcRenderer.invoke('ph:setSleep', { bed, wake, memo, lastModified }),
  // 잠 칠하기: from('YYYY-MM-DD HH:MM')부터 hours시간 창 안 잠을 segments로 통째로 바꿈 (js/life_log.js setSleepWindow, 창 밖·다른 줄은 그대로)
  //   dropOpen = 같이 지울 "잔 시각만" 줄의 시각 목록 (없어도 됨, 2026-10-09)
  setSleepWindow: (from, hours, segments, lastModified, dropOpen) => ipcRenderer.invoke('ph:setSleepWindow', { from, hours, segments, lastModified, dropOpen }),
  addMeal: (kind, text, lastModified) => ipcRenderer.invoke('ph:addMeal', { kind, text, lastModified }),
  setNote: (text, lastModified, fix, mood) => ipcRenderer.invoke('ph:setNote', { text, lastModified, fix: fix === true, mood: typeof mood === 'string' ? mood : null }), // mood = 기분 4칸 (interact)
  // 생활 습관 체크 (electron/life_check_ipc.js). 파일·날짜·주는 메인이 정함
  //   toggleWeekly: 주 N회 습관 오늘 했음/안 했음 뒤집기 / addAmount: 기록 습관 양 (mode 'add' 더하기 | 'set' 바꾸기)
  //   setSafetyCheck: 안전장치 이번 주 확인 (week = 화면이 본 주 월요일, result 'good' | 'missed')
  toggleWeekly: (habit, lastModified) => ipcRenderer.invoke('ph:toggleWeekly', { habit, lastModified }),
  addAmount: (habit, value, mode, lastModified) => ipcRenderer.invoke('ph:addAmount', { habit, value, mode, lastModified }),
  setSafetyCheck: (week, item, result, lastModified) => ipcRenderer.invoke('ph:setSafetyCheck', { week, item, result, lastModified }),
});
// 공부 간트 쓰기 (study 브랜치 2026-10-03, electron/study_ipc.js). 파일·섹션·오늘 날짜는 메인이 정함. 이름·값·읽은 시각만 보냄
contextBridge.exposeInMainWorld('PHStudyDesktop', {
  add: (name, start, memo, lastModified) => ipcRenderer.invoke('ph:studyAdd', { name, start, memo, lastModified }),
  update: (name, patch, lastModified) => ipcRenderer.invoke('ph:studyUpdate', { name, patch, lastModified }), // patch = { start, end, memo, newName }
  archive: (name, lastModified) => ipcRenderer.invoke('ph:studyArchive', { name, lastModified }),           // ## 공부 보관으로 옮김
  restore: (name, lastModified) => ipcRenderer.invoke('ph:studyRestore', { name, lastModified }),           // 보관에서 되돌리기
  logToday: (name, add, lastModified) => ipcRenderer.invoke('ph:studyLog', { name, add, lastModified }),    // 오늘 add(1 / -1)시간
  // [추가 | 수정] 창 한 번 저장 (2026-10-08 3-1단계): q = { mode: add|edit, name(edit: 지금 이름), study: { name, start, end, memo }, plans: [{ sig?, part, from, to }], removed: [sig] }
  save: (q, lastModified) => ipcRenderer.invoke('ph:studySave', Object.assign({}, q, { lastModified })),
  movePlan: (sig, from, to, lastModified) => ipcRenderer.invoke('ph:planMove', { sig, from, to, lastModified }), // 세부 계획 막대 끌기 (피드백 2): 그 줄 기간만
});
// 옷 갈아입기 차림 (wardrobe 브랜치 2026-10-03, electron/outfit_ipc.js). 파일 = 앱 설정 폴더 outfit.json (메인이 정함). 차림 값만 보냄
contextBridge.exposeInMainWorld('PHOutfitDesktop', {
  get: () => ipcRenderer.invoke('ph:outfitGet'),       // -> { ok, outfit: { top, bottom, outer, bag, hat, onepiece } | null }
  set: (outfit) => ipcRenderer.invoke('ph:outfitSet', outfit),
});
// 독서 책꽂이 쓰기 (journal 브랜치 2026-10-03, electron/book_ipc.js). 파일·섹션·오늘 날짜는 메인이 정함. 책 값·읽은 시각만 보냄
//   key = { date, title } (책 하나 = 같은 날 같은 제목은 하나), book/patch = { date, title, color, summary }
contextBridge.exposeInMainWorld('PHBookDesktop', {
  add: (book, lastModified) => ipcRenderer.invoke('ph:bookAdd', { book, lastModified }),
  update: (key, patch, lastModified) => ipcRenderer.invoke('ph:bookUpdate', { key, patch, lastModified }),
  archive: (key, lastModified) => ipcRenderer.invoke('ph:bookArchive', { key, lastModified }),  // ## 독서 보관으로 옮김
  restore: (key, lastModified) => ipcRenderer.invoke('ph:bookRestore', { key, lastModified }),  // 보관에서 되돌리기
});
// 살림 쓰기 (2026-10-03, electron/household_ipc.js). 파일·섹션·오늘 날짜는 메인이 정함. 바꾸기 값·읽은 시각만 보냄
//   inv: { type: qty|need|add|remove|restore|color, cat, name, ... } / shop: { type: add|bought, name } / chore: 청소 습관 이름 (오늘 했음/안 했음 뒤집기)
contextBridge.exposeInMainWorld('PHHouseDesktop', {
  inv: (op, lastModified) => ipcRenderer.invoke('ph:invOp', { op, lastModified }),
  shop: (op, lastModified) => ipcRenderer.invoke('ph:shopOp', { op, lastModified }),
  chore: (habit, lastModified) => ipcRenderer.invoke('ph:choreToggle', { habit, lastModified }),
});
// 습관 편집·공부 완전 삭제 (2026-10-04, electron/habit_ipc.js). 파일·섹션·오늘 날짜는 메인이 정함. 이름·값·읽은 시각만 보냄
//   habit = { kind, name, target, cycle: { per: day|week|month, n } }, patch = { newName, target, cycle }, before·raw = 되돌리기 때 원래 자리·글자
contextBridge.exposeInMainWorld('PHHabitDesktop', {
  addHabit: (habit, lastModified, before, raw) => ipcRenderer.invoke('ph:habitAdd', { habit, lastModified, before, raw }),
  updateHabit: (name, patch, lastModified) => ipcRenderer.invoke('ph:habitUpdate', { name, patch, lastModified }),
  removeHabit: (name, lastModified) => ipcRenderer.invoke('ph:habitRemove', { name, lastModified }),
  moveHabit: (name, dir, lastModified) => ipcRenderer.invoke('ph:habitMove', { name, dir, lastModified }), // dir -1 위로, 1 아래로 (같은 종류 안)
  removeStudy: (name, lastModified) => ipcRenderer.invoke('ph:studyRemove', { name, lastModified }),       // ## 공부에서 완전히 빼기 (보관함 아님)
  unremoveStudy: (row, before, raw, lastModified) => ipcRenderer.invoke('ph:studyUnremove', { row, before, raw, lastModified }), // 완전 삭제 되돌리기
  setDaily: (habit, value, lastModified) => ipcRenderer.invoke('ph:habitSetDaily', { habit, value, lastModified }), // 매일 n회 습관 오늘 value/n
});
// 약속 쓰기 (2026-10-07, electron/meeting_ipc.js). 파일·섹션은 메인이 정함. 약속 값·고를 줄 글·읽은 시각만 보냄
//   meeting/patch = { date: 'YYYY-MM-DD', time: '7pm' | '', text }, key = { sig: 읽은 그 줄 글 }, before·raw = 되돌리기 때 원래 자리·글자
contextBridge.exposeInMainWorld('PHMeetingDesktop', {
  add: (meeting, lastModified, before, raw) => ipcRenderer.invoke('ph:meetingAdd', { meeting, lastModified, before, raw }),
  update: (key, patch, lastModified, raw) => ipcRenderer.invoke('ph:meetingUpdate', { key, patch, lastModified, raw }),
  remove: (key, lastModified) => ipcRenderer.invoke('ph:meetingRemove', { key, lastModified }),
});
// 기록 넓히기 (2026-10-08, electron/record_ipc.js). 파일·섹션·오늘 날짜는 메인이 정함. 값·고를 줄 글(sig)·읽은 시각만 보냄
//   before·raw = 지우기·고치기 되돌리기 때 원래 자리·글자
contextBridge.exposeInMainWorld('PHRecordDesktop', {
  add: (record, lastModified, before, raw) => ipcRenderer.invoke('ph:recordAdd', { record, lastModified, before, raw }), // record = { kind, date, title, summary }
  update: (sig, record, lastModified, raw) => ipcRenderer.invoke('ph:recordUpdate', { sig, record, lastModified, raw }),
  remove: (sig, lastModified) => ipcRenderer.invoke('ph:recordRemove', { sig, lastModified }),
  kindAdd: (name, lastModified, before, raw) => ipcRenderer.invoke('ph:recordKindAdd', { name, lastModified, before, raw }),
  kindRemove: (name, lastModified) => ipcRenderer.invoke('ph:recordKindRemove', { name, lastModified }),
});
contextBridge.exposeInMainWorld('PHBucketDesktop', {
  add: (text, lastModified, before, raw) => ipcRenderer.invoke('ph:bucketAdd', { text, lastModified, before, raw }),
  done: (sig, done, lastModified) => ipcRenderer.invoke('ph:bucketDone', { sig, done, lastModified }),
  edit: (sig, text, lastModified, raw) => ipcRenderer.invoke('ph:bucketEdit', { sig, text, lastModified, raw }),
  remove: (sig, lastModified) => ipcRenderer.invoke('ph:bucketRemove', { sig, lastModified }),
});
contextBridge.exposeInMainWorld('PHStudyPartDesktop', {
  add: (subject, part, lastModified, before, raw) => ipcRenderer.invoke('ph:partAdd', { subject, part, lastModified, before, raw }),
  rename: (sig, part, lastModified) => ipcRenderer.invoke('ph:partRename', { sig, part, lastModified }),
  remove: (sig, lastModified) => ipcRenderer.invoke('ph:partRemove', { sig, lastModified }),
  toggle: (subject, part, date, lastModified) => ipcRenderer.invoke('ph:partToggle', { subject, part, date, lastModified }),
});
// 대변 관찰 일지·식사 일지 (logs 브랜치 2026-10-04, electron/logs_ipc.js). 파일·섹션·오늘 날짜는 메인이 정함. 기록 값·읽은 시각만 보냄
//   entry/patch: 대변 { date, time, form, amount, color, memo } / 식사 { date, time, kind, menu, rating, amount, memo }. key = { sig: 읽은 그 줄 글 }
// 가구 연결·일지 기능 표시 (2026-10-04, electron/furnish_ipc.js). 파일 = 앱 설정 폴더 features.json (메인이 정함). 가구 key·기능 id만 보냄
contextBridge.exposeInMainWorld('PHFurnishDesktop', {
  get: () => ipcRenderer.invoke('ph:featuresGet'),                          // -> { links, seen }
  setLinks: (links) => ipcRenderer.invoke('ph:featuresSetLinks', { links }), // 사용자 연결표 통째로 (js/features.js setLink로 만든 것)
  reset: () => ipcRenderer.invoke('ph:featuresReset'),                      // 기본으로 되돌리기
  hide: (id) => ipcRenderer.invoke('ph:featuresHide', { id }),              // 화면에만 보이던 일지 기능 줄 끄기
});
contextBridge.exposeInMainWorld('PHLogsDesktop', {
  addPoop: (entry, lastModified) => ipcRenderer.invoke('ph:poopAdd', { entry, lastModified }),
  updatePoop: (key, patch, lastModified) => ipcRenderer.invoke('ph:poopUpdate', { key, patch, lastModified }),
  removePoop: (key, lastModified) => ipcRenderer.invoke('ph:poopRemove', { key, lastModified }),
  addMeal2: (entry, lastModified) => ipcRenderer.invoke('ph:mealAdd', { entry, lastModified }),
  updateMeal: (key, patch, lastModified) => ipcRenderer.invoke('ph:mealUpdate', { key, patch, lastModified }),
  removeMeal: (key, lastModified) => ipcRenderer.invoke('ph:mealRemove', { key, lastModified }),
});

};
RT.mainRoot.__PH_SET_NAMES = ["room1","room2","room3"]; RT.mainRoot.__PH_SET_LABELS = {"room1":"원룸","room2":"투룸","room3":"쓰리룸"};
window.PHWebMain = RT.load('/app/web/web_main.js', false);
RT.load('/app/electron/preload.js', true);
})(window.__PHWebRT);
