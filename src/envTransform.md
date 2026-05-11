# envTransform

Utilities for transforming `.env` variable keys and values in bulk.

## Functions

### `keysToUpper(envMap)`
Converts all keys in the env map to `UPPER_SNAKE_CASE`.

### `keysToLower(envMap)`
Converts all keys to `lower_snake_case`.

### `addPrefix(envMap, prefix)`
Prepends `prefix` to every key.

```js
addPrefix({ FOO: '1' }, 'APP_') // => { APP_FOO: '1' }
```

### `stripPrefix(envMap, prefix)`
Removes `prefix` from keys that start with it; other keys are left unchanged.

```js
stripPrefix({ APP_FOO: '1', OTHER: '2' }, 'APP_') // => { FOO: '1', OTHER: '2' }
```

### `transformValues(envMap, fn)`
Applies a custom `fn(value, key) => string` to every value.

### `trimValues(envMap)`
Trims leading/trailing whitespace from all values.

---

## CLI — `transform` command

```
envwatch transform [options]
```

| Flag | Description |
|------|-------------|
| `--input, -i <file>` | Source `.env` file (default: `.env`) |
| `--output, -o <file>` | Write result to file (default: stdout) |
| `--upper` | Convert all keys to uppercase |
| `--lower` | Convert all keys to lowercase |
| `--trim` | Trim whitespace from all values |
| `--add-prefix <p>` | Add prefix `p` to all keys |
| `--strip-prefix <p>` | Strip prefix `p` from matching keys |

### Examples

```bash
# Uppercase all keys and write to a new file
envwatch transform --input .env.local --upper --output .env.prod

# Strip a prefix and print to stdout
envwatch transform --strip-prefix APP_

# Chain multiple transforms
envwatch transform --trim --upper --add-prefix MYAPP_
```
