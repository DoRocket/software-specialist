---
title: SQL
order: 3
summary: 関係データベースを操作する言語。SELECT・集約・GROUP BY・HAVING・結合・副問合せとDDL/DML
exams: [fe, ap]
tags: [SQL, 頻出]
related: [database/relational-model, database/normalization, database/transaction]
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

## 試験対策のポイント

- **基本情報**: SELECT 文の実行結果（行数や値）を求める問題が中心です。`WHERE` と `HAVING` の違い、`COUNT(*)` と `COUNT(列)` の NULL の扱い、外部結合で NULL が入る行に注意してトレースします。
- **応用情報**: 午後問題で SQL の空欄補充が頻出です。相関副問合せ、`EXISTS` / `NOT EXISTS`、外部結合、`GROUP BY` と `HAVING` の組合せを読み書きできるようにします。参照制約やビューの更新可否など DDL 側の知識も問われます。
- ITパスポートでは SQL 文そのものはほぼ出題されませんが、「DBMS に対して問合せを行う言語」としての位置付けは押さえておきます。
