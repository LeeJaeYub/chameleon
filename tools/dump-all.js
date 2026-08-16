// 전체 커리큘럼(9레벨 78레슨 344문항)을 사람이 훑어보기 좋은 HTML로 뽑습니다.
var fs = require('fs');
eval(fs.readFileSync(__dirname + '/../money-muscle/content.js', 'utf8'));

function dec(s) {
  if (!s) return '';
  return String(s)
    .replace(/&lsquo;/g, '‘').replace(/&rsquo;/g, '’')
    .replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”')
    .replace(/&amp;/g, '&').replace(/&minus;/g, '−');
}
function esc(s) {
  return dec(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

var lvName = {};
CURRICULUM.forEach(function (c) { lvName[c.n] = c; });

var perLvCount = {};
var html = [];

LESSONS.forEach(function (L) {
  var lv = L.lv || 1;
  if (!perLvCount[lv]) {
    perLvCount[lv] = 0;
    var meta = lvName[lv];
    html.push('<section class="level" id="lv' + lv + '">');
    html.push('<h1>레벨 ' + lv + ' · ' + esc(meta.name) + '</h1>');
    html.push('<p class="lv-desc">' + esc(meta.ko) + ' · ' + esc(meta.en) + '<br>' + esc(meta.desc) + '</p>');
  }
  if (!L.checkpoint) perLvCount[lv]++;

  html.push('<article class="lesson">');
  html.push('<h2>' + (L.checkpoint ? '🏁 ' : (perLvCount[lv] + '. ')) + esc(L.name) + '</h2>');

  L.steps.forEach(function (s) {
    if (s.type === 'concept') {
      html.push('<div class="concept">');
      html.push('<div class="tag">개념카드</div>');
      html.push('<h3>' + esc(s.title) + '</h3>');
      html.push('<p>' + esc(s.body) + '</p>');
      if (s.compare) {
        html.push('<div class="compare">');
        html.push('<div class="cell"><div class="lbl">' + esc(s.compare.a.label) + '</div><div class="val">' + esc(s.compare.a.value) + '</div></div>');
        html.push('<div class="cell good"><div class="lbl">' + esc(s.compare.b.label) + '</div><div class="val">' + esc(s.compare.b.value) + '</div></div>');
        html.push('</div>');
        html.push('<div class="note">' + esc(s.compare.note) + '</div>');
      }
      if (s.aside) html.push('<div class="aside">💬 ' + esc(s.aside) + '</div>');
      html.push('</div>');
      return;
    }

    html.push('<div class="quiz">');
    var typeLabel = { quiz: '객관식/OX', match: '짝맞추기', fill: '빈칸', order: '순서배열' }[s.type];
    html.push('<div class="tag">' + typeLabel + '</div>');

    if (s.type === 'quiz') {
      html.push('<h3>' + esc(s.q) + '</h3>');
      if (s.hint) html.push('<div class="hint">힌트: ' + esc(s.hint) + '</div>');
      html.push('<ul class="opts">');
      s.options.forEach(function (o, i) {
        html.push('<li class="' + (i === s.correct ? 'correct' : '') + '">' + esc(o) + (i === s.correct ? ' <span class="mark">✔ 정답</span>' : '') + '</li>');
      });
      html.push('</ul>');
    } else if (s.type === 'fill') {
      html.push('<h3>' + esc(s.sentence).replace('___', '<span class="blank">____</span>') + '</h3>');
      html.push('<ul class="opts">');
      s.options.forEach(function (o, i) {
        html.push('<li class="' + (i === s.correct ? 'correct' : '') + '">' + esc(o) + (i === s.correct ? ' <span class="mark">✔ 정답</span>' : '') + '</li>');
      });
      html.push('</ul>');
    } else if (s.type === 'match') {
      html.push('<h3>' + esc(s.q) + '</h3>');
      html.push('<ul class="pairs">');
      s.pairs.forEach(function (p) {
        html.push('<li><b>' + esc(p[0]) + '</b> — ' + esc(p[1]) + '</li>');
      });
      html.push('</ul>');
    } else if (s.type === 'order') {
      html.push('<h3>' + esc(s.q) + '</h3>');
      html.push('<ol class="order">');
      s.items.forEach(function (it) { html.push('<li>' + esc(it) + '</li>'); });
      html.push('</ol>');
    }

    if (s.explain) html.push('<div class="explain">해설: ' + esc(s.explain) + '</div>');
    html.push('</div>');
  });

  html.push('</article>');
});
html.push('</section>');

var page = [
  '<title>머니머슬 전체 콘텐츠 검토 · 9레벨 78레슨 344문항</title>',
  '<style>',
  ':root{--ink:#2a2a28;--sub:#6b6b64;--line:#e5e1d6;--card:#fbfaf6;--bg:#f5f2ea;--accent:#3f7a52;--accent-wash:#e8f2ea;}',
  '@media(prefers-color-scheme:dark){:root:not([data-theme="light"]){--ink:#e9e6dd;--sub:#a8a598;--line:#3a382f;--card:#232019;--bg:#17150f;--accent:#7fc99a;--accent-wash:#1c2b21;}}',
  ':root[data-theme="dark"]{--ink:#e9e6dd;--sub:#a8a598;--line:#3a382f;--card:#232019;--bg:#17150f;--accent:#7fc99a;--accent-wash:#1c2b21;}',
  'body{background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Malgun Gothic",sans-serif;max-width:760px;margin:0 auto;padding:32px 20px 120px;line-height:1.6;}',
  '.toc{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 20px;margin-bottom:32px;position:sticky;top:12px;z-index:9;font-size:14px;}',
  '.toc a{color:var(--accent);text-decoration:none;margin-right:10px;font-weight:600;}',
  '.level{margin-bottom:48px;padding-top:8px;}',
  '.level h1{font-size:22px;border-bottom:2px solid var(--accent);padding-bottom:8px;margin-bottom:6px;}',
  '.lv-desc{color:var(--sub);font-size:13.5px;margin-bottom:20px;}',
  '.lesson{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px 20px;margin-bottom:16px;}',
  '.lesson h2{font-size:16px;margin:0 0 12px;}',
  '.concept,.quiz{border-top:1px dashed var(--line);padding-top:12px;margin-top:12px;}',
  '.tag{display:inline-block;font-size:10.5px;font-weight:700;letter-spacing:.03em;color:var(--accent);background:var(--accent-wash);padding:2px 8px;border-radius:20px;margin-bottom:6px;}',
  'h3{font-size:14.5px;margin:0 0 8px;font-weight:700;}',
  'p{font-size:13.5px;margin:0 0 8px;}',
  '.opts{list-style:none;padding:0;margin:8px 0;font-size:13px;}',
  '.opts li{padding:6px 10px;border:1px solid var(--line);border-radius:8px;margin-bottom:5px;}',
  '.opts li.correct{border-color:var(--accent);background:var(--accent-wash);font-weight:700;}',
  '.mark{font-size:11px;color:var(--accent);}',
  '.pairs,.order{font-size:13px;padding-left:18px;margin:8px 0;}',
  '.pairs li{margin-bottom:4px;list-style:none;padding-left:0;}',
  '.order li{margin-bottom:4px;}',
  '.compare{display:flex;gap:8px;margin:10px 0 4px;}',
  '.cell{flex:1;background:var(--bg);border-radius:8px;padding:10px;font-size:12.5px;}',
  '.cell.good{background:var(--accent-wash);}',
  '.cell .lbl{color:var(--sub);margin-bottom:3px;}',
  '.cell .val{font-weight:700;font-size:15px;}',
  '.note{font-size:11.5px;color:var(--sub);margin-bottom:6px;}',
  '.aside{font-size:12.5px;color:var(--sub);font-style:italic;}',
  '.hint{font-size:12px;color:var(--sub);margin-bottom:6px;}',
  '.explain{font-size:12.5px;color:var(--sub);margin-top:8px;border-top:1px dotted var(--line);padding-top:6px;}',
  '</style>',
  '<div class="toc">' + CURRICULUM.map(function (c) { return '<a href="#lv' + c.n + '">L' + c.n + ' ' + esc(c.name) + '</a>'; }).join(' ') + '</div>',
  html.join('\n')
].join('\n');

fs.writeFileSync(__dirname + '/../머니머슬-전체검토.html', page, 'utf8');
console.log('완료:', __dirname + '/../머니머슬-전체검토.html', '(' + (page.length / 1024).toFixed(0) + 'KB)');
