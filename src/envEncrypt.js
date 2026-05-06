// envEncrypt.js — simple symmetric encryption for .env secret values
const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;
const KEY_LENGTH = 32;

function deriveKey(passphrase) {
  return crypto.createHash('sha256').update(passphrase).digest();
}

function encryptValue(plaintext, passphrase) {
  const key = deriveKey(passphrase);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptValue(ciphertext, passphrase) {
  const parts = ciphertext.split(':');
  if (parts.length !== 2) throw new Error('Invalid encrypted value format');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = Buffer.from(parts[1], 'hex');
  const key = deriveKey(passphrase);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);
  return decrypted.toString('utf8');
}

function encryptEnv(envMap, passphrase, keysToEncrypt = null) {
  const result = {};
  for (const [k, v] of Object.entries(envMap)) {
    if (keysToEncrypt === null || keysToEncrypt.includes(k)) {
      result[k] = 'enc:' + encryptValue(v, passphrase);
    } else {
      result[k] = v;
    }
  }
  return result;
}

function decryptEnv(envMap, passphrase) {
  const result = {};
  for (const [k, v] of Object.entries(envMap)) {
    if (typeof v === 'string' && v.startsWith('enc:')) {
      result[k] = decryptValue(v.slice(4), passphrase);
    } else {
      result[k] = v;
    }
  }
  return result;
}

function isEncrypted(value) {
  return typeof value === 'string' && value.startsWith('enc:');
}

module.exports = { encryptValue, decryptValue, encryptEnv, decryptEnv, isEncrypted };
