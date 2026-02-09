const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");

/**
 * Shift_JIS → UTF-8 変換しながらコピー（ストリーム方式）
 * @param {string} srcPath コピー元パス
 * @param {string} destPath コピー先パス
 * @return {Promise<void>}
 */
async function convertAndCopyFile(srcPath, destPath) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(srcPath);
    const writeStream = fs.createWriteStream(destPath, { encoding: "utf8" });

    readStream
      .pipe(iconv.decodeStream("shift_jis"))
      .pipe(iconv.encodeStream("utf8"))
      .pipe(writeStream)
      .on("finish", resolve)
      .on("error", reject);
  });
}

/**
 * CSVファイルをコピー＆UTF-8変換
 * @param {string[]} fileNames
 * @param {string} serverBasePath
 * @param {string} localDir
 * @return {Promise<void>}
 */
async function copyCSVFiles(fileNames, serverBasePath, localDir) {
  if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });

  for (const fileName of fileNames) {
    const src = path.join(serverBasePath, fileName);
    const dest = path.join(localDir, fileName);

    if (!fs.existsSync(src)) {
      console.error(`コピー元が存在しません: ${src}`);
      continue;
    }

    try {
      await convertAndCopyFile(src, dest);
      console.log(`コピー＆UTF-8変換完了: ${fileName}`);
    } catch (err) {
      console.error(`処理失敗: ${fileName}`, err.message);
    }
  }
}

module.exports = { copyCSVFiles };
