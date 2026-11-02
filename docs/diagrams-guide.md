# 図・アニメーションの作り方

文字だけでは分かりにくい仕組みは、図・アニメーション・操作できる可視化で補います。
部品は `src/components/diagrams/` にあり、記事を **`.mdx`** にすると本文中で使えます。

## 記事を .mdx にする

1. `git mv foo.md foo.mdx`（URL・id は変わりません）
2. フロントマターの直後に部品を import する

```mdx
---
title: TCP と UDP
...
---

import SequenceDiagram from '../../../../components/diagrams/SequenceDiagram.astro';
```

### MDX の注意点（.md では問題なかった書き方がエラーになる）

- 本文中の `{` `}` は JavaScript 式として解釈される → `\{` `\}` とエスケープするか、コード（`` ` ``）の中に入れる
- 本文中の `<` の直後に文字が続くと タグとして解釈される（例: `a<b`）→ `a &lt; b` か、コードの中に入れる
- HTML コメント `<!-- -->` は使えない → `{/* コメント */}`
- 表・コードブロック内は通常どおり書ける
- 数式 `$...$` / `$$...$$` の中の `{ }` はそのまま書いてよい（数式として先に解釈される）

## 共通の仕組み

### Figure（図の枠）とステップ再生

`Figure.astro` で囲み、`steps` を指定すると「最初へ / 前へ / 再生 / 次へ」の操作ボタンが付きます。
画面に入ると自動再生します（OS の「視差効果を減らす」設定が有効なら自動再生しません）。

中身の要素に次の属性を付けると、ステップに応じて表示が切り替わります（`src/scripts/stepper.ts`）。

| 属性 | 動き |
| --- | --- |
| `data-step="n"` | ステップ n 以降で表示（フェードイン）。現在のステップの要素には `.is-current` が付く |
| `data-step-only="n"` | ステップ n のときだけ表示（説明文向け） |
| `data-step-until="m"` | ステップ m までだけ表示（`data-step="n"` と組み合わせると n〜m のあいだだけ表示） |
| `class="dg-draw"`（線・パス） | `data-step` を付けた要素（またはその子）で、線を描くように表示 |

説明文は `slot="narration"` に `data-step-only` 付きの `<p>` を並べます。
自動再生の間隔は既定 2.5 秒です。説明文が長い図は `Figure` の `interval`（ミリ秒）で長くします。

```astro
<Figure title="…" steps={3} intro="ステップ 0 で表示する説明">
  <svg viewBox="0 0 600 200">
    <g data-step="1">…</g>
  </svg>
  <Fragment slot="narration">
    <p data-step-only="1">1 の説明</p>
  </Fragment>
</Figure>
```

### 用意済みの部品

| 部品 | 用途 |
| --- | --- |
| `SequenceDiagram` | 「誰が誰に何を送るか」の流れ（TCP、DHCP、DNS、ARP、TLS など）。`colWidth` で列の間隔を指定できる。幅の広い図はスマートフォンで横スクロール |
| `Encapsulation` | カプセル化と非カプセル化（送信側でヘッダを付け、受信側で外す）のステップ再生 |
| `SubnetCalculator` | IPv4 アドレスとプレフィックス長から、ネットワーク部とホスト部の色分け、各アドレス、ホスト数を即時計算（props: ip, prefix） |
| `SwitchLearning` | L2スイッチの MACアドレス学習・フラッディング・転送のステップ再生 |
| `TransferTimeCalculator` | データ量・回線速度・伝送効率から伝送時間を式つきで計算（props: size, sizeUnit, speed, speedUnit, efficiency） |
| `BitToggle` | 8ビットをクリックで切替え、各桁の重みと 10進・16進・2進を即時表示（10進入力も可）。`signed` で 2の補数（MSB の重み −128）（props: initial, signed） |
| `FloatBitLayout` | IEEE 754 単精度のビット配置を符号部・指数部・仮数部で色分けし、ビット操作・10進入力で各部の意味と値を表示。単精度/倍精度のビット数比較つき（props: bits, formats） |
| `LogicGateSimulator` | AND/OR/NOT/XOR/NAND/NOR を選び、入力をクリックで切替え、出力ランプと真理値表の該当行を強調（props: gates, initial） |
| `HalfAdderCircuit` | 半加算器の回路図（XOR が和 S、AND が桁上がり C）を入力の切替えで動かす |
| `StackQueueDemo` | スタック（LIFO）とキュー（FIFO）を並べ、出し入れをアニメーション表示。同じ操作列を両方に1手ずつ実行できる（props: ops, capacity） |
| `BinaryTree` | 二分木の図。`traversal`（pre/in/post）を指定すると、なぞる順にステップ再生（props: tree, traversal） |
| `SortVisualizer` | バブル・選択・挿入ソートを棒グラフでステップ再生。比較中/交換/確定済みの色分け、比較・交換回数、シャッフル（props: values, algorithm, shuffleSize） |
| `BinarySearchDemo` | 二分探索の lo/mid/hi をステップ再生し、比較回数と線形探索の回数を並べて表示。探す値・配列の大きさを変更可（props: values, target, sizes） |
| `CallStackDiagram` | 関数の呼出しスタックが積まれて戻る様子（戻り値の矢印つき）をステップ再生。再帰のトレースに（props: steps） |
| `MemoryHierarchy` | 記憶階層のピラミッド図（上ほど高速・小容量・高価）。静的な図 |
| `EffectiveAccessTime` | キャッシュ・主記憶のアクセス時間とヒット率から実効アクセス時間を式つきで計算し、グラフに現在の点を表示。例題ボタン付き（props: cache, main, hit, presets） |
| `ReliabilityCalculator` | 装置 A・B・C の稼働率をスライダーで変え、直列・並列・並列＋直列の構成図と全体稼働率を式つきで表示（props: a, b, c） |
| `TaskStateDiagram` | タスクの状態遷移（実行可能・実行・待ち）をディスパッチ／プリエンプション／入出力要求／入出力完了の順にステップ再生 |
| `CryptoFlow` | 鍵・封をした文書の絵で暗号化して送る流れをステップ再生。公開鍵と共通鍵（鍵配送問題）を切り替え（props: mode="public" \| "symmetric"） |
| `DigitalSignatureFlow` | デジタル署名の生成（ハッシュ → 送信者の秘密鍵で署名）と検証、改ざん時の不一致をステップ再生 |
| `FirewallDmz` | ファイアウォールと DMZ の構成図で、パケットの許可・拒否と一致したルール表の行をステップ再生 |
| `ArrowDiagram` | アローダイアグラムの最早・最遅結合点時刻を計算しながらステップ再生し、クリティカルパスを強調（props: nodes, activities, width, height, unit, note） |
| `NormalizationSteps` | 正規化で表が分割されていく様子（非正規形 → 第3正規形）をステップ再生。列を分割先の表ごとに色分け（props: stages, groups） |
| `AuditProcessFlow` | システム監査の流れ（監査計画 → 予備調査 → 本調査 → 評価・結論 → 監査報告 → フォローアップ）を各段階の成果物つきでステップ再生。改善の実施は監査対象部門であることを色分けで示す |
| `IncidentFlow` | インシデント発生 → サービスデスク → エスカレーション → 回避策で回復 → 問題管理（根本原因・既知の誤り）→ 変更管理（RFC）をステップ再生。HTML の箱で組むので狭い画面でも読める（props: example） |
| `RecoveryTimeline` | 最後のバックアップ → 障害発生 → 業務再開 の時間軸で、失うデータ（RPO と比べる）と停止時間（RTO と比べる）をステップ再生（props: backup, failure, recovery） |
| `CommunicationPaths` | 人数スライダーで円周上の人と全員の組合せの線が増減し、経路数 n(n−1)/2 を式つきで表示。増分（n−1 本）を強調し、リーダー経由の n−1 本と比較（props: n, max） |
| `StrategyFlowMap` | 分析フレームワークの地図。外部環境 → 内部環境 → 統合 → 戦略立案 → 目標・評価 の5段階に、問い・使う手法・得られるものを並べた静的な図（props: highlight） |
| `FiveForcesDiagram` | ファイブフォース分析の図。notes で事例の評価（強い／中程度／弱い）と根拠を色付きで表示（props: notes） |
| `ValueChainDiagram` | バリューチェーンの図（支援活動・主活動・マージン）。活動名を業種に合わせて置換でき、marks で強み・弱みを色分け（props: supports, primaries, marks） |
| `SwotWorkshop` | SWOT・クロス SWOT のワークシート。項目の追加・削除、組合せの問いかけ、テキストでコピー。内容は localStorage にだけ保存（props: initial, storageKey） |
| `PpmMatrix` | 事業ごとの市場成長率・シェア・売上高から相対的市場シェアを計算し、4象限に円で配置。境界の変更・事業の追加が可（props: businesses, growthLine, salesUnit） |
| `JournalToLedger` | 仕訳 → 総勘定元帳（T字勘定）への転記 → 残高試算表 をステップ再生。貸借不一致や未定義の科目はビルドエラー（props: accounts, entries, interval） |
| `BreakEvenChart` | 固定費・変動費率・売上高のスライダーで、売上高線・総費用線・損益分岐点・利益／損失の領域を描き直し、損益分岐点売上高・安全余裕率などを式つきで表示（props: fixed, rate, sales, unit, maxFixed, maxSales, presets） |

部品を追加したらこの表に追記してください。

## デザインのルール

- 色は CSS 変数を使う（ライト/ダーク両対応）: `--dg-fill`（図形の地）, `--dg-stroke`（枠線）, `--accent`（強調）,
  `--dg-c1`〜`--dg-c5`（区別用の色）, `--dg-ok` / `--dg-warn`, 文字は `--fg` / `--fg-muted`
- SVG は `viewBox` を指定し、幅は CSS で 100%（スマートフォンでも崩れない）。文字は 13〜15px 相当
- 1つの図で伝えることは1つ。説明文（narration）で「今なにが起きたか」を1〜2文で言う
- 操作できる部品（計算機など）は `<script>` で実装し、同じページに複数置いても動くよう
  `document.querySelectorAll('[data-xxx]')` で各インスタンスを初期化する
- 部品内の固有のスタイルは `<style>`（Astro のスコープ付き CSS）に書く。`Figure` が出力する要素（`.diagram-body` など）を起点にするセレクタは、スコープが合わず効かないので `:global(.diagram-body) svg .x` のように書く。共通の見た目は `.diagram`, `.dg-controls`, `.dg-result`, `.dg-btn`, `.dg-mono` を使う
