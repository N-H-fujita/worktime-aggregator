// TODO: 将来的には data/employees.json から取得
const EMPLOYEE_IDS = [
  "a001",
  "a002",
];

// TODO: serverBasePath は現状固定。将来的には .env から取得
const serverBasePath = "//server/csv"; //コピー元

// TODO: localDir は現状固定。将来的には .env から取得
const localDir = "./local_csv";        // コピー先

module.exports = { EMPLOYEE_IDS, serverBasePath, localDir };