// pinCommand.js — CLI interface for pinning/unpinning env keys

const path = require('path');
const { parseEnvFile } = require('./envParser');
const { pinKeys, unpinKeys, getPinnedKeys, clearPins, savePins, loadPins } = require('./envPin');
const { log } = require('./logger');

const DEFAULT_PINS_FILE = '.env.pins.json';

function parsePinArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    action: args[0] || 'list',   // pin | unpin | list | clear
    keys: [],
    envFile: '.env',
    pinsFile: DEFAULT_PINS_FILE,
  };
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--env' && args[i + 1]) { opts.envFile = args[++i]; }
    else if (args[i] === '--pins-file' && args[i + 1]) { opts.pinsFile = args[++i]; }
    else if (!args[i].startsWith('--')) { opts.keys.push(args[i]); }
  }
  return opts;
}

function runPinCommand(opts) {
  const pinsPath = path.resolve(opts.pinsFile);

  // Always load existing pins first
  loadPins(pinsPath);

  switch (opts.action) {
    case 'pin': {
      if (opts.keys.length === 0) {
        log('error', 'pin', 'No keys specified to pin.');
        process.exitCode = 1;
        return;
      }
      const envMap = parseEnvFile(path.resolve(opts.envFile));
      const pinned = pinKeys(envMap, opts.keys);
      const missing = opts.keys.filter(k => !(k in pinned));
      if (missing.length) {
        log('warn', 'pin', `Keys not found in env file: ${missing.join(', ')}`);
      }
      savePins(pinsPath);
      log('info', 'pin', `Pinned: ${Object.keys(pinned).join(', ')}`);
      break;
    }
    case 'unpin': {
      if (opts.keys.length === 0) {
        log('error', 'pin', 'No keys specified to unpin.');
        process.exitCode = 1;
        return;
      }
      unpinKeys(opts.keys);
      savePins(pinsPath);
      log('info', 'pin', `Unpinned: ${opts.keys.join(', ')}`);
      break;
    }
    case 'clear': {
      clearPins();
      savePins(pinsPath);
      log('info', 'pin', 'All pins cleared.');
      break;
    }
    case 'list': {
      const pins = getPinnedKeys();
      const entries = Object.entries(pins);
      if (entries.length === 0) {
        log('info', 'pin', 'No keys are currently pinned.');
      } else {
        log('info', 'pin', `Pinned keys (${entries.length}):`);
        for (const [k, v] of entries) {
          log('info', 'pin', `  ${k}=${v}`);
        }
      }
      break;
    }
    default:
      log('error', 'pin', `Unknown action: ${opts.action}`);
      process.exitCode = 1;
  }
}

module.exports = { parsePinArgs, runPinCommand };
