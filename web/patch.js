// 모바일 웹판: 화면 글 몇 개 바꾸기 + 기록 백업 + 홈 화면 앱(PWA) 준비
(function (root) {
  'use strict';
  const RT = root.__PHWebRT, WM = root.PHWebMain;
  // ---- 글 ----
  const OP = root.PH_ONBOARD_PLAIN, OL = root.PH_ONBOARD_LINES;
  if (OP) {
    if (Array.isArray(OP.steps)) OP.steps = OP.steps.map((s) => (s === '기록 폴더' ? '저장' : s));
    OP.folderTitle = '기록 저장';
    OP.folderNote = '기록은 이 폰(브라우저) 안에만 저장돼요. 설정 > 탭·백업에서 파일로 내보내 둘 수 있어요';
  }
  if (OL && OL.folder) {
    OL.folder.ask = ['기록은 이 폰 안에 모아 둘게요. 인터넷으로 보내지 않아요냥~'];
    OL.folder.ok = ['이 폰에 기록을 모아 둘게요냥~'];
  }
  const SP = root.PH_SETTINGS_PLAIN;
  if (SP && SP.tabs) SP.tabs.side = '탭·백업';

  // ---- 알림 ----
  let toastT = null;
  function toast(msg) {
    let t = document.querySelector('.phw-toast');
    if (!t) { t = document.createElement('div'); t.className = 'phw-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; requestAnimationFrame(() => t.classList.add('on'));
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600);
  }

  // ---- 백업 ----
  const PFX = 'phfs:';
  function stamp() { const n = new Date(), p = (x) => String(x).padStart(2, '0'); return `${n.getFullYear()}${p(n.getMonth() + 1)}${p(n.getDate())}_${p(n.getHours())}${p(n.getMinutes())}`; }
  function allData() {
    const files = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(PFX) || k.includes('/backup/')) continue;
      try { files[k.slice(PFX.length)] = JSON.parse(localStorage.getItem(k)).t; } catch (e) {}
    }
    return files;
  }
  async function saveFile(name, text, type) {
    const blob = new Blob([text], { type });
    try {
      const file = new File([blob], name, { type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name }); return true; }
    } catch (e) { if (e && e.name === 'AbortError') return false; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    return true;
  }
  function exportAll() {
    const data = { app: 'pixel-house-mobile', version: 1, savedAt: new Date().toISOString(), files: allData() };
    return saveFile(`PixelHouse_백업_${stamp()}.json`, JSON.stringify(data, null, 2), 'application/json');
  }
  function exportMd() {
    const f = WM && WM.lifeFile(); if (!f || !RT.fs.existsSync(f)) { toast('아직 생활 기록이 없어요'); return; }
    return saveFile(`PixelHouse_생활기록_${stamp()}.md`, RT.fs.readFileSync(f), 'text/markdown');
  }
  function importFile(file) {
    const rd = new FileReader();
    rd.onload = () => {
      const text = String(rd.result || '');
      try {
        if (/\.json$/i.test(file.name) || text.trim().startsWith('{')) {
          const d = JSON.parse(text);
          if (!d || d.app !== 'pixel-house-mobile' || !d.files || typeof d.files !== 'object') throw new Error('Pixel House 백업 파일이 아니에요');
          if (!confirm('지금 기록을 백업 파일 내용으로 바꿀까요? 지금 기록은 되돌릴 수 없어요.')) return;
          const cur = allData(); RT.fs.writeFileSync('/data/userData/backup/before_import_' + stamp() + '.json', JSON.stringify(cur));
          Object.keys(cur).forEach((p) => localStorage.removeItem(PFX + p));
          Object.keys(d.files).forEach((p) => { if (/^\/data\//.test(p) && typeof d.files[p] === 'string') RT.fs.writeFileSync(p, d.files[p]); });
        } else {
          const f = WM && WM.lifeFile();
          if (!f) throw new Error('처음 설정을 먼저 끝내 주세요');
          if (!/^#|^\|/m.test(text) || !/##\s*생활습관/.test(text)) throw new Error('Pixel House 생활 기록(.md) 파일이 아니에요');
          if (!confirm('생활 기록 파일을 이 파일로 바꿀까요? (지금 기록은 백업 폴더에 사본으로 남겨요)')) return;
          if (RT.fs.existsSync(f)) RT.fs.writeFileSync('/data/userData/backup/before_import_' + stamp() + '_' + f.split('/').pop(), RT.fs.readFileSync(f));
          RT.fs.writeFileSync(f, text);
        }
        toast('불러왔어요. 다시 여는 중…');
        setTimeout(() => location.reload(), 700);
      } catch (e) { toast(e && e.message ? e.message : '불러오지 못했어요'); }
    };
    rd.readAsText(file);
  }
  function backupSection() {
    const s = document.createElement('section');
    s.className = 'phw-backup';
    s.innerHTML = '<h4>기록 백업</h4><p>기록은 이 폰의 브라우저 안에만 있어요. 앱을 지우거나 브라우저 데이터를 지우면 사라지니, 가끔 내보내 두세요.</p>'
      + '<div class="phw-row"><button type="button" class="main" data-a="all">전체 백업 내보내기</button><button type="button" data-a="md">생활 기록(.md)만</button><button type="button" data-a="in">백업 불러오기</button></div>'
      + '<input type="file" accept=".json,.md,application/json,text/markdown,text/plain" hidden>';
    const inp = s.querySelector('input');
    s.querySelector('[data-a=all]').addEventListener('click', exportAll);
    s.querySelector('[data-a=md]').addEventListener('click', exportMd);
    s.querySelector('[data-a=in]').addEventListener('click', () => inp.click());
    inp.addEventListener('change', () => { if (inp.files && inp.files[0]) importFile(inp.files[0]); inp.value = ''; });
    return s;
  }
  // 설정 창 "탭·백업" 칸에 붙임
  new MutationObserver(() => {
    const p = document.getElementById('cfg-panel'); if (!p) return;
    const ui = root.PHSettingsUI, tab = ui && ui.U && ui.U.tab;
    if (tab === 'side' && !p.querySelector('.phw-backup')) { const foot = p.querySelector('.cfg-foot'); p.insertBefore(backupSection(), foot || null); }
  }).observe(document.documentElement, { childList: true, subtree: true });

  // ---- 터치로 닫기: 창마다 있는 "Esc 닫기" 안내를 누르면 Esc 와 같게 ----
  const KEY_HINT = /Esc\s*(닫기|그만두기)/;
  function fixHints(rootEl) {
    const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
    const hits = [];
    while (walker.nextNode()) { const t = walker.currentNode; if (KEY_HINT.test(t.nodeValue)) hits.push(t); }
    hits.forEach((t) => {
      const el = t.parentElement; if (!el || el.closest('.phw-backup')) return;
      const m = t.nodeValue.match(KEY_HINT);
      t.nodeValue = (m && m[1] === '그만두기' ? '그만두기' : '닫기') + ' ✕';
      el.classList.add('phw-close'); el.removeAttribute('aria-hidden'); el.setAttribute('role', 'button');
      if (!el.__phwTap) { el.__phwTap = true; el.addEventListener('click', onCloseTap); } // 요소에 직접 달아야 폰이 "누를 수 있는 것"으로 보고 옆 버튼으로 끌어가지 않음
    });
  }
  new MutationObserver((ms) => {
    ms.forEach((m) => {
      if (m.type === 'characterData') { if (m.target.parentElement && KEY_HINT.test(m.target.nodeValue)) fixHints(m.target.parentElement); return; }
      m.addedNodes.forEach((n) => { if (n.nodeType === 1) fixHints(n); else if (n.nodeType === 3 && n.parentElement && KEY_HINT.test(n.nodeValue)) fixHints(n.parentElement); });
    });
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  function onCloseTap(e) {
    const h = e.currentTarget;
    e.preventDefault(); e.stopPropagation();
    // 창 안에 포커스가 있으면 거기서(입력칸 Esc = 그만두기 처럼), 아니면 안내 글에서 보냄 (위로 올라가 창·문서가 받음)
    const ae = document.activeElement, typing = ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName) && (h.closest('[role=dialog]') || document.body).contains(ae);
    const target = typing ? ae : h;
    target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true }));
    target.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true }));
  }

  // ---- 저장소 오래 두기 · 오프라인 ----
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    root.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }
  root.PHWeb = { exportAll, exportMd, importFile, toast };
})(window);
