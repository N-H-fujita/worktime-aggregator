const path = require("path");
require("dotenv").config();

const { readJsonPreferReal, validateEmployeeMap, validateTaskMap, validateOutputFlags } = require("./config/loaders");

const dataDir = path.join(__dirname, "..", "data");
const settingsDir = path.join(__dirname, "..", "settings");

// --- データ(data/) ---
const employeeMap = readJsonPreferReal(dataDir, "employees.json", "employees.example.json");
validateEmployeeMap(employeeMap);

const taskMap = readJsonPreferReal(dataDir, "tasks.json", "tasks.example.json");
validateTaskMap(taskMap);

// --- アプリ設定(settings/) ---
const outputFlags = readJsonPreferReal(settingsDir, "output.json", "output.example.json");
validateOutputFlags(outputFlags);

// --- 環境変数(.env) ---
const serverBasePath = process.env.SERVER_BASE_PATH; // コピー元
const localDir = process.env.LOCAL_CSV_DIR; // コピー先
const outputDir = process.env.OUTPUT_DIR; // 集計結果の出力先

if (!serverBasePath || !localDir || !outputDir) {
  throw new Error("[config] Missing required environment variables");
}

module.exports = {
  employeeMap,
  taskMap,
  outputFlags,
  serverBasePath,
  localDir,
  outputDir,
};
