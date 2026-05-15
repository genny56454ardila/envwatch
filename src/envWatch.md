# envWatch

High-level orchestration layer that ties together file watching, env diffing, history recording, snapshotting, and process reloading into a single `startEnvWatch` call.

## API

### `startEnvWatch(envPath, opts?) → Promise<stop>`

Begins watching `envPath` for changes.

| Option | Type | Default | Description |
|---|---|---|---|
| `command` | `string` | — | Shell command to spawn as the child process |
| `reload` | `boolean` | `true` | Re-apply env to the running process on change |
| `snapshot` | `boolean` | `false` | Save a snapshot after each detected change |

Returns a `stop()` function that unregisters the file watcher.

```js
const { startEnvWatch } = require('./envWatch');

const stop = await startEnvWatch('.env', {
  command: 'node server.js',
  snapshot: true,
});

// later…
stop();
```

### `handleEnvChange(envPath)`

Manually trigger a change check against the last known env state. Useful for testing or manual reloads.

## Behaviour

1. On startup the current `.env` is parsed and stored as the baseline.
2. When the file changes, the new content is diffed against the baseline.
3. If no effective changes are found (e.g. only whitespace), nothing happens.
4. Otherwise the diff is recorded in `envHistory`, an optional snapshot is saved, and (if `reload` is not `false`) `applyEnvToProcess` is called.
5. The baseline is updated to the new env map.
