# envwatch

> Lightweight utility that monitors `.env` file changes and hot-reloads Node.js processes in development.

---

## Installation

```bash
npm install --save-dev envwatch
```

Or with yarn:

```bash
yarn add --dev envwatch
```

---

## Usage

Wrap your start command with `envwatch` to automatically restart your process whenever `.env` changes are detected.

```bash
npx envwatch node index.js
```

You can also use it programmatically:

```js
const envwatch = require('envwatch');

envwatch.watch('.env', () => {
  console.log('.env changed — reloading...');
});
```

Or add it to your `package.json` scripts:

```json
"scripts": {
  "dev": "envwatch node server.js"
}
```

By default, `envwatch` monitors `.env` in the current working directory. You can specify a custom path:

```bash
npx envwatch --file ./config/.env node index.js
```

---

## Notes

- Intended for **development use only** — do not use in production environments.
- Works seamlessly alongside tools like `nodemon` and `dotenv`.

---

## License

[MIT](LICENSE) © envwatch contributors