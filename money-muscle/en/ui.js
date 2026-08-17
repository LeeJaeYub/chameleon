
/* Money Muscle — screen copy (English).
   Lesson content lives in content.js; the chrome around it lives here.
   Spots like {n} get filled in by the app with numbers or names. */

var LOCALE = 'en';

var UI = {
  /* onboarding — why you're here */
  'why.bubble': 'Hey! Just a couple quick questions.',
  'why.q': 'What brings you<br>to learn about money?',

  /* onboarding — daily goal */
  'goal.back': 'Back',
  'goal.bubble': 'It\'s fine to start small.',
  'goal.q': 'Let\'s set a<br>daily goal.',
  'goal.chip': 'Estimated time',
  'goal.hint': 'Pick a goal and we\'ll show you when you\'ll finish.',
  'goal.forecast': 'Level 1 in <strong>{d} days</strong>.',
  'goal.forecastSub': 'In {d} days, you\'ll be Financially Literate.',

  /* building the course */
  'build.title': 'Building your course',
  'build.note': 'Level 1 · {name} — {n} units',

  /* shared buttons */
  'cta.continue': 'Continue',
  'cta.check': 'Check',

  /* home — learning path */
  'level.tag': 'Level {n} · {name}',
  'node.entryAria': '{name} — jump straight into this level',
  'node.startAria': 'Start {name}',
  'cp.name': 'Level {n} checkpoint',
  'cp.done': 'Done',
  'cp.locked': 'Locked',
  'cp.test': 'Test',
  'goalStone.band': 'Final',
  'goalStone.title': 'Financially Literate',
  'goalStone.subFull': 'You finished all {n} levels.',
  'goalStone.sub': 'Each level you graduate lights up a step.',
  'head.goalFull': 'Finish all {n} levels',
  'head.goalName': 'Final destination',
  'head.levelCount': '{d} / {t} levels',
  'toast.unitSoon': 'Level {n} · {name} — coming soon',
  'toast.cpLocked': 'Finish every unit in Level {n} to unlock the checkpoint',
  'toast.cpSoon': 'Level {n} checkpoint — coming soon',

  /* full curriculum */
  'cur.title': 'Curriculum',
  'cur.sub': '{n} levels to financial literacy',
  'cur.close': 'Close',
  'cur.cp': 'Level {n} <span class="cur-cp-name">{name}</span> checkpoint',

  /* lesson */
  'lesson.close': 'Exit lesson',
  'phase.concept': 'Concept {p}/{t}',
  'phase.quiz': 'Question {p}/{t}',
  'phase.retry': 'Retry {n}',
  'combo': '{n} in a row',
  'pill.retry': 'Let\'s try that again',
  'pill.concept': 'New concept',
  'hint.label': 'Hint',
  'match.q': 'Match the pairs',
  'order.slot': 'Drop here',

  /* grading — many ways to praise, one way to correct */
  'praise': [
    'Excellent!', 'Nice!', 'Exactly right!', 'Well done!', 'That\'s it!',
    'Perfect!', 'Awesome!', 'Clean!', 'Correct!', 'Nailed it!'
  ],
  'fb.wrong': 'Not quite!',
  'fb.answerLabel': 'Correct answer',

  /* completion */
  'done.title': 'Unit complete!',
  'done.xpHead': 'XP earned',
  'done.cpLabel': 'Level {n} graduated',
  'done.unitLabel': 'Level {n} · Unit {u} complete',
  'done.cpTitle': 'New title unlocked: <b style="color:{color}">{name}</b>',
  'done.moneyHead': 'Cash earned',
  'done.accHead': 'Nice work',
  'goalHit.title': 'Today\'s goal complete!',
  'goalHit.moneyHead': 'Cash earned today',
  'goalHit.unitsHead': 'Units finished today',
  'count.units': '{n} unit|{n} units',
  'count.done': '{n} unit|{n} units',

  /* invest */
  'invest.label': 'Total assets',
  'invest.bubble': 'Solve lessons and watch this grow.',
  'invest.note': 'Buying and selling with this cash is still in the works.',

  /* sign-up prompt */
  'signup.title': 'Want to save<br>your progress?',
  'signup.units': 'Units completed',
  'signup.money': 'Cash earned',
  'signup.yes': 'Create profile',
  'signup.later': 'Maybe later',
  'signup.alert': 'Profile creation is coming soon. Your progress is saved on this device.',

  /* bottom tabs */
  'tab.learn': 'Learn',
  'tab.invest': 'Invest',
  'lang.pick': 'Choose language',
  'lang.title': 'Language'
};
