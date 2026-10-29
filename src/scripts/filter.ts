/**
 * 試験範囲・タグ・キーワードによるクライアントサイドの絞り込み。
 *
 * - 試験範囲はヘッダーのボタンで選び、localStorage に保存して全ページで共有する。
 * - ツリー（ul.tree）は「自身が条件に一致する」か「子孫に一致するものがある」項目を表示する。
 * - カード等は data-deep-exams（自身＋子孫の試験）で表示/非表示を切り替える。
 * - タグ・キーワードは全体マップページ（[data-tree-filter]）でのみ使う。
 */
const STORAGE_KEY = 'ss:exam-filter';

const state = {
  exams: new Set<string>(),
  tag: '',
  query: '',
};

function loadExams() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state.exams = new Set(JSON.parse(raw) as string[]);
  } catch {
    // 保存領域が使えない環境では絞り込みなしで表示する
  }
}

function saveExams() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.exams]));
  } catch {
    // 同上
  }
}

const words = (s: string | undefined) => (s ? s.split(' ').filter(Boolean) : []);
const examOk = (exams: string[]) => state.exams.size === 0 || exams.some((e) => state.exams.has(e));

function selfMatches(li: HTMLElement, narrowing: boolean): boolean {
  if (!examOk(words(li.dataset.exams))) return false;
  if (!narrowing) return true;
  if (state.tag && !(li.dataset.tags ?? '').split('\u001f').includes(state.tag)) return false;
  if (state.query && !(li.dataset.search ?? '').includes(state.query)) return false;
  return true;
}

/** li を後順でたどり表示可否を決める。戻り値は自身または子孫が一致したか */
function applyLi(li: HTMLElement, narrowing: boolean): { visible: boolean; matches: number } {
  let matches = 0;
  let childVisible = false;
  for (const child of li.querySelectorAll<HTMLElement>(':scope > details > ul.tree > li, :scope > ul.tree > li')) {
    const r = applyLi(child, narrowing);
    childVisible ||= r.visible;
    matches += r.matches;
  }
  const self = selfMatches(li, narrowing);
  if (self) matches++;
  const visible = self || childVisible;
  li.hidden = !visible;
  li.toggleAttribute('data-match', narrowing && self);
  // タグ・キーワードで絞り込み中は一致箇所が見えるよう展開する
  const details = li.querySelector<HTMLDetailsElement>(':scope > details');
  if (details && narrowing && childVisible) details.open = true;
  return { visible, matches };
}

function apply() {
  const narrowing = Boolean(state.tag || state.query);

  for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-exam-toggle]')) {
    btn.setAttribute('aria-pressed', String(state.exams.has(btn.dataset.examToggle!)));
  }

  // タグ・キーワードは [data-filter-scope] 内のツリー（全体マップ本体）にだけ適用する
  let total = 0;
  for (const tree of document.querySelectorAll<HTMLElement>('ul.tree')) {
    if (tree.parentElement?.closest('ul.tree')) continue; // ルートのツリーだけ処理
    const inScope = tree.closest('[data-filter-scope]') !== null;
    for (const li of tree.querySelectorAll<HTMLElement>(':scope > li')) {
      const { matches } = applyLi(li, inScope && narrowing);
      if (inScope) total += matches;
    }
  }

  for (const el of document.querySelectorAll<HTMLElement>('[data-deep-exams]')) {
    el.hidden = !examOk(words(el.dataset.deepExams));
  }

  for (const el of document.querySelectorAll<HTMLElement>('[data-out-of-scope]')) {
    el.hidden = examOk(words(el.dataset.outOfScope));
  }

  for (const el of document.querySelectorAll<HTMLElement>('[data-match-count]')) {
    el.textContent = String(total);
  }

  document.documentElement.toggleAttribute('data-exam-filtered', state.exams.size > 0);
}

function init() {
  loadExams();

  for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-exam-toggle]')) {
    btn.addEventListener('click', () => {
      const id = btn.dataset.examToggle!;
      if (state.exams.has(id)) state.exams.delete(id);
      else state.exams.add(id);
      saveExams();
      apply();
    });
  }

  for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-exam-clear]')) {
    btn.addEventListener('click', () => {
      state.exams.clear();
      saveExams();
      apply();
    });
  }

  const panel = document.querySelector<HTMLElement>('[data-tree-filter]');
  if (panel) {
    const params = new URLSearchParams(location.search);
    const tagSelect = panel.querySelector<HTMLSelectElement>('[data-tag-select]');
    const search = panel.querySelector<HTMLInputElement>('[data-search-input]');
    const reset = panel.querySelector<HTMLButtonElement>('[data-filter-reset]');

    state.tag = params.get('tag') ?? '';
    state.query = (params.get('q') ?? '').trim().toLowerCase();
    if (tagSelect) tagSelect.value = state.tag;
    if (search) search.value = params.get('q') ?? '';

    const syncUrl = () => {
      const p = new URLSearchParams();
      if (state.tag) p.set('tag', state.tag);
      if (search?.value.trim()) p.set('q', search.value.trim());
      const qs = p.toString();
      history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
    };

    tagSelect?.addEventListener('change', () => {
      state.tag = tagSelect.value;
      syncUrl();
      apply();
    });
    search?.addEventListener('input', () => {
      state.query = search.value.trim().toLowerCase();
      syncUrl();
      apply();
    });
    reset?.addEventListener('click', () => {
      state.tag = '';
      state.query = '';
      if (tagSelect) tagSelect.value = '';
      if (search) search.value = '';
      syncUrl();
      apply();
    });
  }

  apply();
}

init();
