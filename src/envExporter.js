/**
 * envExporter.js
 * Exports current env snapshot to various formats (shell, JSON, Docker)
 */

const fs = require('fs');
const path = require('path');

/**
 * Export env vars as shell export statements
 * @param {Object} envMap
 * @returns {string}
 */
function toShellExports(envMap) {
  return Object.entries(envMap)
    .map(([key, value]) => `export ${key}=${shellQuote(value)}`)
    .join('\n');
}

/**
 * Export env vars as JSON
 * @param {Object} envMap
 * @param {boolean} pretty
 * @returns {string}
 */
function toJSON(envMap, pretty = true) {
  return JSON.stringify(envMap, null, pretty ? 2 : 0);
}

/**
 * Export env vars as Docker --env-file format
 * @param {Object} envMap
 * @returns {string}
 */
function toDockerEnvFile(envMap) {
  return Object.entries(envMap)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}

/**
 * Quote a value for shell safety
 * @param {string} value
 * @returns {string}
 */
function shellQuote(value) {
  if (/[\s"'\\$`!]/.test(value)) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  return value;
}

/**
 * Write exported content to a file
 * @param {string} outputPath
 * @param {string} content
 */
function writeExport(outputPath, content) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, content, 'utf8');
}

/**
 * Export envMap to a file in the given format
 * @param {Object} envMap
 * @param {string} format - 'shell' | 'json' | 'docker'
 * @param {string} outputPath
 */
function exportEnv(envMap, format, outputPath) {
  let content;
  switch (format) {
    case 'shell':
      content = toShellExports(envMap);
      break;
    case 'json':
      content = toJSON(envMap);
      break;
    case 'docker':
      content = toDockerEnvFile(envMap);
      break;
    default:
      throw new Error(`Unknown export format: ${format}`);
  }
  writeExport(outputPath, content);
  return content;
}

module.exports = { toShellExports, toJSON, toDockerEnvFile, shellQuote, exportEnv, writeExport };
