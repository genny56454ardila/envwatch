"use strict";

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

let currentLevel = LEVELS.info;
let useColor = process.stdout.isTTY;

const COLORS = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  green: "\x1b[32m",
};

function colorize(color, text) {
  return useColor ? `${COLORS[color]}${text}${COLORS.reset}` : text;
}

function timestamp() {
  return colorize("dim", new Date().toISOString());
}

function formatPrefix(level) {
  const prefixes = {
    debug: colorize("dim", "[debug]"),
    info: colorize("cyan", "[envwatch]"),
    warn: colorize("yellow", "[warn]"),
    error: colorize("red", "[error]"),
  };
  return prefixes[level] || "[envwatch]";
}

function log(level, ...args) {
  if (LEVELS[level] < currentLevel) return;
  const out = level === "error" ? process.stderr : process.stdout;
  out.write(`${timestamp()} ${formatPrefix(level)} ${args.join(" ")}\n`);
}

const logger = {
  debug: (...args) => log("debug", ...args),
  info: (...args) => log("info", ...args),
  warn: (...args) => log("warn", ...args),
  error: (...args) => log("error", ...args),

  setLevel(level) {
    if (!(level in LEVELS)) throw new Error(`Unknown log level: ${level}`);
    currentLevel = LEVELS[level];
  },

  setColor(enabled) {
    useColor = Boolean(enabled);
  },

  changed(key, type) {
    const action = {
      added: colorize("green", "added"),
      removed: colorize("red", "removed"),
      modified: colorize("yellow", "modified"),
    }[type] || type;
    log("info", `env var ${colorize("cyan", key)} was ${action}`);
  },
};

module.exports = logger;
