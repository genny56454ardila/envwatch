// envPromote.js — copy/promote env vars from one environment file to another

const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('./envParser');

/**
 * Promote selected keys from a source env map into a target env map.
 * Existing keys in target are overwritten only if `overwrite` is true.
 */
function promoteKeys(source, target, keys, { overwrite = false } = {}) {
  const result = new Map(target);
  const promoted = [];
  const skipped = [];

  for (const key of keys) {
    if (!source.has(key)) continue;
    if (result.has(key) && !overwrite) {
      skipped.push(key);
      continue;
    }
    result.set(key, source.get(key));
    promoted.push(key);
  }

  return { result, promoted, skipped };
}

/**
 * Promote all keys from source into target (respecting overwrite flag).
 */
function promoteAll(source, target, { overwrite = false } = {}) {
  return promoteKeys(source, target, [...source.keys()], { overwrite });
}

/**
 * Serialize a Map back to .env file format.
 */
function serializeEnv(map) {
  return [...map.entries()].map(([k, v]) => `${k}=${v}`).join('\n') + '\n';
}

/**
 * Promote keys from sourceFile into targetFile, writing result to outputPath.
 */
function promoteEnvFile(sourceFile, targetFile, outputPath, keys, options = {}) {
  const source = parseEnvFile(sourceFile);
  const target = fs.existsSync(targetFile) ? parseEnvFile(targetFile) : new Map();

  const keysToPromote = keys && keys.length > 0 ? keys : [...source.keys()];
  const { result, promoted, skipped } = promoteKeys(source, target, keysToPromote, options);

  fs.writeFileSync(outputPath, serializeEnv(result), 'utf8');
  return { promoted, skipped };
}

module.exports = { promoteKeys, promoteAll, serializeEnv, promoteEnvFile };
