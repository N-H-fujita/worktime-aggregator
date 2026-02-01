const { parseArgs } = require('./src/args');

function main() {
  const { year, month } = parseArgs();
  console.log((`Target: ${year}-${String(month).padStart(2, '0')}`));
}

main();
