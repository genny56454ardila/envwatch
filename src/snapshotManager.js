/**
 * snapshotManager.js
 * Manages snapshots of .env state for rollback and comparison purposes.
 */

const fs = require('fs');
const path = require('path');
const { parseEnvContent } = require('./envParser');

const DEFAULT_SNAPSHOT_DIR = '.envwatch-snapshots';
const MAX_SNAPSHOTS = 10;

let snapshotDir = DEFAULT_SNAPSHOT_DIR;

function setSnapshotDir(dir) {
  snapshotDir = dir;
}

function ensureSnapshotDir() {
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }
}

function getSnapshotPath(label) {
  const timestamp = Date.now();
  const name = label ? `${label}-${timestamp}.json` : `snapshot-${timestamp}.json`;
  return path.join(snapshotDir, name);
}

function saveSnapshot(envContent, label) {
  ensureSnapshotDir();
  const parsed = parseEnvContent(envContent);
  const snapshot = {
    timestamp: Date.now(),
    label: label || null,
    env: parsed,
  };
  const filePath = getSnapshotPath(label);
  fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf8');
  pruneOldSnapshots();
  return filePath;
}

function loadSnapshot(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Snapshot not found: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function listSnapshots() {
  ensureSnapshotDir();
  return fs
    .readdirSync(snapshotDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const filePath = path.join(snapshotDir, f);
      const stat = fs.statSync(filePath);
      return { file: f, filePath, mtime: stat.mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);
}

function pruneOldSnapshots() {
  const snapshots = listSnapshots();
  if (snapshots.length > MAX_SNAPSHOTS) {
    const toDelete = snapshots.slice(MAX_SNAPSHOTS);
    toDelete.forEach(({ filePath }) => fs.unlinkSync(filePath));
  }
}

function getLatestSnapshot() {
  const snapshots = listSnapshots();
  if (snapshots.length === 0) return null;
  return loadSnapshot(snapshots[0].filePath);
}

module.exports = {
  saveSnapshot,
  loadSnapshot,
  listSnapshots,
  getLatestSnapshot,
  setSnapshotDir,
  pruneOldSnapshots,
};
