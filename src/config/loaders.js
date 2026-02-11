const fs = require("fs");
const path = require("path");

/**
 * dataディレクトリ内のJSONファイルを読み込む。
 * 実データ（realName）が存在すればそれを優先する。
 * 存在しない場合は exampleName を代替として使用する。
 *
 * @param {string} dataDir JSON設定ファイルを格納しているディレクトリパス
 * @param {string} realName 実データのJSONファイル名（例: "employees.json"）
 * @param {string} exampleName サンプル用JSONファイル名（例: "employees.example.json"）
 * @returns {any} パース済みのJSONデータ
 * @throws {Error} 両方のファイルが存在しない場合、またはJSON形式が不正な場合
 */
function readJsonPreferReal(dataDir, realName, exampleName) {
  const realPath = path.join(dataDir, realName);
  const examplePath = path.join(dataDir, exampleName);

  // 本物があれば優先
  if (fs.existsSync(realPath)) {
    try {
      const raw = fs.readFileSync(realPath, "utf8");
      return JSON.parse(raw);
    } catch (err) {
      throw new Error(`[config] Invalid JSON in ${realName}: ${err.message}`);
    }
  }

  // example.json があれば使う
  if (fs.existsSync(examplePath)) {
    console.warn(`[config] ${realName} not found. Using ${exampleName}.`);
    try {
      const raw = fs.readFileSync(examplePath, "utf8");
      return JSON.parse(raw);
    } catch (err) {
      throw new Error(`[config] Invalid JSON in ${exampleName}: ${err.message}`);
    }
  }

  // どちらもない場合
  throw new Error(
    `[config] ${realName} not found.\n` +
    `Please create data/${realName} (you can copy from data/${exampleName}).`
  );
}

function validateEmployeeMap(employeeMap) {
  if (!employeeMap || typeof employeeMap !== "object" || Array.isArray(employeeMap)) {
    throw new Error("[config] employees.json must be a key:value object");
  }

  for (const [id, name] of Object.entries(employeeMap)) {
    if (typeof id !== "string" || id.trim() === "") {
      throw new Error("[config] invalid employee id");
    }
    if (typeof name !== "string" || name.trim() === "") {
      throw new Error(`[config] empty name for employee id: ${id}`);
    }
  }

  // 任意：形式チェック（必要なら）
  // const re = /^a\d{3}$/;
  // const invalid = employeeIds.find((id) => !re.test(id));
  // if (invalid) throw new Error(`[config] invalid employee id format: ${invalid}`);
}

function validateTaskMap(taskMap) {
  if (!taskMap || typeof taskMap !== "object" || Array.isArray(taskMap)) {
    throw new Error("[config] tasks.json must be a key:value object");
  }

  for (const [code, name] of Object.entries(taskMap)) {
    if (typeof code !== "string" || code.trim() === "") {
      throw new Error("[config] tasks.json contains invalid task code");
    }
    if (typeof name !== "string" || name.trim() === "") {
      throw new Error(`[config] tasks.json has empty task name for code: ${code}`);
    }
  }

  // 任意：形式チェック（必要なら）
  // const re = /^T\d{3}$/;
  // const invalid = Object.keys(taskMap).find((c) => !re.test(c));
  // if (invalid) throw new Error(`[config] invalid task code format: ${invalid}`);
}

module.exports = { readJsonPreferReal, validateEmployeeMap, validateTaskMap };