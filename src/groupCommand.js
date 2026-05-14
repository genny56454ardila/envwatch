// groupCommand.js — CLI command for grouping env variables
const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('./envParser');
const { groupByPrefix, groupByKeys, serializeGroups } = require('./envGroup');
const { log } = require('./logger');

function parseGroupArgs(argv) {
  const args = { file: '.env', mode: 'prefix', separator: '_', output: null, groupDefs: {} };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--file' || argv[i] === '-f') args.file = argv[++i];
    else if (argv[i] === '--output' || argv[i] === '-o') args.output = argv[++i];
    else if (argv[i] === '--separator' || argv[i] === '-s') args.separator = argv[++i];
    else if (argv[i] === '--mode') args.mode = argv[++i];
    else if (argv[i] === '--group') {
      // --group name=KEY1,KEY2
      const [name, keys] = argv[++i].split('=');
      args.groupDefs[name] = keys.split(',');
      args.mode = 'keys';
    }
  }
  return args;
}

function runGroupCommand(argv) {
  const args = parseGroupArgs(argv);
  const filePath = path.resolve(args.file);

  if (!fs.existsSync(filePath)) {
    log('error', `File not found: ${filePath}`);
    process.exit(1);
  }

  const envMap = parseEnvFile(filePath);
  let groups;

  if (args.mode === 'keys' && Object.keys(args.groupDefs).length > 0) {
    groups = groupByKeys(envMap, args.groupDefs);
  } else {
    groups = groupByPrefix(envMap, args.separator);
  }

  const output = serializeGroups(groups);

  if (args.output) {
    fs.writeFileSync(path.resolve(args.output), output + '\n', 'utf8');
    log('info', `Grouped env written to ${args.output}`);
  } else {
    console.log(output);
  }
}

module.exports = { parseGroupArgs, runGroupCommand };
