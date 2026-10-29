---
title: SQL
order: 3
summary: 関係データベースを操作する言語。SELECT・集約・GROUP BY・HAVING・結合・副問合せとDDL/DML
exams: [fe, ap]
tags: [SQL, 頻出]
related: [database/relational-model, database/normalization, database/transaction]
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
