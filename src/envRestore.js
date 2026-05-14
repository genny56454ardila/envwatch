// envRestore.js — restore .env from a saved snapshot

const fs = require('fs');
const path = require('path');
const { loadSnapshot, listSnapshots } = require('./snapshotManager');
const { log } = require('./logger');

/**
 * Restore a snapshot by tag or index to a target .env file.
 * @param {string} tagOrIndex - snapshot tag or numeric index (0 = most recent)
 * @param {string} targetPath - path to write restored .env
 * @returns {{ restored: boolean, tag: string, entries: number }}
 */
function restoreSnapshot(tagOrIndex, targetPath) {
  const snapshots = listSnapshots();

  if (!snapshots || snapshots.length === 0) {
    throw new Error('No snapshots available to restore.');
  }

  let tag;
  if (typeof tagOrIndex === 'number' || /^\d+$/.test(tagOrIndex)) {
    const idx = parseInt(tagOrIndex, 10);
    if (idx < 0 || idx >= snapshots.length) {
      throw new Error(`Snapshot index ${idx} out of range (0–${snapshots.length - 1}).`);
    }
    tag = snapshots[idx];
  } else {
    tag = tagOrIndex;
    if (!snapshots.includes(tag)) {
      throw new Error(`Snapshot "${tag}" not found.`);
    }
  }

  const envMap = loadSnapshot(tag);
  if (!envMap) {
    throw new Error(`Failed to load snapshot "${tag}".`);
  }

  const lines = Object.entries(envMap).map(([k, v]) => `${k}=${v}`);
  const content = lines.join('\n') + '\n';

  fs.writeFileSync(targetPath, content, 'utf8');

  log('info', `Restored snapshot "${tag}" → ${targetPath} (${lines.length} keys)`);

  return { restored: true, tag, entries: lines.length };
}

/**
 * Preview what a restore would write without touching the file.
 * @param {string} tagOrIndex
 * @returns {{ tag: string, envMap: object }}
 */
function previewRestore(tagOrIndex) {
  const snapshots = listSnapshots();
  let tag;
  if (typeof tagOrIndex === 'number' || /^\d+$/.test(tagOrIndex)) {
    const idx = parseInt(tagOrIndex, 10);
    tag = snapshots[idx];
  } else {
    tag = tagOrIndex;
  }
  const envMap = loadSnapshot(tag);
  return { tag, envMap };
}

module.exports = { restoreSnapshot, previewRestore };
