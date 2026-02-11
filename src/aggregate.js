const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

/**
 * CSV集計（UTF-8前提・ヘッダー対応版）
 * @param {string[]} fileNames
 * @param {string} localDir
 * @param {Record<string, string>} taskMap 業務コード->業務名
 * @param {string[]} employeeIds 社員ID一覧(例: ["a001", "a002"])
 * @return {Promise<{teamTotals: Record<string, number>, employeeTotals: Record<string, Record<string, number>>}>}
 */
async function aggregateCSV(fileNames, localDir, taskMap, employeeIds) {

  const employeeIdSet = new Set(employeeIds);

  const teamTotals = {};
  const employeeTotals = {};

  for (const fileName of fileNames) {
    const filePath = path.join(localDir, fileName);

    // ファイル名例: "2025-10_a001.csv" → "a001"
    const empId = (fileName.split("_")[1] || "").replace(/\.csv$/i, "") || null;
    if (empId && employeeIdSet.size > 0 && !employeeIdSet.has(empId)) {
      continue;
    }

    if (empId && !employeeTotals[empId]) employeeTotals[empId] = {};

    // copy と方針を揃える：無ければ warn してスキップ
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠ 集計対象が存在しません: ${filePath}`);
      continue;
    }

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          const taskId = row["業務コード"];
          const secondsNum = Number(String(row["経過時間"]).replace(/,/g, ""));

          if (!taskMap[taskId] || Number.isNaN(secondsNum)) return;

          const taskName = taskMap[taskId];
          teamTotals[taskName] = (teamTotals[taskName] || 0) + secondsNum;

          if (empId) {
            employeeTotals[empId][taskName] =
              (employeeTotals[empId][taskName] || 0) + secondsNum;
          }
        })
        .on("end", resolve)
        .on("error", reject);
    });
  }

  return { teamTotals, employeeTotals };
}

module.exports = { aggregateCSV };

