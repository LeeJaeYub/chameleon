// 앱에 실린 LESSONS 전수 검사. 레벨이 늘어날 때마다 이걸 먼저 돌립니다.
// 언어판을 검사하려면 인자로 폴더명을 줍니다 (예: node tools/audit-lessons.js en).
var fs = require('fs');
var dir = process.argv[2] ? process.argv[2] + '/' : '';
eval(fs.readFileSync(__dirname + '/../money-muscle/' + dir + 'content.js', 'utf8'));

// 한글 음절 하나가 라틴 글자 하나보다 화면에서 훨씬 넓어서, 같은 자리에 들어가는
// 글자 수 한도가 언어마다 달라요. 한국어 18자 기준을 그대로 라틴 알파벳에 쓰면
// 실제로는 자리가 남는데도 경고가 뜹니다.
var LABEL_MAX = dir ? 32 : 18;

var err = [], warn = [];
function N(s) { return String(s).replace(/\s+/g, ' ').trim(); }

// 커리큘럼 ↔ 레슨 정합
var perLv = {};
LESSONS.forEach(function (L) { if (!L.checkpoint) { var v = L.lv || 1; perLv[v] = (perLv[v] || 0) + 1; } });
CURRICULUM.forEach(function (c) {
  if (perLv[c.n] && perLv[c.n] !== c.units.length)
    err.push('레벨' + c.n + ' 유닛 수 불일치: 커리큘럼 ' + c.units.length + ' vs 레슨 ' + perLv[c.n]);
});

var allQ = {}, oxTally = {};
LESSONS.forEach(function (L, li) {
  var lv = L.lv || 1;
  var id = 'L' + lv + (L.checkpoint ? '-cp' : '-' + li);
  var nConcept = 0, nQ = 0;

  L.steps.forEach(function (s, si) {
    var sid = id + 'S' + si + '(' + s.type + ')';

    if (s.type === 'concept') {
      nConcept++;
      if (!s.title || !s.body) err.push(sid + ' 제목/본문 누락');
      if (!s.aside) warn.push(sid + ' aside 없음');
      if (s.compare) {
        var c = s.compare;
        if (!c.note || !c.a || !c.b || !c.a.label || !c.a.value || !c.b.label || !c.b.value)
          err.push(sid + ' compare 필드 누락');
        if (c.a.label.length > LABEL_MAX || c.b.label.length > LABEL_MAX)
          warn.push(sid + ' compare 라벨 김(' + Math.max(c.a.label.length, c.b.label.length) + '자)');
      }
      return;
    }

    nQ++;
    if (s.type === 'quiz' || s.type === 'fill') {
      if (!Array.isArray(s.options) || !s.options.length) { err.push(sid + ' options 없음'); return; }
      if (s.correct == null || s.correct < 0 || s.correct >= s.options.length) err.push(sid + ' correct 범위 밖');
      if (new Set(s.options).size !== s.options.length) err.push(sid + ' 보기 중복');
      if (!s.explain) err.push(sid + ' explain 없음');
      else if (s.explain.length < 20) warn.push(sid + ' 해설 짧음: "' + s.explain + '"');

      // 티나는 오답 — 오답에만 단정 표현이 몰리면 소거법으로 풀립니다
      if (s.type === 'quiz' && s.options.length === 4) {
        var tell = s.options.filter(function (o, oi) {
          return oi !== s.correct && /(항상|절대|무조건|자동으로|전혀|100% 보장|모든 (?:사람|회사|경우|것))/.test(o);
        }).length;
        if (tell >= 2) warn.push(sid + ' 티나는 오답 ' + tell + '/3 — ' + N(s.q).slice(0, 40));
      }
      // O/X 정답 분포
      if (s.options.length === 2 && s.options[0] === 'O') {
        oxTally[lv] = oxTally[lv] || { O: 0, X: 0 };
        oxTally[lv][s.options[s.correct]]++;
      }
    }
    if (s.type === 'quiz' && !s.q) err.push(sid + ' q 없음');
    if (s.type === 'fill') {
      if (!s.sentence) err.push(sid + ' sentence 없음');
      else if (s.sentence.indexOf('___') < 0) err.push(sid + ' 빈칸(___) 없음');
    }
    if (s.type === 'match') {
      if (!Array.isArray(s.pairs) || s.pairs.length < 2) err.push(sid + ' pairs 부족');
      else if (!s.pairs.every(function (p) { return Array.isArray(p) && p.length === 2 && p[0] && p[1]; })) err.push(sid + ' pairs 형식');
      if (!s.explain) err.push(sid + ' explain 없음');
    }
    if (s.type === 'order') {
      if (!Array.isArray(s.items) || s.items.length < 3) err.push(sid + ' items 부족');
      if (!s.explain) err.push(sid + ' explain 없음');
    }

    var key = N(s.q || s.sentence || (s.items || []).join('|'));
    if (key) {
      if (allQ[key] && !L.checkpoint) err.push('문항 중복: ' + key.slice(0, 45) + ' (' + allQ[key] + ' ↔ ' + sid + ')');
      else if (!allQ[key]) allQ[key] = sid;
    }
  });

  if (!L.checkpoint && nConcept !== 2) warn.push(id + ' 개념 ' + nConcept + '개(2개 권장)');
  if (nQ < 4) warn.push(id + ' 문항 ' + nQ + '개');
});

// 엔티티 오타 — 화면에 &minus; 같은 게 그대로 찍히면 안 됩니다
var raw = fs.readFileSync(__dirname + '/../money-muscle/content.js', 'utf8');
var ents = raw.match(/&[a-z]+;/g) || [];
var okEnt = { '&lsquo;': 1, '&rsquo;': 1, '&ldquo;': 1, '&rdquo;': 1, '&amp;': 1, '&nbsp;': 1 };
var bad = {};
ents.forEach(function (e) { if (!okEnt[e]) bad[e] = (bad[e] || 0) + 1; });
Object.keys(bad).forEach(function (e) { err.push('미지원 엔티티 ' + e + ' ' + bad[e] + '회'); });

// O/X 한쪽 쏠림 — X만 찍어도 통과하면 문제가 아니에요
Object.keys(oxTally).forEach(function (lv) {
  var t = oxTally[lv], n = t.O + t.X, big = Math.max(t.O, t.X);
  if (n >= 4 && big / n > 0.75) warn.push('레벨' + lv + ' O/X 쏠림 ' + t.O + ':' + t.X + ' — 한쪽만 찍어도 통과함');
});

console.log('레슨 ' + LESSONS.length + '개 | 문항 ' +
  LESSONS.reduce(function (a, L) { return a + L.steps.filter(function (s) { return s.type !== 'concept'; }).length; }, 0) + '개');
console.log('O/X 정답 분포:', JSON.stringify(oxTally));
console.log('\n오류 ' + err.length + '건');
err.forEach(function (e) { console.log('  ✗ ' + e); });
console.log('\n경고 ' + warn.length + '건');
warn.forEach(function (w) { console.log('  · ' + w); });
process.exit(err.length ? 1 : 0);
