// src/output/writers/json.js
const fs = require("fs");
const path = require("path");

/**
 * json を出力する
 * @returns {{ dir: string, filePath: string }}
 */
function writeJson({ dir, fileName, teamTotals, employeeTotals, taskMap, employeeMap, year, monthStr }) {
  const filePath = path.join(dir, fileName);

  const payload = {
    year,
    month: monthStr,
    generatedAt: new Date().toISOString(),
    teamTotals,
    employeeTotals,
    employees: employeeMap || {},
    tasks: taskMap || {},
  };

  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");
  return { dir, filePath };
}

module.exports = { writeJson };
