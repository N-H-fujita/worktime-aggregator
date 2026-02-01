/**
 * @param {number} year
 * @param {number} month
 * @param {string[]} employeeIds
 * @returns {string[]}
 */

function generateCsvFilenames(year, month, employeeIds) {
  const ym = `${year}-${String(month).padStart(2, '0')}`;
  return employeeIds.map((id) => `${ym}_${id}.csv`);
}

module.exports = { generateCsvFilenames };