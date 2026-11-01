/** data-on-steps に渡す「from〜to のステップ番号の並び」（例: range(2, 4) → "2 3 4"） */
export function range(from: number, to: number): string {
  const r: number[] = [];
  for (let i = from; i <= to; i++) r.push(i);
  return r.join(' ');
}
