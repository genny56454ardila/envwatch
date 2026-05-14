/**
 * scopeCommand.js — CLI command for env scope operations
 * Usage:
 *   envwatch scope extract --scope dev [--namespace app] <file>
 *   envwatch scope list [--namespace app] <file>
 */

const path = require('path');
const { parseEnvFile } = require('./envParser');
const { extractScope, listScopes } = require('./envScope');
const { log } = require('./logger');

function parseScopeArgs(argv = []) {
  const args = { action: null, scope: null, namespace: '', file: null };
  const rest = [...argv];

  args.action = rest.shift() || null; // 'extract' | 'list'

  while (rest.length) {
    const flag = rest.shift();
    if (flag === '--scope' || flag === '-s') {
      args.scope = rest.shift();
    } else if (flag === '--namespace' || flag === '-n') {
      args.namespace = rest.shift();
    } else if (!flag.startsWith('-')) {
      args.file = flag;
    }
  }

  return args;
}

function runScopeCommand(argv = [], { stdout = process.stdout } = {}) {
  const args = parseScopeArgs(argv);

  if (!args.action) {
    stdout.write('Usage: envwatch scope <extract|list> [options] <file>\n');
    return;
  }

  if (!args.file) {
    log('error', 'scope', 'No env file specified');
    process.exitCode = 1;
    return;
  }

  const filePath = path.resolve(args.file);
  let envMap;
  try {
    envMap = parseEnvFile(filePath);
  } catch (err) {
    log('error', 'scope', `Cannot read file: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  if (args.action === 'list') {
    const scopes = listScopes(envMap, args.namespace);
    if (scopes.length === 0) {
      stdout.write('No scopes found.\n');
    } else {
      stdout.write(scopes.join('\n') + '\n');
    }
    return;
  }

  if (args.action === 'extract') {
    if (!args.scope) {
      log('error', 'scope', '--scope is required for extract');
      process.exitCode = 1;
      return;
    }
    const extracted = extractScope(envMap, args.scope);
    if (extracted.size === 0) {
      stdout.write(`No keys found for scope: ${args.scope}\n`);
    } else {
      for (const [key, value] of extracted) {
        stdout.write(`${key}=${value}\n`);
      }
    }
    return;
  }

  log('error', 'scope', `Unknown action: ${args.action}`);
  process.exitCode = 1;
}

module.exports = { parseScopeArgs, runScopeCommand };
