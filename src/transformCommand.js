/**
 * transformCommand.js
 * CLI command handler for env key/value transformations.
 */

const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('./envParser');
const {
  keysToUpper,
  keysToLower,
  addPrefix,
  stripPrefix,
  trimValues,
} = require('./envTransform');
const { log } = require('./logger');

function parseTransformArgs(argv = process.argv.slice(2)) {
  const args = { input: '.env', output: null, ops: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--input' || argv[i] === '-i') args.input = argv[++i];
    else if (argv[i] === '--output' || argv[i] === '-o') args.output = argv[++i];
    else if (argv[i] === '--upper') args.ops.push({ type: 'upper' });
    else if (argv[i] === '--lower') args.ops.push({ type: 'lower' });
    else if (argv[i] === '--trim') args.ops.push({ type: 'trim' });
    else if (argv[i] === '--add-prefix') args.ops.push({ type: 'addPrefix', value: argv[++i] });
    else if (argv[i] === '--strip-prefix') args.ops.push({ type: 'stripPrefix', value: argv[++i] });
  }
  return args;
}

function applyOps(envMap, ops) {
  let result = { ...envMap };
  for (const op of ops) {
    if (op.type === 'upper') result = keysToUpper(result);
    else if (op.type === 'lower') result = keysToLower(result);
    else if (op.type === 'trim') result = trimValues(result);
    else if (op.type === 'addPrefix') result = addPrefix(result, op.value);
    else if (op.type === 'stripPrefix') result = stripPrefix(result, op.value);
  }
  return result;
}

function serializeEnv(envMap) {
  return Object.entries(envMap)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n') + '\n';
}

function runTransformCommand(argv) {
  const args = parseTransformArgs(argv);
  const inputPath = path.resolve(args.input);

  if (!fs.existsSync(inputPath)) {
    log('error', `Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const envMap = parseEnvFile(inputPath);
  const transformed = applyOps(envMap, args.ops);
  const serialized = serializeEnv(transformed);

  if (args.output) {
    const outputPath = path.resolve(args.output);
    fs.writeFileSync(outputPath, serialized, 'utf8');
    log('info', `Transformed env written to ${outputPath}`);
  } else {
    process.stdout.write(serialized);
  }
}

module.exports = { parseTransformArgs, applyOps, runTransformCommand };
