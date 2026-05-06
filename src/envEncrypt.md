# envEncrypt

Symmetric AES-256-CBC encryption helpers for protecting secret values inside `.env` files.

## API

### `encryptValue(plaintext, passphrase) → string`
Encrypts a single string value. Returns `<iv_hex>:<ciphertext_hex>`.

### `decryptValue(ciphertext, passphrase) → string`
Decrypts a value previously produced by `encryptValue`.

### `isEncrypted(value) → boolean`
Returns `true` when a value carries the `enc:` prefix used by `encryptEnv`.

### `encryptEnv(envMap, passphrase, keysToEncrypt?) → object`
Encrypts values in an env map. If `keysToEncrypt` is omitted (or `null`) all keys are encrypted. Encrypted values are stored with an `enc:` prefix so they can be detected later.

```js
const { encryptEnv } = require('./envEncrypt');
const safe = encryptEnv({ DB_PASS: 'hunter2', HOST: 'localhost' }, process.env.MASTER_KEY, ['DB_PASS']);
// { DB_PASS: 'enc:<iv>:<cipher>', HOST: 'localhost' }
```

### `decryptEnv(envMap, passphrase) → object`
Decrypts all `enc:`-prefixed values in a map, leaving plain values untouched.

```js
const { decryptEnv } = require('./envEncrypt');
const plain = decryptEnv(safe, process.env.MASTER_KEY);
// { DB_PASS: 'hunter2', HOST: 'localhost' }
```

## Notes
- A random IV is generated per encryption call, so the same plaintext produces different ciphertext each time.
- The passphrase is hashed with SHA-256 to produce a 32-byte AES key.
- Do **not** commit passphrases to source control; pass them via `ENVWATCH_MASTER_KEY` or a secrets manager.
