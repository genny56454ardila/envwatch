# envRequire

Validates that a set of required environment variable keys are present and non-empty in a `.env` file.

## Functions

### `requireKeys(envMap, requiredKeys)`
Returns `{ ok, missing }` where `ok` is `true` only if all keys exist and are non-empty.

```js
const { requireKeys } = require('./envRequire');
const { parseEnvFile } = require('./envParser');

const env = parseEnvFile('.env');
const { ok, missing } = requireKeys(env, ['PORT', 'DB_URL', 'SECRET_KEY']);
if (!ok) console.error('Missing:', missing);
```

### `findMissingKeys(envMap, requiredKeys)`
Returns an array of keys that are absent or blank.

### `parseRequireFile(content)`
Parses a plain-text file listing required keys, one per line. Lines starting with `#` and blank lines are ignored.

```
# Database
DB_URL
DB_PASSWORD

# App
PORT
SECRET_KEY
```

### `formatMissingIssues(missingKeys)`
Formats missing keys as human-readable strings suitable for CLI output.

## CLI Usage

```bash
envwatch require PORT DB_URL --env .env.production
envwatch require --require-file required-keys.txt --env .env
```

Exits with code `1` if any required keys are missing.
