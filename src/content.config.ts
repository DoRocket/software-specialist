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
 */
const topics = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/topics',
    generateId: ({ entry }) => entry.replace(/\.md$/, '').replace(/(^|\/)index$/, ''),
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
    draft: z.boolean().default(false),
  }),
});

export const collections = { topics };
