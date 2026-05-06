// envTemplate.js — Generate .env.example files from existing .env files

const fs = require('fs');
const { parseEnvContent } = require('./envParser');

/**
 * Redact a value: replace with a placeholder hint based on key name.
 */
function redactValue(key, value) {
  if (!value) return '';
  const lower = key.toLowerCase();
  if (lower.includes('url') || lower.includes('uri')) return 'http://example.com';
  if (lower.includes('port')) return '3000';
  if (lower.includes('host')) return 'localhost';
  if (lower.includes('email')) return 'user@example.com';
  if (lower.includes('secret') || lower.includes('password') || lower.includes('token') || lower.includes('key')) {
    return 'your_' + lower + '_here';
  }
  // generic: mask with same length placeholder
  return 'REPLACE_ME';
}

/**
 * Generate template lines from parsed env entries.
 * Preserves comments and blank lines from original content.
 */
function generateTemplate(rawContent) {
  const lines = rawContent.split('\n');
  const result = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // blank lines and comments pass through
    if (!trimmed || trimmed.startsWith('#')) {
      result.push(line);
      continue;
    }
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) {
      result.push(line);
      continue;
    }
    const key = line.slice(0, eqIdx).trim();
    const value = line.slice(eqIdx + 1).trim();
    const redacted = redactValue(key, value);
    result.push(`${key}=${redacted}`);
  }

  return result.join('\n');
}

/**
 * Read an env file and write a .env.example template.
 */
function writeTemplate(inputPath, outputPath) {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }
  const raw = fs.readFileSync(inputPath, 'utf8');
  const template = generateTemplate(raw);
  fs.writeFileSync(outputPath, template, 'utf8');
  return template;
}

module.exports = { redactValue, generateTemplate, writeTemplate };
