// src/output.js
const fs = require("fs");
const path = require("path");

/**
 * 集計結果をテキスト出力（最小実装）
 */
function writeOutput({
  teamTotals,
  employeeTotals,
  outputDir,
  year,
  monthStr,
}) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, `${year}-${monthStr}_集計.txt`);

  const content = `テスト出力\n`;

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`出力完了: ${filePath}`);
}

module.exports = { writeOutput };
