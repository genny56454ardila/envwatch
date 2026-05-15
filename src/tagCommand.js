// tagCommand.js — CLI command to list or filter env keys by tag

const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('./envParser');
const { extractTags, filterByTag, validateTags, formatTagIssues, VALID_TAGS } = require('./envTagging');

function parseTagArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    envFile: '.env',
    tag: null,
    list: false,
    validate: false,
  };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--env' && args[i + 1]) opts.envFile = args[++i];
    else if (args[i] === '--tag' && args[i + 1]) opts.tag = args[++i];
    else if (args[i] === '--list') opts.list = true;
    else if (args[i] === '--validate') opts.validate = true;
  }
  return opts;
}

function runTagCommand(opts, { log = console.log, warn = console.warn } = {}) {
  const absPath = path.resolve(opts.envFile);
  if (!fs.existsSync(absPath)) {
    warn(`[envwatch] env file not found: ${absPath}`);
    return 1;
  }

  const content = fs.readFileSync(absPath, 'utf8');
  const envMap = parseEnvFile(absPath);
  const tagMap = extractTags(content);

  if (opts.validate) {
    const issues = validateTags(tagMap);
    if (issues.length === 0) {
      log('[envwatch] All tags are valid.');
    } else {
      warn('[envwatch] Unknown tags found:');
      warn(formatTagIssues(issues));
      return 1;
    }
    return 0;
  }

  if (opts.list) {
    log(`[envwatch] Valid tags: ${VALID_TAGS.join(', ')}`);
    log('[envwatch] Tagged keys:');
    for (const [key, tags] of tagMap) {
      log(`  ${key}: ${tags.join(', ')}`);
    }
    return 0;
  }

  if (opts.tag) {
    const filtered = filterByTag(envMap, tagMap, opts.tag);
    if (filtered.size === 0) {
      log(`[envwatch] No keys tagged with "${opts.tag}".`);
    } else {
      log(`[envwatch] Keys tagged "${opts.tag}":`);
      for (const [key, value] of filtered) {
        log(`  ${key}=${value}`);
      }
    }
    return 0;
  }

  warn('[envwatch] Usage: envwatch tag [--env <file>] [--tag <tag>] [--list] [--validate]');
  return 1;
}

module.exports = { parseTagArgs, runTagCommand };
