import katex from 'katex';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * 確認問題などの短い文を HTML にする。$数式$ は KaTeX で描画し、`コード` は <code> にする。
 * それ以外はエスケープしたテキスト（改行は <br>）。
 */
export function rich(text: string): string {
  return text
    .split(/(\$[^$]+\$|`[^`]+`)/g)
    .map((part) => {
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        return katex.renderToString(part.slice(1, -1), { throwOnError: false, strict: 'ignore', output: 'html' });
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return `<code>${escapeHtml(part.slice(1, -1))}</code>`;
      }
      return escapeHtml(part).replace(/\n/g, '<br>');
    })
    .join('');
}

/** 選択肢の記号（ア〜オ） */
export const CHOICE_LABELS = ['ア', 'イ', 'ウ', 'エ', 'オ'];
