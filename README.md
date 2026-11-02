# Software Specialist

ソフトウェアスペシャリストを育てるための学習サイトです。
ITパスポート（IP）・基本情報技術者（FE）・応用情報技術者（AP）の出題範囲をメインに、日商簿記3級などの関連資格も含めて、
**資格ごとではなく技術の階層構造**（例: ネットワーク › インターネット層 › IPアドレス › アドレスクラス）で学習項目を整理しています。
どの試験の範囲に含まれるかは各トピックのタグで管理し、サイト上で絞り込めます。

## 主な機能

- **階層ナビゲーション**: サイドバーのツリー、パンくずリスト、配下トピックのカード、前後ページ送り
- **試験範囲フィルタ**: ヘッダーの IP / FE / AP ボタンで全ページを絞り込み（選択はブラウザに保存）
- **全体マップ** (`/tree/`): 全トピックの階層を、試験範囲・タグ・キーワードで絞り込み
- **試験別** (`/exams/<id>/`): 試験ごとの範囲を技術の階層付きで一覧
- **タグ** (`/tags/<tag>/`): 「計算問題」「プロトコル」など分野をまたいだ横断検索
- **確認問題**: 各記事の末尾。選ぶとその場で正誤と解説を表示
- **演習モード** (`/practice/`): 試験範囲・分野・問題数を選び、全記事の問題からランダムに出題。未解答・前回不正解を優先できる
- **学習の記録** (`/progress/`): 解答結果をブラウザに保存し、分野別の進み具合・復習が必要な記事を表示。サイドバーと分野カードにも進み具合を表示
- **この記事の前に**: 前提となる記事を記事の冒頭に案内

## 開発

Node.js 24 以上（`.nvmrc` 参照）が必要です。

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ に静的サイトを出力
npm run check    # 型チェック
npm run check:links  # ビルド結果のリンク切れ検査
```

サブパスで公開する場合（GitHub Pages など）は `SITE` と `BASE_PATH` 環境変数を指定してビルドします。

```bash
SITE=https://example.github.io BASE_PATH=/software-specialist npm run build
```

## 公開（GitHub Pages）

`main` ブランチへの push で `.github/workflows/deploy.yml` が動き、GitHub Pages に公開されます。
初回のみ、リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に設定してください。
公開 URL とサブパス（`/software-specialist/`）はワークフローが自動で設定します。

- 非公開（private）リポジトリで Pages を使うには、GitHub Team 以上のプランが必要です。
- Pages で公開したサイトは、リポジトリが非公開でも **インターネットに公開** されます
  （閲覧者を組織内に限定できるのは GitHub Enterprise Cloud のみ）。

`npm run check:links` で、ビルド結果のサイト内リンク切れを検査できます（CI とデプロイ時にも実行）。

## コンテンツの追加

`src/content/topics/` 以下に Markdown を追加します。**ディレクトリ構造がそのまま階層** になります。
フロントマターの仕様（`exams` / `tags` / `related` など）と執筆ルールは [docs/content-guide.md](docs/content-guide.md) を参照してください。

```
src/content/topics/network/ip/ip-address/class.md  →  /topics/network/ip/ip-address/class/
```

試験区分を追加する場合（例: 情報処理安全確保支援士）は `src/data/exams.ts` に追記します。

## 構成

| パス | 内容 |
| --- | --- |
| `src/content/topics/` | 学習コンテンツ（Markdown） |
| `src/content.config.ts` | フロントマターのスキーマ定義 |
| `src/data/exams.ts` | 試験区分の定義 |
| `src/lib/topics.ts` | ディレクトリ構造からトピックの木を組み立てる処理 |
| `src/scripts/filter.ts` | 試験範囲・タグ・キーワードの絞り込み（クライアント側） |
| `src/pages/` | ページ（トップ、トピック、全体マップ、試験別、タグ） |
