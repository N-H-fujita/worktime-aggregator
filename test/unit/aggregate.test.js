const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

const { makeTmpDir } = require('../helpers/tmpDir');
const { aggregateCSV } = require('../../src/aggregate');

/**
 * aggregateCSV のテスト目的：
 *
 * 1) taskMap に含まれる業務コードのみ集計する（taskMap外は無視）
 * 2) 経過時間のカンマ入り数値（例: "3,661"）を正しく数値化して合算する
 *    - CSVとしてカンマ入り値はクォートが必須（"3,661"）
 * 3) teamTotals（全体）と employeeTotals（社員別）が正しく構築される
 * 4) CSVが欠損していても warn して処理を継続する
 *
 * 注意：aggregateCSV は位置引数
 *   aggregateCSV(fileNames, localDir, taskMap, employeeIds)
 */

test('aggregateCSV: taskMap対象だけ集計し、社員別も正しい', async () => {
  // テスト用の隔離ディレクトリ（本番フォルダを汚さない）
  const localDir = await makeTmpDir();

  const monthKey = '2026-02';
  const employees = { a001: '山田', a002: '田中' };
  const employeeIds = Object.keys(employees);

  // taskMap の対象コードだけを集計する
  const taskMap = { T100: '案件A', T200: '案件B' };

  /**
   * テストCSVの意図：
   *
   * a001:
   * - T100: "3,661" → 3661秒（カンマ除去の確認）
   * - X999: taskMap外 → 無視される確認
   * - T200: 60秒
   *
   * a002:
   * - T100: 3600秒
   *
   * 期待値：
   * - 案件A = 3661 + 3600 = 7261
   * - 案件B = 60
   */
  const csvA001 = [
    '業務コード,経過時間',
    'T100,"3,661"', // CSV上でカンマ入り値はクォート必須
    'X999,120',     // taskMap外 → 無視される
    'T200,60',
  ].join('\n');

  const csvA002 = [
    '業務コード,経過時間',
    'T100,3600',
  ].join('\n');

  // 実ファイルとして配置（aggregateCSV はファイル読み込み前提）
  await fs.writeFile(path.join(localDir, `${monthKey}_a001.csv`), csvA001, 'utf8');
  await fs.writeFile(path.join(localDir, `${monthKey}_a002.csv`), csvA002, 'utf8');

  const fileNames = [`${monthKey}_a001.csv`, `${monthKey}_a002.csv`];

  const { teamTotals, employeeTotals } = await aggregateCSV(
    fileNames,
    localDir,
    taskMap,
    employeeIds
  );

  // 全体合計（タスク別）
  assert.equal(teamTotals['案件A'], 7261);
  assert.equal(teamTotals['案件B'], 60);

  // 社員別集計
  assert.equal(employeeTotals.a001['案件A'], 3661);
  assert.equal(employeeTotals.a001['案件B'], 60);
  assert.equal(employeeTotals.a002['案件A'], 3600);
});

test('aggregateCSV: missing csv -> warn and continue', async () => {
  const localDir = await makeTmpDir();

  const monthKey = '2026-02';
  const employees = { a001: '山田' };
  const employeeIds = Object.keys(employees);
  const taskMap = { T100: '案件A' };

  /**
   * 目的：
   * - CSVが存在しない場合に console.warn されること
   * - 例外で落ちずに処理継続すること
   *
   * 実装仕様：
   * - employeeTotals は employeeIds を元に先に空オブジェクトを用意するため、
   *   CSVが無くても { a001: {} } の形になる
   */
  const originalWarn = console.warn;
  const warns = [];
  console.warn = (...args) => warns.push(args.map(String).join(' '));

  try {
    // a001 のCSVは作らない（missingを再現）
    const fileNames = [`${monthKey}_a001.csv`];

    const { teamTotals, employeeTotals } = await aggregateCSV(
      fileNames,
      localDir,
      taskMap,
      employeeIds
    );

    // warn が出て、落ちないこと
    assert.ok(warns.length >= 1);

    // 現実装では teamTotals は空、employeeTotals は社員分の空オブジェクトが残る
    assert.deepEqual(teamTotals, {});
    assert.deepEqual(employeeTotals, { a001: {} });
  } finally {
    console.warn = originalWarn;
  }
});

