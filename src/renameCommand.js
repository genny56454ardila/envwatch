const fs = require('fs');
const path = require('path');
const { renameInFile } = require('./envRename');
const { log } = require('./logger');

/**
 * Parse CLI args for the rename command.
 * Usage: envwatch rename --file .env --from OLD_KEY --to NEW_KEY [--out .env.renamed]
 */
function parseRenameArgs(argv) {
  const args = { file: '.env', from: null, to: null, out: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--file' && argv[i + 1]) args.file = argv[++i];
    else if (argv[i] === '--from' && argv[i + 1]) args.from = argv[++i];
    else if (argv[i] === '--to' && argv[i + 1]) args.to = argv[++i];
    else if (argv[i] === '--out' && argv[i + 1]) args.out = argv[++i];
  }
  return args;
}

function runRenameCommand(argv) {
  const args = parseRenameArgs(argv);

  if (!args.from || !args.to) {
    log('error', 'rename', '--from and --to are required');
    process.exit(1);
  }

  const filePath = path.resolve(args.file);
  if (!fs.existsSync(filePath)) {
    log('error', 'rename', `File not found: ${filePath}`);
    process.exit(1);
  }

  const outPath = args.out ? path.resolve(args.out) : filePath;
  const renames = { [args.from]: args.to };

  try {
    renameInFile(filePath, renames, outPath);
    log('info', 'rename', `Renamed ${args.from} -> ${args.to} in ${path.basename(outPath)}`);
  } catch (err) {
    log('error', 'rename', err.message);
    process.exit(1);
  }
}

module.exports = { parseRenameArgs, runRenameCommand };
