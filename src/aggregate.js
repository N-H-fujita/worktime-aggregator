// src/aggregate.js
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

/**
 * CSV集計
 * @param {string[]} fileNames
 * @param {string} localDir
 * @param {object} taskMap  { 業務コード: 業務名 }
 */
async function aggregateCSV(fileNames, localDir, taskMap) {
  const teamTotals = {};
  const employeeTotals = {};

  for (const fileName of fileNames) {
    const filePath = path.join(localDir, fileName);

    // 例: 2025-10_a001.csv → a001
    const empId = fileName.split("_")[1]?.replace(".csv", "");
    if (!employeeTotals[empId]) employeeTotals[empId] = {};

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          const taskId = row["業務コード"];
          const seconds = Number(row["経過時間"]);

          if (!taskMap[taskId] || isNaN(seconds)) return;

          const taskName = taskMap[taskId];

          // チーム集計
          teamTotals[taskName] = (teamTotals[taskName] || 0) + seconds;

          // 社員別集計
          employeeTotals[empId][taskName] =
            (employeeTotals[empId][taskName] || 0) + seconds;
        })
        .on("end", resolve)
        .on("error", reject);
    });
  }

  return { teamTotals, employeeTotals };
}

module.exports = { aggregateCSV };
