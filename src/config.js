require("dotenv").config();

// TODO: 将来的には data/employees.json から取得
const EMPLOYEE_IDS = [
  "a001",
  "a002",
];

// 業務コード → 業務名
/// TODO: 将来的には data/tasks.json などに移行
const taskMap = {
  "P001": "開発",
  "P002": "レビュー",
  "P003": "会議",
};

const serverBasePath = process.env.SERVER_BASE_PATH //コピー元
const localDir = process.env.LOCAL_CSV_DIR;         // コピー先

module.exports = {
  EMPLOYEE_IDS,
  serverBasePath,
  localDir,
  taskMap,
};
