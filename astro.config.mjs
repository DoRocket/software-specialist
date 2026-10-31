// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { satteri } from '@astrojs/markdown-satteri';
import { katexMdxPlugin, katexPlugin } from './src/plugins/satteri-katex.mjs';

// GitHub Pages などサブパスで公開する場合は SITE / BASE_PATH 環境変数で上書きする
export default defineConfig({
  site: process.env.SITE || 'http://localhost:4321',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
  integrations: [
    mdx({
      // MDX は raw HTML ノードを出力できないため、mdast の段階で KaTeX の出力を JSX として取り込む
      processor: satteri({
        features: { math: true },
        mdastPlugins: [katexMdxPlugin],
      }),
    }),
  ],
  markdown: {
    // $...$（インライン）と $$...$$（ブロック）の数式を KaTeX で描画する
    processor: satteri({
      features: { math: true },
      hastPlugins: [katexPlugin],
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
