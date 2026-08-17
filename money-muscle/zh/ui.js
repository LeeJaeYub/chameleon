
/* Money Muscle — 界面文案（简体中文）。
   课程内容在 content.js，界面文案在这里。
   {n} 这样的占位符由程序自动填入数字或名称。 */

var LOCALE = 'zh';

var UI = {
  /* 引导 — 学习理由 */
  'why.bubble': '你好呀!先问你几个小问题。',
  'why.q': '你想学理财的<br>理由是?',

  /* 引导 — 每日目标 */
  'goal.back': '返回',
  'goal.bubble': '目标小一点也没关系。',
  'goal.q': '定一个<br>每日目标吧',
  'goal.chip': '预计用时',
  'goal.hint': '选好目标,就能算出大概什么时候完成。',
  'goal.forecast': '第1级预计<strong>{d}天</strong>完成。',
  'goal.forecastSub': '{d}天后,你就能拿下"理财达人"称号。',

  /* 课程生成中 */
  'build.title': '正在生成课程',
  'build.note': '第1级 · {name} 共{n}个单元',

  /* 通用按钮 */
  'cta.continue': '继续',
  'cta.check': '检查',

  /* 首页 — 学习路径 */
  'level.tag': '第{n}级 · {name}',
  'node.entryAria': '{name} — 从这一级开始',
  'node.startAria': '开始{name}',
  'cp.name': '第{n}级 关卡测试',
  'cp.done': '已完成',
  'cp.locked': '未解锁',
  'cp.test': '测试',
  'goalStone.band': '终点',
  'goalStone.title': '理财达人毕业',
  'goalStone.subFull': '你已完成全部{n}个级别。',
  'goalStone.sub': '每毕业一个级别,就点亮一格。',
  'head.goalFull': '全{n}级通关',
  'head.goalName': '最后的目的地',
  'head.levelCount': '{d} / {t} 级',
  'toast.unitSoon': '第{n}级 · {name} — 内容制作中',
  'toast.cpLocked': '完成第{n}级的所有单元后即可解锁关卡测试',
  'toast.cpSoon': '第{n}级 关卡测试 — 内容制作中',

  /* 课程总览 */
  'cur.title': '课程大纲',
  'cur.sub': '距离理财达人毕业还有{n}级',
  'cur.close': '关闭',
  'cur.cp': '第{n}级 <span class="cur-cp-name">{name}</span> 关卡测试',

  /* 课程界面 */
  'lesson.close': '退出课程',
  'phase.concept': '知识点 {p}/{t}',
  'phase.quiz': '题目 {p}/{t}',
  'phase.retry': '第{n}次重试',
  'combo': '连续答对{n}题',
  'pill.retry': '再试一次吧',
  'pill.concept': '新知识点',
  'hint.label': '提示',
  'match.q': '连一连配对',
  'order.slot': '放在这里',

  /* 判分 — 表扬语多样,订正只有一种 */
  'praise': [
    '太棒了!', '真厉害!', '答对了!', '做得好!', '就是这样!',
    '完美!', '真不错!', '漂亮!', '猜中了!', '厉害啊!'
  ],
  'fb.wrong': '差一点!',
  'fb.answerLabel': '正确答案',

  /* 完成页 */
  'done.title': '单元完成!',
  'done.xpHead': '获得经验值',
  'done.cpLabel': '第{n}级 已毕业',
  'done.unitLabel': '第{n}级 · 第{u}单元 完成',
  'done.cpTitle': '从今天起,你是<b style="color:{color}">{name}</b>了',
  'done.moneyHead': '获得的钱',
  'done.accHead': '正确率',
  'goalHit.title': '今日目标达成!',
  'goalHit.moneyHead': '今天赚到的钱',
  'goalHit.unitsHead': '今天完成的单元',
  'count.units': '{n}个单元',
  'count.done': '{n}个单元',

  /* 投资 */
  'invest.label': '总资产',
  'invest.bubble': '答对题目,这里的钱就会累积。',
  'invest.note': '用这笔钱买卖股票的功能正在开发中。',

  /* 注册提示 */
  'signup.title': '要保存<br>你的学习记录吗?',
  'signup.units': '已完成单元',
  'signup.money': '累计赚到的钱',
  'signup.yes': '创建账号',
  'signup.later': '以后再说',
  'signup.alert': '账号功能正在开发中。你的记录已保存在这台设备上。',

  /* 底部标签栏 */
  'tab.learn': '学习',
  'tab.invest': '投资',
  'lang.pick': '选择语言',
  'lang.title': '语言'
};
