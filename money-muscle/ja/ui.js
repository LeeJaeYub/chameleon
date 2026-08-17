
/* マネーマッスル — 画面の文言（日本語）。
   レッスンの内容は content.js に、画面まわりの文言はここにあります。
   {n} のような場所はアプリが数字や名前で埋めます。 */

var LOCALE = 'ja';

var UI = {
  /* オンボーディング — 学ぶ理由 */
  'why.bubble': 'こんにちは!いくつか質問させてくださいね。',
  'why.q': 'お金の勉強を<br>始める理由は?',

  /* オンボーディング — 1日の目標 */
  'goal.back': '戻る',
  'goal.bubble': '小さな目標でも大丈夫です。',
  'goal.q': '1日の目標を<br>決めましょう',
  'goal.chip': '予想期間',
  'goal.hint': '目標を選ぶと、いつ終わるか分かります。',
  'goal.forecast': 'レベル1は<strong>{d}日</strong>で終わります。',
  'goal.forecastSub': '{d}日後には金融リテラシーを卒業できます。',

  /* コース作成中 */
  'build.title': 'コースを作成中',
  'build.note': 'レベル1 · {name} 全{n}ユニット',

  /* 共通ボタン */
  'cta.continue': '続ける',
  'cta.check': '確認',

  /* ホーム — 学習パス */
  'level.tag': 'レベル{n} · {name}',
  'node.entryAria': '{name} — このレベルから始める',
  'node.startAria': '{name}を始める',
  'cp.name': 'レベル{n} チェックポイント',
  'cp.done': '完了',
  'cp.locked': 'ロック中',
  'cp.test': 'テスト',
  'goalStone.band': 'ラスト',
  'goalStone.title': '金融リテラシー卒業',
  'goalStone.subFull': '{n}レベルすべて完了しました。',
  'goalStone.sub': 'レベルを卒業するたびに1マスずつ埋まります。',
  'head.goalFull': '全{n}レベル制覇',
  'head.goalName': '最後の目的地',
  'head.levelCount': '{d} / {t} レベル',
  'toast.unitSoon': 'レベル{n} · {name} — コンテンツ準備中です',
  'toast.cpLocked': 'レベル{n}のユニットをすべて終えるとチェックポイントが開きます',
  'toast.cpSoon': 'レベル{n} チェックポイント — コンテンツ準備中です',

  /* カリキュラム全体 */
  'cur.title': 'カリキュラム',
  'cur.sub': '金融リテラシー卒業まで{n}レベル',
  'cur.close': '閉じる',
  'cur.cp': 'レベル{n} <span class="cur-cp-name">{name}</span> チェックポイント',

  /* レッスン */
  'lesson.close': 'レッスンを終了',
  'phase.concept': 'コンセプト {p}/{t}',
  'phase.quiz': '問題 {p}/{t}',
  'phase.retry': '再挑戦 {n}',
  'combo': '{n}問連続正解',
  'pill.retry': 'もう一度挑戦しましょう',
  'pill.concept': '新しいコンセプト',
  'hint.label': 'ヒント',
  'match.q': 'ペアを合わせましょう',
  'order.slot': 'ここに置く',

  /* 採点 — ほめ言葉はいろいろ、訂正は一つ */
  'praise': [
    '素晴らしい!', 'いいね!', '正解!', 'よくできました!', 'その通り!',
    '完璧!', 'すごい!', 'きれい!', '当たり!', 'さすが!'
  ],
  'fb.wrong': '惜しい!',
  'fb.answerLabel': '正解',

  /* 完了 */
  'done.title': 'ユニット完了!',
  'done.xpHead': '獲得XP',
  'done.cpLabel': 'レベル{n} 卒業',
  'done.unitLabel': 'レベル{n} · ユニット{u} 完了',
  'done.cpTitle': '今日から<b style="color:{color}">{name}</b>です',
  'done.moneyHead': '獲得したお金',
  'done.accHead': 'よくできました',
  'goalHit.title': '今日の目標達成!',
  'goalHit.moneyHead': '今日獲得したお金',
  'goalHit.unitsHead': '今日終えたユニット',
  'count.units': '{n}ユニット',
  'count.done': '{n}ユニット',

  /* 投資 */
  'invest.label': '総資産',
  'invest.bubble': '問題を解くとここにお金が貯まります。',
  'invest.note': 'このお金で銘柄を売買する機能は現在準備中です。',

  /* 登録の呼びかけ */
  'signup.title': 'ここまでの記録を<br>保存しますか?',
  'signup.units': '完了したユニット',
  'signup.money': '貯めたお金',
  'signup.yes': 'プロフィールを作成',
  'signup.later': 'あとで',
  'signup.alert': 'プロフィール機能は準備中です。記録はこの端末に保存されています。',

  /* 下部タブ */
  'tab.learn': '学習',
  'tab.invest': '投資',
  'lang.pick': '言語を選択',
  'lang.title': '言語'
};
