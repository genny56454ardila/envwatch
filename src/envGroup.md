# envGroup

Groups environment variables by prefix or explicit key definitions.

## Functions

### `groupByPrefix(envMap, separator?)`

Groups all keys in `envMap` by their prefix (the part before the first `separator`, default `_`).

Keys with no separator are placed in the `__ungrouped__` group.

```js
const { groupByPrefix } = require('./envGroup');
const groups = groupByPrefix(envMap);
// groups.DB -> Map { DB_HOST => 'localhost', DB_PORT => '5432' }
```

### `groupByKeys(envMap, groupDefs)`

Assigns keys to named groups based on explicit lists. Unassigned keys go to `__ungrouped__`.

```js
const groups = groupByKeys(envMap, {
  database: ['DB_HOST', 'DB_PORT'],
  app: ['APP_NAME', 'APP_PORT']
});
```

### `serializeGroups(groups)`

Converts grouped maps to a labeled `.env`-style string with section headers.

```
# [DB]
DB_HOST=localhost
DB_PORT=5432

# [APP]
APP_NAME=myapp
```

## CLI Usage

```bash
# Group by prefix (default)
envwatch group --file .env

# Group by prefix with custom separator
envwatch group --file .env --separator .

# Group by explicit key lists
envwatch group --file .env --group database=DB_HOST,DB_PORT --group app=APP_NAME

# Write output to file
envwatch group --file .env --output .env.grouped
```
