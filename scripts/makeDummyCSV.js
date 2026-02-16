// test/makeDummyCSV.js
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");

const employees = require("../data/employees.json"); // { "a001": "山田", ... }
const taskMap = require("../data/tasks.json");       // { "T100": "○○案件", ... }

/**
 * 出力先ディレクトリを保障
 * @param {string} dir
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * 現在月から過去3か月分の { year, monthStr }を返す(年またぎ対応)
 * @returns {{year:number, monthStr:string}[]}
 */
function getLastThreeMonths() {
  const now = new Date();
  const periods = [];

  for (let i = 0; i < 3; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() -i, 1);
    periods.push({
      year: date.getFullYear(),
      monthStr: String(date.getMonth() + 1).padStart(2, "0"),
    });
  }

  return periods;
}

/**
 * レン数で整数を返す(min~max)
 * @param {number} min
 * @param {number} max
 */
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 配列からランダムに1つ選ぶ
   * @template T
   * @param {T[]} arr
   * @returns {T}
   */
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }


/**
 * 1ファイル分のダミーCSVを生成（Shift_JIS）
 * @param {Object} params
 * @param {number} params.year
 * @param {string} params.monthStr
 * @param {string} params.empId
 * @param {string} params.outputDir
 * @param {Record<string,string>} params.taskMap
 * @param {Record<string,string>} params.otherTasks
 * @param {string[]} params.otherDeptIds
 */
function generateOneCsv({
  year,
  monthStr,
  empId,
  outputDir,
  taskMap,
  otherTasks,
  otherDeptIds,
}) {
  const header = '"社員番号","日付","業務コード","業務","経過時間","備考"';
  const rows = [header];

  const TargetCodes = Object.keys(taskMap);
  const nonTargetCodes = Object.keys(otherTasks);

  const isOtherDept = otherDeptIds.includes(empId);
  if (isOtherDept && nonTargetCodes.length === 0) {
    throw new Error("nonTargetCodes is empty. Define otherTasks codes.");
  }
  if (!isOtherDept && TargetCodes.length === 0) {
    throw new Error("targetCodes is empty. taskMap has no codes.");
  }

  const allCodes = { ...taskMap, ...otherTasks };

  const numRows = randInt(10, 20);

  for (let i = 0; i< numRows; i++) {
    const day = String(randInt(1, 28)).padStart(2, "0");
    const dateStr = `${year}-${monthStr}-${day}`;

    const code = isOtherDept ? pick(nonTargetCodes) : pick(TargetCodes);
    const taskName = allCodes[code];

    // 集計対象タスクは1~8時間、対象外は0~59分(適当に差をつける)
    const durationSeconds = isOtherDept
      ? randInt(1, 59) * 60
      : randInt(1, 8) * 3600

    const remarks = isOtherDept ? "備考あり" : "";

    rows.push(
      `"${empId}","${dateStr}","${code}","${taskName}","${durationSeconds}","${remarks}"`
    );
  }


  const fileName = `${year}-${monthStr}_${empId}.csv`;
  const filePath = path.join(outputDir, fileName);

  const buffer = iconv.encode(rows.join("\r\n"), "Shift_JIS")
  fs.writeFileSync(filePath, buffer);

  console.log(`作成: ${filePath}`);
}

/**
 * ダミーCSVを server_csv に生成する
 * - year: 現在年（年またぎあり）
 * - month: 現在月から過去3か月
 * - a004-a006 は集計対象コード（taskMap）を使わない
 */
function main() {
  const outputDir =
    process.env.SERVER_BASE_PATH || path.join(__dirname, "../server_csv");
  ensureDir(outputDir);

  // 集計対象（employees.jsonにいる社員）
  const baseEmployeeIds = Object.keys(employees);

  // 同じ部署だが案件に関わっていない（employees.jsonにいない）
  const sameDeptNonProjectIds = ["a004", "a005", "a006"];

  // 別部署（employees.jsonにいない）
  const otherDeptIds = ["b001", "b002", "b003"];

  // server_csv に混ぜる全員
  const allEmployeeIds = [
    ...baseEmployeeIds,
    ...sameDeptNonProjectIds,
    ...otherDeptIds,
  ];

  // 集計対象コード(taskMap)を「絶対に使わない社員」
  const nonProjectIds = [...sameDeptNonProjectIds, ...otherDeptIds];

  const otherTasks = {
    T000: "休憩",
    T400: "××案件",
    T500: "ミーティング",
    T600: "雑務",
    T700: "研修",
    T800: "テスト",
    T900: "その他",
  };

  const periods = getLastThreeMonths();

  for (const { year, monthStr } of periods) {
    for (const empId of allEmployeeIds) {
      generateOneCsv({
        year,
        monthStr,
        empId,
        outputDir,
        taskMap,
        otherTasks,
        otherDeptIds: nonProjectIds, // ← ここがポイント（名前はそのまま流用）
      });
    }
  }

  console.log("✅ ダミーCSV生成完了");
}


if (require.main === module) {
  main();
}

module.exports = { main };
