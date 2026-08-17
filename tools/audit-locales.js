// 언어판 검사. 언어를 하나 추가할 때마다 이걸 먼저 돌립니다.
//   1. i18n.js와 _middleware.js의 언어 목록이 같은지
//   2. app.js·index.html이 쓰는 문구 키가 한국어 ui.js에 다 있는지 (반대로 안 쓰는 키도)
//   3. 언어판마다 문구 키가 빠짐없이 옮겨졌는지
//   4. 언어판의 레슨 순서·개수가 한국어와 같은지 (진도를 레슨 번호로 저장해서 어긋나면 큰일)
var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..', 'money-muscle');
var err = [], warn = [];
function read(p) { return fs.readFileSync(p, 'utf8'); }

// ── 1. 두 곳의 언어 목록이 같은가 ─────────────────────────
var i18n = read(path.join(ROOT, 'i18n.js'));
eval(i18n.replace(/\bfunction\s+\w+\s*\([\s\S]*$/, ''));   // LOCALES 선언부까지만 실행

var mw = read(path.join(ROOT, 'functions', '_middleware.js'));
var mwBlock = mw.match(/const LOCALES = \{([\s\S]*?)\n\};/);
if (!mwBlock) err.push('_middleware.js에서 LOCALES를 못 찾음');
else {
  var mwSet = {};
  mwBlock[1].split('\n').forEach(function (line) {
    var m = line.match(/(\w+):\s*\{\s*dir:\s*'([^']*)',\s*ready:\s*(true|false)/);
    if (m) mwSet[m[1]] = { dir: m[2], ready: m[3] === 'true' };
  });
  LOCALES.forEach(function (l) {
    var o = mwSet[l.code];
    if (!o) err.push('_middleware.js에 ' + l.code + ' 없음');
    else if (o.dir !== l.dir || o.ready !== l.ready)
      err.push(l.code + ' 설정 불일치: i18n(' + l.dir + ',' + l.ready + ') vs middleware(' + o.dir + ',' + o.ready + ')');
    delete mwSet[l.code];
  });
  Object.keys(mwSet).forEach(function (c) { err.push('i18n.js에 ' + c + ' 없음 (middleware에만 있음)'); });
}

// ── 2. 쓰이는 문구 키 모으기 ───────────────────────────────
var used = {};
read(path.join(ROOT, 'app.js')).replace(/\bt\(\s*'([^']+)'/g, function (_, k) { used[k] = 1; return _; });
read(path.join(ROOT, 'app.js')).replace(/UI\['([^']+)'\]/g, function (_, k) { used[k] = 1; return _; });
var html = read(path.join(ROOT, 'index.html'));
html.replace(/data-t(?:-aria)?="([^"]+)"/g, function (_, k) { used[k] = 1; return _; });
// i18n.js가 언어 목록을 그릴 때 쓰는 문구
['lang.pick', 'lang.title', 'cur.close'].forEach(function (k) { used[k] = 1; });

// ── 3·4. 언어판별 검사 ────────────────────────────────────
function loadLocale(dir) {
  var box = {};
  var uiPath = path.join(ROOT, dir, 'ui.js');
  var cPath = path.join(ROOT, dir, 'content.js');
  if (!fs.existsSync(uiPath)) return { missing: 'ui.js' };
  if (!fs.existsSync(cPath)) return { missing: 'content.js' };
  var fn = new Function(read(uiPath) + '\n' + read(cPath) + '\n; return { UI: UI, LOCALE: LOCALE, LESSONS: LESSONS, CURRICULUM: CURRICULUM, REASONS: REASONS, GOALS: GOALS };');
  try { box = fn(); } catch (e) { return { broken: e.message }; }
  return box;
}

var ko = loadLocale('');
if (ko.missing || ko.broken) {
  err.push('한국어판을 못 읽음: ' + (ko.missing || ko.broken));
} else {
  var koKeys = Object.keys(ko.UI);
  Object.keys(used).forEach(function (k) {
    if (koKeys.indexOf(k) === -1) err.push('ko/ui.js에 없는 키를 씀: ' + k);
  });
  koKeys.forEach(function (k) {
    if (!used[k]) warn.push('아무데서도 안 쓰는 키: ' + k);
  });

  var koShape = ko.LESSONS.map(function (L) { return (L.lv || 1) + (L.checkpoint ? 'c' : 'u'); }).join(',');

  LOCALES.forEach(function (l) {
    if (l.code === 'ko') return;
    var box = loadLocale(l.dir);
    if (box.missing) {
      if (l.ready) err.push(l.code + ': ready인데 ' + box.missing + '이 없음');
      return;   // 아직 안 만든 언어는 넘어갑니다
    }
    if (box.broken) { err.push(l.code + ': 읽다가 터짐 — ' + box.broken); return; }

    if (box.LOCALE !== l.code) err.push(l.code + '/ui.js의 LOCALE이 "' + box.LOCALE + '"로 되어 있음');
    koKeys.forEach(function (k) {
      if (box.UI[k] === undefined) err.push(l.code + ': 문구 빠짐 — ' + k);
      else if (typeof box.UI[k] !== typeof ko.UI[k]) err.push(l.code + ': 문구 형태 다름 — ' + k);
    });
    Object.keys(box.UI).forEach(function (k) {
      if (ko.UI[k] === undefined) warn.push(l.code + ': 한국어에 없는 키 — ' + k);
    });

    // 문구 안의 {자리}가 그대로 옮겨졌는지 — 하나라도 빠지면 화면에 숫자가 안 나옵니다.
    // 단수·복수(|) 문구는 폼마다 같은 {n}이 반복되니, 등장 횟수가 아니라 종류만 비교합니다.
    function placeholders(s) {
      var set = {};
      (s.match(/\{\w+\}/g) || []).forEach(function (p) { set[p] = 1; });
      return Object.keys(set).sort().join(',');
    }
    koKeys.forEach(function (k) {
      if (typeof ko.UI[k] !== 'string' || typeof box.UI[k] !== 'string') return;
      var want = placeholders(ko.UI[k]);
      var got = placeholders(box.UI[k]);
      if (want !== got) err.push(l.code + ': 자리표시 다름 — ' + k + ' (ko: ' + (want || '없음') + ' / ' + l.code + ': ' + (got || '없음') + ')');
    });

    // 게임 안 통화는 어느 언어판이든 달러입니다 — 번역하다 자국 통화로 바꾸면 안 돼요
    Object.keys(box.UI).forEach(function (k) {
      if (typeof box.UI[k] !== 'string') return;
      var money = box.UI[k].match(/[₩¥€£₫₹]|R\$/);
      if (money) err.push(l.code + ': 달러가 아닌 통화가 들어감 — ' + k + ' ("' + money[0] + '")');
    });

    if (box.LESSONS.length !== ko.LESSONS.length)
      err.push(l.code + ': 레슨 수 다름 — ko ' + ko.LESSONS.length + ' vs ' + box.LESSONS.length);
    var shape = box.LESSONS.map(function (L) { return (L.lv || 1) + (L.checkpoint ? 'c' : 'u'); }).join(',');
    if (shape !== koShape) err.push(l.code + ': 레슨 순서가 한국어와 다름 (진도가 어긋납니다)');

    box.LESSONS.forEach(function (L, i) {
      var k = ko.LESSONS[i];
      if (!k) return;
      var a = L.steps.map(function (s) { return s.type; }).join(',');
      var b = k.steps.map(function (s) { return s.type; }).join(',');
      if (a !== b) err.push(l.code + ': 레슨 ' + i + ' 문항 구성 다름 — ko(' + b + ') vs ' + l.code + '(' + a + ')');
    });

    // REASONS·GOALS가 없으면 app.js가 온보딩 화면에서 그대로 멈춰요
    if (!Array.isArray(box.REASONS)) err.push(l.code + ': REASONS 없음');
    if (!Array.isArray(box.GOALS)) err.push(l.code + ': GOALS 없음');
    if (Array.isArray(box.GOALS)) {
      if (box.GOALS.length !== ko.GOALS.length) err.push(l.code + ': GOALS 개수 다름 — ko ' + ko.GOALS.length + ' vs ' + box.GOALS.length);
      box.GOALS.forEach(function (g, i) {
        var kg = ko.GOALS[i];
        if (!kg) return;
        if (g.key !== kg.key || g.min !== kg.min || g.units !== kg.units)
          err.push(l.code + ': GOALS[' + i + '] key·min·units가 한국어와 달라야 할 이유가 없어요 (label·detail만 옮기세요)');
      });
    }
  });
}

// ── 결과 ──────────────────────────────────────────────────
var ready = LOCALES.filter(function (l) { return l.ready; }).map(function (l) { return l.code; });
console.log('언어판 ' + ready.length + '개 준비됨: ' + ready.join(', '));
console.log('문구 키 ' + (ko.UI ? Object.keys(ko.UI).length : 0) + '개 | 오류 ' + err.length + '건 | 경고 ' + warn.length + '건');
if (err.length) { console.log('\n[오류]'); err.forEach(function (e) { console.log('  ' + e); }); }
if (warn.length) { console.log('\n[경고]'); warn.forEach(function (w) { console.log('  ' + w); }); }
process.exit(err.length ? 1 : 0);
