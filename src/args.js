/**
 * コマンドライン引数をパース（最小版）
 * @returns {{ year: number, month: number }}
 */
function parseArgs() {
  const [argMonth, argYear] = process.argv.slice(2);

  if (!argMonth || !argYear) {
    throw new Error('Usage: node index.js <month> <year>');
  }

  const month = Number(argMonth);
  const year = Number(argYear);

  if (Number.isNaN(month) || Number.isNaN(year)) {
    throw new Error('month and year must be numbers');
  }

  return { year, month };
}

module.exports = { parseArgs };
