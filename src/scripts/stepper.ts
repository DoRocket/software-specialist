/**
 * 図のステップ再生エンジン。
 *
 * マークアップの約束:
 *   <figure data-stepper data-steps="4">
 *     <g data-step="2">…</g>        … ステップ 2 以降で表示（それまでは非表示）
 *     <g data-step="2" data-step-until="4">… ステップ 2〜4 のあいだだけ表示（data-step 省略時は 0 から）
 *     <p data-step-only="2">…</p>   … ステップ 2 のときだけ表示（説明文など）
 *     <button data-stepper-act="prev|next|play|reset">
 *     <span data-stepper-count>     … 「2 / 4」の表示先
 *   </figure>
 *
 * 現在のステップの要素には .is-current が付くので、CSS で「今動いたもの」を強調できる。
 * 画面に入ったら自動再生する（prefers-reduced-motion が有効なら自動再生しない）。
 * 自動再生の間隔は data-interval（ミリ秒）で図ごとに変えられる。
 */
const DEFAULT_INTERVAL_MS = 2500;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setup(root: HTMLElement) {
  const total = Number(root.dataset.steps ?? 0);
  if (!total) return;
  const interval = Number(root.dataset.interval) || DEFAULT_INTERVAL_MS;
  let current = 0;
  let timer: number | undefined;
  const playBtn = root.querySelector<HTMLButtonElement>('[data-stepper-act="play"]');

  const render = () => {
    for (const el of root.querySelectorAll<HTMLElement | SVGElement>('[data-step], [data-step-until]')) {
      const from = Number(el.dataset.step ?? 0);
      const until = el.dataset.stepUntil === undefined ? Infinity : Number(el.dataset.stepUntil);
      el.classList.toggle('is-visible', from <= current && current <= until);
      el.classList.toggle('is-current', from === current);
    }
    for (const el of root.querySelectorAll<HTMLElement | SVGElement>('[data-step-only]')) {
      el.classList.toggle('is-visible', Number(el.dataset.stepOnly) === current);
    }
    for (const el of root.querySelectorAll<HTMLElement>('[data-stepper-count]')) {
      el.textContent = `${current} / ${total}`;
    }
    root.dataset.current = String(current);
  };

  const stop = () => {
    window.clearInterval(timer);
    timer = undefined;
    if (playBtn) {
      playBtn.textContent = '▶ 再生';
      playBtn.setAttribute('aria-pressed', 'false');
    }
  };

  const play = () => {
    if (current >= total) current = 0;
    render();
    if (playBtn) {
      playBtn.textContent = '❚❚ 一時停止';
      playBtn.setAttribute('aria-pressed', 'true');
    }
    timer = window.setInterval(() => {
      current++;
      render();
      if (current >= total) stop();
    }, interval);
  };

  root.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-stepper-act]');
    if (!btn || !root.contains(btn)) return;
    const act = btn.dataset.stepperAct;
    if (act === 'play') {
      if (timer === undefined) play();
      else stop();
      return;
    }
    stop();
    if (act === 'prev') current = Math.max(0, current - 1);
    if (act === 'next') current = Math.min(total, current + 1);
    if (act === 'reset') current = 0;
    render();
  });

  render();

  if (!reducedMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          play();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(root);
  }
}

document.querySelectorAll<HTMLElement>('[data-stepper]').forEach(setup);
