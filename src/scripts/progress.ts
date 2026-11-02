/**
 * 学習の記録（確認問題・演習モードの解答結果）をブラウザの localStorage に保存する。
 * 記録は「トピックごと・問題ごとの最新の正誤」だけを持つ。保存できない環境では何もしない。
 */
const STORAGE_KEY = 'ss:progress:v1';

export interface TopicRecord {
  /** 問題番号（0 始まり）→ 最新の正誤 */
  answers: Record<string, boolean>;
  /** 最後に解いた日時（ミリ秒） */
  updatedAt: number;
}
export type ProgressData = Record<string, TopicRecord>;

export function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    return data && typeof data === 'object' ? (data as ProgressData) : {};
  } catch {
    return {};
  }
}

function save(data: ProgressData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // 保存できない（プライベートブラウズ・容量不足など）場合は記録しない
  }
}

export function recordAnswer(topicId: string, index: number, correct: boolean) {
  const data = loadProgress();
  const rec = data[topicId] ?? { answers: {}, updatedAt: 0 };
  rec.answers[String(index)] = correct;
  rec.updatedAt = Date.now();
  data[topicId] = rec;
  save(data);
}

export function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 同上
  }
}

export interface TopicSummary {
  answered: number;
  correct: number;
  total: number;
}

/** 記録と問題数から、トピックの解答状況を集計する（記録が問題数より多い場合は問題数までを数える） */
export function summarize(rec: TopicRecord | undefined, total: number): TopicSummary {
  if (!rec) return { answered: 0, correct: 0, total };
  let answered = 0;
  let correct = 0;
  for (const [k, ok] of Object.entries(rec.answers)) {
    if (Number(k) >= total) continue;
    answered++;
    if (ok) correct++;
  }
  return { answered, correct, total };
}

export type TopicStatus = 'none' | 'started' | 'weak' | 'mastered';

/**
 * 状態の判定:
 * - mastered: 全問に解答し、最新の解答がすべて正解
 * - weak: 2問以上解いて正答率が 60% 未満
 * - started: 1問以上解いた
 */
export function statusOf(s: TopicSummary): TopicStatus {
  if (s.answered === 0 || s.total === 0) return 'none';
  if (s.answered >= s.total && s.correct === s.total) return 'mastered';
  if (s.answered >= 2 && s.correct / s.answered < 0.6) return 'weak';
  return 'started';
}

export const STATUS_LABEL: Record<TopicStatus, string> = {
  none: '未挑戦',
  started: '挑戦中',
  weak: '要復習',
  mastered: '全問正解',
};
