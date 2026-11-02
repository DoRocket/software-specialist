---
title: SQL
order: 3
summary: 関係データベースを操作する言語。SELECT・集約・GROUP BY・HAVING・結合・副問合せとDDL/DML
exams: [fe, ap]
tags: [SQL, 頻出]
related: [database/relational-model, database/normalization, database/transaction]
prerequisites: [database/relational-model]
quiz:
  - q: '社員表の部署コード列には、5 行分の値として D1、D2、NULL、D1、NULL が入っている。`SELECT COUNT(*), COUNT(部署コード), COUNT(DISTINCT 部署コード) FROM 社員` の結果はどれか。'
    choices: ['5, 5, 2', '3, 3, 2', '5, 3, 3', '5, 3, 2']
    answer: 3
    explanation: '`COUNT(*)` は NULL を含む行も数えるので 5。`COUNT(部署コード)` は NULL を数えないので 3（D1、D2、D1）。`COUNT(DISTINCT 部署コード)` は重複と NULL を除いた D1、D2 の 2。NULL を1つの値として数えると 3 になり誤り。'
    level: fe
  - q: '社員表に (氏名, 部署コード, 給与) として、(佐藤, D1, 300)、(鈴木, D2, 250)、(高橋, D1, 200)、(田中, D3, 400)、(伊藤, D2, 350)、(渡辺, D1, 150) の 6 行がある（給与の単位は千円）。次の SQL 文の結果はどれか。`SELECT 部署コード, AVG(給与) FROM 社員 WHERE 給与 >= 200 GROUP BY 部署コード HAVING COUNT(*) >= 2`'
    choices:
      - 'D2 が 300 の 1 行'
      - 'D1 が約 217、D2 が 300 の 2 行'
      - 'D1 が 250、D2 が 300 の 2 行'
      - 'D1 が 250、D2 が 300、D3 が 400 の 3 行'
    answer: 2
    explanation: 'まず `WHERE` で給与 200 未満の渡辺の行が除かれる。グループ化すると D1 が 300 と 200（2 行）、D2 が 250 と 350（2 行）、D3 が 400（1 行）。`HAVING COUNT(*) >= 2` で D3 が除かれ、平均は D1 が $\dfrac{300 + 200}{2} = 250$、D2 が $\dfrac{250 + 350}{2} = 300$。渡辺を含めて平均すると D1 は $\dfrac{650}{3} \approx 217$ になるが、`WHERE` は集約前に評価されるので誤り。'
    level: fe
  - q: '社員表に 4 行あり、そのうち 1 行は部署コードが部署表に存在しない値（D9）である。残り 3 行の部署コードは部署表に存在する。`SELECT 社員.氏名, 部署.部署名 FROM 社員 LEFT OUTER JOIN 部署 ON 社員.部署コード = 部署.部署コード` の結果として正しいものはどれか。'
    choices:
      - '3 行が返り、D9 の社員は含まれない'
      - '4 行が返り、D9 の社員の部署名は NULL になる'
      - '4 行が返り、D9 の社員の部署名は空文字列になる'
      - '社員表の行数と部署表の行数の積の行が返る'
    answer: 1
    explanation: '左外部結合では左側（社員表）の行がすべて残り、対応する部署がない行の部署名は NULL になる。アは内部結合（`INNER JOIN`）の結果。エは結合条件を書かなかった場合の直積。'
    level: fe
  - q: '集約関数を使った条件「社員が 3 人以上いる部署だけ」を指定する場所として、適切なものはどれか。'
    choices: ['`WHERE` 句', '`ORDER BY` 句', '`SELECT` 句', '`HAVING` 句']
    answer: 3
    explanation: '論理的な評価順序は FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY。`WHERE` は集約前の行を絞り込むため `COUNT(*)` などの集約関数は使えず、グループ化後のグループを絞り込む `HAVING COUNT(*) >= 3` と書く。'
    level: fe
  - q: 'SQL 文とその分類の組合せとして、適切なものはどれか。'
    choices:
      - '`GRANT` … DCL（データ制御言語）'
      - '`CREATE` … DML（データ操作言語）'
      - '`UPDATE` … DDL（データ定義言語）'
      - '`COMMIT` … DCL（データ制御言語）'
    answer: 0
    explanation: '`GRANT`・`REVOKE` は権限を管理する DCL。`CREATE` は表などを定義する DDL、`UPDATE` はデータを更新する DML。`COMMIT` は更新を確定するトランザクション制御の文。'
    level: fe
  - q: '注文明細表に (注文番号, 書籍番号, 数量) として、(1001, B01, 1)、(1001, B02, 2)、(1002, B04, 1)、(1003, B02, 1)、(1003, B03, 1)、(1004, B01, 2) の 6 行がある。`SELECT 書籍番号, SUM(数量) FROM 注文明細 GROUP BY 書籍番号 HAVING SUM(数量) >= 2` の結果はどれか。'
    choices:
      - 'B01 が 2、B02 が 2 の 2 行'
      - 'B01 が 3、B02 が 3、B03 が 1、B04 が 1 の 4 行'
      - 'B01 が 3、B02 が 3 の 2 行'
      - 'B01 が 3 の 1 行'
    answer: 2
    explanation: '書籍番号でグループ化すると、B01 は $1 + 2 = 3$、B02 は $2 + 1 = 3$、B03 は 1、B04 は 1。`HAVING SUM(数量) >= 2` で合計が 2 以上の B01 と B02 が残る。アは `WHERE 数量 >= 2` で先に行を絞ってから合計した場合（B01 は 1004 の行だけ、B02 は 1001 の行だけ）の結果、イは `HAVING` を書かなかった場合の結果。'
    level: fe
---

SQL は関係データベースで表を定義し、データを検索・更新するための標準言語です（ISO/JIS で規格化）。
表の構造を定義する **DDL**、データを操作する **DML**、権限を管理する **DCL** に大別されます。

## SQL の分類

| 分類 | 主な文 | 役割 |
| --- | --- | --- |
| DDL（データ定義言語） | `CREATE`, `ALTER`, `DROP` | 表・ビュー・索引などを定義・変更・削除 |
| DML（データ操作言語） | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | データの検索・追加・更新・削除 |
| DCL（データ制御言語） | `GRANT`, `REVOKE` | 権限の付与・取消し |
| トランザクション制御 | `COMMIT`, `ROLLBACK` | 更新の確定・取消し |

## 表の定義（DDL）

```sql
CREATE TABLE 部署 (
  部署コード CHAR(2)      PRIMARY KEY,
  部署名     VARCHAR(20)  NOT NULL
);

CREATE TABLE 社員 (
  社員番号   INTEGER      PRIMARY KEY,
  氏名       VARCHAR(20)  NOT NULL,
  部署コード CHAR(2)      REFERENCES 部署(部署コード),
  給与       INTEGER      CHECK (給与 >= 0)
);

CREATE VIEW 営業部社員 AS
  SELECT 社員番号, 氏名 FROM 社員 WHERE 部署コード = 'D1';
```

`PRIMARY KEY`（主キー制約）、`NOT NULL`、`UNIQUE`、`CHECK`、`REFERENCES` / `FOREIGN KEY`（参照制約）などで整合性を守ります。
**ビュー** は SELECT 文の結果を仮想的な表として扱えるようにしたものです。

## データの操作（DML）

```sql
INSERT INTO 社員 (社員番号, 氏名, 部署コード, 給与) VALUES (104, '田中', 'D2', 300000);
UPDATE 社員 SET 給与 = 給与 * 1.05 WHERE 部署コード = 'D1';
DELETE FROM 社員 WHERE 社員番号 = 104;
```

`UPDATE` や `DELETE` で `WHERE` を省略すると **全行が対象** になる点に注意します。

## SELECT 文の基本

```sql
SELECT   部署コード, AVG(給与) AS 平均給与   -- 射影と集約
FROM     社員                                 -- 対象の表
WHERE    給与 >= 200000                       -- 行の選択（集約前）
GROUP BY 部署コード                           -- グループ化
HAVING   COUNT(*) >= 2                        -- グループの選択（集約後）
ORDER BY 平均給与 DESC;                       -- 並べ替え
```

論理的な評価順序は **FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY** です。
`WHERE` は集約前の行を絞り込み、`HAVING` はグループ化後のグループを絞り込みます。そのため集約関数を使った条件は `HAVING` に書きます。

### 主な集約関数

| 関数 | 意味 | NULL の扱い |
| --- | --- | --- |
| `COUNT(*)` | 行数 | NULL を含む行も数える |
| `COUNT(列)` | 値の個数 | NULL は数えない |
| `SUM(列)` / `AVG(列)` | 合計 / 平均 | NULL を除いて計算 |
| `MAX(列)` / `MIN(列)` | 最大 / 最小 | NULL を除く |

`DISTINCT` を付けると重複を除いて数えられます（例: `COUNT(DISTINCT 部署コード)`）。

### その他の条件指定

```sql
WHERE 給与 BETWEEN 200000 AND 300000   -- 両端を含む範囲
WHERE 氏名 LIKE '佐%'                  -- % は0文字以上、_ は任意の1文字
WHERE 部署コード IN ('D1', 'D2')
WHERE 部署コード IS NULL               -- NULL の判定は = ではなく IS NULL
```

## 結合

```sql
-- 内部結合: 両方の表に対応する行があるものだけ
SELECT 社員.氏名, 部署.部署名
FROM 社員 INNER JOIN 部署 ON 社員.部署コード = 部署.部署コード;

-- 左外部結合: 社員表の行はすべて残し、対応が無ければ部署名は NULL
SELECT 社員.氏名, 部署.部署名
FROM 社員 LEFT OUTER JOIN 部署 ON 社員.部署コード = 部署.部署コード;
```

`FROM 社員, 部署 WHERE 社員.部署コード = 部署.部署コード` のように、`WHERE` 句に結合条件を書く形式も試験でよく使われます。結合条件を書き忘れると直積（全組合せ）になります。

## 副問合せ

SELECT 文の中に入れ子にした SELECT 文です。

```sql
-- 平均給与より高い社員（結果が1つの値になる副問合せ）
SELECT 氏名 FROM 社員
WHERE 給与 > (SELECT AVG(給与) FROM 社員);

-- 営業部に所属する社員（IN と組み合わせる）
SELECT 氏名 FROM 社員
WHERE 部署コード IN (SELECT 部署コード FROM 部署 WHERE 部署名 = '営業部');

-- 相関副問合せ: 自分の部署の平均給与より高い社員
SELECT 氏名 FROM 社員 S1
WHERE 給与 > (SELECT AVG(給与) FROM 社員 S2
              WHERE S2.部署コード = S1.部署コード);

-- EXISTS: 社員が1人以上いる部署
SELECT 部署名 FROM 部署 B
WHERE EXISTS (SELECT * FROM 社員 S WHERE S.部署コード = B.部署コード);
```

**相関副問合せ** は外側の行ごとに内側の問合せが評価されるもので、外側の表の列を内側で参照しているのが特徴です。

## 実際の進め方: 業務の質問を SQL にする

「顧客ごとの今月の購入金額を知りたい」のような質問は、次の順で SQL に組み立てると迷いません。

1. **結果の1行が何かを決める**: 「顧客1人で1行」なら、`GROUP BY` は顧客の主キーになります。
2. **必要な列がどの表にあるかを洗い出す**: 氏名は顧客、金額は注文明細、というように並べ、表どうしをつなぐ外部キーをたどって `FROM` と `JOIN` を書きます。
3. **集計前に除く行を `WHERE` に書く**: 期間や都道府県などの条件です。
4. **集計の単位を `GROUP BY` に、集計後の条件を `HAVING` に書く**
5. **出す列と並び順を `SELECT` と `ORDER BY` に書く**
6. **小さなデータで手計算した結果と照らし合わせる**: 本番の大量データでは誤りに気付きにくいので、数行のデータで結果を確かめてから使います。

よくある失敗と対策:

| 失敗 | 何が起きるか | 対策 |
| --- | --- | --- |
| 1対多の結合のあとに数える・合計する | 明細の行数だけ行が増え、注文数や金額が **水増し** される | 数える単位を意識し、`COUNT(DISTINCT 注文番号)` にする、先に集計してから結合する |
| 内部結合で相手のない行が消える | 一度も注文していない顧客が一覧から漏れる | 残したい側を左にして `LEFT OUTER JOIN` にする |
| `NOT IN (副問合せ)` の結果に NULL が含まれる | 比較結果が「不明」になり、1行も返らない | NULL を除く条件を付けるか、`NOT EXISTS` を使う |
| `UPDATE` / `DELETE` の `WHERE` 忘れ | 全行が更新・削除される | 先に同じ `WHERE` で `SELECT` して対象行を確かめる。トランザクションの中で実行し、確認してから `COMMIT` する |

## 事例: あおば書店の注文管理

[関係モデルとキー](../relational-model/) の記事で使った架空のオンライン書店「あおば書店」の4つの表を、SQL で定義して業務の質問に答えます。

### 表の定義

```sql
CREATE TABLE 顧客 (
  顧客番号       CHAR(4)       PRIMARY KEY,
  氏名           VARCHAR(20)   NOT NULL,
  都道府県       VARCHAR(4)    NOT NULL,
  メールアドレス VARCHAR(100)  NOT NULL UNIQUE      -- 代替キー
);

CREATE TABLE 書籍 (
  書籍番号 CHAR(3)      PRIMARY KEY,
  書名     VARCHAR(50)  NOT NULL,
  価格     INTEGER      NOT NULL CHECK (価格 > 0),
  在庫数   INTEGER      NOT NULL CHECK (在庫数 >= 0)  -- マイナスの在庫を禁止
);

CREATE TABLE 注文 (
  注文番号 INTEGER  PRIMARY KEY,
  顧客番号 CHAR(4)  NOT NULL REFERENCES 顧客(顧客番号),  -- 既定は NO ACTION（参照されている顧客は削除できない）
  注文日   DATE     NOT NULL
);

CREATE TABLE 注文明細 (
  注文番号 INTEGER  NOT NULL REFERENCES 注文(注文番号) ON DELETE CASCADE,
  書籍番号 CHAR(3)  NOT NULL REFERENCES 書籍(書籍番号),
  数量     INTEGER  NOT NULL CHECK (数量 > 0),
  単価     INTEGER  NOT NULL,                         -- 注文した時点の価格
  PRIMARY KEY (注文番号, 書籍番号)                    -- 複合主キーは表制約として書く
);
```

データは次のように `INSERT` で登録します（日付は `DATE '…'` の形で書きます）。

```sql
INSERT INTO 注文 (注文番号, 顧客番号, 注文日) VALUES (1001, 'C001', DATE '2026-04-01');
INSERT INTO 注文明細 (注文番号, 書籍番号, 数量, 単価) VALUES (1001, 'B01', 1, 2800);
```

### サンプルデータ

| 顧客番号 | 氏名 | 都道府県 |
| --- | --- | --- |
| C001 | 青木 | 東京都 |
| C002 | 石井 | 大阪府 |
| C003 | 上田 | 東京都 |
| C004 | 江口 | 福岡県 |

| 書籍番号 | 書名 | 価格 | 在庫数 |
| --- | --- | --- | --- |
| B01 | データベース入門 | 2800 | 12 |
| B02 | SQLドリル | 1800 | 5 |
| B03 | ネットワーク基礎 | 3200 | 0 |
| B04 | アルゴリズム図鑑 | 2400 | 8 |

| 注文番号 | 顧客番号 | 注文日 |
| --- | --- | --- |
| 1001 | C001 | 2026-04-01 |
| 1002 | C002 | 2026-04-01 |
| 1003 | C001 | 2026-04-03 |
| 1004 | C003 | 2026-04-05 |

| 注文番号 | 書籍番号 | 数量 | 単価 |
| --- | --- | --- | --- |
| 1001 | B01 | 1 | 2800 |
| 1001 | B02 | 2 | 1800 |
| 1002 | B04 | 1 | 2400 |
| 1003 | B02 | 1 | 1800 |
| 1003 | B03 | 1 | 3200 |
| 1004 | B01 | 2 | 2800 |

### 質問1: 日ごとの売上はいくらか（結合と集計）

```sql
SELECT   注文.注文日, SUM(注文明細.数量 * 注文明細.単価) AS 売上
FROM     注文 INNER JOIN 注文明細 ON 注文.注文番号 = 注文明細.注文番号
GROUP BY 注文.注文日
ORDER BY 注文.注文日;
```

| 注文日 | 売上 |
| --- | --- |
| 2026-04-01 | 8800 |
| 2026-04-03 | 5000 |
| 2026-04-05 | 5600 |

4月1日は注文1001（$2800 \times 1 + 1800 \times 2 = 6400$）と注文1002（2400）の合計です。3日間の合計は 19,400 円になります。

### 質問2: 顧客ごとの購入金額は（外部結合で 0 円の顧客も残す）

```sql
SELECT   顧客.顧客番号, 顧客.氏名,
         COALESCE(SUM(注文明細.数量 * 注文明細.単価), 0) AS 購入金額
FROM     顧客
         LEFT OUTER JOIN 注文     ON 顧客.顧客番号 = 注文.顧客番号
         LEFT OUTER JOIN 注文明細 ON 注文.注文番号 = 注文明細.注文番号
GROUP BY 顧客.顧客番号, 顧客.氏名
ORDER BY 購入金額 DESC;
```

| 顧客番号 | 氏名 | 購入金額 |
| --- | --- | --- |
| C001 | 青木 | 11400 |
| C003 | 上田 | 5600 |
| C002 | 石井 | 2400 |
| C004 | 江口 | 0 |

江口さんには注文が無いので、外部結合で注文側の列が NULL になり、`SUM` も NULL になります。`COALESCE(式, 0)` は「式が NULL なら 0」とする関数です。内部結合にすると江口さんの行は消えます。

### 質問3: 2冊以上売れた書籍は（`HAVING`）

```sql
SELECT   書籍.書名, SUM(注文明細.数量) AS 販売冊数
FROM     書籍 INNER JOIN 注文明細 ON 書籍.書籍番号 = 注文明細.書籍番号
GROUP BY 書籍.書籍番号, 書籍.書名
HAVING   SUM(注文明細.数量) >= 2;
```

| 書名 | 販売冊数 |
| --- | --- |
| データベース入門 | 3 |
| SQLドリル | 3 |

### 質問4: 平均価格より高い書籍は（副問合せ）

```sql
SELECT 書名, 価格 FROM 書籍
WHERE  価格 > (SELECT AVG(価格) FROM 書籍);
```

平均価格は $\dfrac{2800 + 1800 + 3200 + 2400}{4} = 2550$ 円なので、結果は「データベース入門（2800）」と「ネットワーク基礎（3200）」の2行です。

### 質問5: 一度も注文していない顧客は（`NOT EXISTS`）

```sql
SELECT 顧客.氏名 FROM 顧客
WHERE NOT EXISTS (SELECT * FROM 注文 WHERE 注文.顧客番号 = 顧客.顧客番号);
```

結果は「江口」の1行です。関係演算でいえば、顧客の集合から注文した顧客の集合を引く **差** にあたります。

### 質問6: 2回以上注文した顧客は（数える単位に注意）

```sql
SELECT   顧客番号, COUNT(*) AS 注文回数
FROM     注文
GROUP BY 顧客番号
HAVING   COUNT(*) >= 2;
```

結果は「C001 が 2 回」の1行です。ここで注文明細まで結合してから `COUNT(*)` すると、青木さんの行は注文1001・1003の明細の数だけ（4行）になり、注文回数を 4 と数えてしまいます。結合したまま数えるなら `COUNT(DISTINCT 注文.注文番号)` とします。

### 更新: 新しい注文を登録し、在庫を減らす

石井さん（C002）が 4月6日に SQLドリル（B02）を1冊注文した場合です。

```sql
INSERT INTO 注文 (注文番号, 顧客番号, 注文日) VALUES (1005, 'C002', DATE '2026-04-06');
INSERT INTO 注文明細 (注文番号, 書籍番号, 数量, 単価) VALUES (1005, 'B02', 1, 1800);
UPDATE 書籍 SET 在庫数 = 在庫数 - 1
WHERE  書籍番号 = 'B02' AND 在庫数 >= 1;    -- 在庫が無ければ 0 行の更新になる
COMMIT;
```

B02 の在庫数は 5 から 4 になります。この3つの文は「全部成功するか、全部取り消すか」でなければなりません（注文だけ登録されて在庫が減らない、などを防ぐ）。
途中で失敗したときや、同時に別の人が同じ本を注文したときに何が起きるかは [トランザクション](../transaction/) の記事で扱います。

あとで SQLドリルの価格を 2000 円に改定しても（`UPDATE 書籍 SET 価格 = 2000 WHERE 書籍番号 = 'B02'`）、注文明細には注文時点の単価 1800 が残っているので、過去の売上は変わりません。

## 試験対策のポイント

- **基本情報**: SELECT 文の実行結果（行数や値）を求める問題が中心です。`WHERE` と `HAVING` の違い、`COUNT(*)` と `COUNT(列)` の NULL の扱い、外部結合で NULL が入る行に注意してトレースします。
- **応用情報**: 午後問題で SQL の空欄補充が頻出です。相関副問合せ、`EXISTS` / `NOT EXISTS`、外部結合、`GROUP BY` と `HAVING` の組合せを読み書きできるようにします。参照制約やビューの更新可否など DDL 側の知識も問われます。
- ITパスポートでは SQL 文そのものはほぼ出題されませんが、「DBMS に対して問合せを行う言語」としての位置付けは押さえておきます。
