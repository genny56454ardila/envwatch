/**
 * envTokenize.js
 * Tokenizes a .env file into structured tokens for analysis and tooling.
 */

'use strict';

const TOKEN_TYPES = {
  COMMENT: 'COMMENT',
  BLANK: 'BLANK',
  ASSIGNMENT: 'ASSIGNMENT',
  INVALID: 'INVALID',
};

/**
 * Tokenize a single line from a .env file.
 * @param {string} line
 * @param {number} lineNumber
 * @returns {{ type: string, raw: string, line: number, key?: string, value?: string, comment?: string }}
 */
function tokenizeLine(line, lineNumber) {
  const raw = line;
  const trimmed = line.trim();

  if (trimmed === '') {
    return { type: TOKEN_TYPES.BLANK, raw, line: lineNumber };
  }

  if (trimmed.startsWith('#')) {
    return { type: TOKEN_TYPES.COMMENT, raw, line: lineNumber, comment: trimmed.slice(1).trim() };
  }

  const eqIndex = trimmed.indexOf('=');
  if (eqIndex === -1) {
    return { type: TOKEN_TYPES.INVALID, raw, line: lineNumber, reason: 'missing equals sign' };
  }

  const key = trimmed.slice(0, eqIndex).trim();
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
    return { type: TOKEN_TYPES.INVALID, raw, line: lineNumber, reason: `invalid key name: "${key}"` };
  }

  let value = trimmed.slice(eqIndex + 1);
  let comment = undefined;

  // Strip inline comment (not inside quotes)
  const inlineMatch = value.match(/^([^"'#]*)#(.*)$/);
  if (inlineMatch) {
    value = inlineMatch[1].trim();
    comment = inlineMatch[2].trim();
  }

  // Strip surrounding quotes
  const quotedMatch = value.match(/^(["'])(.*?)\1$/);
  if (quotedMatch) {
    value = quotedMatch[2];
  } else {
    value = value.trim();
  }

  return { type: TOKEN_TYPES.ASSIGNMENT, raw, line: lineNumber, key, value, ...(comment !== undefined && { comment }) };
}

/**
 * Tokenize full .env file content into an array of tokens.
 * @param {string} content
 * @returns {Array}
 */
function tokenize(content) {
  const lines = content.split('\n');
  return lines.map((line, i) => tokenizeLine(line, i + 1));
}

/**
 * Filter tokens to only ASSIGNMENT type.
 * @param {Array} tokens
 * @returns {Array}
 */
function getAssignments(tokens) {
  return tokens.filter(t => t.type === TOKEN_TYPES.ASSIGNMENT);
}

/**
 * Filter tokens to only INVALID type.
 * @param {Array} tokens
 * @returns {Array}
 */
function getInvalidTokens(tokens) {
  return tokens.filter(t => t.type === TOKEN_TYPES.INVALID);
}

module.exports = { tokenize, tokenizeLine, getAssignments, getInvalidTokens, TOKEN_TYPES };
