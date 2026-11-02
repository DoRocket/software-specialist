/**
 * 試験（資格）の定義。
 * コンテンツは試験ごとではなく技術の階層で整理し、各トピックの `exams` に
 * ここで定義した id を付けることで「どの試験範囲に含まれるか」を表す。
 * 新しい試験（例: 情報処理安全確保支援士 = sc）を追加する場合はここに追記し、
 * src/styles/global.css に色（--exam-<id> と .exam-<id>）を足す。
 * - group: 試験の系統（一覧での見出しに使う）
 * - note: 一覧に添える補足（IT系は ITSS のレベル）
 */
export const exams = [
  { id: 'ip', name: 'ITパスポート試験', short: 'IP', group: 'IT系', note: 'ITSS レベル1' },
  { id: 'fe', name: '基本情報技術者試験', short: 'FE', group: 'IT系', note: 'ITSS レベル2' },
  { id: 'ap', name: '応用情報技術者試験', short: 'AP', group: 'IT系', note: 'ITSS レベル3' },
  { id: 'boki3', name: '日商簿記検定 3級', short: '簿記3', group: '会計系', note: '商業簿記' },
] as const;

export type ExamId = (typeof exams)[number]['id'];

export const examIds = exams.map((e) => e.id) as [ExamId, ...ExamId[]];

export const examById = Object.fromEntries(exams.map((e) => [e.id, e])) as Record<
  ExamId,
  (typeof exams)[number]
>;
