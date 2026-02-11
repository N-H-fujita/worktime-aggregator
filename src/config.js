const fs = require("fs");
const path = require("path");
require("dotenv").config();

const { readJsonPreferReal, validateEmployeeMap, validateTaskMap } = require("./config/loaders");

const dataDir = path.join(__dirname, "..", "data");

const employeeMap = readJsonPreferReal(dataDir, "employees.json", "employees.example.json");
const taskMap = readJsonPreferReal(dataDir, "tasks.json", "tasks.example.json");
validateEmployeeMap(employeeMap);
validateTaskMap(taskMap);

const serverBasePath = process.env.SERVER_BASE_PATH; // コピー元
const localDir = process.env.LOCAL_CSV_DIR; // コピー先
const outputDir = process.env.OUTPUT_DIR; // 集計結果の出力先

if (!serverBasePath || !localDir || !outputDir) {
  throw new Error("[config] Missing required environment variables");
}

module.exports = {
  employeeMap,
  taskMap,
  serverBasePath,
  localDir,
  outputDir,
};
