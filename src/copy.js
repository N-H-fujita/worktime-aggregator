const fs = require("fs");
const path = require("path");

/**
 * CSVファイルをコピーする
 * @param {string[]} fileNames
 * @param {string} serverBasePath
 * @param {string} localDir
 * @returns {Promise<void>}
 */
async function copyCSVFiles(fileNames, serverBasePath, localDir) {
  // 出力先ディレクトリがなければ作成
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }

  for (const fileName of fileNames) {
    const srcPath = path.join(serverBasePath, fileName);
    const destPath = path.join(localDir, fileName);

    if (!fs.existsSync(srcPath)) {
      throw new Error(`コピー元ファイルが存在しません: ${srcPath}`);
    }

    fs.copyFileSync(srcPath, destPath);
    console.log(`コピー完了: ${fileName}`);
  }
}

module.exports = { copyCSVFiles };
