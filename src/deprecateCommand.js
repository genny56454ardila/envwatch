import fs from 'fs';
import path from 'path';
import { parseEnvFile } from './envParser.js';
import {
  buildDeprecationMap,
  findDeprecatedKeys,
  applyReplacements,
  formatDeprecationIssues,
  hasDeprecations,
} from './envDeprecate.js';
import { log } from './logger.js';

export function parseDeprecateArgs(argv = process.argv.slice(2)) {
  const args = { envFile: '.env', rulesFile: null, fix: false, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--env' && argv[i + 1]) args.envFile = argv[++i];
    else if (argv[i] === '--rules' && argv[i + 1]) args.rulesFile = argv[++i];
    else if (argv[i] === '--fix') args.fix = true;
    else if (argv[i] === '--dry-run') args.dryRun = true;
  }
  return args;
}

function loadRules(rulesFile) {
  const abs = path.resolve(rulesFile);
  if (!fs.existsSync(abs)) {
    throw new Error(`Rules file not found: ${abs}`);
  }
  const raw = fs.readFileSync(abs, 'utf8');
  return JSON.parse(raw);
}

export async function runDeprecateCommand(argv = process.argv.slice(2)) {
  const args = parseDeprecateArgs(argv);

  if (!args.rulesFile) {
    log('error', 'deprecate', '--rules <file> is required');
    process.exitCode = 1;
    return;
  }

  let rules;
  try {
    rules = loadRules(args.rulesFile);
  } catch (err) {
    log('error', 'deprecate', err.message);
    process.exitCode = 1;
    return;
  }

  const envPath = path.resolve(args.envFile);
  if (!fs.existsSync(envPath)) {
    log('error', 'deprecate', `Env file not found: ${envPath}`);
    process.exitCode = 1;
    return;
  }

  const env = parseEnvFile(envPath);
  const deprecationMap = buildDeprecationMap(rules);
  const issues = findDeprecatedKeys(env, deprecationMap);

  if (!hasDeprecations(issues)) {
    log('info', 'deprecate', 'No deprecated keys found.');
    return;
  }

  const lines = formatDeprecationIssues(issues);
  lines.forEach((line) => log('warn', 'deprecate', line));

  if (args.fix) {
    const updated = applyReplacements(env, deprecationMap);
    const serialized = [...updated.entries()]
      .map(([k, v]) => `${k}=${v}`)
      .join('\n') + '\n';

    if (args.dryRun) {
      log('info', 'deprecate', '[dry-run] Would write updated env:');
      process.stdout.write(serialized);
    } else {
      fs.writeFileSync(envPath, serialized, 'utf8');
      log('info', 'deprecate', `Applied replacements to ${args.envFile}`);
    }
  } else {
    process.exitCode = 1;
  }
}
