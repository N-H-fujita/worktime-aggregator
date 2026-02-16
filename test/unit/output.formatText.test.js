const test = require('node:test');
const assert = require('node:assert/strict');

const { formatText } = require('../../src/output/writers/txt');

test('formatText: taskMapの順で出力される（全体合計）', () => {
  const taskMap = { T100: '案件A', T200: '案件B' };
  const employees = { a001: '山田', a002: '田中' };

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

  // === 全体合計ブロックだけ切り出す（見出しは実フォーマットに合わせて） ===
  const start = text.indexOf('全体合計');
  assert.ok(start !== -1);

  const end = text.indexOf('社員別', start);
  const section = end === -1 ? text.slice(start) : text.slice(start, end);

  // 1) taskMap順（案件A → 案件B）
  const idxA = section.indexOf('案件A');
  const idxB = section.indexOf('案件B');
  assert.ok(idxA !== -1 && idxB !== -1);
  assert.ok(idxA < idxB);

  // 2) formatSecondsの仕様に合わせた表記（hoursゼロ埋めなし）
  assert.match(section, /案件A.*1:01:01/);
  assert.match(section, /案件B.*0:01:00/);

  // 3) 社員別集計が存在し、社員IDが出る（ざっくり）
  assert.ok(text.includes('a001'));
  assert.ok(text.includes('a002'));
});

