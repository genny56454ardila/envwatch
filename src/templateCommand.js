// templateCommand.js — CLI command for generating .env.example templates

const path = require('path');
const { writeTemplate } = require('./envTemplate');
const { log } = require('./logger');

function parseTemplateArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    input: '.env',
    output: '.env.example',
  };

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--input' || args[i] === '-i') && args[i + 1]) {
      opts.input = args[++i];
    } else if ((args[i] === '--output' || args[i] === '-o') && args[i + 1]) {
      opts.output = args[++i];
    } else if (args[i] === '--help' || args[i] === '-h') {
      opts.help = true;
    }
  }

  return opts;
}

function runTemplateCommand(argv) {
  const opts = parseTemplateArgs(argv);

  if (opts.help) {
    console.log([
      'Usage: envwatch template [options]',
      '',
      'Options:',
      '  -i, --input <file>   Source .env file (default: .env)',
      '  -o, --output <file>  Output template file (default: .env.example)',
      '  -h, --help           Show this help message',
    ].join('\n'));
    return;
  }

  const inputPath = path.resolve(process.cwd(), opts.input);
  const outputPath = path.resolve(process.cwd(), opts.output);

  try {
    writeTemplate(inputPath, outputPath);
    log('info', `Template written to ${opts.output} from ${opts.input}`);
  } catch (err) {
    log('error', `Failed to generate template: ${err.message}`);
    process.exitCode = 1;
  }
}

module.exports = { parseTemplateArgs, runTemplateCommand };
