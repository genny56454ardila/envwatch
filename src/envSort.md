# envSort

Sorts `.env` file keys in various orders for consistency and readability.

## Functions

### `sortAlpha(envMap)`
Sorts keys alphabetically (A-Z).

### `sortByOrder(envMap, keyOrder)`
Sorts keys by a provided explicit order array. Keys not in the order list are appended at the end alphabetically.

### `sortByPrefix(envMap)`
Groups keys by their prefix (e.g. `DB_`, `APP_`) and sorts groups alphabetically, then sorts within each group.

### `serializeSorted(sortedMap)`
Converts a sorted Map or object back into `.env` file string format.

## Usage

```js
const { sortAlpha, serializeSorted } = require('./envSort');
const { parseEnvFile } = require('./envParser');

const env = parseEnvFile('.env');
const sorted = sortAlpha(env);
console.log(serializeSorted(sorted));
```

## CLI

```bash
envwatch sort --file .env --mode alpha
envwatch sort --file .env --mode prefix
envwatch sort --file .env --mode alpha --write
```

### Options

| Flag | Description |
|------|-------------|
| `--file` | Path to the `.env` file |
| `--mode` | Sort mode: `alpha`, `prefix`, or `order` |
| `--order` | Comma-separated key order (for `order` mode) |
| `--write` | Write sorted output back to the file |
