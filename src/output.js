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
 * CSV用に値をエスケープする（カンマ/改行/ダブルクォート対応）
 * @param {string | number} value
 * @returns {string}
 */
function csvEscape(value) {
  const s = String(value);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

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
 * 集計結果を出力する（txt/json/csv を outputFlags で出し分け）
 * 出力先:
 * - txt:  OUTPUT_DIR/txt/YYYY-MM/summary.txt
 * - json: OUTPUT_DIR/json/YYYY-MM/summary.json
 * - csv:  OUTPUT_DIR/csv/YYYY-MM/summary.csv
 * @returns {{ outputs: { txt?: { dir: string, filePath: string }, json?: { dir: string, filePath: string } } }}
 */
function writeOutput({
  teamTotals,
  employeeTotals,
  taskMap,
  employeeMap,
  outputFlags,
  outputDir,
  year,
  monthStr,
}) {
  if (!outputDir) {
    throw new Error("outputDir is required (set OUTPUT_DIR in .env)");
  }
  if (!outputFlags) {
    throw new Error("outputFlags is required");
  }

  const outputs = {};

  // --- txt ---
  if (outputFlags.txt) {
    const periodDir = path.join(outputDir, "txt", `${year}-${monthStr}`);
    ensureDir(periodDir);

    const filePath = path.join(periodDir, "summary.txt");
    const content = formatText({ teamTotals, employeeTotals, taskMap, employeeMap, year, monthStr });

    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ txt 出力完了: ${filePath}`);

    outputs.txt = { dir: periodDir, filePath };
  }

  // --- json ---
  if (outputFlags.json) {
    const periodDir = path.join(outputDir, "json", `${year}-${monthStr}`);
    ensureDir(periodDir);

    const filePath = path.join(periodDir, "summary.json");

    const payload = {
      year,
      month: monthStr,
      generatedAt: new Date().toISOString(),
      teamTotals,
      employeeTotals,
      employees: employeeMap || {},
      tasks: taskMap || {},
    };

  // --- csv ---
  if (outputFlags.csv) {
    const periodDir = path.join(outputDir, "csv", `${year}-${monthStr}`);
    ensureDir(periodDir);

    const filePath = path.join(periodDir, "summary.csv");

    const lines = [];
    lines.push("year,month,employeeId,employeeName,taskName,seconds");

    // employeeTotals: { a001: { taskName: seconds } }
    for (const [empId, tasks] of Object.entries(employeeTotals)) {
      const empName = employeeMap?.[empId] || empId;

      // taskMap の定義順で出したい場合（txtと整合）
      const taskNames = Object.values(taskMap);
      for (const taskName of taskNames) {
        const seconds = tasks?.[taskName];
        if (!Number.isFinite(seconds) || seconds <= 0) continue;

        const row = [
          year,
          monthStr,
          empId,
          empName,
          taskName,
          seconds,
        ].map(csvEscape).join(",");

        lines.push(row);
      }
    }

    fs.writeFileSync(filePath, lines.join(os.EOL), "utf8");
    console.log(`✅ csv 出力完了: ${filePath}`);

    outputs.csv = { dir: periodDir, filePath };
  }


    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");
    console.log(`✅ json 出力完了: ${filePath}`);

    outputs.json = { dir: periodDir, filePath };
  }

  return { outputs };
}

module.exports = { writeOutput, formatText };

