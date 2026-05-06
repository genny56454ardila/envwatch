# envDiff — Change Report Feature

Generates human-readable diff reports when `.env` files change.

## Usage

```js
const { generateDiffReport, printDiffReport } = require('./diffReporter');

const report = generateDiffReport(prevEnv, nextEnv);
printDiffReport(report);
```

## Report Structure

```json
{
  "added": { "NEW_KEY": "value" },
  "removed": { "OLD_KEY": "value" },
  "changed": { "API_URL": { "from": "http://old", "to": "http://new" } },
  "unchanged": 5,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Change Types

- **added** — keys present in new env but not in old
- **removed** — keys present in old env but not in new
- **changed** — keys present in both but with different values
- **unchanged** — count of keys with identical values
