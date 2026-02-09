const { parseArgs } = require('./src/args');
const { EMPLOYEE_IDS, serverBasePath, localDir } = require('./src/config');
const { generateCsvFilenames } = require('./src/fileNames');
const { copyCSVFiles } = require('./src/copy');

async function main() {

  // --- 年・月を取得 ---
  const { year, month } = parseArgs();

  // --- ファイル名配列作成 ---
  const csvFileNames = generateCsvFilenames(year, month, EMPLOYEE_IDS)

  // --- CSVコピー + UTF-8変換 ---
  await copyCSVFiles(csvFileNames, serverBasePath, localDir);

  console.log(csvFileNames);
}

main().catch((err) => {
  console.error("❌ 処理中にエラー:", err.message);
  process.exit();
});
