const { parseArgs } = require('./src/args');
const { employeeMap, taskMap, outputFlags, serverBasePath, localDir, outputDir } = require('./src/config');
const { generateCsvFilenames } = require('./src/fileNames');
const { aggregateCSV } = require('./src/aggregate');
const { copyCSVFiles } = require('./src/copy');
const { writeOutput } = require("./src/output");

async function main() {
  // --- 年・月を取得 ---
  const { year, month } = parseArgs();
  const monthStr = String(month).padStart(2, "0");

  // --- 社員ID一覧を作成 ---
  const employeeIds = Object.keys(employeeMap);

  // --- ファイル名配列作成 ---
  const csvFileNames = generateCsvFilenames(year, month, employeeIds);

  // --- CSVコピー + UTF-8変換 ---
  await copyCSVFiles(csvFileNames, serverBasePath, localDir);

  // --- CSV集計（現状の main に合わせる） ---
  const { teamTotals, employeeTotals } = await aggregateCSV(csvFileNames, localDir, taskMap, employeeIds);

  writeOutput({ teamTotals, employeeTotals, employeeMap, taskMap, outputFlags, outputDir, year, monthStr });
}

main().catch((err) => {
  console.error("❌ 処理中にエラー:", err.message);
  process.exit(1);
});

