// annotateCommand.js — CLI interface for envAnnotate operations

const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('./envParser');
const { addAnnotation, stripAnnotations, extractAnnotations, filterByAnnotation } = require('./envAnnotate');
const { log } = require('./logger');

function parseAnnotateArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    file: '.env',
    action: null,
    key: null,
    annotationKey: null,
    annotationValue: null,
    filter: null,
  };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' || args[i] === '-f') opts.file = args[++i];
    else if (args[i] === 'add') { opts.action = 'add'; opts.key = args[++i]; opts.annotationKey = args[++i]; opts.annotationValue = args[++i] || null; }
    else if (args[i] === 'strip') opts.action = 'strip';
    else if (args[i] === 'list') opts.action = 'list';
    else if (args[i] === 'filter') { opts.action = 'filter'; opts.filter = args[++i]; }
  }
  return opts;
}

function runAnnotateCommand(opts) {
  const filePath = path.resolve(opts.file);
  if (!fs.existsSync(filePath)) {
    log('error', `File not found: ${filePath}`);
    process.exit(1);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  if (opts.action === 'add') {
    if (!opts.key || !opts.annotationKey) {
      log('error', 'Usage: annotate add <KEY> <annotationKey> [annotationValue]');
      process.exit(1);
    }
    const updated = addAnnotation(content, opts.key, opts.annotationKey, opts.annotationValue);
    fs.writeFileSync(filePath, updated, 'utf8');
    log('info', `Added @${opts.annotationKey} to ${opts.key}`);
    return;
  }

  if (opts.action === 'strip') {
    const stripped = stripAnnotations(content);
    fs.writeFileSync(filePath, stripped, 'utf8');
    log('info', 'Stripped all annotations from ' + opts.file);
    return;
  }

  if (opts.action === 'list') {
    const annotations = extractAnnotations(lines);
    if (annotations.size === 0) {
      log('info', 'No annotations found.');
      return;
    }
    for (const [key, anns] of annotations) {
      const parts = Object.entries(anns).map(([k, v]) => v === true ? `@${k}` : `@${k}:${v}`);
      console.log(`${key}: ${parts.join(' ')}`);
    }
    return;
  }

  if (opts.action === 'filter') {
    const keys = filterByAnnotation(lines, opts.filter);
    if (keys.length === 0) {
      log('info', `No keys with @${opts.filter} annotation.`);
    } else {
      keys.forEach(k => console.log(k));
    }
    return;
  }

  log('error', 'Unknown action. Use: add | strip | list | filter');
  process.exit(1);
}

module.exports = { parseAnnotateArgs, runAnnotateCommand };
