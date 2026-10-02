# 引き継ぎ：テスト運転用「最初からやり直す」ボタン

- 更新: 2026-10-02 19:30 ごろ（Claude Code）
- 目的: 最後まで修了すると賢者の姿のまま最初に戻れないため、テスト運転用に、通過したカリキュラムを1つのボタンでまとめて消せるようにする
- 実フォルダ: `/Users/TatsuyaUchida/mind-seeker`、ブランチ `feat/world-map`、HEAD `06f1b3e`。今回分も含めすべて未コミット・未公開（Codex の9段階キャラクター実装の未コミット変更と同じファイルに同居）
- 経緯・レビュー統合・実測値は `tasks/todo.md` 末尾「テスト運転用の『最初からやり直す』ボタン」

## 何をやったか

- ユーザーの決定: 公開サイトにも出す／「旅人・持ち物」パネルの中に置く／押したら必ず確認を挟む
- 「旅人・持ち物」パネルの下に「テスト運転用」の点線枠。「最初からやり直す」→ 警告文と「すべて消して最初に戻す／やめる」→「最初の状態に戻しました。」
- 保存は既存の `saveProgress` を通す（別タブとの食い違い・保存失敗はそのまま地図のお知らせに出る）
- レビュー4体（A・B・C・D）→ P2 2件と P3 の多くを修正 → 実測で確認

## 今どういう状況か

- 実装完了。build / lint / `git diff --check` 成功。内蔵ブラウザで、リセットの流れ・失敗の流れ・フォーカス・4画面サイズを実測済み
- ユーザー自身の画面での確認はまだ
- 開発サーバーは 127.0.0.1:5173 で稼働中（Codex が起動したもの）

## 次に何をするか

1. ユーザーに「旅人・持ち物」→ 下の「最初からやり直す」を試してもらい、感想を聞く
2. 指示があればコミット。`main` への push で公開サイトにボタンが出る
3. テスト運転が終わったら `src/world/progress.ts` の `progressResetEnabled` を false にする（`TODO:` 付き）。コードごと消すなら `src/world/ProgressReset.tsx` を削除し、ItemsPanel の import と描画の1行、Root の `resetProgress`、WorldMap・ItemsPanel の `onResetProgress`、world.css の `.progress-reset` 系を外す

## 触ったファイル

- 新規: `src/world/ProgressReset.tsx`、`tasks/progress-reset/handoff.md`
- 変更: `src/world/progress.ts`（`progressResetEnabled`・`resetWorldProgress`）、`src/Root.tsx`、`src/world/WorldMap.tsx`（`itemsPanelKey` を閉じるときに上げる）、`src/world/ItemsPanel.tsx`、`src/world/world.css`、`tasks/todo.md`、`tasks/handoff-index.md`
- 第2の脳: `~/brain/70_dev/開いたダイアログの中身をkeyで作り直すとフォーカスが消える.md`、`INDEX.md`

## 未解決の問題

- 見送った P3: 別タブで修了証を出したままリセットすると、そのタブの修了証の表示がずれる（データは失わない）／別タブのリセットでも「別の画面で学習が進んでいた」と出る文言
- テスト運転の終了時期は未定。消し忘れ防止は `TODO:` と本書の「次に何をするか」3
