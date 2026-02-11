const { parseArgs } = require('./src/args');
const { EMPLOYEE_IDS, serverBasePath, localDir, taskMap } = require('./src/config');
const { generateCsvFilenames } = require('./src/fileNames');
const { aggregateCSV } = require('./src/aggregate');
const { copyCSVFiles } = require('./src/copy');
// const { writeOutput } = require("./src/output"); // ← まだ使わない

async function main() {

  // --- 年・月を取得 ---
  const { year, month } = parseArgs();

  // --- ファイル名配列作成 ---
  const csvFileNames = generateCsvFilenames(year, month, EMPLOYEE_IDS);

  // --- CSVコピー + UTF-8変換 ---
  await copyCSVFiles(csvFileNames, serverBasePath, localDir);

  // --- CSV集計（現状の main に合わせる） ---
  const result = await aggregateCSV(csvFileNames, './local_csv', taskMap);

  console.log(result);

  // output は後で output.js 実装と同時に入れる
}

main().catch((err) => {
  console.error("❌ 処理中にエラー:", err.message);
  process.exit(1);
});

