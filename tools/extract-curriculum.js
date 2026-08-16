// 커리큘럼 HTML → JSON. 원본은 읽기만 하고 건드리지 않습니다.
var fs = require('fs');

var SRC = process.argv[2];
var OUT = process.argv[3];
var html = fs.readFileSync(SRC, 'utf8');

function decode(s) {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&lsquo;/g, '‘').replace(/&rsquo;/g, '’')
    .replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”')
    .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ').trim();
}

// 레벨 경계 = <div class="level-head"> ... 레벨 N
var levels = [];
var levelRe = /<div class="level-tag">([\s\S]{0,200}?)<\/div>/g;
var m;
while ((m = levelRe.exec(html))) {
  var t = decode(m[1]);
  var n = /레벨\s*(\d+)/.exec(t);
  if (n) levels.push({ at: m.index, n: Number(n[1]), text: t });
}

function levelOf(pos) {
  var n = 0;
  for (var i = 0; i < levels.length; i++) if (levels[i].at < pos) n = levels[i].n;
  return n;
}

var sections = html.split('<section class="skill-section">');
var offset = 0;
var units = [];

sections.forEach(function (sec, si) {
  var at = offset;
  offset += sec.length + '<section class="skill-section">'.length;
  if (si === 0) return;

  var head = /<span class="skill-num">(\d+)<\/span><h3>([\s\S]*?)<\/h3>/.exec(sec);
  if (!head) return;
  var titleRaw = head[2];
  var enM = /<span class="en">·?\s*([\s\S]*?)<\/span>/.exec(titleRaw);
  var unit = {
    level: levelOf(at),
    no: Number(head[1]),
    ko: decode(titleRaw.replace(/<span class="en">[\s\S]*?<\/span>/, '')),
    en: enM ? decode(enM[1]) : '',
    concepts: [],
    quizzes: []
  };

  var ccRe = /<div class="cc-label">([\s\S]*?)<\/div>\s*<p class="lang-ko">([\s\S]*?)<\/p>\s*<p class="lang-en">([\s\S]*?)<\/p>/g;
  var cc;
  while ((cc = ccRe.exec(sec))) {
    unit.concepts.push({ label: decode(cc[1]), ko: decode(cc[2]), en: decode(cc[3]) });
  }

  var qcRe = /<div class="quiz-card">([\s\S]*?)<div class="quiz-explain lang-en">([\s\S]*?)<\/div>/g;
  var qc;
  while ((qc = qcRe.exec(sec))) {
    var body = qc[1];
    var type = /<span class="quiz-type">([\s\S]*?)<\/span>/.exec(body);
    var qko = /<div class="quiz-q lang-ko">([\s\S]*?)<\/div>/.exec(body);
    var qen = /<div class="quiz-q lang-en">([\s\S]*?)<\/div>/.exec(body);
    var xko = /<div class="quiz-explain lang-ko">([\s\S]*?)<\/div>/.exec(body);

    var optsKo = [], correctKo = -1;
    var oRe = /<div class="quiz-opt( correct)? lang-ko">([\s\S]*?)<\/div>/g, o;
    while ((o = oRe.exec(body))) {
      if (o[1]) correctKo = optsKo.length;
      optsKo.push(decode(o[2].replace(/<span class="mark">[\s\S]*?<\/span>/, '')));
    }
    var optsEn = [], correctEn = -1;
    var oRe2 = /<div class="quiz-opt( correct)? lang-en">([\s\S]*?)<\/div>/g, o2;
    while ((o2 = oRe2.exec(body))) {
      if (o2[1]) correctEn = optsEn.length;
      optsEn.push(decode(o2[2].replace(/<span class="mark">[\s\S]*?<\/span>/, '')));
    }

    unit.quizzes.push({
      type: /OX/i.test(type ? type[1] : '') ? 'ox' : 'mcq',
      ko: qko ? decode(qko[1]) : '',
      en: qen ? decode(qen[1]) : '',
      optionsKo: optsKo, correctKo: correctKo,
      optionsEn: optsEn, correctEn: correctEn,
      explainKo: xko ? decode(xko[1]) : '',
      explainEn: decode(qc[2])
    });
  }

  units.push(unit);
});

fs.writeFileSync(OUT, JSON.stringify(units, null, 1), 'utf8');
console.log('유닛', units.length, '| 개념', units.reduce(function (a, u) { return a + u.concepts.length; }, 0),
  '| 문항', units.reduce(function (a, u) { return a + u.quizzes.length; }, 0));
