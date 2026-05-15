// schemaCommand.js — CLI command for generating or validating env schemas

const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('./envParser');
const { generateSchema, validateAgainstSchema, serializeSchema } = require('./envSchema');
const { log } = require('./logger');

function parseSchemaArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    mode: 'generate',  // 'generate' | 'validate'
    envFile: '.env',
    schemaFile: null,
    output: null,
    required: true
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--validate' && args[i + 1]) {
      opts.mode = 'validate';
      opts.schemaFile = args[++i];
    } else if (args[i] === '--env' && args[i + 1]) {
      opts.envFile = args[++i];
    } else if (args[i] === '--output' && args[i + 1]) {
      opts.output = args[++i];
    } else if (args[i] === '--no-required') {
      opts.required = false;
    }
  }

  return opts;
}

async function runSchemaCommand(opts) {
  const envMap = parseEnvFile(opts.envFile);

  if (opts.mode === 'generate') {
    const schema = generateSchema(envMap, { required: opts.required });
    const out = serializeSchema(schema);
    if (opts.output) {
      fs.writeFileSync(opts.output, out, 'utf8');
      log('info', `Schema written to ${opts.output}`);
    } else {
      process.stdout.write(out + '\n');
    }
    return { success: true, schema };
  }

  if (opts.mode === 'validate') {
    if (!opts.schemaFile || !fs.existsSync(opts.schemaFile)) {
      log('error', `Schema file not found: ${opts.schemaFile}`);
      return { success: false, issues: ['Schema file not found'] };
    }
    const raw = fs.readFileSync(opts.schemaFile, 'utf8');
    const schema = JSON.parse(raw);
    const issues = validateAgainstSchema(envMap, schema);
    if (issues.length === 0) {
      log('info', `${opts.envFile} is valid against schema.`);
    } else {
      for (const issue of issues) log('warn', issue);
    }
    return { success: issues.length === 0, issues };
  }
}

module.exports = { parseSchemaArgs, runSchemaCommand };
