const { parseArgs } = require('./src/args');
const { EMPLOYEE_IDS, taskMap } = require('./src/config');
const { generateCsvFilenames } = require('./src/fileNames');
const { aggregateCSV } = require('./src/aggregate');

async function main() {

  // --- 年・月を取得 ---
  const { year, month } = parseArgs();

  // --- ファイル名配列作成 ---
  const csvFileNames = generateCsvFilenames(year, month, EMPLOYEE_IDS)

  // --- CSV集計 ---
  const result = await aggregateCSV(
    csvFileNames,
    './local_csv',
    taskMap
  );

  console.log(result);
}

main();
