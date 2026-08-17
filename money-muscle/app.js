
/* 머니머슬 — 앱 로직
   화면: 온보딩 3 → 홈 → 레슨 → 완료 → 가입 */
(function () {
  'use strict';

  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var QUESTION_XP = 10;
  var COMBO_XP = 5;      // 연속 정답 한 번마다 얹히는 보너스
  var COMBO_MAX = 7;     // 보너스가 멈추는 지점 — 정답 효과음이 더 안 올라가는 8연속과 같은 자리
  var USD_PER_XP = 1;    // 유닛을 끝내면 그 레슨에서 모은 XP가 이 비율로 달러가 됩니다

  // ── 레온 · 표정은 세 개면 충분합니다 ────────────────────────
  function leon(mood) {
    var face =
      mood === 'correct'
        ? '<path d="M14 21q4-5 8 0" fill="none" stroke="#0f2a20" stroke-width="2.6" stroke-linecap="round"/>' +
          '<path d="M22 34q7 6 14 0" fill="none" stroke="#0f2a20" stroke-width="2.4" stroke-linecap="round"/>'
        : mood === 'incorrect'
        ? '<circle cx="18" cy="22" r="3.4" fill="#0f2a20"/>' +
          '<path d="M23 37q6-4 12 0" fill="none" stroke="#0f2a20" stroke-width="2.4" stroke-linecap="round"/>'
        : '<circle cx="18" cy="21" r="3.6" fill="#0f2a20"/>' +
          '<path d="M23 34q6 4 12 0" fill="none" stroke="#0f2a20" stroke-width="2.4" stroke-linecap="round"/>';

    return (
      '<svg viewBox="0 0 76 64" fill="none" aria-hidden="true">' +
      '<path d="M52 40q16-4 13-18-3-11-15-7" fill="none" stroke="#00795a" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M20 14q4-8 10-6" fill="none" stroke="#00795a" stroke-width="4" stroke-linecap="round"/>' +
      '<ellipse cx="36" cy="40" rx="23" ry="16" fill="#00b37e" stroke="#00795a" stroke-width="2.5"/>' +
      '<ellipse cx="22" cy="24" rx="16" ry="12" fill="#00b37e" stroke="#00795a" stroke-width="2.5"/>' +
      '<ellipse cx="26" cy="54" rx="5" ry="3.4" fill="#00795a"/>' +
      '<ellipse cx="46" cy="55" rx="5" ry="3.4" fill="#00795a"/>' +
      face +
      '</svg>'
    );
  }

  function paintLeon(root) {
    (root || document).querySelectorAll('[data-leon]').forEach(function (el) {
      if (!el.firstChild) el.innerHTML = leon(el.dataset.leon);
    });
  }

  // ── 소리 ──────────────────────────────────────────────────
  // 사인파 하나는 '삐' 소리라 몇 문제만 풀어도 물립니다.
  // 배음을 겹쳐 나무·벨 소리에 가깝게 만들고, 연속 정답이면 음을 한 칸씩 올립니다.
  var ctx = null;

  // 모바일에서 AudioContext는 (1) 탭이 백그라운드로 갔다 오거나
  // (2) 첫 소리가 나기 전 '사용자 제스처' 없이 만들어지면 suspended로 멈춥니다.
  // resume()은 비동기라 note() 안에서 호출해도 그 첫 소리는 씹힙니다 —
  // 그래서 터치/클릭·탭 복귀 시점에 미리 깨워둡니다.
  function unlockAudio() {
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) {}
  }
  ['touchstart', 'mousedown', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, unlockAudio, { passive: true });
  });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') unlockAudio();
  });

  var BELL = [[1, 1], [2, 0.42], [3.01, 0.17], [4.7, 0.07]];   /* 실로폰·벨 */
  var WOOD = [[1, 1], [2, 0.22], [3, 0.06]];                   /* 나무 두드리는 소리 */

  function note(freq, at, dur, gain, opt) {
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      opt = opt || {};
      var t = ctx.currentTime + at;
      var parts = opt.parts || BELL;

      var out = ctx.createGain();
      // plain은 세기를 엔벨로프에 직접 실어요 — 게인을 따로 곱하면 감쇠 곡선이 달라집니다
      out.gain.value = opt.plain ? 1 : gain;
      if (opt.plain) {
        out.connect(ctx.destination);
      } else {
        // 소리가 끝나가며 배음부터 사라집니다 — 실제 악기가 그렇게 잦아들어요
        var lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(Math.min(freq * 9, 11000), t);
        lp.frequency.exponentialRampToValueAtTime(Math.max(freq * 2, 240), t + dur);
        out.connect(lp); lp.connect(ctx.destination);
      }

      var attack = opt.plain ? 0.012 : 0.008;
      var scale = opt.plain ? gain : 1;
      parts.forEach(function (p) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = opt.type || 'sine';
        o.frequency.setValueAtTime(freq * p[0], t);
        if (opt.bend) o.frequency.exponentialRampToValueAtTime(freq * p[0] * opt.bend, t + dur * 0.8);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(p[1] * scale, t + attack);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(out);
        o.start(t); o.stop(t + dur + 0.03);
      });
    } catch (e) { /* 오디오는 있으면 좋은 것이지 필수가 아닙니다 */ }
  }

  // 연속 정답 수만큼 음계를 타고 올라갑니다 (도–레–미–파–솔–라–시–도)
  var CLIMB = [0, 2, 4, 5, 7, 9, 11, 12];
  function climb(streak) { return Math.pow(2, CLIMB[Math.min(streak, CLIMB.length - 1)] / 12); }

  var sfx = {
    // 탭은 예전 그대로 — 필터도 배음도 없는 사인파 하나 (plain)
    tap: function () { note(740, 0, 0.05, 0.06, { parts: [[1, 1]], plain: true }); },

    // 3음 아르페지오 + 한 옥타브 위 반짝임. 연속으로 맞히면 통째로 올라갑니다.
    correct: function (streak) {
      var k = climb(streak || 0);
      note(523.25 * k, 0,     0.20, 0.13);
      note(659.25 * k, 0.055, 0.20, 0.13);
      note(783.99 * k, 0.11,  0.34, 0.15);
      note(1567.98 * k, 0.15, 0.28, 0.035);
    },

    // 짝을 맞출 때마다 한 음씩 — 계단을 오르는 느낌
    pair: function (n) { note(392 * climb(n), 0, 0.16, 0.10, { parts: WOOD }); },

    // 아래로 미끄러지는 두 음. 짧고 부드럽게 — 실수를 사건으로 만들지 않습니다.
    wrong: function () {
      note(233.08, 0,    0.24, 0.10, { parts: WOOD, type: 'triangle', bend: 0.94 });
      note(174.61, 0.10, 0.32, 0.09, { parts: WOOD, type: 'triangle', bend: 0.94 });
    },

    // 완료 팡파르 — 도미솔도 위에 5도를 얹어 마무리
    done: function () {
      note(523.25, 0,    0.16, 0.12);
      note(659.25, 0.09, 0.16, 0.12);
      note(783.99, 0.18, 0.16, 0.13);
      note(1046.5, 0.27, 0.55, 0.16);
      note(1567.98, 0.30, 0.50, 0.06);
    }
  };

  // ── 상태 ────────────────────────────────────────────────
  var SAVE_KEY = 'moneymuscle.v1';
  var state = {
    reason: null, goal: null,
    done: LESSONS.map(function () { return false; }),
    xp: 0, cash: 0, askedSignup: false, onboarded: false,
    day: '', dayU: 0, dayXP: 0, dayHit: false
  };

  // ── 오늘 ────────────────────────────────────────────────
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }
  function rollDay() {
    if (state.day === today()) return;
    state.day = today();
    state.dayU = 0; state.dayXP = 0; state.dayHit = false;
  }
  function goalOf() {
    for (var i = 0; i < GOALS.length; i++) if (GOALS[i].key === state.goal) return GOALS[i];
    return GOALS[0];
  }
  function goalReached() {
    return state.dayU >= goalOf().units;
  }

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      var saved = JSON.parse(raw);
      Object.keys(state).forEach(function (k) {
        if (saved[k] !== undefined) state[k] = saved[k];
      });
      // 레슨이 추가돼도 기존 진도는 유지 — 길이만 맞춥니다
      if (!Array.isArray(state.done)) state.done = [];
      while (state.done.length < LESSONS.length) state.done.push(false);
      state.done.length = LESSONS.length;
    } catch (e) {}
  }

  var $ = function (id) { return document.getElementById(id); };

  var SCREENS = ['s-why', 's-goal', 's-build', 's-home', 's-invest', 's-curriculum', 's-lesson', 's-done', 's-signup'];
  var TAB_SCREENS = ['s-home', 's-invest'];   // 하단 탭이 보이는 화면들

  function show(id) {
    SCREENS.forEach(function (s) { $(s).hidden = s !== id; });
    var onTab = TAB_SCREENS.indexOf(id) !== -1;
    $('tabbar').hidden = !onTab;
    if (onTab) {
      // 언어 버튼은 화면을 옮기지 않으므로 data-goes가 있는 탭만 봅니다
      $('tabbar').querySelectorAll('.tab[data-goes]').forEach(function (t) {
        t.classList.toggle('is-active', t.dataset.goes === id);
      });
    }
    window.scrollTo(0, 0);
    if (id === 's-home' && typeof syncHeader === 'function') syncHeader();
    if (id === 's-invest') renderInvest();
  }

  // 게임 안에서 모으는 돈은 어느 언어판이든 달러입니다 — 나라마다 통화를 바꾸지 않아요.
  // 보상은 전부 정수라 소수점은 쓰지 않습니다.
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }

  function renderInvest() {
    $('inv-total').textContent = money(state.cash);
  }

  $('tabbar').querySelectorAll('.tab[data-goes]').forEach(function (t) {
    t.addEventListener('click', function () {
      if (t.classList.contains('is-active')) return;
      sfx.tap();
      show(t.dataset.goes);
    });
  });

  // ══ 온보딩 · 학습 이유 ══════════════════════════════════
  var whyOpts = $('why-opts');
  REASONS.forEach(function (text) {
    var b = document.createElement('button');
    b.className = 'opt';
    b.textContent = text;
    b.addEventListener('click', function () {
      sfx.tap();
      whyOpts.querySelectorAll('.opt').forEach(function (x) { x.classList.remove('is-sel'); });
      b.classList.add('is-sel');
      state.reason = text;
      $('why-next').disabled = false;
    });
    whyOpts.appendChild(b);
  });
  $('why-next').addEventListener('click', function () { sfx.tap(); show('s-goal'); });

  // ══ 온보딩 · 일일 목표 ══════════════════════════════════
  var goalOpts = $('goal-opts');
  var LEVEL1_UNITS = CURRICULUM[0].units.length;
  var TOTAL_UNITS = CURRICULUM.reduce(function (sum, lv) { return sum + lv.units.length; }, 0);
  GOALS.forEach(function (g) {
    var b = document.createElement('button');
    b.className = 'opt opt-split';
    b.innerHTML = '<span>' + g.label + '</span><span class="opt-detail">' + g.detail + '</span>';
    b.addEventListener('click', function () {
      sfx.tap();
      goalOpts.querySelectorAll('.opt').forEach(function (x) { x.classList.remove('is-sel'); });
      b.classList.add('is-sel');
      state.goal = g.key;
      $('goal-forecast').innerHTML =
        t('goal.forecast', { d: Math.ceil(LEVEL1_UNITS / g.units) }) +
        '<span class="forecast-sub">' + t('goal.forecastSub', { d: Math.ceil(TOTAL_UNITS / g.units) }) + '</span>';
      $('goal-next').disabled = false;
    });
    goalOpts.appendChild(b);
  });
  $('goal-back').addEventListener('click', function () { sfx.tap(); show('s-why'); });
  $('goal-next').addEventListener('click', function () {
    sfx.tap();
    show('s-build');
    setTimeout(function () {
      state.onboarded = true;
      save();
      renderHome();
      show('s-home');
    }, reduced ? 300 : 1250);
  });

  // ══ 홈 · 학습 경로 — 9레벨이 하나의 길로 이어집니다 ════
  var OFFSETS = ['off-l', 'off-r', 'off-l2', 'off-r2'];
  // 지금 눌러야 할 자리 — 재생 버튼 하나
  var ICON_PLAY = '<svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5 3.2 13 8 5 12.8V3.2Z" fill="currentColor"/></svg>';
  // 레벨의 첫 유닛 — 어디서든 이 레벨로 뛰어들 수 있다는 표시, 재생 버튼 두 개
  var ICON_SKIP = '<svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true"><path d="M2 3.2 8 8 2 12.8V3.2Z" fill="currentColor"/><path d="M11 3.2 17 8 11 12.8V3.2Z" fill="currentColor"/></svg>';
  // 레슨 → 커리큘럼 좌표 색인. 콘텐츠가 있는 (레벨,유닛)만 등록됩니다.
  var LESSON_AT = {};
  (function () {
    var n = {};
    LESSONS.forEach(function (L, i) {
      var lv = L.lv || 1;
      if (L.checkpoint) { LESSON_AT[lv + ':cp'] = i; return; }
      n[lv] = (n[lv] || 0) + 1;
      LESSON_AT[lv + ':' + n[lv]] = i;
    });
  })();
  function lessonOf(li, ui) { return LESSON_AT[(li + 1) + ':' + (ui + 1)]; }
  function cpOf(li) { return LESSON_AT[(li + 1) + ':cp']; }
  function doneAt(li, ui) { var i = lessonOf(li, ui); return i !== undefined && !!state.done[i]; }
  function doneCp(li) { var i = cpOf(li); return i !== undefined && !!state.done[i]; }
  // 그 레벨의 유닛(콘텐츠 있는 것만)을 다 끝냈는지 — 체크포인트 잠금 여부에 씁니다
  function unitsDone(li) {
    var units = CURRICULUM[li].units;
    for (var ui = 0; ui < units.length; ui++) {
      if (lessonOf(li, ui) !== undefined && !doneAt(li, ui)) return false;
    }
    return true;
  }
  var homeFirstPaint = true;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function lvColor(n) { return LEVELS[n - 1].color; }

  // 지금 눌러야 할 곳 — 잠그지 않고, 표시만 합니다. 콘텐츠 없는 유닛은 건너뜁니다
  function curPos() {
    for (var li = 0; li < CURRICULUM.length; li++) {
      for (var ui = 0; ui < CURRICULUM[li].units.length; ui++) {
        if (lessonOf(li, ui) !== undefined && !doneAt(li, ui)) return { l: li, u: ui };
      }
      if (cpOf(li) !== undefined && !doneCp(li)) return { l: li, u: -1 };
    }
    return { l: -1, u: -1 };
  }

  var toastTimer = 0;
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 1900);
  }

  function openUnit(li, ui) {
    var i = lessonOf(li, ui);
    if (i !== undefined) { startLesson(i); return; }
    sfx.tap();
    toast(t('toast.unitSoon', { n: li + 1, name: CURRICULUM[li].units[ui] }));
  }
  function openCp(li) {
    if (!doneCp(li) && !unitsDone(li)) {
      sfx.tap();
      toast(t('toast.cpLocked', { n: li + 1 }));
      return;
    }
    var i = cpOf(li);
    if (i !== undefined) { startLesson(i); return; }
    sfx.tap();
    toast(t('toast.cpSoon', { n: li + 1 }));
  }

  function renderHome() {
    var path = $('path');
    var keep = path.scrollTop;
    var cur = curPos();
    path.innerHTML = '';

    CURRICULUM.forEach(function (lv, li) {
      var band = document.createElement('div');
      band.className = 'lv-band';
      band.setAttribute('data-lv', lv.n);
      band.style.setProperty('--lv', lvColor(lv.n));
      band.innerHTML =
        '<div class="lv-line"><span></span><b>' + t('level.tag', { n: pad(lv.n), name: lv.name }) + '</b><span></span></div>' +
        '<div class="lv-card">' +
          '<div class="lv-title">' + lv.ko + '</div>' +
          '<div class="lv-meta">' + lv.en + '</div>' +
          '<p class="lv-desc">' + lv.desc + '</p>' +
        '</div>';
      path.appendChild(band);

      lv.units.forEach(function (name, ui) {
        var done = doneAt(li, ui);
        var isCur = li === cur.l && ui === cur.u;
        path.appendChild(isCur ? currentNode(name, li, ui) : plainNode(name, li, ui, done));
      });

      path.appendChild(cpCard(lv, li, li === cur.l && cur.u === -1));
    });

    path.appendChild(goalStone());

    paintLeon(path);

    if (homeFirstPaint) {
      // 화면이 아직 숨겨져 있으면 위치를 잴 수 없어요 — 보인 다음 프레임에 맞춥니다
      homeFirstPaint = false;
      requestAnimationFrame(function () {
        var star = path.querySelector('.node-row.is-current');
        path.scrollTop = star ? Math.max(0, star.offsetTop - 150) : 0;
        syncHeader();
        paintRail();
      });
    } else {
      path.scrollTop = keep;
    }
    syncHeader();
    paintRail();
  }

  function plainNode(name, li, ui, done) {
    var row = document.createElement('div');
    row.className = 'node-row ' + OFFSETS[ui % OFFSETS.length] + (done ? ' is-done' : '');
    row.id = 'u-' + li + '-' + ui;
    row.style.setProperty('--lv', lvColor(li + 1));
    var btn = document.createElement('button');
    btn.className = 'node';
    if (done) { btn.textContent = '★'; }
    else if (ui === 0) {
      btn.className = 'node is-entry';
      btn.innerHTML = ICON_SKIP;
      btn.setAttribute('aria-label', t('node.entryAria', { name: name }));
    }
    else { btn.textContent = pad(ui + 1); }
    btn.addEventListener('click', function () { openUnit(li, ui); });
    var label = document.createElement('span');
    label.className = 'node-label';
    label.textContent = name;
    row.appendChild(btn);
    row.appendChild(label);
    return row;
  }

  function currentNode(name, li, ui) {
    var row = document.createElement('div');
    row.className = 'node-row is-current ' + OFFSETS[ui % OFFSETS.length];
    row.id = 'u-' + li + '-' + ui;
    row.style.setProperty('--lv', lvColor(li + 1));
    var btn = document.createElement('button');
    btn.className = 'node node-current-btn';
    btn.innerHTML = ICON_PLAY;
    btn.setAttribute('aria-label', t('node.startAria', { name: name }));
    btn.addEventListener('click', function () { openUnit(li, ui); });
    var label = document.createElement('span');
    label.className = 'node-label';
    label.textContent = name;
    row.appendChild(btn);
    row.appendChild(label);
    return row;
  }

  function cpCard(lv, li, isNext) {
    var locked = !doneCp(li) && !unitsDone(li);
    var b = document.createElement('button');
    b.className = 'checkpoint-card' + (isNext ? ' is-next' : '') + (locked ? ' is-locked' : '');
    b.id = 'cp-' + li;
    b.style.setProperty('--lv', lvColor(lv.n));
    var label = doneCp(li) ? t('cp.done') : locked ? t('cp.locked') : t('cp.test');
    b.innerHTML =
      '<span class="cp-name">' + t('cp.name', { n: lv.n }) + '</span>' +
      '<span class="cp-state">' + label + '</span>';
    b.addEventListener('click', function () { openCp(li); });
    return b;
  }

  // 경로 맨 아래 — 9레벨을 졸업할 때마다 한 칸씩 그 레벨 색으로 칠해집니다
  function goalStone() {
    var doneN = 0;
    for (var i = 0; i < CURRICULUM.length; i++) if (doneCp(i)) doneN++;
    var full = doneN === CURRICULUM.length;

    var last = CURRICULUM.length - 1;
    var bars = '';
    for (var li = 0; li <= last; li++) {
      var w = 56 + (last - li) * 8;              // 아래로 갈수록 넓게 — 레벨 1이 주춧돌
      bars += '<rect x="' + ((140 - w) / 2) + '" y="' + ((last - li) * 21) + '"' +
        ' width="' + w + '" height="18" rx="4" fill="' +
        (doneCp(li) ? lvColor(li + 1) : 'var(--line)') + '"/>';
    }

    var wrap = el('div', 'goal-stone' + (full ? ' is-full' : ''));
    wrap.innerHTML =
      '<div class="lv-line"><span></span><b>' + t('goalStone.band') + '</b><span></span></div>' +
      '<svg viewBox="0 0 140 210" aria-hidden="true">' + bars +
        '<rect x="0" y="192" width="140" height="18" rx="5" fill="' +
        (full ? 'var(--ink)' : 'var(--line)') + '"/></svg>' +
      '<div class="goal-stone-title">' + t('goalStone.title') + '</div>' +
      '<p class="goal-stone-sub">' +
        (full ? t('goalStone.subFull', { n: CURRICULUM.length }) : t('goalStone.sub')) +
      '</p>';
    return wrap;
  }

  // 구간이 바뀔 때만 글자를 한 번 페이드 — 휠이 크게 튀어도 뚝 끊겨 보이지 않게.
  // 동시에, 지금 구간의 띠는 지웁니다 — 헤더가 이미 그 이름을 말하고 있으니까요.
  var shownKey = null;
  function swapHead(key, section) {
    if (key === shownKey) return;
    shownKey = key;

    var main = $('home-level-tab').querySelector('.level-head-main');
    main.classList.remove('is-swap');
    void main.offsetWidth;        // 애니메이션을 다시 태우려면 한 번 끊어줘야 해요
    main.classList.add('is-swap');

    $('path').querySelectorAll('.is-here').forEach(function (x) { x.classList.remove('is-here'); });
    if (section) section.classList.add('is-here');
  }

  // 스크롤한 위치에 따라 상단 고정 탭이 따라옵니다
  function syncHeader() {
    var path = $('path');
    var marks = path.querySelectorAll('.lv-band, .goal-stone');
    if (!marks.length) return;
    if (!path.clientHeight) { requestAnimationFrame(syncHeader); return; }

    // 11px = 체크포인트 카드 하단과 다음 레벨 띠 사이의 간격.
    // 이 값을 써야 헤더가 '상단 탭 하단이 체크포인트 카드 하단에 닿는 순간' 바뀝니다.
    var cur = marks[0];
    var mark = path.scrollTop + 11;
    for (var i = 0; i < marks.length; i++) if (marks[i].offsetTop <= mark) cur = marks[i];

    // 마지막 구간은 더 내려갈 여지가 없어 판정선까지 못 올라와요.
    // 그래서 화면에 통째로 들어오면 그때부터 현재 구간으로 봅니다.
    var last = marks[marks.length - 1];
    if (last.offsetTop + last.offsetHeight <= path.scrollTop + path.clientHeight) cur = last;

    var tab = $('home-level-tab');
    var rail = $('scroll-rail');
    swapHead(cur.classList.contains('goal-stone') ? 'goal' : cur.getAttribute('data-lv'), cur);

    if (cur.classList.contains('goal-stone')) {
      var doneN = 0;
      for (var l = 0; l < CURRICULUM.length; l++) if (doneCp(l)) doneN++;
      var full = doneN === CURRICULUM.length;
      var goalColor = full ? 'var(--coin-deep)' : 'var(--slate)';
      tab.style.setProperty('--lv', goalColor);
      rail.style.setProperty('--lv', goalColor);
      $('home-level-tag').textContent = t('goalStone.title');
      $('home-level-name').textContent = full
        ? t('head.goalFull', { n: CURRICULUM.length })
        : t('head.goalName');
      $('home-count').textContent = t('head.levelCount', { d: doneN, t: CURRICULUM.length });
      return;
    }

    var n = Number(cur.getAttribute('data-lv'));
    var lv = CURRICULUM[n - 1];
    tab.style.setProperty('--lv', lvColor(n));
    rail.style.setProperty('--lv', lvColor(n));
    $('home-level-tag').textContent = t('level.tag', { n: pad(n), name: lv.name });
    $('home-level-name').textContent = lv.ko;
    var d = 0;
    for (var u = 0; u < lv.units.length; u++) if (doneAt(n - 1, u)) d++;
    $('home-count').textContent = d + ' / ' + lv.units.length;
  }

  // 오른쪽 스크롤 진행 표시줄 — 지나온 만큼 선이 차오르고, 점이 그 끝을 따라갑니다
  var railLen = null;
  function paintRail() {
    var path = $('path');
    var fill = $('scroll-rail-fill');
    var dot = $('scroll-rail-dot');
    if (railLen === null) railLen = fill.getTotalLength();
    var max = path.scrollHeight - path.clientHeight;
    var progress = max > 0 ? Math.min(1, Math.max(0, path.scrollTop / max)) : 0;
    fill.style.strokeDasharray = railLen;
    fill.style.strokeDashoffset = railLen * (1 - progress);
    dot.style.top = (progress * 100) + '%';
  }

  // 스크롤 이벤트는 한 프레임에도 여러 번 들어와요. 그릴 때 한 번만 계산합니다.
  var headQueued = false;
  $('path').addEventListener('scroll', function () {
    if (headQueued) return;
    headQueued = true;
    requestAnimationFrame(function () { headQueued = false; syncHeader(); paintRail(); });
  }, { passive: true });
  window.addEventListener('resize', function () { railLen = null; paintRail(); });

  // ══ 커리큘럼 전체 보기 ═══════════════════════════════════
  function renderCurriculum() {
    var body = $('cur-body');
    body.innerHTML = '';
    CURRICULUM.forEach(function (lv, li) {
      var sec = document.createElement('div');
      sec.className = 'cur-lv';
      sec.style.setProperty('--lv', lvColor(lv.n));
      var rows = lv.units.map(function (name, ui) {
        var done = doneAt(li, ui);
        return '<button class="cur-row" data-l="' + li + '" data-u="' + ui + '">' +
          '<span class="cur-no">' + pad(ui + 1) + '</span>' +
          '<span class="cur-name">' + name + '</span>' +
          '<span class="cur-mark">' + (done ? '✓' : '') + '</span></button>';
      }).join('');
      sec.innerHTML =
        '<div class="cur-lv-head"><span class="cur-chip">' + pad(lv.n) + '</span>' +
          '<span><span class="cur-lv-name">' + lv.ko + '</span>' +
          '<span class="cur-lv-meta">' + lv.name + ' · ' + lv.en + '</span></span></div>' +
        '<p class="cur-lv-desc">' + lv.desc + '</p>' +
        '<div class="cur-rows">' + rows + '</div>' +
        '<div class="cur-cp' + (doneCp(li) ? ' is-done' : '') + '">' + t('cur.cp', { n: lv.n, name: lv.name }) + '</div>';
      body.appendChild(sec);
    });

    body.querySelectorAll('.cur-row').forEach(function (r) {
      r.addEventListener('click', function () {
        sfx.tap();
        var li = Number(r.getAttribute('data-l'));
        var ui = Number(r.getAttribute('data-u'));
        show('s-home');
        var el = document.getElementById('u-' + li + '-' + ui);
        if (el) {
          $('path').scrollTop = Math.max(0, el.offsetTop - 120);
          el.classList.add('is-flash');
          setTimeout(function () { el.classList.remove('is-flash'); }, 1000);
        }
        syncHeader();
      });
    });
  }

  $('home-level-tab').addEventListener('click', function () {
    sfx.tap();
    renderCurriculum();
    show('s-curriculum');
  });
  $('cur-close').addEventListener('click', function () { sfx.tap(); show('s-home'); });

  // ══ 레슨 ════════════════════════════════════════════════
  var sess = null;

  function startLesson(idx) {
    sfx.tap();
    var lesson = LESSONS[idx];
    var concepts = [], quizzes = [];
    lesson.steps.forEach(function (s) {
      (s.type === 'concept' ? concepts : quizzes).push(s);
    });

    sess = {
      idx: idx,
      lesson: lesson,
      queue: concepts.map(function (s) { return { step: s, kind: 'concept' }; })
        .concat(quizzes.map(function (s) { return { step: s, kind: 'quiz' }; })),
      pos: 0,
      total: { concept: concepts.length, quiz: quizzes.length, retry: 0 },
      passed: { concept: 0, quiz: 0, retry: 0 },
      firstTryRight: 0,
      xp: 0,
      combo: 0,
      graded: false
    };

    $('bar').innerHTML = '';   // 새 레슨은 빈 바에서 시작 — 앞 레슨에서 줄어드는 게 보이지 않게
    renderStep();
    show('s-lesson');
  }

  function renderBar() {
    var bar = $('bar');
    ['concept', 'quiz', 'retry'].forEach(function (kind) {
      var total = sess.total[kind];
      var seg = bar.querySelector('.of-' + kind);
      // 다시 풀기 칸은 실제로 틀렸을 때 생깁니다 — 미리 자리를 비워두지 않습니다
      if (total === 0) { if (seg) bar.removeChild(seg); return; }

      // 칸을 새로 만들지 않고 폭만 바꿉니다 — 그래야 채워지는 게 애니메이션으로 보입니다
      if (!seg) {
        seg = document.createElement('div');
        seg.className = 'bar-seg of-' + kind;
        seg.appendChild(el('div', 'bar-fill'));
        bar.appendChild(seg);
      }
      seg.style.flex = total;
      seg.firstChild.style.width = Math.round(sess.passed[kind] / total * 100) + '%';
    });

    // 구간 라벨
    var left = $('phase-left');
    var total = sess.total, p = sess.passed;
    var cur = sess.queue[sess.pos];
    var parts = [
      '<span class="phase-tag on-concept' + (cur && cur.kind !== 'concept' ? ' is-past' : '') + '">' +
        t('phase.concept', { p: p.concept, t: total.concept }) + '</span>',
      '<span class="phase-sep">·</span>',
      '<span class="phase-tag on-quiz">' + t('phase.quiz', { p: p.quiz, t: total.quiz }) + '</span>'
    ];
    if (total.retry > 0) {
      parts.push('<span class="phase-sep">·</span>');
      parts.push('<span class="phase-tag on-retry">' + t('phase.retry', { n: total.retry - p.retry }) + '</span>');
    }
    left.innerHTML = parts.join('');

    $('combo').textContent = sess.combo >= 2 ? t('combo', { n: sess.combo }) : '';
  }

  function armCta(label, enabled, handler) {
    var cta = $('lesson-cta');
    var fresh = cta.cloneNode(false);   // 이전 핸들러를 확실히 떼어냅니다
    fresh.textContent = label;
    fresh.disabled = !enabled;
    fresh.addEventListener('click', function () { sfx.tap(); handler(); });
    cta.parentNode.replaceChild(fresh, cta);
  }

  function setCtaEnabled(on) { $('lesson-cta').disabled = !on; }

  function clearFeedback() {
    var foot = $('lesson-foot');
    foot.classList.remove('is-correct', 'is-wrong');
    var fb = foot.querySelector('.fb');
    if (fb) fb.remove();
  }

  function renderStep() {
    sess.graded = false;
    clearFeedback();
    renderBar();

    var entry = sess.queue[sess.pos];
    var body = $('lesson-body');
    body.innerHTML = '';

    if (entry.kind === 'retry') {
      body.appendChild(el('span', 'pill on-retry', t('pill.retry')));
    } else if (entry.kind === 'concept' && !sess.lesson.checkpoint) {
      body.appendChild(el('span', 'pill on-concept', t('pill.concept')));
    }

    var s = entry.step;
    if (s.type === 'concept') return renderConcept(s, body);
    if (s.type === 'match') return renderMatch(s, body);
    if (s.type === 'fill') return renderFill(s, body);
    if (s.type === 'order') return renderOrder(s, body);
    return renderQuiz(s, body);
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  // ---- 개념 ----
  function renderConcept(s, body) {
    body.appendChild(el('h2', 'concept-title', s.title));

    var card = el('div', 'concept-card');
    // 빈 줄로 나뉜 문단은 각각 <p>로 — 카드 안쪽 여백보다 문단 사이가 벌어지지 않게 합니다
    s.body.split('\n\n').forEach(function (para) {
      card.appendChild(el('p', 'concept-text', para));
    });
    if (s.compare) {
      card.appendChild(el('div', 'rule'));
      var cmp = el('div', 'compare');
      cmp.appendChild(el('div', 'compare-cell is-plain',
        '<span class="compare-label">' + s.compare.a.label + '</span><span class="compare-value">' + s.compare.a.value + '</span>'));
      cmp.appendChild(el('div', 'compare-cell is-good',
        '<span class="compare-label">' + s.compare.b.label + '</span><span class="compare-value">' + s.compare.b.value + '</span>'));
      card.appendChild(cmp);
      card.appendChild(el('p', 'compare-note', s.compare.note));
    }
    body.appendChild(card);

    if (s.aside) {
      var row = el('div', 'sticker-row');
      row.appendChild(el('span', 'sticker is-idle', ''));
      var stk = row.firstChild;
      stk.style.cssText = 'width:82px;height:82px;border-radius:22px';
      stk.innerHTML = leon('idle');
      row.appendChild(el('p', 'bubble', s.aside));
      body.appendChild(row);
    }

    armCta(t('cta.continue'), true, advance);
  }

  // ---- 객관식 / O·X ----
  function renderQuiz(s, body) {
    body.appendChild(el('h2', 'q-text', s.q));
    if (s.hint) {
      var h = el('div', 'hint');
      h.appendChild(el('span', 'hint-label', t('hint.label')));
      h.appendChild(el('p', 'hint-text', s.hint));
      body.appendChild(h);
    }

    var isOX = s.options.length === 2;
    var picks = s.options.map(function (t, i) { return { t: t, ok: i === s.correct }; });
    if (!isOX) shuffle(picks);

    var box = el('div', 'opts' + (isOX ? ' is-ox' : ''));
    var chosen = null;

    picks.forEach(function (p) {
      var b = el('button', 'opt is-quiz', p.t);
      b.addEventListener('click', function () {
        if (sess.graded) return;
        sfx.tap();
        box.querySelectorAll('.opt').forEach(function (x) { x.classList.remove('is-sel'); });
        b.classList.add('is-sel');
        chosen = { node: b, ok: p.ok };
        setCtaEnabled(true);
      });
      box.appendChild(b);
    });
    body.appendChild(box);

    armCta(t('cta.check'), false, function () {
      if (!chosen) return;
      box.querySelectorAll('.opt').forEach(function (x, i) {
        x.disabled = true;
        x.classList.remove('is-sel');
        if (picks[i].ok) x.classList.add('is-right');
        else x.classList.add('is-muted');
      });
      if (chosen.ok) sparkle(chosen.node);
      else {
        chosen.node.classList.remove('is-muted');
        chosen.node.classList.add('is-wrong');
      }
      var answer = picks.filter(function (p) { return p.ok; })[0].t;
      grade(chosen.ok, s.explain, answer);
    });
  }

  // ---- 짝맞추기 ----
  function renderMatch(s, body) {
    body.appendChild(el('h2', 'q-text', s.q || t('match.q')));

    var grid = el('div', 'match');
    body.appendChild(grid);

    var left = shuffle(s.pairs.map(function (p, i) { return { t: p[0], id: i }; }));
    var right = shuffle(s.pairs.map(function (p, i) { return { t: p[1], id: i }; }));
    var selL = null, selR = null, solved = 0, missed = false;

    // 왼쪽·오른쪽을 한 줄씩 번갈아 넣어요 — 그리드 한 행에 두 칸이 같이 들어가면
    // 브라우저가 그 행의 높이를 둘 중 더 큰 쪽에 맞춰줘서, 글자가 길어 줄바꿈된 칸 옆도
    // 빈 공간 없이 나란히 맞춰집니다 (왼쪽 칸만 따로 쌓으면 이게 안 맞아요).
    function build(items, side) {
      return items.map(function (it) {
        var b = el('button', 'match-item', it.t);
        b.dataset.id = it.id;
        b.dataset.side = side;
        b.addEventListener('click', function () {
          if (b.classList.contains('is-done') || sess.graded) return;
          sfx.tap();
          var isLeft = side === 'l';
          var prev = isLeft ? selL : selR;
          if (prev) prev.classList.remove('is-sel');
          // 같은 칸을 다시 누르면 선택을 무릅니다 — 양쪽 다 똑같이
          if (prev === b) { if (isLeft) selL = null; else selR = null; return; }
          b.classList.add('is-sel');
          if (isLeft) selL = b; else selR = b;
          if (selL && selR) resolve();
        });
        return b;
      });
    }

    function resolve() {
      var a = selL, b = selR;
      selL = null; selR = null;
      if (a.dataset.id === b.dataset.id) {
        [a, b].forEach(function (x) { x.classList.remove('is-sel'); x.classList.add('is-done'); sparkle(x); });
        solved++;
        sfx.pair(solved - 1);
        if (solved === s.pairs.length) grade(!missed, s.explain, null);
      } else {
        missed = true;
        sfx.wrong();
        [a, b].forEach(function (x) { x.classList.remove('is-sel'); x.classList.add('is-miss'); });
        setTimeout(function () {
          [a, b].forEach(function (x) { x.classList.remove('is-miss'); });
        }, 500);
      }
    }

    var lBtns = build(left, 'l');
    var rBtns = build(right, 'r');
    for (var i = 0; i < lBtns.length; i++) { grid.appendChild(lBtns[i]); grid.appendChild(rBtns[i]); }
    armCta(t('cta.check'), false, function () {});
  }

  // ---- 빈칸 채우기 ----
  function renderFill(s, body) {
    var parts = s.sentence.split('___');
    var sentence = el('p', 'fill-sentence');
    sentence.innerHTML = parts[0] + '<span class="fill-slot" id="fill-slot">&nbsp;</span>' + (parts[1] || '');
    body.appendChild(sentence);

    var slot = sentence.querySelector('#fill-slot');
    var picks = s.options.map(function (t, i) { return { t: t, ok: i === s.correct }; });
    shuffle(picks);

    var chips = el('div', 'chips');
    var chosen = null;

    picks.forEach(function (p) {
      var c = el('button', 'chip', p.t);
      c.addEventListener('click', function () {
        if (sess.graded) return;
        sfx.tap();
        chips.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('is-sel'); });
        c.classList.add('is-sel');
        slot.textContent = p.t;
        slot.classList.add('is-filled');
        chosen = { node: c, ok: p.ok, text: p.t };
        setCtaEnabled(true);
      });
      chips.appendChild(c);
    });
    body.appendChild(chips);

    armCta(t('cta.check'), false, function () {
      if (!chosen) return;
      chips.querySelectorAll('.chip').forEach(function (x) { x.disabled = true; });
      chosen.node.classList.remove('is-sel');
      chosen.node.classList.add(chosen.ok ? 'is-right' : 'is-wrong');
      if (chosen.ok) sparkle(chosen.node);
      var answer = picks.filter(function (p) { return p.ok; })[0].t;
      grade(chosen.ok, s.explain, answer);
    });
  }

  // ---- 순서 배열 ----
  function renderOrder(s, body) {
    body.appendChild(el('h2', 'q-text', s.q));

    var slots = el('div', 'slots');
    s.items.forEach(function (_, i) {
      var sl = el('div', 'slot');
      sl.innerHTML = '<span class="slot-n">' + (i + 1) + '</span><span class="slot-text">' + t('order.slot') + '</span>';
      slots.appendChild(sl);
    });
    body.appendChild(slots);

    var picks = shuffle(s.items.map(function (t, i) { return { t: t, order: i }; }));
    var chips = el('div', 'chips');
    var placed = [];

    picks.forEach(function (p) {
      var c = el('button', 'chip', p.t);
      c.style.fontSize = '15px';
      c.style.fontFamily = 'var(--body)';
      c.style.fontWeight = '600';
      c.addEventListener('click', function () {
        if (sess.graded || c.classList.contains('is-used') || placed.length >= s.items.length) return;
        sfx.tap();
        c.classList.add('is-used');
        c.disabled = true;
        placed.push(p);
        var sl = slots.children[placed.length - 1];
        sl.classList.add('is-filled');
        sl.querySelector('.slot-text').textContent = p.t;
        setCtaEnabled(placed.length === s.items.length);
      });
      chips.appendChild(c);
    });
    body.appendChild(chips);

    armCta(t('cta.check'), false, function () {
      var ok = placed.every(function (p, i) { return p.order === i; });
      Array.prototype.forEach.call(slots.children, function (sl, i) {
        sl.classList.remove('is-filled');
        sl.style.borderStyle = 'solid';
        var right = placed[i].order === i;
        sl.style.borderColor = right ? 'var(--sprout)' : 'var(--ember)';
        sl.style.background = right ? 'var(--sprout-wash)' : 'var(--ember-wash)';
        sl.style.color = right ? 'var(--sprout-ink)' : 'var(--ember-deep)';
        if (right && ok) sparkle(sl);
      });
      grade(ok, s.explain, ok ? null : s.items.join(' → '));
    });
  }

  // 맞힌 카드에서 네 갈래 별이 튀어오릅니다 — 정답 순간에만 쓰는 효과입니다
  var STAR = '<svg viewBox="0 0 24 24"><path d="M12 0c1.1 7.4 3.5 9.8 12 12-8.5 2.2-10.9 4.6-12 12-1.1-7.4-3.5-9.8-12-12 8.5-2.2 10.9-4.6 12-12Z" fill="currentColor"/></svg>';
  var SPARK_SPOTS = [[4, 14], [92, 6], [12, 88], [86, 82], [50, -8]];

  function sparkle(node) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    SPARK_SPOTS.forEach(function (spot, i) {
      var s = el('span', 'burst', STAR);
      s.style.left = spot[0] + '%';
      s.style.top = spot[1] + '%';
      s.style.animationDelay = (i * 55) + 'ms';
      node.appendChild(s);
      setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 900 + i * 55);
    });
  }

  // ---- 채점 ----
  function grade(ok, explain, answer) {
    if (sess.graded) return;
    sess.graded = true;

    var entry = sess.queue[sess.pos];
    var foot = $('lesson-foot');
    var fb = el('div', 'fb');
    var head = el('div', 'fb-head');

    var got = 0;
    if (ok) {
      sfx.correct(sess.combo);   // 소리는 지금까지 쌓인 연속 정답만큼 올라갑니다
      if (entry.kind !== 'retry') {
        // 보너스는 소리와 같은 값을 타고 올라요 — 둘 다 8연속에서 멈춥니다
        got = QUESTION_XP + COMBO_XP * Math.min(sess.combo, COMBO_MAX);
        sess.firstTryRight++;
        sess.xp += got;   // XP는 첫 시도에만
        rollDay();
        state.dayXP += got;
      }
      sess.combo++;
      foot.classList.add('is-correct');
      // 맞힌 순간 바로 차오릅니다 — '계속하기'까지 기다리지 않아요
      sess.passed[entry.kind]++;
      entry.counted = true;

      var stk = el('span', 'sticker is-correct');
      stk.style.cssText = 'width:56px;height:56px;border-radius:18px;border-width:4px';
      stk.innerHTML = leon('correct');
      head.appendChild(stk);
      var praise = UI['praise'];
      head.appendChild(el('span', 'fb-title', praise[Math.floor(Math.random() * praise.length)]));
      // 연속으로 더 받은 게 눈에 보여야 연속이 의미가 생겨요
      if (got) head.appendChild(el('span', 'fb-gain', '+' + money(got * USD_PER_XP)));
      fb.appendChild(head);
      if (explain) fb.appendChild(el('p', 'fb-explain', explain));
    } else {
      sfx.wrong();
      sess.combo = 0;
      // 틀린 문제는 노트로 빼지 않고, 이 레슨 안에서 다시 나옵니다
      sess.total.retry++;
      sess.queue.push({ step: entry.step, kind: 'retry' });
      foot.classList.add('is-wrong');

      var stk2 = el('span', 'sticker is-incorrect');
      stk2.style.cssText = 'width:56px;height:56px;border-radius:18px;border-width:4px';
      stk2.innerHTML = leon('incorrect');
      head.appendChild(stk2);
      head.appendChild(el('span', 'fb-title', t('fb.wrong')));
      fb.appendChild(head);
      if (answer) {
        var box = el('div');
        box.appendChild(el('div', 'fb-answer-label', t('fb.answerLabel')));
        box.appendChild(el('div', 'fb-answer', answer));
        fb.appendChild(box);
      }
      if (explain) {
        var ex = el('p', 'fb-explain', explain);
        ex.style.color = '#a34242';
        fb.appendChild(ex);
      }
    }

    foot.insertBefore(fb, foot.firstChild);
    renderBar();
    armCta(t('cta.continue'), true, advance);
  }

  function advance() {
    var entry = sess.queue[sess.pos];
    if (!entry.counted) sess.passed[entry.kind]++;   // 정답은 채점할 때 이미 셌습니다
    sess.pos++;
    if (sess.pos >= sess.queue.length) return finishLesson();
    renderStep();
  }

  $('lesson-close').addEventListener('click', function () {
    sfx.tap();
    renderHome();
    show('s-home');
  });

  // ══ 완료 ════════════════════════════════════════════════
  // 유닛 완료와 오늘 목표 달성은 같은 화면, 멘트만 다릅니다
  function showResult(r) {
    // 작은 라벨이 "무슨 일이 끝났나", 큰 줄이 "그래서 뭐가 달라졌나"를 맡습니다
    var label = $('done-label');
    label.hidden = !r.label;
    label.innerHTML = r.label || '';
    label.style.color = r.labelColor || 'var(--slate)';
    $('done-title').innerHTML = r.title;

    $('done-xp-head').textContent = r.xpHead;
    $('done-xp').textContent = r.xp;
    $('done-acc-head').textContent = r.accHead;
    $('done-acc').textContent = r.acc;

    var next = $('done-next');
    var fresh = next.cloneNode(false);
    fresh.textContent = t('cta.continue');
    fresh.addEventListener('click', function () { sfx.tap(); r.next(); });
    next.parentNode.replaceChild(fresh, next);

    paintLeon($('s-done'));
    show('s-done');
  }

  function finishLesson() {
    sfx.done();
    var wasNew = !state.done[sess.idx];
    state.done[sess.idx] = true;
    state.xp += sess.xp;
    state.cash += sess.xp * USD_PER_XP;   // 유닛을 끝내는 순간 환전됩니다
    rollDay();
    state.dayU++;
    save();

    var acc = sess.total.quiz
      ? Math.round((sess.firstTryRight / sess.total.quiz) * 100)
      : 100;
    var hitNow = !state.dayHit && goalReached();
    var cp = sess.lesson.checkpoint;
    var lv = CURRICULUM[sess.lesson.lv - 1];
    var color = lvColor(lv.n);

    showResult({
      // 체크포인트는 졸업, 유닛은 그 유닛에서 얻은 한 줄
      label: cp
        ? t('done.cpLabel', { n: pad(lv.n) })
        : t('done.unitLabel', { n: pad(lv.n), u: pad(unitNoOf(sess.lesson)) }),
      labelColor: color,
      title: cp
        ? t('done.cpTitle', { color: color, name: lv.name })
        : (sess.lesson.got || t('done.title')),
      xpHead: t('done.moneyHead'), xp: money(sess.xp * USD_PER_XP),
      accHead: t('done.accHead'), acc: acc + '%',
      next: function () { hitNow ? showGoalHit(wasNew) : afterDone(wasNew); }
    });
  }

  // 그 레벨 안에서 몇 번째 유닛인지 (체크포인트는 세지 않습니다)
  function unitNoOf(lesson) {
    var n = 0;
    for (var i = 0; i < LESSONS.length; i++) {
      if (LESSONS[i].lv !== lesson.lv || LESSONS[i].checkpoint) continue;
      n++;
      if (LESSONS[i] === lesson) return n;
    }
    return 0;
  }

  // ══ 오늘 목표 달성 ══════════════════════════════════════
  function showGoalHit(wasNew) {
    state.dayHit = true;
    save();
    sfx.done();
    showResult({
      label: '', title: t('goalHit.title'),
      xpHead: t('goalHit.moneyHead'), xp: money(state.dayXP * USD_PER_XP),
      accHead: t('goalHit.unitsHead'), acc: t('count.units', { n: state.dayU }),
      next: function () { afterDone(wasNew); }
    });
  }

  function afterDone(wasNew) {
    // 가입은 첫 성공 경험 뒤에 딱 한 번 물어봅니다
    if (wasNew && !state.askedSignup) {
      state.askedSignup = true;
      save();
      renderSignup();
      show('s-signup');
    } else {
      renderHome();
      show('s-home');
    }
  }

  // ══ 가입 요청 ═══════════════════════════════════════════
  function renderSignup() {
    $('recap-units').textContent = t('count.done', { n: state.done.filter(Boolean).length });
    $('recap-xp').textContent = money(state.xp * USD_PER_XP);
    paintLeon($('s-signup'));
  }
  $('signup-yes').addEventListener('click', function () {
    sfx.tap();
    alert(t('signup.alert'));
    renderHome();
    show('s-home');
  });
  $('signup-later').addEventListener('click', function () {
    sfx.tap();
    renderHome();
    show('s-home');
  });

  // ── 유틸 ────────────────────────────────────────────────
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // ── 시작 ────────────────────────────────────────────────
  // 주소 끝에 ?reset 을 붙이면 온보딩부터 다시 봅니다
  if (/reset/.test(location.search + location.hash)) {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    history.replaceState(null, '', location.pathname);
  }
  // 화면을 그리기 전에 HTML에 박아둔 자리부터 지금 언어로 채웁니다
  applyStaticText();
  $('build-note').textContent = t('build.note', { name: CURRICULUM[0].ko, n: CURRICULUM[0].units.length });
  $('cur-sub').textContent = t('cur.sub', { n: CURRICULUM.length });
  mountLangSwitch(sfx.tap);

  load();
  rollDay();
  paintLeon(document);
  if (state.onboarded) {
    renderHome();
    show('s-home');
  } else {
    show('s-why');
  }
})();
