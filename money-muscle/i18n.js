
/* 머니머슬 — 언어 공통부.
   언어마다 다른 파일은 ui.js(화면 문구)와 content.js(레슨)뿐입니다.
   app.js·styles.css·이 파일은 모든 언어가 그대로 나눠 씁니다.

   ※ 언어가 달라도 content.js의 LESSONS는 순서와 개수가 같아야 합니다.
      진도를 레슨 '번호'로 저장하기 때문에, 어긋나면 언어를 바꿨을 때
      엉뚱한 유닛이 완료 표시됩니다. tools/audit-locales.js 가 이걸 검사합니다. */

/* ready:false 인 언어는 아직 번역이 없어서 자동 이동에도, 언어 목록에도 나오지 않습니다.
   functions/_middleware.js 에 같은 목록이 한 벌 더 있어요 — 둘이 어긋나면 검사 도구가 잡습니다. */
var LOCALES = [
  { code: 'ko', dir: '',    tag: 'KO', label: '한국어',     ready: true  },
  { code: 'en', dir: 'en/', tag: 'EN', label: 'English',    ready: true  },
  { code: 'ja', dir: 'ja/', tag: 'JA', label: '日本語',      ready: true  },
  { code: 'zh', dir: 'zh/', tag: 'ZH', label: '简体中文',    ready: false },
  { code: 'es', dir: 'es/', tag: 'ES', label: 'Español',    ready: false },
  { code: 'pt', dir: 'pt/', tag: 'PT', label: 'Português',  ready: false },
  { code: 'vi', dir: 'vi/', tag: 'VI', label: 'Tiếng Việt', ready: false }
];

var LANG_COOKIE = 'mm_lang';

/* ── 문구 꺼내기 ────────────────────────────────────────────
   t('cp.name', { n: 3 })  →  '레벨 3 체크포인트'
   수를 세는 문구는 '{n} unit|{n} units' 처럼 |로 단수·복수를 나눠 적습니다.
   한국어·일본어·중국어처럼 복수형이 없는 언어는 그냥 한 벌만 적으면 돼요. */
function t(key, vars) {
  var s = UI[key];
  if (s == null) return key;   // 빠진 문구는 키가 그대로 보여서 바로 눈에 띕니다
  if (vars && vars.n !== undefined && s.indexOf('|') !== -1) {
    var forms = s.split('|');
    s = Number(vars.n) === 1 ? forms[0] : forms[1];
  }
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, function (m, k) {
    return vars[k] !== undefined ? vars[k] : m;
  });
}

/* HTML에 박아둔 data-t 자리를 지금 언어의 문구로 채웁니다 */
function applyStaticText(root) {
  var scope = root || document;
  scope.querySelectorAll('[data-t]').forEach(function (n) {
    n.innerHTML = t(n.getAttribute('data-t'));   // 일부 문구에 <br>이 들어갑니다
  });
  scope.querySelectorAll('[data-t-aria]').forEach(function (n) {
    n.setAttribute('aria-label', t(n.getAttribute('data-t-aria')));
  });
}

/* ── 국기 ───────────────────────────────────────────────────
   이모지 국기는 윈도우에서 글자 두 개('KR')로 보여서 못 씁니다. 직접 그립니다. */
function star(x, y, s) {
  return '<path transform="translate(' + x + ',' + y + ') scale(' + s + ')" fill="#ffde00" d="' +
    'M0,-1 L.224,-.309 L.951,-.309 L.363,.118 L.588,.809 L0,.382 ' +
    'L-.588,.809 L-.363,.118 L-.951,-.309 L-.224,-.309 Z"/>';
}

/* 태극기 4괘. 막대 셋을 중심 쪽으로 쌓되, 막대는 중심을 잇는 선과 직각입니다.
   1은 이어진 막대, 0은 끊어진 막대 — 네 귀퉁이가 서로 다른 괘예요. */
function tri(x, y, deg, rows) {
  var g = '';
  rows.forEach(function (solid, i) {
    var y0 = i * 1.1 - 1.1;
    g += solid
      ? '<rect x="-1.4" y="' + y0 + '" width="2.8" height=".62" rx=".1"/>'
      : '<rect x="-1.4" y="' + y0 + '" width="1.15" height=".62" rx=".1"/>' +
        '<rect x="0.25" y="' + y0 + '" width="1.15" height=".62" rx=".1"/>';
  });
  return '<g fill="#101010" transform="translate(' + x + ',' + y + ') rotate(' + deg + ')">' + g + '</g>';
}

var FLAG = {
  // 태극은 왼쪽 위가 빨강이 되도록 기울입니다. 두 색은 같은 S자 곡선을 방향만 반대로
  // 훑어야 해요 — 어긋나면 가운데에 흰 틈이 생깁니다.
  ko: '<rect width="20" height="14" fill="#fff"/>' +
      '<g transform="rotate(-28.6 10 7)">' +
        '<path fill="#cd2e3a" d="M6.5,7 A3.5,3.5 0 0 1 13.5,7 A1.75,1.75 0 0 1 10,7 A1.75,1.75 0 0 0 6.5,7 Z"/>' +
        '<path fill="#0047a0" d="M6.5,7 A1.75,1.75 0 0 1 10,7 A1.75,1.75 0 0 0 13.5,7 A3.5,3.5 0 0 1 6.5,7 Z"/>' +
      '</g>' +
      tri(3.4,  3.4,  -61.4, [1, 1, 1]) +   // 건 ☰ 왼쪽 위
      tri(16.6, 3.4,   61.4, [0, 1, 0]) +   // 감 ☵ 오른쪽 위
      tri(3.4,  10.6,  61.4, [1, 0, 1]) +   // 리 ☲ 왼쪽 아래
      tri(16.6, 10.6, -61.4, [0, 0, 0]),    // 곤 ☷ 오른쪽 아래

  en: '<rect width="20" height="14" fill="#b22234"/>' +
      '<g fill="#fff"><rect y="1.08" width="20" height="1.08"/><rect y="3.23" width="20" height="1.08"/>' +
      '<rect y="5.38" width="20" height="1.08"/><rect y="7.54" width="20" height="1.08"/>' +
      '<rect y="9.69" width="20" height="1.08"/><rect y="11.85" width="20" height="1.08"/></g>' +
      '<rect width="8.6" height="7.54" fill="#3c3b6e"/>' +
      '<g fill="#fff"><circle cx="1.7" cy="1.5" r=".5"/><circle cx="4.3" cy="1.5" r=".5"/><circle cx="6.9" cy="1.5" r=".5"/>' +
      '<circle cx="3" cy="3.1" r=".5"/><circle cx="5.6" cy="3.1" r=".5"/>' +
      '<circle cx="1.7" cy="4.7" r=".5"/><circle cx="4.3" cy="4.7" r=".5"/><circle cx="6.9" cy="4.7" r=".5"/>' +
      '<circle cx="3" cy="6.2" r=".5"/><circle cx="5.6" cy="6.2" r=".5"/></g>',

  ja: '<rect width="20" height="14" fill="#fff"/><circle cx="10" cy="7" r="4.1" fill="#bc002d"/>',

  zh: '<rect width="20" height="14" fill="#de2910"/>' + star(4, 3.7, 2.4) +
      star(7.9, 1.5, .85) + star(9.3, 3.2, .85) + star(9.3, 5.4, .85) + star(7.9, 7, .85),

  es: '<rect width="20" height="14" fill="#c60b1e"/><rect y="3.5" width="20" height="7" fill="#ffc400"/>',

  pt: '<rect width="20" height="14" fill="#009b3a"/>' +
      '<path d="M10,1.5 18.3,7 10,12.5 1.7,7 Z" fill="#fedf00"/>' +
      '<circle cx="10" cy="7" r="3.1" fill="#002776"/>' +
      '<path d="M7.1,5.9 A3.6,3.6 0 0 1 12.9,6.6 L12.6,7.4 A3.1,3.1 0 0 0 7,6.7 Z" fill="#fff"/>',

  vi: '<rect width="20" height="14" fill="#da251d"/>' + star(10, 7, 4)
};

function flagSvg(code) {
  return '<svg viewBox="0 0 20 14" aria-hidden="true">' + (FLAG[code] || '') + '</svg>';
}

/* ── 지금 언어 / 다른 언어로 가기 ───────────────────────────── */
function localeBy(code) {
  for (var i = 0; i < LOCALES.length; i++) if (LOCALES[i].code === code) return LOCALES[i];
  return null;
}
function readyLocales() {
  return LOCALES.filter(function (l) { return l.ready; });
}

/* 지금 주소에서 사이트 뿌리를 찾습니다 — /en/ 에 있으면 한 칸 올라가야 /ja/ 로 갈 수 있어요 */
function siteRoot() {
  var dir = location.pathname.replace(/[^/]*$/, '');
  var m = dir.match(/^(.*\/)([a-z]{2})\/$/);
  return m && localeBy(m[2]) ? m[1] : dir;
}

function goLocale(code) {
  var lc = localeBy(code);
  if (!lc || lc.code === LOCALE) return;
  // 고른 언어를 기억해 둡니다 — 다음에 들어와도 접속 위치로 되돌리지 않게
  try {
    document.cookie = LANG_COOKIE + '=' + code + ';path=/;max-age=31536000;samesite=lax';
  } catch (e) {}
  location.href = siteRoot() + lc.dir;
}

/* ── 언어 버튼과 목록 ───────────────────────────────────────
   버튼은 하단 탭 오른쪽 끝에 붙습니다. 목록에는 번역이 끝난 언어만 올라가요. */
function mountLangSwitch(onTap) {
  var list = readyLocales();
  var btn = document.getElementById('tab-lang');
  if (!btn) return;

  var here = localeBy(LOCALE);
  btn.querySelector('.flag').innerHTML = flagSvg(LOCALE);
  btn.querySelector('.tab-label').textContent = here ? here.tag : LOCALE.toUpperCase();
  btn.hidden = false;

  var sheet = document.createElement('div');
  sheet.className = 'lang-sheet';
  sheet.id = 'lang-sheet';
  sheet.hidden = true;
  sheet.innerHTML =
    '<div class="lang-scrim"></div>' +
    '<div class="lang-panel" role="dialog" aria-modal="true" aria-label="' + t('lang.pick') + '">' +
      '<div class="lang-head">' +
        '<span class="lang-title">' + t('lang.title') + '</span>' +
        '<button class="cur-close lang-close" aria-label="' + t('cur.close') + '"><span></span><span></span></button>' +
      '</div>' +
      '<div class="lang-list">' +
        list.map(function (l) {
          return '<button class="lang-row' + (l.code === LOCALE ? ' is-on' : '') + '" data-code="' + l.code + '">' +
            '<span class="flag">' + flagSvg(l.code) + '</span>' +
            '<span class="lang-name">' + l.label + '</span>' +
            '<span class="lang-mark">' + (l.code === LOCALE ? '✓' : '') + '</span></button>';
        }).join('') +
      '</div>' +
    '</div>';
  document.querySelector('.app').appendChild(sheet);

  function close() { sheet.hidden = true; }
  sheet.querySelector('.lang-scrim').addEventListener('click', close);
  sheet.querySelector('.lang-close').addEventListener('click', function () { onTap(); close(); });
  sheet.querySelectorAll('.lang-row').forEach(function (r) {
    r.addEventListener('click', function () {
      onTap();
      var code = r.getAttribute('data-code');
      if (code === LOCALE) { close(); return; }
      goLocale(code);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !sheet.hidden) close();
  });

  btn.addEventListener('click', function () { onTap(); sheet.hidden = false; });
}
