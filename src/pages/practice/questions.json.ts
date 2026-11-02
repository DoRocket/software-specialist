import type { APIRoute } from 'astro';
import { ancestry, getTopicTree, topicUrl } from '../../lib/topics';
import { rich } from '../../lib/rich';

/**
 * 演習モード用に、全記事の確認問題をまとめた JSON を出力する（ビルド時に生成）。
 * 数式などは HTML に描画済みにして、閲覧側では計算しない。
 */
export const GET: APIRoute = async () => {
  const tree = await getTopicTree();
  const questions = tree.flat.flatMap((node) => {
    const d = node.entry.data;
    const path = ancestry(node);
    return d.quiz.map((item, index) => ({
      topic: node.id,
      index,
      title: d.title,
      url: topicUrl(node.id),
      root: path[0].id,
      rootTitle: path[0].entry.data.title,
      exams: d.exams,
      level: item.level ?? null,
      q: rich(item.q),
      choices: item.choices.map(rich),
      answer: item.answer,
      explanation: rich(item.explanation),
    }));
  });
  return new Response(JSON.stringify(questions), { headers: { 'Content-Type': 'application/json' } });
};
