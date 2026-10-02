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

- 第3章3枚目・採用済み（悟りの書を開く最終賢者v4）: [human-sage-final-v4.png](../src/assets/characters/sage/human-sage-final-v4.png)

- 第3章2枚目・採用済み（洗練したロングコート・本なしv4）: [human-sage-without-book-v4.png](../src/assets/characters/sage/human-sage-without-book-v4.png)

- 第3章1枚目・採用済み（都会の探求者v3、旧採用v2は保持）: [human-beige-jacket-holding-compass-v3.png](../src/assets/characters/sage/human-beige-jacket-holding-compass-v3.png)

- 第2章3枚目・採用済み（新人サラリーマン）: [human-new-salaryman.png](../src/assets/characters/traveler/human-new-salaryman.png)

- 第2章2枚目・採用済み（作業監督）: [human-workshop-supervisor.png](../src/assets/characters/traveler/human-workshop-supervisor.png)

- 第2章1枚目・採用済み（工房の作業着・革エプロン）: [human-workshop-worker.png](../src/assets/characters/traveler/human-workshop-worker.png)

- 第1章3枚目の正式採用画像（一人前の旅人・オリーブ上着・腰の羅針盤）: [human-rural-traveler.png](../src/assets/characters/traveler/human-rural-traveler.png)

- 第1章2枚目の正式採用画像（旅立つ青年・茶色ベスト・羅針盤を手に持つ）: [human-rural-departure.png](../src/assets/characters/traveler/human-rural-departure.png)

- スタートの正式採用画像（田舎の青年・前下ろし黒髪・丸メガネ）: [human-rural-start-v2.png](../src/assets/characters/traveler/human-rural-start-v2.png)

- 完成形賢者の再生成版（元画像と採用済み羅針盤画像の質感を参照）: [human-sage-black-hair-glasses-v3.png](../src/assets/characters/sage/human-sage-black-hair-glasses-v3.png)
- 羅針盤を手に持つ採用衣装の再生成版（元賢者を主参照）: [human-beige-jacket-holding-compass-v2.png](../src/assets/characters/sage/human-beige-jacket-holding-compass-v2.png)
- 賢者の最新完成画像: [human-sage-black-hair-glasses-v2.png](../src/assets/characters/sage/human-sage-black-hair-glasses-v2.png)
- 賢者の1段階前（悟りの書なし・自然に両腕を下ろした姿）: [human-sage-stage-7-without-book-v3.png](../src/assets/characters/sage/human-sage-stage-7-without-book-v3.png)
- 白いワイシャツのサラリーマン風段階案: [human-office-white-shirt.png](../src/assets/characters/sage/human-office-white-shirt.png)
- 白いジャケット・ズボン・ワイシャツのスーツ案: [human-white-tailored-suit.png](../src/assets/characters/sage/human-white-tailored-suit.png)
- ベージュジャケット・紺ズボン・白シャツ案: [human-beige-jacket-navy-trousers.png](../src/assets/characters/sage/human-beige-jacket-navy-trousers.png)
- 同衣装に紺ネクタイを追加した案: [human-beige-jacket-navy-tie.png](../src/assets/characters/sage/human-beige-jacket-navy-tie.png)
- 同衣装で羅針盤を手に持つ案: [human-beige-jacket-holding-compass.png](../src/assets/characters/sage/human-beige-jacket-holding-compass.png)
- 選択された1枚目の装備シート: [sage-equipment-sheet.png](../artwork/equipment/sage-equipment-sheet.png)
- ゲームが現在表示する初期旅人: [traveler-shirt-and-bag.png](../src/assets/characters/traveler/traveler-shirt-and-bag.png)

賢者画像は保存素材であり、現在のゲーム表示への採用や装備段階切り替えは別作業。素材整理では表示・進捗データを変更していない。

## 新しい素材を追加するとき

アプリ素材は `src/assets` の用途別フォルダへ置き、TSXの相対importまたはCSSの相対urlで読み込む。Viteが開発用・GitHub Pages用のパスを処理するため、`/src/assets/...` をコードに直書きしない。生成候補は `artwork` へ保存し、採用画像だけを `src/assets` へ移す。

過去の引き継ぎ書は当時のパスを保持している。移動先は [移動一覧](assets-migration.json) の `from` / `to` で照合できる。各移動ファイルのSHA-256を記録し、元の画像・音声・動画の内容を保持している。
