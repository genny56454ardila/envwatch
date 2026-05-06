# envExporter

The `envExporter` module allows you to export your current `.env` file variables into different formats useful for CI/CD pipelines, Docker deployments, or shell scripting.

## Supported Formats

| Format   | Description                              | Default Output File    |
|----------|------------------------------------------|------------------------|
| `json`   | Pretty-printed JSON object               | `env-export.json`      |
| `shell`  | Shell `export KEY=VALUE` statements      | `env-export.sh`        |
| `docker` | Docker `--env-file` compatible format    | `env-export.env`       |

## CLI Usage

```bash
# Export to JSON (default)
envwatch export

# Export to shell script
envwatch export --format shell --output ./scripts/load-env.sh

# Export a specific env file in Docker format
envwatch export -f docker -e .env.production -o deploy/.env
```

## Programmatic Usage

```js
const { exportEnv } = require('./envExporter');
const { parseEnvFile } = require('./envParser');

const envMap = parseEnvFile('.env');

// Write as JSON
exportEnv(envMap, 'json', './env-export.json');

// Write as shell exports
exportEnv(envMap, 'shell', './load-env.sh');

// Write as Docker env file
exportEnv(envMap, 'docker', './docker.env');
```

## Notes

- Shell values containing spaces, quotes, or special characters are automatically quoted.
- The output directory is created automatically if it does not exist.
- Throws an `Error` if an unsupported format is specified.
