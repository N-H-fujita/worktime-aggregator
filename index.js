const { parseArgs } = require('./src/args');
const { EMPLOYEE_IDS, serverBasePath, localDir, outputDir, taskMap } = require('./src/config');
const { generateCsvFilenames } = require('./src/fileNames');
const { aggregateCSV } = require('./src/aggregate');
const { copyCSVFiles } = require('./src/copy');
const { writeOutput } = require("./src/output");

async function main() {
  // --- 年・月を取得 ---
  const { year, month } = parseArgs();
  const monthStr = String(month).padStart(2, "0");

  // --- ファイル名配列作成 ---
  const csvFileNames = generateCsvFilenames(year, month, EMPLOYEE_IDS);

  // --- CSVコピー + UTF-8変換 ---
  await copyCSVFiles(csvFileNames, serverBasePath, localDir);

  // --- CSV集計（現状の main に合わせる） ---
  const { teamTotals, employeeTotals } = await aggregateCSV(csvFileNames, localDir, taskMap);

  writeOutput({ teamTotals, employeeTotals, taskMap, outputDir, year, monthStr });
}

main().catch((err) => {
  console.error("❌ 処理中にエラー:", err.message);
  process.exit(1);
});

