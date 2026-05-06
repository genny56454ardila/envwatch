const { encryptValue, decryptValue, encryptEnv, decryptEnv, isEncrypted } = require('./envEncrypt');

const PASS = 'test-passphrase-123';

describe('encryptValue / decryptValue', () => {
  test('round-trips a simple string', () => {
    const cipher = encryptValue('hello world', PASS);
    expect(decryptValue(cipher, PASS)).toBe('hello world');
  });

  test('produces different ciphertext each call (random IV)', () => {
    const c1 = encryptValue('same', PASS);
    const c2 = encryptValue('same', PASS);
    expect(c1).not.toBe(c2);
  });

  test('throws on malformed ciphertext', () => {
    expect(() => decryptValue('notvalid', PASS)).toThrow('Invalid encrypted value format');
  });

  test('throws with wrong passphrase', () => {
    const cipher = encryptValue('secret', PASS);
    expect(() => decryptValue(cipher, 'wrong-pass')).toThrow();
  });
});

describe('isEncrypted', () => {
  test('returns true for enc: prefixed values', () => {
    expect(isEncrypted('enc:abc:def')).toBe(true);
  });

  test('returns false for plain values', () => {
    expect(isEncrypted('plaintext')).toBe(false);
    expect(isEncrypted('')).toBe(false);
  });
});

describe('encryptEnv / decryptEnv', () => {
  const env = { DB_PASS: 'secret', API_KEY: 'key123', HOST: 'localhost' };

  test('encrypts all keys when keysToEncrypt is null', () => {
    const encrypted = encryptEnv(env, PASS);
    expect(isEncrypted(encrypted.DB_PASS)).toBe(true);
    expect(isEncrypted(encrypted.API_KEY)).toBe(true);
    expect(isEncrypted(encrypted.HOST)).toBe(true);
  });

  test('encrypts only specified keys', () => {
    const encrypted = encryptEnv(env, PASS, ['DB_PASS', 'API_KEY']);
    expect(isEncrypted(encrypted.DB_PASS)).toBe(true);
    expect(isEncrypted(encrypted.API_KEY)).toBe(true);
    expect(encrypted.HOST).toBe('localhost');
  });

  test('full round-trip encrypt then decrypt', () => {
    const encrypted = encryptEnv(env, PASS);
    const decrypted = decryptEnv(encrypted, PASS);
    expect(decrypted).toEqual(env);
  });

  test('decryptEnv leaves plain values untouched', () => {
    const mixed = { HOST: 'localhost', DB_PASS: 'enc:' + require('./envEncrypt').encryptValue('secret', PASS) };
    const result = decryptEnv(mixed, PASS);
    expect(result.HOST).toBe('localhost');
    expect(result.DB_PASS).toBe('secret');
  });
});
