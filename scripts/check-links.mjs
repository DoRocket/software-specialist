// ビルド済みの dist/ 内の HTML を走査し、サイト内リンク（href / src）の参照先が存在するか検査する。
// BASE_PATH を指定してビルドした場合は同じ値を渡すこと。
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';

const root = 'dist';
const base = (process.env.BASE_PATH || '/').replace(/\/$/, '');

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* htmlFiles(p);
    else if (p.endsWith('.html')) yield p;
  }
}

const exists = (p) => (existsSync(p) && statSync(p).isFile()) || existsSync(join(p, 'index.html'));

let pages = 0;
let checked = 0;
const broken = [];
for (const file of htmlFiles(root)) {
  pages++;
  const html = readFileSync(file, 'utf8');
  for (const [, link] of html.matchAll(/(?:href|src)="([^"#?]+)/g)) {
    if (/^[a-z]+:/i.test(link)) continue; // http:, mailto: などの外部リンク
    checked++;
    let target;
    if (link.startsWith('/')) {
      if (base && !link.startsWith(`${base}/`)) {
        broken.push([file, link]);
        continue;
      }
      target = join(root, link.slice(base.length));
    } else {
      target = normalize(join(dirname(file), link));
    }
    if (!exists(decodeURIComponent(target))) broken.push([file, link]);
  }
}

if (pages === 0) {
  console.error(`${root}/ に HTML がありません。先に npm run build を実行してください。`);
  process.exit(1);
}
if (broken.length) {
  for (const [file, link] of broken) console.error(`リンク切れ: ${file} -> ${link}`);
  process.exit(1);
}
console.log(`${pages} ページ・${checked} 件のサイト内リンクを検査しました。リンク切れはありません。`);
