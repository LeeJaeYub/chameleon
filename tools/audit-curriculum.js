// 276문항 전수 감사 — 레벨 1에서 잡았던 문제들을 전체에 대해 기계적으로 찾습니다.
var U = require('./curriculum.json');

function N(s) { return String(s).replace(/\s+/g, ' ').trim(); }
var out = {};
function add(k, v) { (out[k] = out[k] || []).push(v); }

// 1) 개념 카드에 구체적 숫자가 있나 (띠용 후보)
U.forEach(function (u) {
  var hasNum = u.concepts.some(function (c) { return /\d/.test(c.ko.replace(/\d\s*\/\s*\d/, '')); });
  if (!hasNum) add('숫자없는유닛', 'L' + u.level + '-' + u.no + ' ' + u.ko);
});

// 2) OX 정답 분포
var ox = { O: 0, X: 0 }, oxByLevel = {};
U.forEach(function (u) {
  u.quizzes.forEach(function (q) {
    if (q.type !== 'ox') return;
    var a = q.optionsKo[q.correctKo];
    ox[a] = (ox[a] || 0) + 1;
    oxByLevel[u.level] = oxByLevel[u.level] || { O: 0, X: 0 };
    oxByLevel[u.level][a]++;
  });
});
out['OX정답분포'] = [JSON.stringify(ox) + ' | 레벨별 ' + JSON.stringify(oxByLevel)];

// 3) MCQ 정답 위치 (원본은 정답이 항상 맨 앞인지)
var pos = {};
U.forEach(function (u) {
  u.quizzes.forEach(function (q) { if (q.type === 'mcq') pos[q.correctKo] = (pos[q.correctKo] || 0) + 1; });
});
out['MCQ정답위치'] = [JSON.stringify(pos)];

// 4) 앱에 없는 기능·자기참조·제작노트
var BAD = [
  ['레전더리', /레전더리/],
  ['앞서 확인했듯', /앞서 확인했듯|앞서 배운|이 유닛에서는|여기서는/],
  ['다른 레벨 참조', /레벨\s*\d\s*(에서|의)\s*(배운|다룬|확인)/],
  ['원칙 N 표기', /\(원칙\s*\d\)/],
  ['개념만 표기', /\(개념만\)|\(총정리\)|\(Concept Only\)|\(Wrap-Up\)/],
  ['다음 유닛 참조', /다음 유닛|이후 레벨|이번 레벨/]
];
U.forEach(function (u) {
  var texts = [['제목', u.ko]]
    .concat(u.concepts.map(function (c, i) { return ['개념' + (i + 1), c.ko]; }))
    .concat(u.quizzes.map(function (q, i) { return ['Q' + (i + 1), q.ko + ' / ' + q.explainKo]; }));
  texts.forEach(function (t) {
    BAD.forEach(function (b) {
      if (b[1].test(t[1])) add('문제표현:' + b[0], 'L' + u.level + '-' + u.no + ' ' + t[0] + ' — ' + N(t[1]).slice(0, 70));
    });
  });
});

// 5) 문어체(반말) 종결
U.forEach(function (u) {
  u.concepts.forEach(function (c, i) {
    if (/(한다|된다|이다|않는다|이에요\.\s*$)/.test(c.ko) && /(한다|된다|이다|않는다)\.?\s*$/.test(c.ko))
      add('문어체', 'L' + u.level + '-' + u.no + ' 개념' + (i + 1) + ' — ' + N(c.ko).slice(-40));
  });
});

// 6) 문항 중복 (질문이 완전히 같은 것)
var seen = {};
U.forEach(function (u) {
  u.quizzes.forEach(function (q, i) {
    var k = N(q.ko);
    if (seen[k]) add('중복문항', k.slice(0, 50) + ' :: ' + seen[k] + ' ↔ L' + u.level + '-' + u.no + 'Q' + (i + 1));
    else seen[k] = 'L' + u.level + '-' + u.no + 'Q' + (i + 1);
  });
});

// 7) 보기 중복 / 보기 수
U.forEach(function (u) {
  u.quizzes.forEach(function (q, i) {
    var id = 'L' + u.level + '-' + u.no + 'Q' + (i + 1);
    if (new Set(q.optionsKo).size !== q.optionsKo.length) add('보기중복', id);
    var want = q.type === 'ox' ? 2 : 4;
    if (q.optionsKo.length !== want) add('보기수이상', id + ' ' + q.optionsKo.length + '개');
    if (q.optionsKo.length !== q.optionsEn.length) add('한영보기수불일치', id);
    if (q.correctKo !== q.correctEn) add('한영정답불일치', id + ' ko' + q.correctKo + ' en' + q.correctEn);
  });
});

// 8) 오답 보기가 너무 티나는 경우 (‘항상/절대/무조건/자동으로’ 남발)
U.forEach(function (u) {
  u.quizzes.forEach(function (q, i) {
    if (q.type !== 'mcq') return;
    var tell = q.optionsKo.filter(function (o, oi) {
      return oi !== q.correctKo && /(항상|절대|무조건|자동으로|전혀|100%|모든)/.test(o);
    }).length;
    if (tell >= 2) add('티나는오답', 'L' + u.level + '-' + u.no + 'Q' + (i + 1) + ' 오답3개중 ' + tell + '개 — ' + N(q.ko).slice(0, 45));
  });
});

// 9) 해설이 너무 짧음
U.forEach(function (u) {
  u.quizzes.forEach(function (q, i) {
    if (q.explainKo.length < 20) add('해설짧음', 'L' + u.level + '-' + u.no + 'Q' + (i + 1) + ' "' + q.explainKo + '"');
  });
});

Object.keys(out).forEach(function (k) {
  var v = out[k];
  console.log('\n■ ' + k + ' (' + v.length + ')');
  v.slice(0, 14).forEach(function (x) { console.log('   ' + x); });
  if (v.length > 14) console.log('   … 외 ' + (v.length - 14) + '건');
});
