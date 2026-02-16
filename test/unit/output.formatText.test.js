const test = require('node:test');
const assert = require('node:assert/strict');

const { formatText } = require('../../src/output/writers/txt');

/**
 * formatText のテスト目的：
 *
 * 1) 全体合計（タスク別）が taskMap の定義順で出力されること
 *    → teamTotals の順番には依存しない
 *
 * 2) 秒数が formatSeconds の仕様で文字列化されること
 *    → hours はゼロ埋めしない（例: 3661秒 → "1:01:01"）
 *
 * 3) 社員別集計ブロックが存在し、社員IDが出力に含まれること
 *
 * ※ 文字列の完全一致ではなく、構造と主要部分のみを検証する
 */
test('formatText: taskMapの順で出力される（全体合計）', () => {

  // taskMapの定義順が出力順の基準になる
  const taskMap = { T100: '案件A', T200: '案件B' };

  // 社員情報（現仕様では社員名は出力に必須ではない）
  const employees = { a001: '山田', a002: '田中' };

  // わざと順番を崩す（出力がtaskMap順になることを確認するため）
  const teamTotals = { '案件B': 60, '案件A': 3661 };

  const employeeTotals = {
    a001: { '案件A': 1, '案件B': 2 },
    a002: { '案件A': 3600 },
  };

  const text = formatText({
    monthKey: '2026-02',
    teamTotals,
    employeeTotals,
    employees,
    taskMap,
  });

  // ===== 全体合計ブロックのみを対象に検証 =====

  // 「全体合計」見出しが存在すること
  const start = text.indexOf('全体合計');
  assert.ok(start !== -1);

  // 「社員別」見出しまでを切り出す
  const end = text.indexOf('社員別', start);
  const section = end === -1 ? text.slice(start) : text.slice(start, end);

  // 1) taskMap順で並んでいること（案件A → 案件B）
  const idxA = section.indexOf('案件A');
  const idxB = section.indexOf('案件B');
  assert.ok(idxA !== -1 && idxB !== -1);
  assert.ok(idxA < idxB);

  // 2) 秒数フォーマット確認
  // 案件A = 3661秒 → 1:01:01
  // 案件B = 60秒   → 0:01:00
  assert.match(section, /案件A.*1:01:01/);
  assert.match(section, /案件B.*0:01:00/);

  // 3) 社員別集計が存在すること（社員IDが出力に含まれる）
  assert.ok(text.includes('a001'));
  assert.ok(text.includes('a002'));
});

