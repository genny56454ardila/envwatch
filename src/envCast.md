# envCast

Cast `.env` string values to typed JavaScript primitives.

## Why

All `.env` values are strings by default. `envCast` converts them to booleans, numbers, arrays, or parsed JSON automatically — or via an explicit schema.

## API

### `autoCast(value: string): any`

Attempts to detect and cast a string to the most appropriate type in this order:
1. Boolean (`true`, `false`, `yes`, `no`, `on`, `off`, `1`, `0`)
2. Number
3. JSON object/array
4. String (fallback)

### `castEnv(envMap: Record<string, string>): Record<string, any>`

Runs `autoCast` on every value in the map and returns a new typed object.

```js
const { castEnv } = require('./envCast');
const typed = castEnv({ DEBUG: 'true', PORT: '3000', APP: 'myapp' });
// => { DEBUG: true, PORT: 3000, APP: 'myapp' }
```

### `castEnvWithSchema(envMap, schema): Record<string, any>`

Cast specific keys using explicit type hints.

Supported types: `'boolean'`, `'number'`, `'array'`, `'json'`, `'string'`

```js
const typed = castEnvWithSchema(
  { TAGS: 'api,web', PORT: '8080' },
  { TAGS: 'array', PORT: 'number' }
);
// => { TAGS: ['api', 'web'], PORT: 8080 }
```

## Low-level helpers

| Function | Description |
|---|---|
| `castBoolean(value)` | Returns `true`/`false` or `null` |
| `castNumber(value)` | Returns a number or `null` |
| `castArray(value)` | Splits on `,`, trims, filters empty |
| `castJSON(value)` | Parses JSON or returns `null` |
