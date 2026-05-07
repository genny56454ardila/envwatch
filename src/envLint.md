# envLint

Lint `.env` files for common mistakes and style issues.

## Rules

| Rule | Severity | Description |
|---|---|---|
| `noEmptyKey` | error | Key name must not be empty |
| `noSpacesInKey` | error | Key must not contain whitespace |
| `noLowercaseKey` | warning | Keys should be UPPERCASE |
| `noQuotedNumbers` | warning | Numeric values should not be quoted |
| `noTrailingSpace` | warning | Values should not have trailing whitespace |

## API

### `lintEnv(parsed, enabledRules?)`

Lint a parsed env object. Returns an array of issue objects.

```js
const { parseEnvFile } = require('./envParser');
const { lintEnv, formatIssues } = require('./envLint');

const parsed = parseEnvFile('.env');
const issues = lintEnv(parsed);
console.log(formatIssues(issues));
```

### `hasErrors(issues)`

Returns `true` if any issue has `severity: 'error'`.

### `formatIssues(issues)`

Returns a human-readable string summary of all issues.

## CLI

```bash
node src/lintCommand.js --file .env --strict
node src/lintCommand.js -f staging.env --rules noLowercaseKey,noTrailingSpace
```

### Flags

- `--file`, `-f` — Path to the `.env` file (default: `.env`)
- `--rules` — Comma-separated list of rules to run
- `--strict` — Exit with code 1 if any errors are found
