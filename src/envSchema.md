# envSchema

Generate and validate JSON schemas from `.env` files.

## Functions

### `generateSchema(envMap, options)`

Infers a JSON schema from an env `Map<string, string>`. Types are inferred automatically:

- `"true"` / `"false"` → `boolean`
- Numeric strings → `number`
- Everything else → `string`

**Options:**
- `required` (default `true`) — include all keys in the `required` array
- `title` (default `"env schema"`) — schema title field

```js
const { generateSchema } = require('./envSchema');
const schema = generateSchema(envMap, { required: true, title: 'my app' });
```

### `validateAgainstSchema(envMap, schema)`

Validates an env map against a JSON schema object. Returns an array of issue strings.

```js
const issues = validateAgainstSchema(envMap, schema);
if (issues.length) console.error(issues);
```

### `serializeSchema(schema)`

Returns a pretty-printed JSON string of the schema.

## CLI Usage

```bash
# Generate schema from .env
envwatch schema --env .env --output schema.json

# Generate without required fields
envwatch schema --env .env --no-required

# Validate .env against existing schema
envwatch schema --validate schema.json --env .env
```

## Example Output

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "env schema",
  "type": "object",
  "properties": {
    "PORT": { "type": "number" },
    "DEBUG": { "type": "boolean" }
  },
  "required": ["PORT", "DEBUG"]
}
```
