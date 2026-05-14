# envAudit

Audits `.env` files for sensitive keys with weak or missing values.

## Functions

### `isSensitiveKey(key)`
Returns `true` if the key name suggests it holds sensitive data (e.g. contains `SECRET`, `PASSWORD`, `TOKEN`, `KEY`, `PRIVATE`).

### `isWeakValue(value)`
Returns `true` if the value is considered weak — empty string, `changeme`, `password`, `secret`, `1234`, `test`, `example`, or fewer than 8 characters.

### `auditEnv(envMap)`
Audits all entries in the provided env map. Returns an array of issue objects:
```js
[
  { key: 'DB_PASSWORD', severity: 'error', message: 'Sensitive key has a weak or missing value' },
  { key: 'API_KEY', severity: 'warning', message: 'Sensitive key value is very short' }
]
```

### `hasAuditErrors(issues)`
Returns `true` if any issue has `severity === 'error'`.

### `formatAuditIssues(issues)`
Formats issues into a human-readable string for CLI output.

## Usage

```js
const { auditEnv, formatAuditIssues } = require('./envAudit');
const { parseEnvFile } = require('./envParser');

const env = parseEnvFile('.env');
const issues = auditEnv(env);
console.log(formatAuditIssues(issues));
```

## Severity Levels

- **error** — sensitive key with empty or known-weak value
- **warning** — sensitive key with a short but non-empty value
