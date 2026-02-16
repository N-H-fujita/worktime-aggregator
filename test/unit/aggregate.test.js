const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

const { makeTmpDir } = require('../helpers/tmpDir');

const { aggregateCSV } = require('../../src/aggregate');

test('aggregateCSV: taskMap対象だけ集計し、社員別も正しい', async () => {
  const localDir = await makeTmpDir();

  const monthKey = '2026-02';
  const employees = { a001: '山田', a002: '田中' };
  const taskMap = { T100: '案件A', T200: '案件B' };

  const csvA001 = [
    '業務コード,経過時間',
    'T100,"3,661"', // ← 修正（ダブルクォートで囲む）
    'X999,120',
    'T200,60'
  ].join('\n');


  const csvA002 = [
    '業務コード,経過時間',
    'T100,3600'
  ].join('\n');

  await fs.writeFile(path.join(localDir, `${monthKey}_a001.csv`), csvA001, 'utf8');
  await fs.writeFile(path.join(localDir, `${monthKey}_a002.csv`), csvA002, 'utf8');

  const fileNames = [`${monthKey}_a001.csv`, `${monthKey}_a002.csv`];
  const employeeIds = Object.keys(employees);

  const { teamTotals, employeeTotals } = await aggregateCSV(
    fileNames,
    localDir,
    taskMap,
    employeeIds
  );

  assert.equal(teamTotals['案件A'], 7261);
  assert.equal(teamTotals['案件B'], 60);

  assert.equal(employeeTotals.a001['案件A'], 3661);
  assert.equal(employeeTotals.a001['案件B'], 60);
  assert.equal(employeeTotals.a002['案件A'], 3600);
});

test('aggregateCSV: missing csv -> warn and continue', async () => {
  const localDir = await makeTmpDir();

  const monthKey = '2026-02';
  const employees = { a001: '山田' };
  const taskMap = { T100: '案件A' };

  const originalWarn = console.warn;
  const warns = [];
  console.warn = (...args) => warns.push(args.map(String).join(' '));

  const fileNames = [`${monthKey}_a001.csv`]; // 作らない
  const employeeIds = Object.keys(employees);

  try {
    const { teamTotals, employeeTotals } = await aggregateCSV(
      fileNames,
      localDir,
      taskMap,
      employeeIds
    );

    assert.ok(warns.length >= 1);

    // ここは実装次第で {} じゃない可能性あり（落ちたら合わせる）
    assert.deepEqual(teamTotals, {});
    assert.deepEqual(employeeTotals, { a001: {} });
  } finally {
    console.warn = originalWarn;
  }
});
