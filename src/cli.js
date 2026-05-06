#!/usr/bin/env node
'use strict';

const path = require('path');
const { resolveConfig } = require('./configLoader');
const { startReloader } = require('./reloader');
const { log } = require('./logger');

const HELP_TEXT = `
Usage: envwatch [options] -- <command> [args...]

Options:
  --env <file>        Path to .env file (default: .env)
  --debounce <ms>     Debounce delay in ms (default: 300)
  --delay <ms>        Restart delay in ms (default: 100)
  --signal <signal>   Kill signal: SIGTERM | SIGKILL | SIGHUP (default: SIGTERM)
  --config <file>     Path to envwatch.config.json
  --verbose           Enable verbose logging
  --no-watch          Parse env once without watching
  --help              Show this help message
`.trim();

function parseArgs(argv) {
  const args = argv.slice(2);
  const options = {};
  const separatorIdx = args.indexOf('--');

  const flags = separatorIdx === -1 ? args : args.slice(0, separatorIdx);
  const command = separatorIdx === -1 ? [] : args.slice(separatorIdx + 1);

  for (let i = 0; i < flags.length; i++) {
    const flag = flags[i];
    if (flag === '--help') { options.help = true; }
    else if (flag === '--verbose') { options.verbose = true; }
    else if (flag === '--no-watch') { options.watch = false; }
    else if (flag === '--env') { options.envFile = flags[++i]; }
    else if (flag === '--debounce') { options.debounceMs = Number(flags[++i]); }
    else if (flag === '--delay') { options.restartDelay = Number(flags[++i]); }
    else if (flag === '--signal') { options.signal = flags[++i]; }
    else if (flag === '--config') { options.config = flags[++i]; }
  }

  return { options, command };
}

function main(argv) {
  const { options, command } = parseArgs(argv);

  if (options.help) {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  if (command.length === 0) {
    console.error('Error: no command specified. Use: envwatch [options] -- <command>');
    console.error('Run envwatch --help for usage.');
    process.exit(1);
  }

  let config;
  try {
    config = resolveConfig(options);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  if (config.verbose) {
    log('info', `Config: ${JSON.stringify(config, null, 2)}`);
  }

  startReloader(config, command);
}

main(process.argv);
