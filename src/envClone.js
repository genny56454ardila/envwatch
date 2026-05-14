// envClone.js — copy an env file to a new location with optional key filtering and transforms

const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('./envParser');
const { applyFilters } = require('./envFilter');

/**
 * Clone an env file to a destination path.
 * @param {string} src - source .env file path
 * @param {string} dest - destination file path
 * @param {object} options
 * @param {string[]} [options.only] - only include these keys
 * @param {string[]} [options.exclude] - exclude these keys
 * @param {string} [options.prefix] - only keys with this prefix
 * @param {boolean} [options.overwrite=false] - overwrite dest if it exists
 * @returns {{ written: string, count: number }}
 */
function cloneEnvFile(src, dest, options = {}) {
  const { only = [], exclude = [], prefix = null, overwrite = false } = options;

  if (!fs.existsSync(src)) {
    throw new Error(`Source file not found: ${src}`);
  }

  if (!overwrite && fs.existsSync(dest)) {
    throw new Error(`Destination already exists: ${dest}. Use overwrite=true to replace.`);
  }

  const envMap = parseEnvFile(src);

  const filterOpts = {};
  if (prefix) filterOpts.prefix = prefix;
  if (only.length) filterOpts.keys = only;
  if (exclude.length) filterOpts.exclude = exclude;

  const filtered = Object.keys(filterOpts).length
    ? applyFilters(envMap, filterOpts)
    : envMap;

  const lines = Object.entries(filtered).map(([k, v]) => `${k}=${v}`);
  const content = lines.join('\n') + (lines.length ? '\n' : '');

  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.writeFileSync(dest, content, 'utf8');

  return { written: dest, count: lines.length };
}

/**
 * Preview clone without writing.
 * @returns {{ dest: string, entries: object }}
 */
function previewClone(src, dest, options = {}) {
  const { only = [], exclude = [], prefix = null } = options;

  if (!fs.existsSync(src)) {
    throw new Error(`Source file not found: ${src}`);
  }

  const envMap = parseEnvFile(src);
  const filterOpts = {};
  if (prefix) filterOpts.prefix = prefix;
  if (only.length) filterOpts.keys = only;
  if (exclude.length) filterOpts.exclude = exclude;

  const filtered = Object.keys(filterOpts).length
    ? applyFilters(envMap, filterOpts)
    : envMap;

  return { dest, entries: filtered };
}

module.exports = { cloneEnvFile, previewClone };
