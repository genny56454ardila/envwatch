// diffReporter.js — generates structured diff reports from env snapshots

const { colorize, timestamp } = require('./logger');

/**
 * Generate a structured diff report between two env objects.
 * @param {Object} prevEnv
 * @param {Object} nextEnv
 * @returns {Object} report
 */
function generateDiffReport(prevEnv = {}, nextEnv = {}) {
  const added = {};
  const removed = {};
  const changed = {};
  let unchanged = 0;

  const allKeys = new Set([...Object.keys(prevEnv), ...Object.keys(nextEnv)]);

  for (const key of allKeys) {
    const inPrev = Object.prototype.hasOwnProperty.call(prevEnv, key);
    const inNext = Object.prototype.hasOwnProperty.call(nextEnv, key);

    if (inPrev && !inNext) {
      removed[key] = prevEnv[key];
    } else if (!inPrev && inNext) {
      added[key] = nextEnv[key];
    } else if (prevEnv[key] !== nextEnv[key]) {
      changed[key] = { from: prevEnv[key], to: nextEnv[key] };
    } else {
      unchanged++;
    }
  }

  return {
    added,
    removed,
    changed,
    unchanged,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Format a single diff report entry line.
 * @param {string} type  'added' | 'removed' | 'changed'
 * @param {string} key
 * @param {*} value
 * @returns {string}
 */
function formatDiffLine(type, key, value) {
  if (type === 'added') {
    return colorize('green', `  + ${key}=${value}`);
  }
  if (type === 'removed') {
    return colorize('red', `  - ${key}=${value}`);
  }
  if (type === 'changed') {
    return [
      colorize('yellow', `  ~ ${key}`),
      colorize('red',    `      from: ${value.from}`),
      colorize('green',  `      to:   ${value.to}`),
    ].join('\n');
  }
  return '';
}

/**
 * Print a diff report to stdout.
 * @param {Object} report
 */
function printDiffReport(report) {
  const ts = timestamp();
  console.log(`\n${colorize('cyan', `[${ts}] env diff report`)}`);

  const addedKeys = Object.keys(report.added);
  const removedKeys = Object.keys(report.removed);
  const changedKeys = Object.keys(report.changed);

  if (addedKeys.length === 0 && removedKeys.length === 0 && changedKeys.length === 0) {
    console.log(colorize('gray', '  no changes detected'));
    return;
  }

  for (const key of addedKeys) {
    console.log(formatDiffLine('added', key, report.added[key]));
  }
  for (const key of removedKeys) {
    console.log(formatDiffLine('removed', key, report.removed[key]));
  }
  for (const key of changedKeys) {
    console.log(formatDiffLine('changed', key, report.changed[key]));
  }

  console.log(colorize('gray', `  (${report.unchanged} key(s) unchanged)\n`));
}

module.exports = { generateDiffReport, formatDiffLine, printDiffReport };
