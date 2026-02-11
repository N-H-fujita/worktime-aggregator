// src/output/index.js
const fs = require("fs");
const path = require("path");

const { writeTxt } = require("./writers/txt");
const { writeJson } = require("./writers/json");
const { writeCsv } = require("./writers/csv");

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
 * 集計結果を出力する（txt/json/csv を outputFlags で出し分け）
 * 出力先:
 * - txt:  OUTPUT_DIR/txt/YYYY-MM/summary.txt
 * - json: OUTPUT_DIR/json/YYYY-MM/summary.json
 * - csv:  OUTPUT_DIR/csv/YYYY-MM/summary.csv
 *
 * @returns {{ outputs: { txt?: { dir: string, filePath: string }, json?: { dir: string, filePath: string }, csv?: { dir: string, filePath: string } } }}
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
  if (!outputDir) throw new Error("outputDir is required (set OUTPUT_DIR in .env)");
  if (!outputFlags) throw new Error("outputFlags is required");

  const outputs = {};

  if (outputFlags.txt) {
    const periodDir = path.join(outputDir, "txt", `${year}-${monthStr}`);
    ensureDir(periodDir);
    outputs.txt = writeTxt({
      dir: periodDir,
      fileName: "summary.txt",
      teamTotals,
      employeeTotals,
      taskMap,
      employeeMap,
      year,
      monthStr,
    });
    console.log(`✅ txt 出力完了: ${outputs.txt.filePath}`);
  }

  if (outputFlags.json) {
    const periodDir = path.join(outputDir, "json", `${year}-${monthStr}`);
    ensureDir(periodDir);
    outputs.json = writeJson({
      dir: periodDir,
      fileName: "summary.json",
      teamTotals,
      employeeTotals,
      taskMap,
      employeeMap,
      year,
      monthStr,
    });
    console.log(`✅ json 出力完了: ${outputs.json.filePath}`);
  }

  if (outputFlags.csv) {
    const periodDir = path.join(outputDir, "csv", `${year}-${monthStr}`);
    ensureDir(periodDir);
    outputs.csv = writeCsv({
      dir: periodDir,
      fileName: "summary.csv",
      employeeTotals,
      taskMap,
      employeeMap,
      year,
      monthStr,
    });
    console.log(`✅ csv 出力完了: ${outputs.csv.filePath}`);
  }

  return { outputs };
}

module.exports = { writeOutput };


