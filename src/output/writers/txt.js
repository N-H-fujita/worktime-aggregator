const fs = require("fs");
const path = require("path");
const os = require("os");
const { formatSeconds } = require("../../lib/utils");

/**
 * { taskName: seconds } を出力する
 * @param {string[]} lines
 * @param {Record<string, number>} totals
 * @param {Record<string, string>} taskMap // code -> name
 */
function pushTotalsByTaskMapOrder(lines, totals, taskMap) {
  const taskNames = Object.values(taskMap);

  for (const taskName of taskNames) {
    const seconds = totals?.[taskName];
    if (!Number.isFinite(seconds) || seconds <= 0) continue;
    lines.push(`${taskName}: ${formatSeconds(seconds)}`);
  }
}

/**
 * txt 出力用フォーマット
 * @param {Object} params
 * @param {Object} params.teamTotals - { taskName: seconds, ... }（全体合計）
 * @param {Object} params.employeeTotals - { a001: { taskName: seconds } } を想定
 * @param {Object} [params.employeeMap] - { a001: "山田", ... } を想定
 * @param {number} params.year
 * @param {string} params.monthStr - "02" など
 * @returns {string}
 */
function formatText({ teamTotals, employeeTotals, taskMap, employeeMap, year, monthStr }) {
  const lines = [];

  const header = `${year}年${monthStr}月 集計結果`;
  lines.push(`=== ${header} ===`);
  lines.push("");

  // --- 全体合計（タスク別） ---
  lines.push("---【全体合計（タスク別）】---");
  pushTotalsByTaskMapOrder(lines, teamTotals, taskMap);

  // --- 社員別 ---
  lines.push("");
  lines.push("---【社員別集計】---");
  for (const [empId, tasks] of Object.entries(employeeTotals)) {
    const empName = employeeMap?.[empId] || empId;
    lines.push(`-- ${empName} (${empId}) --`);

    pushTotalsByTaskMapOrder(lines, tasks, taskMap);
    lines.push("");
  }

  return lines.join(os.EOL);
}

/**
 * txt を出力する
 * @returns {{ dir: string, filePath: string }}
 */
function writeTxt({
  dir,
  fileName,
  teamTotals,
  employeeTotals,
  taskMap,
  employeeMap,
  year,
  monthStr,
}) {
  const filePath = path.join(dir, fileName);
  const content = formatText({ teamTotals, employeeTotals, taskMap, employeeMap, year, monthStr });
  fs.writeFileSync(filePath, content, "utf8");
  return { dir, filePath };
}

module.exports = { writeTxt, formatText };