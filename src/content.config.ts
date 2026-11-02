import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { examIds } from './data/exams';

/**
 * トピック（学習項目）コレクション。
 * ディレクトリ構造がそのまま技術の階層になる。
 *   src/content/topics/network/index.md                 -> network
 *   src/content/topics/network/ip/ip-address/index.md   -> network/ip/ip-address
 *   src/content/topics/network/ip/ip-address/class.md   -> network/ip/ip-address/class
 * 子を持つトピックは「ディレクトリ + index.md」、末端は単独の .md にする。
 * 図やアニメーションの部品（src/components/diagrams/）を使う記事は .mdx にする。
 */
/** 確認問題（4択などの選択式）。問題文・選択肢・解説では $...$ の数式が使える */
const quizItem = z
  .object({
    q: z.string(),
    choices: z.array(z.string()).min(2).max(5),
    /** 正解の選択肢の番号（0 始まり） */
    answer: z.number().int().min(0),
    explanation: z.string(),
    /** この問題の難易度の目安となる試験（省略可） */
    level: z.enum(examIds).optional(),
  })
  .refine((v) => v.answer < v.choices.length, { message: 'answer が choices の範囲外です' });

const topics = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/topics',
    generateId: ({ entry }) => entry.replace(/\.mdx?$/, '').replace(/(^|\/)index$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    /** 同じ階層内での並び順（小さいほど先） */
    order: z.number().default(100),
    /** 一覧やカードに表示する一行説明 */
    summary: z.string().optional(),
    /** このトピックが出題範囲に含まれる試験 */
    exams: z.array(z.enum(examIds)).default([]),
    /** 横断的なフィルタリング用タグ（例: 計算問題, IPv4） */
    tags: z.array(z.string()).default([]),
    /** 関連トピックの id（例: network/ip/routing） */
    related: z.array(z.string()).default([]),
    /** この記事を読む前に理解しておきたいトピックの id（記事の冒頭に案内を出す） */
    prerequisites: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    /** 分野のアイコン名（src/components/CategoryIcon.astro）。主に大分類の index に付ける */
    icon: z.string().optional(),
    /** 記事末尾に表示する確認問題 */
    quiz: z.array(quizItem).default([]),
  }),
});

export const collections = { topics };
