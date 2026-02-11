/**
 * 秒をhh:mm:ssに変換
 * @param {number} totalSeconds
 * @return {string}
 */
function formatSeconds(totalSeconds) {

  if(!Number.isFinite(totalSeconds)) {
    return "0:00:00";
  }

  const safeSeconds = Math.max(0, Math.floor(totalSeconds));

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
}

module.exports = { formatSeconds };