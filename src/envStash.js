// envStash.js — temporarily stash and pop env changes

const { parseEnvContent } = require('./envParser');
const { serializeEnv } = require('./envDefaults');

const stashes = [];

/**
 * Push current env map onto the stash stack.
 * @param {Map<string,string>} envMap
 * @param {string} [label]
 * @returns {{ index: number, label: string, timestamp: number }}
 */
function stashEnv(envMap, label = '') {
  const entry = {
    index: stashes.length,
    label: label || `stash@{${stashes.length}}`,
    timestamp: Date.now(),
    snapshot: new Map(envMap),
  };
  stashes.push(entry);
  return { index: entry.index, label: entry.label, timestamp: entry.timestamp };
}

/**
 * Pop the most recent stash (or by index) and return its env map.
 * @param {number} [index] — defaults to top of stack
 * @returns {Map<string,string>}
 */
function popStash(index) {
  if (stashes.length === 0) throw new Error('No stashes available');
  const idx = index !== undefined ? index : stashes.length - 1;
  if (idx < 0 || idx >= stashes.length) throw new Error(`Invalid stash index: ${idx}`);
  const [entry] = stashes.splice(idx, 1);
  return new Map(entry.snapshot);
}

/**
 * Peek at a stash without removing it.
 * @param {number} [index]
 * @returns {Map<string,string>}
 */
function peekStash(index) {
  if (stashes.length === 0) throw new Error('No stashes available');
  const idx = index !== undefined ? index : stashes.length - 1;
  if (idx < 0 || idx >= stashes.length) throw new Error(`Invalid stash index: ${idx}`);
  return new Map(stashes[idx].snapshot);
}

/**
 * List all stash metadata (no snapshots).
 * @returns {Array<{ index: number, label: string, timestamp: number }>}
 */
function listStashes() {
  return stashes.map(({ index, label, timestamp }) => ({ index, label, timestamp }));
}

/**
 * Clear all stashes.
 */
function clearStashes() {
  stashes.length = 0;
}

/**
 * Stash size.
 */
function stashSize() {
  return stashes.length;
}

module.exports = { stashEnv, popStash, peekStash, listStashes, clearStashes, stashSize };
