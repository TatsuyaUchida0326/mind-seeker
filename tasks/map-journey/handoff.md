# 新地図と街移動演出（2026-10-05 公開）

## 何をやったか
4枚の精密化画像を画素保持で結合した3608×1540地図に差し替え。PC全景、スマホ固定倍率と縦横スクロールを維持。煙突5か所の煙と風車の回転中心を新地図へ合わせ、羽根を160pxへ縮小。半透明街名と現在地の▼、修了証から次の街への道路演出を実装。

## 今どういう状況か
実フォルダ /Users/TatsuyaUchida/mind-seeker。本人からここまでのコミット・プッシュ・公開を承認。feat/world-mapからmainへ反映しGitHub Pages公開を実施。build/lint/diff-check確認。一時検証fixtureは/tmp/mind-seeker-review-fixturesへ退避。

## 次に何をするか
本人が公開URLでスマホ実機確認。その結果に応じて位置・表示を調整。街移動演出のレビュー残件を解消する。

## 触ったファイル
src/world/WorldArt.tsx、WorldMap.tsx、WorldLesson.tsx、story.ts、world.css、新地図とartwork資料、tasks/todo.md。

## 未解決の問題
全4画面サイズの新地図再検証とスマホ実機確認は未完了。道路演出の終端と街座標の整合、スキップ時のカメラ停止・フォーカス、開始/到着のaria-liveを次回確認。第2章以降の座標未定義。QAのFirebase基盤は本プロジェクト未導入。
