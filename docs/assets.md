# 素材の置き場所

アプリから読み込む素材と、制作中・保管用の素材を用途で分ける。ファイル名は履歴を追えるよう維持する。

| 保存先 | 用途 |
|---|---|
| `src/assets/characters/traveler/` | 初期の旅人と装備段階の静止画 |
| `src/assets/characters/sage/` | メガネ付き・黒髪の賢者の最新完成画像 |
| `src/assets/characters/` | その他の人物素材 |
| `src/assets/map/` | 現在の地図部品と旧画面が参照する地図 |
| `src/assets/opening/` | オープニングの背景・動画・BGM |
| `src/assets/ui/` | 修了証・街名ラベル |
| `artwork/equipment/` | 装備品デザインの参照シート |
| `artwork/characters/references/` | 人物制作の参照画像 |
| `artwork/characters/archive/` | 過去の賢者・人物候補 |
| `artwork/characters/3d/` | Blender制作ファイル・生成スクリプト・試作モデル |
| `artwork/maps/archive/` | 地図の旧案 |
| `artwork/archive/legacy/` | 旧ゲームのドット絵・音声・動画など |
| `docs/verification/` | 画面確認用の証跡 |
| `public/` | URLで直接読むファビコンなど |

## よく使う画像

- 賢者の最新完成画像: [human-sage-black-hair-glasses-v2.png](../src/assets/characters/sage/human-sage-black-hair-glasses-v2.png)
- 選択された1枚目の装備シート: [sage-equipment-sheet.png](../artwork/equipment/sage-equipment-sheet.png)
- ゲームが現在表示する初期旅人: [traveler-shirt-and-bag.png](../src/assets/characters/traveler/traveler-shirt-and-bag.png)

賢者画像は保存素材であり、現在のゲーム表示への採用や装備段階切り替えは別作業。素材整理では表示・進捗データを変更していない。

## 新しい素材を追加するとき

アプリ素材は `src/assets` の用途別フォルダへ置き、TSXの相対importまたはCSSの相対urlで読み込む。Viteが開発用・GitHub Pages用のパスを処理するため、`/src/assets/...` をコードに直書きしない。生成候補は `artwork` へ保存し、採用画像だけを `src/assets` へ移す。

過去の引き継ぎ書は当時のパスを保持している。移動先は [移動一覧](assets-migration.json) の `from` / `to` で照合できる。各移動ファイルのSHA-256を記録し、元の画像・音声・動画の内容を保持している。
