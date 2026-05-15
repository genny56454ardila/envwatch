// envMask.js — mask sensitive env values for display/logging

const DEFAULT_MASK = '********';
const SENSITIVE_PATTERNS = [
  /secret/i,
  /password/i,
  /passwd/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
  /cert/i,
  /passphrase/i,
];

function isSensitiveKey(key) {
  return SENSITIVE_PATTERNS.some((pat) => pat.test(key));
}

function maskValue(value, maskChar = DEFAULT_MASK) {
  if (!value || value.trim() === '') return value;
  return maskChar;
}

function partialMask(value, visibleChars = 4, maskChar = '*') {
  if (!value || value.length <= visibleChars) return maskChar.repeat(8);
  const visible = value.slice(-visibleChars);
  return maskChar.repeat(8) + visible;
}

function maskEnv(envMap, options = {}) {
  const {
    maskChar = DEFAULT_MASK,
    partial = false,
    visibleChars = 4,
    customKeys = [],
  } = options;

  const result = new Map();
  for (const [key, value] of envMap) {
    const sensitive = isSensitiveKey(key) || customKeys.includes(key);
    if (sensitive) {
      const masked = partial
        ? partialMask(value, visibleChars)
        : maskValue(value, maskChar);
      result.set(key, masked);
    } else {
      result.set(key, value);
    }
  }
  return result;
}

function listMaskedKeys(envMap, customKeys = []) {
  const keys = [];
  for (const [key] of envMap) {
    if (isSensitiveKey(key) || customKeys.includes(key)) {
      keys.push(key);
    }
  }
  return keys;
}

function serializeMasked(maskedMap) {
  const lines = [];
  for (const [key, value] of maskedMap) {
    lines.push(`${key}=${value}`);
  }
  return lines.join('\n');
}

module.exports = {
  isSensitiveKey,
  maskValue,
  partialMask,
  maskEnv,
  listMaskedKeys,
  serializeMasked,
};
