const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

async function makeTmpDir(prefix = 'worktime-agg-') {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

module.exports = { makeTmpDir };