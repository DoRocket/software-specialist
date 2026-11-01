/**
 * 論理ゲート（MIL 記号）の形。座標は高さ 60 の枠内（左上が原点）。
 * 入力は左端、出力は右端（out の x 座標）。2入力ゲートの入力は y = 15 と 45、NOT は y = 30。
 */
export type GateType = 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR';

export interface GateShape {
  /** 本体（塗りつぶす閉じたパス） */
  body: string;
  /** XOR の入力側の二重線など、線だけのパス */
  extra?: string;
  /** 否定の小円 */
  bubble?: { cx: number; cy: number; r: number };
  /** 出力端の x 座標（y は 30） */
  out: number;
  /** 入力端の y 座標 */
  inputs: number[];
}

const AND = 'M0,0 H40 A30,30 0 0 1 40,60 H0 Z';
const OR = 'M0,0 Q38,0 70,30 Q38,60 0,60 Q16,30 0,0 Z';

export const GATES: Record<GateType, GateShape> = {
  AND: { body: AND, out: 70, inputs: [15, 45] },
  OR: { body: OR, out: 70, inputs: [15, 45] },
  NOT: { body: 'M0,4 L54,30 L0,56 Z', bubble: { cx: 60, cy: 30, r: 6 }, out: 66, inputs: [30] },
  XOR: {
    body: 'M10,0 Q48,0 80,30 Q48,60 10,60 Q26,30 10,0 Z',
    extra: 'M0,0 Q16,30 0,60',
    out: 80,
    inputs: [15, 45],
  },
  NAND: { body: AND, bubble: { cx: 76, cy: 30, r: 6 }, out: 82, inputs: [15, 45] },
  NOR: { body: OR, bubble: { cx: 76, cy: 30, r: 6 }, out: 82, inputs: [15, 45] },
};

export const GATE_INFO: Record<GateType, { name: string; expr: string; fn: (a: number, b: number) => number }> = {
  AND: { name: '論理積', expr: 'Y = A・B', fn: (a, b) => a & b },
  OR: { name: '論理和', expr: 'Y = A + B', fn: (a, b) => a | b },
  NOT: { name: '否定', expr: 'Y = ¬A', fn: (a) => 1 - a },
  XOR: { name: '排他的論理和', expr: 'Y = A ⊕ B', fn: (a, b) => a ^ b },
  NAND: { name: '否定論理積', expr: 'Y = ¬(A・B)', fn: (a, b) => 1 - (a & b) },
  NOR: { name: '否定論理和', expr: 'Y = ¬(A + B)', fn: (a, b) => 1 - (a | b) },
};
