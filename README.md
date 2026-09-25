# マインドシーカー

自己啓発の教材を、36の街を巡りながら段階的に学ぶ e-learning アプリです。街ごとの教材を修了すると修了証を獲得し、次の街が解放されます。

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
