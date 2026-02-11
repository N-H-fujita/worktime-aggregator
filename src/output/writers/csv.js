// src/output/writers/csv.js
const fs = require("fs");
const path = require("path");
const os = require("os");

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
 * csv を出力する（縦持ち）
 * @returns {{ dir: string, filePath: string }}
 */
function writeCsv({ dir, fileName, employeeTotals, taskMap, employeeMap, year, monthStr }) {
  const filePath = path.join(dir, fileName);

  const lines = [];
  lines.push("year,month,employeeId,employeeName,taskName,seconds");

  for (const [empId, tasks] of Object.entries(employeeTotals)) {
    const empName = employeeMap?.[empId] || empId;

    // taskMap 定義順（txtと合わせる）
    const taskNames = Object.values(taskMap);
    for (const taskName of taskNames) {
      const seconds = tasks?.[taskName];
      if (!Number.isFinite(seconds) || seconds <= 0) continue;

      const row = [year, monthStr, empId, empName, taskName, seconds]
        .map(csvEscape)
        .join(",");

      lines.push(row);
    }
  }

  fs.writeFileSync(filePath, lines.join(os.EOL), "utf8");
  return { dir, filePath };
}

module.exports = { writeCsv, csvEscape };
