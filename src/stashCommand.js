// stashCommand.js — CLI interface for stash/pop/list/peek operations

const { parseEnvFile } = require('./envParser');
const { stashEnv, popStash, peekStash, listStashes, clearStashes, stashSize } = require('./envStash');
const { log } = require('./logger');
const fs = require('fs');

function parseStashArgs(argv = process.argv.slice(2)) {
  const [subcommand, ...rest] = argv;
  const args = { subcommand: subcommand || 'list', envFile: '.env', label: '', index: undefined };
  for (let i = 0; i < rest.length; i++) {
    if ((rest[i] === '--file' || rest[i] === '-f') && rest[i + 1]) args.envFile = rest[++i];
    else if ((rest[i] === '--label' || rest[i] === '-l') && rest[i + 1]) args.label = rest[++i];
    else if ((rest[i] === '--index' || rest[i] === '-i') && rest[i + 1]) args.index = parseInt(rest[++i], 10);
  }
  return args;
}

async function runStashCommand(args = parseStashArgs()) {
  const { subcommand, envFile, label, index } = args;

  if (subcommand === 'push' || subcommand === 'save') {
    if (!fs.existsSync(envFile)) {
      log('error', `File not found: ${envFile}`);
      return 1;
    }
    const envMap = parseEnvFile(envFile);
    const meta = stashEnv(envMap, label);
    log('info', `Stashed "${meta.label}" (index ${meta.index}) — ${envMap.size} keys`);
    return 0;
  }

  if (subcommand === 'pop') {
    try {
      const envMap = popStash(index);
      log('info', `Popped stash — ${envMap.size} keys restored to memory`);
      for (const [k, v] of envMap) log('debug', `  ${k}=${v}`);
      return 0;
    } catch (err) {
      log('error', err.message);
      return 1;
    }
  }

  if (subcommand === 'peek') {
    try {
      const envMap = peekStash(index);
      log('info', `Peek at stash (index ${index !== undefined ? index : stashSize() - 1}) — ${envMap.size} keys`);
      for (const [k, v] of envMap) log('debug', `  ${k}=${v}`);
      return 0;
    } catch (err) {
      log('error', err.message);
      return 1;
    }
  }

  if (subcommand === 'list') {
    const list = listStashes();
    if (list.length === 0) {
      log('info', 'No stashes found');
    } else {
      list.forEach(({ index: i, label: l, timestamp }) => {
        const date = new Date(timestamp).toISOString();
        log('info', `  [${i}] ${l}  (${date})`);
      });
    }
    return 0;
  }

  if (subcommand === 'clear') {
    clearStashes();
    log('info', 'All stashes cleared');
    return 0;
  }

  log('error', `Unknown stash subcommand: ${subcommand}`);
  return 1;
}

module.exports = { parseStashArgs, runStashCommand };
