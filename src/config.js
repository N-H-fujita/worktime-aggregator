require("dotenv").config();

// TODO: 将来的には data/employees.json から取得
const EMPLOYEE_IDS = [
  "a001",
  "a002",
];

// 業務コード → 業務名
/// TODO: 将来的には data/tasks.json などに移行
const taskMap = {
  T100: "○○案件",
  T200: "△△案件",
  T400: "××案件",
  T500: "ミーティング",
  T600: "雑務",
  T700: "研修",
  T800: "テスト",
  T900: "その他",
  T000: "休憩",
};

const serverBasePath = process.env.SERVER_BASE_PATH // コピー元
const localDir = process.env.LOCAL_CSV_DIR;         // コピー先
const outputDir = process.env.OUTPUT_DIR;           // 集計結果の出力先

module.exports = {
  EMPLOYEE_IDS,
  serverBasePath,
  localDir,
  outputDir,
  taskMap,
};
