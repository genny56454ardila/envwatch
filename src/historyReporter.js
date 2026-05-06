/**
 * historyReporter.js
 * Formats and prints env change history to stdout.
 */

const { getHistory, getRecentHistory } = require('./envHistory');
const { colorize, timestamp } = require('./logger');

/**
 * Format a single history entry as a human-readable string.
 * @param {Object} entry
 * @returns {string}
 */
function formatEntry(entry) {
  const lines = [];
  const ts = new Date(entry.timestamp).toISOString();
  lines.push(`${colorize('cyan', ts)} ${colorize('dim', entry.envFile)}`);

  const added = Object.entries(entry.added);
  const removed = Object.entries(entry.removed);
  const changed = Object.entries(entry.changed);

  if (added.length === 0 && removed.length === 0 && changed.length === 0) {
    lines.push(`  ${colorize('dim', '(no changes)')}`);
  }

  added.forEach(([k, v]) => {
    lines.push(`  ${colorize('green', `+ ${k}`)}=${v}`);
  });
  removed.forEach(([k, v]) => {
    lines.push(`  ${colorize('red', `- ${k}`)}=${v}`);
  });
  changed.forEach(([k, { from, to }]) => {
    lines.push(`  ${colorize('yellow', `~ ${k}`)} ${colorize('dim', from)} → ${to}`);
  });

  return lines.join('\n');
}

/**
 * Print the last n history entries to stdout.
 * @param {number} n
 */
function printRecentHistory(n = 10) {
  const entries = getRecentHistory(n);
  if (entries.length === 0) {
    console.log(colorize('dim', 'No env change history recorded yet.'));
    return;
  }
  console.log(colorize('bold', `\n── Last ${entries.length} env change(s) ──`));
  entries.forEach((entry) => {
    console.log(formatEntry(entry));
    console.log(colorize('dim', '─'.repeat(40)));
  });
}

/**
 * Print all recorded history.
 */
function printFullHistory() {
  const entries = getHistory();
  if (entries.length === 0) {
    console.log(colorize('dim', 'No env change history recorded yet.'));
    return;
  }
  console.log(colorize('bold', `\n── Full env change history (${entries.length} event(s)) ──`));
  entries.forEach((entry) => {
    console.log(formatEntry(entry));
    console.log(colorize('dim', '─'.repeat(40)));
  });
}

module.exports = { formatEntry, printRecentHistory, printFullHistory };
