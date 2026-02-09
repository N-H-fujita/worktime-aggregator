require("dotenv").config();

// TODO: 将来的には data/employees.json から取得
const EMPLOYEE_IDS = [
  "a001",
  "a002",
];

const serverBasePath = process.env.SERVER_BASE_PATH //コピー元
const localDir = process.env.LOCAL_CSV_DIR;         // コピー先

module.exports = { EMPLOYEE_IDS, serverBasePath, localDir };