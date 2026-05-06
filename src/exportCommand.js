/**
 * exportCommand.js
 * CLI sub-command handler for `envwatch export`
 */

const path = require('path');
const { parseEnvFile } = require('./envParser');
const { exportEnv } = require('./envExporter');
const { log } = require('./logger');

const SUPPORTED_FORMATS = ['shell', 'json', 'docker'];

const DEFAULT_OUTPUT_NAMES = {
  shell: 'env-export.sh',
  json: 'env-export.json',
  docker: 'env-export.env'
};

/**
 * Parse export-specific CLI args
 * @param {string[]} argv
 * @returns {Object}
 */
function parseExportArgs(argv) {
  const args = { format: 'json', envFile: '.env', output: null };

  for (let i = 0; i < argv.length; i++) {
    if ((argv[i] === '--format' || argv[i] === '-f') && argv[i + 1]) {
      args.format = argv[++i];
    } else if ((argv[i] === '--env' || argv[i] === '-e') && argv[i + 1]) {
      args.envFile = argv[++i];
    } else if ((argv[i] === '--output' || argv[i] === '-o') && argv[i + 1]) {
      args.output = argv[++i];
    }
  }

  return args;
}

/**
 * Run the export command
 * @param {string[]} argv
 */
function runExportCommand(argv) {
  const args = parseExportArgs(argv);

  if (!SUPPORTED_FORMATS.includes(args.format)) {
    log('error', `Unsupported format "${args.format}". Choose: ${SUPPORTED_FORMATS.join(', ')}`);
    process.exit(1);
  }

  const envFilePath = path.resolve(args.envFile);
  let envMap;

  try {
    envMap = parseEnvFile(envFilePath);
  } catch (err) {
    log('error', `Failed to read env file: ${err.message}`);
    process.exit(1);
  }

  const outputPath = path.resolve(args.output || DEFAULT_OUTPUT_NAMES[args.format]);

  try {
    exportEnv(envMap, args.format, outputPath);
    log('info', `Exported ${Object.keys(envMap).length} variables to ${outputPath} (${args.format})`);
  } catch (err) {
    log('error', `Export failed: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { parseExportArgs, runExportCommand, SUPPORTED_FORMATS, DEFAULT_OUTPUT_NAMES };
