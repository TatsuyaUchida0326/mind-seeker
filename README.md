# マインドシーカー

自己啓発の教材を、3章・12の目的地・30フェーズに沿って学ぶ e-learning アプリです。教材を修了するとアイテムを獲得し、次の学習へ進みます。

## 技術構成

- React 19 / TypeScript
- Vite
- React Router
- GitHub Pages（GitHub Actions で自動デプロイ）

## 開発

```sh
npm ci
npm run dev
```

品質確認と本番ビルド:

```sh
npm run lint
npm run build
```

学習進捗はブラウザの localStorage に保存されます。端末間では同期されません。教材本文は差し替えやすいサンプル内容です。

## 公開

`main` ブランチへの push で GitHub Actions がビルドし、GitHub Pages にデプロイします。GitHub Pages の設定では公開元に **GitHub Actions** を選択してください。

## 素材の管理

アプリ用素材は `src/assets/`、制作途中・過去案は `artwork/`、画面確認の証跡は `docs/verification/` に保存します。[素材の置き場所・完成画像の一覧](docs/assets.md)をご覧ください。
