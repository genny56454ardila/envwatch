/**
 * Parses a .env file content into a key-value map.
 * Handles comments, blank lines, quoted values, and inline comments.
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Parse raw .env file content into an object.
 * @param {string} content - Raw string content of the .env file
 * @returns {Object} Parsed key-value pairs
 */
function parseEnvContent(content) {
  const result = {};

  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (!key) continue;

    // Strip inline comments (only outside quotes)
    value = stripInlineComment(value);

    // Remove surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

/**
 * Strip inline comments from a value string, respecting quotes.
 * @param {string} value
 * @returns {string}
 */
function stripInlineComment(value) {
  if (value.startsWith('"') || value.startsWith("'")) return value;
  const commentIndex = value.indexOf(' #');
  if (commentIndex !== -1) {
    return value.slice(0, commentIndex).trim();
  }
  return value;
}

/**
 * Read and parse a .env file from disk.
 * @param {string} filePath - Path to the .env file
 * @returns {Object} Parsed key-value pairs
 */
function parseEnvFile(filePath) {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    return {};
  }
  const content = fs.readFileSync(absolutePath, 'utf8');
  return parseEnvContent(content);
}

module.exports = { parseEnvContent, parseEnvFile };
