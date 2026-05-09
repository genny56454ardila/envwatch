// sortCommand.js — CLI handler for env sort feature

const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('./envParser');
const { sortAlpha, sortByOrder, sortByPrefix, serializeSorted } = require('./envSort');
const { log } = require('./logger');

function parseSortArgs(argv = process.argv.slice(2)) {
  const args = {
    file: '.env',
    mode: 'alpha',
    order: [],
    write: false,
  };

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--file' && argv[i + 1]) args.file = argv[++i];
    else if (argv[i] === '--mode' && argv[i + 1]) args.mode = argv[++i];
    else if (argv[i] === '--order' && argv[i + 1]) args.order = argv[++i].split(',').map(k => k.trim());
    else if (argv[i] === '--write') args.write = true;
  }

  return args;
}

function runSortCommand(argv = process.argv.slice(2)) {
  const args = parseSortArgs(argv);
  const filePath = path.resolve(args.file);

  if (!fs.existsSync(filePath)) {
    log('error', `File not found: ${filePath}`);
    process.exit(1);
  }

  const envMap = parseEnvFile(filePath);

  let sorted;
  if (args.mode === 'prefix') {
    sorted = sortByPrefix(envMap);
  } else if (args.mode === 'order') {
    if (!args.order.length) {
      log('error', '--order requires a comma-separated list of keys');
      process.exit(1);
    }
    sorted = sortByOrder(envMap, args.order);
  } else {
    sorted = sortAlpha(envMap);
  }

  const output = serializeSorted(sorted);

  if (args.write) {
    fs.writeFileSync(filePath, output, 'utf8');
    log('info', `Sorted ${filePath} using mode: ${args.mode}`);
  } else {
    process.stdout.write(output + '\n');
  }
}

module.exports = { parseSortArgs, runSortCommand };
