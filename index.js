const { parseArgs } = require('./src/args');
const { EMPLOYEE_IDS, OUTPUT_DIR } = require('./src/config');
const { generateCsvFilenames } = require('./src/fileNames');
const { writeOutput } = require("./src/output");

function main() {

  // --- 年・月を取得 ---
  const { year, month } = parseArgs();

  // --- ファイル名配列作成 ---
  const csvFileNames = generateCsvFilenames(year, month, EMPLOYEE_IDS)


  // aggregateCSV() の後
  writeOutput({
    teamTotals,
    employeeTotals,
    outputDir: OUTPUT_DIR,
    year,
    monthStr: String(month).padStart(2, "0"),
  });


  console.log(csvFileNames);
}

main();
