// Sätteri（Astro 7 標準の Markdown 処理系）用のプラグイン。
// features.math で $...$ / $$...$$ は <code class="math-inline"> / <pre><code class="math-display"> になるので、
// それをビルド時に KaTeX で描画した HTML に置き換える（閲覧時に JavaScript は不要）。
import katex from 'katex';

/** @param {string} tex @param {boolean} displayMode */
function render(tex, displayMode) {
  return katex.renderToString(tex, {
    displayMode,
    output: 'html',
    // 書き間違いはビルドを止めずに赤字で表示する（ページを開けば気付ける）
    throwOnError: false,
    // \text{} の外に日本語を書いても警告で止めない
    strict: 'ignore',
  });
}

/** @param {any} node */
const classes = (node) => node?.properties?.className ?? [];
/** @param {any} node */
const textOf = (node) => (node?.children ?? []).map((c) => c.value ?? '').join('');

/** @type {import('satteri').HastPluginDefinition} */
export const katexPlugin = {
  name: 'katex',
  element: [
    {
      filter: ['code'],
      visit(node) {
        if (!classes(node).includes('math-inline')) return;
        return { type: 'raw', value: render(textOf(node), false) };
      },
    },
    {
      filter: ['pre'],
      visit(node) {
        const code = node.children?.[0];
        if (!classes(code).includes('math-display')) return;
        return { type: 'raw', value: `<div class="math-display">${render(textOf(code), true)}</div>` };
      },
    },
  ],
};

/**
 * MDX 用。MDX は raw HTML ノードを出力できないため、mdast の段階で
 * { raw, mdxExpressions: false }（HTML を JSX として取り込む）に置き換える。
 * @type {import('satteri').MdastPluginDefinition}
 */
export const katexMdxPlugin = {
  name: 'katex-mdx',
  math(node) {
    return { raw: `<div class="math-display">${render(node.value, true)}</div>`, mdxExpressions: false };
  },
  inlineMath(node) {
    return { raw: render(node.value, false), mdxExpressions: false };
  },
};
