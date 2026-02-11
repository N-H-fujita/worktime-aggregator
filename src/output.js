// src/output.js
const fs = require("fs");
const path = require("path");
const os = require("os");
const { formatSeconds } = require("./lib/utils");

/**
 * 出力先ディレクトリを保証する
 * @param {string} dir
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * { taskName: seconds } を出力する
 * @param {string[]} lines
 * @param {Record<string, number>} totals
 * @param {Record<string, string>} taskMap // code -> name
 */
function pushTotalsByTaskMapOrder(lines, totals, taskMap) {
  const taskNames = Object.values(taskMap);

  for(const taskName of taskNames) {
    const seconds = totals?.[taskName];
    if(!Number.isFinite(seconds) || seconds <= 0) continue;
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
 * 集計結果を txt で出力する
 * 出力先: OUTPUT_DIR/YYYY-MM/summary.txt
 * @returns {{ dir: string, filePath: string }}
 */
function writeOutput({ teamTotals, employeeTotals, taskMap, employeeMap, outputDir, year, monthStr }) {
  if (!outputDir) {
    throw new Error("outputDir is required (set OUTPUT_DIR in .env)");
  }

  const periodDir = path.join(outputDir, `${year}-${monthStr}`);
  ensureDir(periodDir);

  const filePath = path.join(periodDir, "summary.txt");

  const content = formatText({ teamTotals, employeeTotals, taskMap, employeeMap, year, monthStr });

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`✅ 出力完了: ${filePath}`);

  return { dir: periodDir, filePath };
}

module.exports = { writeOutput, formatText };

