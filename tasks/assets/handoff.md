# 素材フォルダ整理の引き継ぎ

更新: 2026-10-02／目的: 素材整理と読込導線の維持

## 何をやったか
202ファイルを用途別に移動した。アプリ素材は src/assets（characters/traveler・characters/sage・map・opening・ui）、制作や旧案は artwork、証跡は docs/verification。TSX import・CSS url、Blender生成スクリプト・旧地図経路生成スクリプトの入力を新パスへ更新。案内は docs/assets.md、移動記録は docs/assets-migration.json。

## 今どういう状況か
実フォルダ /Users/TatsuyaUchida/mind-seeker、ブランチ feat/world-map、HEAD d5afa48。既存の物語実装なども含め、ユーザー指示により feat/world-map にコミット・pushする（2026-10-02）。コミットIDとリモート反映状況は git log / git status で確認する。開発サーバーは http://127.0.0.1:5173/ で起動中（この作業のexec session 34141）。画像・音声・動画201件は内容不変、移動したPython1件は出力フォルダ定義だけ更新し、移動前後のhashを記録。

確認: build / lint / git diff --check成功。manifest全202件SHA-256一致、案内リンク正常。変更した素材のHTTP 200とMIMEを確認。ブラウザで地図・旅人パネルを確認、旅人の描画サイズはPC1440×900・1920×1080で220×330、スマホ375×812で160×240、812×375で140×210。オープニング背景と動画（readyState4・videoWidth1920）確認。A/B/C/Dレビュー完了、Bの地図生成入力パスの指摘を修正しB/C再確認済み。

## 次に何をするか
通常起動は npm run dev。画像を探すときは docs/assets.md を入口にする。人間賢者をゲームへ採用する場合は src/assets/characters/sage/human-sage-black-hair-glasses-v2.png を基準に、装備進化の仕様を別タスクで決める。

## 触ったファイル
- docs/assets.md・docs/assets-migration.json・README.md
- src/Opening.tsx・src/LessonPage.tsx・src/App.css・src/world/AvatarArt.tsx（素材参照のみ）
- artwork/characters/3d/create_traveler.py・artwork/characters/reproduction-plan.md
- scripts/build_map_routes.py
- 移動した202ファイル（詳細はmanifest）
- tasks/todo.md・tasks/handoff-index.md・tasks/handoff.md・tasks/character-human/handoff.md（古い記録に現行パス案内）

## 未解決の問題
今回の素材整理・通常起動の参照切れはなし。テストランナーは未導入。旧地図経路生成の全再計算とBlenderの実レンダーは未実施（構文・入力パス確認のみ）。公開は未実施。オープニングBGMの自動再生はブラウザが操作前に制限する既存仕様。装備画像切替・賢者のゲーム採用は今回の範囲外で未実装。
