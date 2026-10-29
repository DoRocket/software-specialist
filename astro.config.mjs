// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages などサブパスで公開する場合は SITE / BASE_PATH 環境変数で上書きする
export default defineConfig({
  site: process.env.SITE ?? 'http://localhost:4321',
  base: process.env.BASE_PATH ?? '/',
  trailingSlash: 'always',
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
