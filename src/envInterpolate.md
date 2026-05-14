# envInterpolate

Resolves variable references within `.env` file values, supporting both `${VAR}` and `$VAR` syntax.

## Features

- **Recursive resolution** — values referencing other values are fully expanded
- **Cycle detection** — circular references are detected and left unmodified
- **Unknown reference passthrough** — unresolvable refs are preserved as-is
- **Unresolved key reporting** — identify which keys still contain refs after interpolation

## API

### `interpolateValue(value, envMap, seen?)`

Expands a single string value using keys from `envMap`.

```js
const env = new Map([['ROOT', '/app']]);
interpolateValue('${ROOT}/logs', env); // '/app/logs'
```

### `interpolateEnv(envMap)`

Returns a new `Map` with all values interpolated.

```js
const env = new Map([['BASE', '/data'], ['PATH', '${BASE}/files']]);
const resolved = interpolateEnv(env);
resolved.get('PATH'); // '/data/files'
```

### `findUnresolved(envMap)`

Returns an array of keys whose values still contain unresolved references after interpolation.

```js
const env = new Map([['A', '${MISSING}/x']]);
findUnresolved(env); // ['A']
```

## CLI Usage

```bash
# Print interpolated env to stdout
envwatch interpolate --input .env

# Write interpolated output to a new file
envwatch interpolate --input .env --output .env.resolved

# Check for unresolved references (exit 1 if any found)
envwatch interpolate --input .env --check
```

## Notes

- Only keys present in the same file are used for resolution
- System environment variables are not consulted
- Quoted values are handled correctly by the parser before interpolation
