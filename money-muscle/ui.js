
/* 머니머슬 — 화면 문구 (한국어).
   레슨 내용은 content.js에, 화면을 두르는 문구는 여기에 있습니다.
   {n} 같은 자리는 앱이 숫자·이름으로 채웁니다. */

var LOCALE = 'ko';

var UI = {
  /* 온보딩 — 학습 이유 */
  'why.bubble': '반가워요. 몇 가지만 물어볼게요.',
  'why.q': '왜 돈 공부를<br>시작하시나요?',

  /* 온보딩 — 하루 목표 */
  'goal.back': '이전으로',
  'goal.bubble': '작게 잡아도 괜찮아요.',
  'goal.q': '하루 목표를<br>정해볼까요?',
  'goal.chip': '예상 기간',
  'goal.hint': '목표를 고르면 언제 끝나는지 알려드릴게요.',
  'goal.forecast': '레벨 1은 <strong>{d}일</strong> 안에 끝나요.',
  'goal.forecastSub': '{d}일 뒤에는 금융 문맹 탈출이에요.',

  /* 코스 짓는 중 */
  'build.title': '코스 만드는 중',
  'build.note': '레벨 1 · {name} {n}유닛',

  /* 공통 버튼 */
  'cta.continue': '계속하기',
  'cta.check': '확인',

  /* 홈 — 학습 경로 */
  'level.tag': '레벨 {n} · {name}',
  'node.entryAria': '{name} — 이 레벨로 바로 시작',
  'node.startAria': '{name} 시작',
  'cp.name': '레벨 {n} 체크포인트',
  'cp.done': '완료',
  'cp.locked': '잠김',
  'cp.test': '테스트',
  'goalStone.band': '마지막',
  'goalStone.title': '금융 문맹 탈출',
  'goalStone.subFull': '{n}레벨을 모두 끝냈어요.',
  'goalStone.sub': '레벨을 졸업할 때마다 한 칸씩 칠해져요.',
  'head.goalFull': '{n}레벨 전체 완주',
  'head.goalName': '마지막 목적지',
  'head.levelCount': '{d} / {t} 레벨',
  'toast.unitSoon': '레벨 {n} · {name} — 콘텐츠 준비 중이에요',
  'toast.cpLocked': '레벨 {n} 유닛을 모두 끝내야 체크포인트를 볼 수 있어요',
  'toast.cpSoon': '레벨 {n} 체크포인트 — 콘텐츠 준비 중이에요',

  /* 커리큘럼 전체 */
  'cur.title': '커리큘럼',
  'cur.sub': '금융 문맹 탈출까지 {n}레벨',
  'cur.close': '닫기',
  'cur.cp': '레벨 {n} <span class="cur-cp-name">{name}</span> 체크포인트',

  /* 레슨 */
  'lesson.close': '레슨 나가기',
  'phase.concept': '개념 {p}/{t}',
  'phase.quiz': '문제 {p}/{t}',
  'phase.retry': '다시 풀기 {n}',
  'combo': '{n}번 연속 정답',
  'pill.retry': '다시 한번 풀어볼까요?',
  'pill.concept': '새로운 개념',
  'hint.label': '힌트',
  'match.q': '짝을 맞춰 보세요',
  'order.slot': '여기에 놓기',

  /* 채점 — 칭찬은 여러 가지, 정정은 한 가지 */
  'praise': [
    '훌륭해요!', '좋아요!', '정확해요!', '잘했어요!', '바로 그거예요!',
    '완벽해요!', '멋져요!', '깔끔해요!', '맞았어요!', '척척이네요!'
  ],
  'fb.wrong': '아쉬워요!',
  'fb.answerLabel': '정답',

  /* 완료 */
  'done.title': '유닛 완료!',
  'done.xpHead': '획득 XP',
  'done.cpLabel': '레벨 {n} 졸업',
  'done.unitLabel': '레벨 {n} · 유닛 {u} 완료',
  'done.cpTitle': '오늘부터 <b style="color:{color}">{name}</b>예요',
  'done.moneyHead': '받은 돈',
  'done.accHead': '잘했어요',
  'goalHit.title': '오늘 목표 달성!',
  'goalHit.moneyHead': '오늘 받은 돈',
  'goalHit.unitsHead': '오늘 끝낸 유닛',
  'count.units': '{n}유닛',
  'count.done': '{n}개',

  /* 투자 */
  'invest.label': '총자산',
  'invest.bubble': '문제를 풀면 여기에 돈이 쌓여요.',
  'invest.note': '이 돈으로 종목을 사고파는 건 아직 만드는 중이에요.',

  /* 가입 요청 */
  'signup.title': '여기까지 온 기록,<br>저장해둘까요?',
  'signup.units': '완료한 유닛',
  'signup.money': '모은 돈',
  'signup.yes': '프로필 만들기',
  'signup.later': '나중에 하기',
  'signup.alert': '프로필 만들기는 준비 중이에요. 기록은 이 기기에 저장돼 있어요.',

  /* 하단 탭 */
  'tab.learn': '학습',
  'tab.invest': '모의투자',
  'lang.pick': '언어 선택',
  'lang.title': '언어'
};
