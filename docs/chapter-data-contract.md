# 章と保存データの確定対応

2026-09-27。教材内容のテーマ対応とは別に、旧進捗の移行には以下の連続コホートを使う。

| 新章ID | 旧ステージID | 新教材ID（各4単位） | 報酬ID |
|---|---|---|---|
| chapter-01 | stage-01〜04 | chapter-01-unit-01〜04 | reward-01 |
| chapter-02 | stage-05〜08 | chapter-02-unit-01〜04 | reward-02 |
| chapter-03 | stage-09〜12 | chapter-03-unit-01〜04 | reward-03 |
| chapter-04 | stage-13〜16 | chapter-04-unit-01〜04 | reward-04 |
| chapter-05 | stage-17〜20 | chapter-05-unit-01〜04 | reward-05 |
| chapter-06 | stage-21〜24 | chapter-06-unit-01〜04 | reward-06 |
| chapter-07 | stage-25〜27 | chapter-07-unit-01〜04 | reward-07 |
| chapter-08 | stage-28〜30 | chapter-08-unit-01〜04 | reward-08 |
| chapter-09 | stage-31〜33 | chapter-09-unit-01〜04 | reward-09 |
| chapter-10 | stage-34〜36 | chapter-10-unit-01〜04 | reward-10 |

- 旧 `completedLessonIds` を照合し、教材が全て終わった旧ステージの連続数を数える。表のコホートを丸ごと終えた章だけを移行する。
- 旧 `mind-seeker-learning-progress-v1` は読み取り専用。途中記録も元のJSONに残る。
- 新 `mind-seeker-progress-v2` の `migration.completedChapterIds` は旧履歴からの修了資格。新教材の既読 `completedUnitIds` と混ぜない。
- 新教材の記録は未移行の先頭章から順に進める。4教材の読了記録で修了証と報酬を付与する。現実での行動・振り返りは任意、文章入力欄は設けない。
- 修了章と報酬所持品は同じ順序・個数に保つ。装備は所有品と対応部位を検証する。
- 不正な保存データや保存領域の読み書き失敗時には、記録を上書きして開始しない。
