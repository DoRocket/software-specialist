/**
 * 学習の記録をサイト内の一覧に反映する。
 * - ツリー（サイドバー・全体マップ）の各項目に状態（全問正解・要復習・挑戦中）の印を付ける
 * - 分野カードに、配下の確認問題の解答率と正解数のバーを出す
 */
import { STATUS_LABEL, loadProgress, statusOf, summarize } from './progress';

const data = loadProgress();

for (const li of document.querySelectorAll<HTMLElement>('ul.tree li[data-quiz-count]')) {
  const s = summarize(data[li.dataset.topic!], Number(li.dataset.quizCount));
  const status = statusOf(s);
  if (status === 'none') continue;
  li.dataset.status = status;
  const label = li.querySelector<HTMLElement>(':scope > details > summary .tree-label, :scope > .tree-leaf .tree-label');
  if (label && !label.querySelector('.progress-mark')) {
    const mark = document.createElement('span');
    mark.className = `progress-mark is-${status}`;
    mark.title = `${STATUS_LABEL[status]}（${s.correct}/${s.total} 問正解）`;
    mark.setAttribute('aria-label', mark.title);
    label.append(mark);
  }
}

for (const card of document.querySelectorAll<HTMLElement>('[data-card-progress]')) {
  let total = 0;
  let answered = 0;
  let correct = 0;
  for (const pair of card.dataset.cardProgress!.split(' ').filter(Boolean)) {
    const [id, n] = pair.split(':');
    const s = summarize(data[id], Number(n));
    total += s.total;
    answered += s.answered;
    correct += s.correct;
  }
  if (answered === 0 || total === 0) continue;
  card.querySelector<HTMLElement>('[data-card-progress-fill]')!.style.width = `${Math.round((correct / total) * 100)}%`;
  card.querySelector<HTMLElement>('[data-card-progress-text]')!.textContent = `${correct} / ${total} 問正解`;
  card.hidden = false;
}
