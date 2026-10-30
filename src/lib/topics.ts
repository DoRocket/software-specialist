import { getCollection, type CollectionEntry } from 'astro:content';
import { examIds, type ExamId } from '../data/exams';

export type TopicEntry = CollectionEntry<'topics'>;

export interface TopicNode {
  id: string;
  entry: TopicEntry;
  parent: TopicNode | null;
  children: TopicNode[];
  depth: number;
  /** 自身と全子孫の exams の和集合（フィルタで「配下に該当項目があるか」を判定するため） */
  deepExams: ExamId[];
  /** 自身と全子孫の tags の和集合 */
  deepTags: string[];
}

export interface TopicTree {
  roots: TopicNode[];
  byId: Map<string, TopicNode>;
  /** ツリーを深さ優先でたどった順の全ノード（前後ナビゲーション用） */
  flat: TopicNode[];
}

let cache: Promise<TopicTree> | undefined;

export function getTopicTree(): Promise<TopicTree> {
  cache ??= buildTree();
  return cache;
}

function sortNodes(a: TopicNode, b: TopicNode) {
  return a.entry.data.order - b.entry.data.order || a.entry.data.title.localeCompare(b.entry.data.title, 'ja');
}

async function buildTree(): Promise<TopicTree> {
  const entries = await getCollection('topics', (e) => !(import.meta.env.PROD && e.data.draft));
  const byId = new Map<string, TopicNode>();
  for (const entry of entries) {
    byId.set(entry.id, { id: entry.id, entry, parent: null, children: [], depth: 0, deepExams: [], deepTags: [] });
  }

  const roots: TopicNode[] = [];
  for (const node of byId.values()) {
    const parentId = node.id.includes('/') ? node.id.slice(0, node.id.lastIndexOf('/')) : null;
    if (parentId === null) {
      roots.push(node);
      continue;
    }
    const parent = byId.get(parentId);
    if (!parent) {
      throw new Error(`トピック "${node.id}" の親 "${parentId}" がありません。${parentId}/index.md を作成してください。`);
    }
    node.parent = parent;
    parent.children.push(node);
  }

  for (const node of byId.values()) {
    for (const rel of node.entry.data.related) {
      if (!byId.has(rel)) throw new Error(`トピック "${node.id}" の related に存在しない id "${rel}" が指定されています。`);
    }
  }

  const flat: TopicNode[] = [];
  const visit = (node: TopicNode, depth: number) => {
    node.depth = depth;
    flat.push(node);
    node.children.sort(sortNodes);
    const exams = new Set<ExamId>(node.entry.data.exams);
    const tags = new Set(node.entry.data.tags);
    for (const child of node.children) {
      visit(child, depth + 1);
      child.deepExams.forEach((e) => exams.add(e));
      child.deepTags.forEach((t) => tags.add(t));
    }
    node.deepExams = examIds.filter((e) => exams.has(e));
    node.deepTags = [...tags].sort((a, b) => a.localeCompare(b, 'ja'));
  };
  roots.sort(sortNodes);
  roots.forEach((r) => visit(r, 0));

  return { roots, byId, flat };
}

/** ルートから自身までのノード列 */
export function ancestry(node: TopicNode): TopicNode[] {
  const path: TopicNode[] = [];
  for (let n: TopicNode | null = node; n; n = n.parent) path.unshift(n);
  return path;
}

export function countDescendants(node: TopicNode): number {
  return node.children.reduce((sum, c) => sum + 1 + countDescendants(c), 0);
}

export function allTags(tree: TopicTree): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const node of tree.flat) {
    for (const t of node.entry.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  const slugs = new Map<string, string>();
  for (const tag of counts.keys()) {
    const other = slugs.get(tagSlug(tag));
    if (other !== undefined) throw new Error(`タグ "${other}" と "${tag}" の URL が同じ "${tagSlug(tag)}" になります。どちらかの表記を変えてください。`);
    slugs.set(tagSlug(tag), tag);
  }
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'ja'));
}

/** base を考慮した URL を返す */
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const p = path.replace(/^\/|\/$/g, '');
  return p ? `${base}/${p}/` : `${base}/`;
}

export function topicUrl(id: string): string {
  return url(`topics/${id}`);
}

/** タグを URL の1階層に収まる文字列にする（「UI/UX」の / などをハイフンに置き換える） */
export function tagSlug(tag: string): string {
  return tag.trim().replace(/[\s/\\?#%]+/g, '-');
}

export function tagUrl(tag: string): string {
  return url(`tags/${encodeURIComponent(tagSlug(tag))}`);
}
