/**
 * ステップ再生の補助: 「ステップ 2〜4 のあいだだけ表示する」「この行をステップ 3 で強調する」のような
 * 範囲指定を扱う（stepper.ts の data-step は「n 以降ずっと」、data-step-only は「n のときだけ」）。
 *
 *   <g data-on-steps="2 3 4">…</g>   … 現在のステップが 2・3・4 のとき .is-on が付く
 *
 * 見た目（.is-on で表示する／強調する など）は各部品の <style> で決める。
 * stepper.ts が figure[data-stepper] に書く data-current を監視して切り替える。
 */
function setupStepOn(root: HTMLElement) {
  const els = root.querySelectorAll<HTMLElement | SVGElement>('[data-on-steps]');
  if (!els.length) return;
  const update = () => {
    const cur = root.dataset.current ?? '0';
    for (const el of els) {
      el.classList.toggle('is-on', (el.dataset.onSteps ?? '').split(' ').includes(cur));
    }
  };
  new MutationObserver(update).observe(root, { attributes: true, attributeFilter: ['data-current'] });
  update();
}

document.querySelectorAll<HTMLElement>('[data-stepper]').forEach(setupStepOn);

export {};
