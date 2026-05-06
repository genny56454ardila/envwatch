# envMerge

Merges multiple `.env` files into a single unified environment map.

## API

### `mergeEnvs(...sources)`

Accepts any number of plain env objects `{ KEY: 'value' }` and merges them
left-to-right — **last source wins** on conflict.

Returns `{ merged, conflicts }` where `conflicts` is an array of:
```js
{ key: 'PORT', previous: '3000', current: '4000' }
```

### `mergeWithPriority(sources)`

Accepts an array of `{ env, priority }` objects. Sources are sorted by
`priority` ascending before merging, so the highest priority value wins.

```js
mergeWithPriority([
  { env: { PORT: '3000' }, priority: 1 },   // base
  { env: { PORT: '4000' }, priority: 10 },  // overrides
]);
// => merged.PORT === '4000'
```

### `overrideKeys(base, override)`

Returns only the keys from `override` that differ from `base`. Useful for
producing a minimal diff-patch env object.

## CLI usage (via `mergeCommand`)

```bash
envwatch merge .env .env.local --output .env.merged
envwatch merge .env .env.local --priority
```

- `--output <file>` — write result to a file instead of stdout
- `--priority`     — treat file order as ascending priority (last file wins)

Conflicts are always reported as warnings.
