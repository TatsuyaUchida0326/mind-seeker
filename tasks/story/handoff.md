# 引き継ぎ：物語・30アイテム・地図構成の設計と実装

- 2026-10-02 19:20 追記: この作業の実装も含めて `main` に取り込み、公開サイトは新版に切り替わった（`tasks/progress-reset/handoff.md`）。下の「未コミット・未公開」「GitHub Pages は旧36街版のまま」は古い記述
- 再確認: 2026-10-02（Claude Code → Codex へ切替）。この切替セッションではファイルを変更していない。HEAD `d5afa48`・ブランチ `feat/world-map`・未コミットのまま、開発サーバー（localhost:5173）は応答あり。以下の内容はそのまま有効
- 更新: 2026-10-02 11:25（Claude Code）。実装・レビュー・振り返りまで完了し、コミットと公開はユーザーの指示待ち。ユーザーが画面で確認中に新しいセッションへ切り替え
- 目的: クライアントの物語資料（30フェーズ・30アイテム）に、アプリの構成（3章・12か所・30フェーズ）を合わせる
- 実フォルダ: `~/mind-seeker`、ブランチ `feat/world-map`、HEAD `d5afa48`。すべて未コミット・未公開
  - このリポジトリは GitHub で公開されている。物語本文を含む `docs/story-*.md` は、コミット前にユーザーへ確認する
  - git のステージには、2026-09-27 に行った `HANDOFF.md` → `tasks/handoff-2026-09-26.md` の移動（git mv）だけが入っている。ルートの `HANDOFF.md` は Codex の引き継ぎ書（新ワールドマップ実装時）の写しで未追跡
- 元資料: Google ドキュメント「研修各ストーリー素案（更新用）」 https://docs.google.com/document/d/17U_4yVAilufmfUX9ksZg-LPDdgr89Pu15zUn4HTnm9g/edit
- 詳しい経緯・実測値・レビュー統合は `tasks/todo.md` の末尾「2026-10-01 物語資料に合わせた3章・12か所・30フェーズ構成へ」以降

## 何をやったか

- 構成をユーザーと決めた（すべて承認済み）。正本は `docs/story-structure.md`
  - 地図3枚（1章1枚）
  - 目的地12か所（各章に町3つ＋章の終わりの地1か所）
  - 30フェーズ・30アイテム。うち装備8個で主人公の姿が変わる
  - アイテム名を3つ変更（視点のマント・自己決定の旅靴・共栄の上衣）
  - ステータス名の言い換え
  - 武器の表現は使わない。魔物はたとえとして残す
  - 教材は「物語＋問い＋研修テーマ」
- 第1章の物語を、いまの地図に合わせて最小修正した（約5%、`docs/story-chapter1-map-adaptation.md`）。表現ルールは `docs/story-wording.md`
- `/develop` の流れで、Step 1（計画）から Step 7（修正）までと Step 10（振り返り）を終えた
  - レビューは4巡。1巡目は8体、2〜4巡目は5体（A・B・C・D・デザイン）
  - 4巡目で B・C・D は P1・P2 なし。A とデザインの指摘は直し、PM が実測で裏取りして終えた
  - 経緯・実測値・統合の判断は `tasks/todo.md` 末尾
- 教訓を `~/brain/70_dev/` に記録した（新規2本・追記1本）

## 今どういう状況か

- **実装は完了。** `npm run build`・`npm run lint`・`git diff --check` が成功する
- 4つの画面サイズ（PC 1440×900・1920×1080、スマホ縦 375×812、スマホ横 812×375）で実測済み
- すべて未コミット・未公開。GitHub Pages は旧36街版のまま
- 開発サーバーは起動中（http://localhost:5173/）。ユーザーはブラウザの画面で地図を開き、動作を確認している最中（進捗は空の状態から）。確認で進めた進捗はそのブラウザの localStorage（`mind-seeker-progress-v5`）にだけ残る。空に戻すよう頼まれたら、このキーを `{"schemaVersion":5,"completedPhaseIds":[],"migration":{"legacyPhaseCount":0,"noticeDismissed":false}}` にする
- 主なファイル
  - データ: `src/world/story.ts`
  - 保存: `src/world/progress.ts`（保存キー `mind-seeker-progress-v5`）
  - 画面: `src/world/WorldMap.tsx`・`WorldLesson.tsx`
  - 部品: `src/world/ItemsPanel.tsx`・`MessageScreen.tsx`・`NoticeRegion.tsx`・`ProgressMeter.tsx`・`motion.ts`
  - そのほか: `src/lessons/legacyLessonIds.ts`・`src/css-custom-properties.d.ts`

## 次に何をするか

1. ユーザーの画面確認の感想を聞き、直したい点があれば対応する
2. ユーザーに下の「未解決の問題」の3点を確認する
3. ユーザーの指示があればコミットする
   - このリポジトリは公開されている。物語本文を含む `docs/story-*.md` を入れてよいかを先に確認する
   - `main` への push で公開サイトが新版に切り替わる（旧版は消える）。公開のタイミングも確認する
4. 別タスクの候補（必要になったら）
   - WorldMap の拡大縮小・ドラッグのフック化と、ドラッグ直後のクリックの打ち消し
   - world.css の画面ごとの分割
   - progress.ts を保存と計算の2つに分ける
   - 使われなくなった旧画面ファイルの削除（ユーザー確認後）
5. 画像まわりの続き
   - 装備ごとの主人公の画像に切り替える（画像は `tasks/handoff.md`・`tasks/character-human/handoff.md` 側で作成中）
   - 町が育つ絵
   - 第2章・第3章の地図と物語

## 触ったファイル

- 新規
  - `src/world/` の `story.ts`・`ItemsPanel.tsx`・`MessageScreen.tsx`・`NoticeRegion.tsx`・`ProgressMeter.tsx`・`motion.ts`
  - `src/lessons/legacyLessonIds.ts`、`src/css-custom-properties.d.ts`
  - `docs/story-structure.md`・`story-wording.md`・`story-chapter1-map-adaptation.md`
- 変更
  - `src/world/` の `progress.ts`・`WorldLesson.tsx`・`WorldMap.tsx`・`layout.ts`・`AvatarArt.tsx`・`WorldArt.tsx`・`curriculum.ts`・`world.css`
  - `src/Root.tsx`・`index.css`・`App.css`（フォーカス枠の1規則）・`learning.ts`・`lessons/worldLessons.ts`
  - `docs/` の既存5文書（冒頭に「構成の記述は置き換えた」注記）
  - `tasks/todo.md`・`tasks/handoff-index.md`
- 削除: `src/world/data.ts`
- 第2の脳: `~/brain/70_dev/` の新規2本・追記1本、`INDEX.md`

## 未解決の問題

- **ユーザーに聞くこと**
  - 旧36街版で1街だけ修了した人は、換算で0フェーズになる（切り捨て）。そのままか、切り上げにするか
  - 使われなくなった旧画面のファイル（`App.tsx`・`LessonPage.tsx`・`learning.css`・`learningDisplay.ts`・`useMouseDragPan.ts` など）を削除してよいか
  - プロジェクトの `CLAUDE.md` の「主なファイル」が旧構成のまま（地図は `App.tsx` など）。ユーザーのローカル設定なので、更新してよいか
- **研修内容の本文は未提供。** 「研修内容は準備中です」と表示している（TODO の印あり）
- **主人公の姿は初期の旅人のまま。** 装備ごとの画像に切り替える処理は未実装（TODO の印あり）
- **レビュー担当が確認に使ったタブが残っている可能性がある。** ユーザーの Chrome に localhost:5173 のタブがいくつか開いたままかもしれない。閉じて問題ない
