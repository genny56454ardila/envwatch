/**
 * envScope.js — Scope env vars by environment name (e.g. dev, staging, prod)
 * Supports scoped keys like APP_DEV_PORT=3000, APP_PROD_PORT=8080
 */

/**
 * Extract vars matching a given scope prefix pattern: KEY_<SCOPE>_SUFFIX
 * Returns a map with the scope segment stripped: { SUFFIX: value }
 */
function extractScope(envMap, scope) {
  if (!scope || typeof scope !== 'string') throw new Error('scope must be a non-empty string');
  const upper = scope.toUpperCase();
  const result = new Map();
  for (const [key, value] of envMap) {
    const match = key.match(new RegExp(`^(.+)_${upper}_(.+)$`));
    if (match) {
      result.set(`${match[1]}_${match[2]}`, value);
    }
  }
  return result;
}

/**
 * Inject scope into keys: { PORT: 3000 } + scope 'dev' => { APP_DEV_PORT: 3000 }
 * Prepends a namespace if provided.
 */
function injectScope(envMap, scope, namespace = '') {
  if (!scope) throw new Error('scope is required');
  const upper = scope.toUpperCase();
  const ns = namespace ? namespace.toUpperCase() + '_' : '';
  const result = new Map();
  for (const [key, value] of envMap) {
    result.set(`${ns}${upper}_${key}`, value);
  }
  return result;
}

/**
 * List all distinct scopes found in an env map given a namespace.
 * e.g. APP_DEV_PORT, APP_PROD_PORT => ['DEV', 'PROD']
 */
function listScopes(envMap, namespace = '') {
  const ns = namespace ? namespace.toUpperCase() + '_' : '';
  const scopes = new Set();
  for (const key of envMap.keys()) {
    const pattern = new RegExp(`^${ns}([A-Z0-9]+)_[A-Z0-9_]+$`);
    const match = key.match(pattern);
    if (match) scopes.add(match[1]);
  }
  return Array.from(scopes).sort();
}

/**
 * Merge a scoped env on top of a base env map.
 * Scoped keys override base keys.
 */
function applyScopeOverrides(baseMap, envMap, scope, namespace = '') {
  const scoped = extractScope(envMap, scope);
  const result = new Map(baseMap);
  for (const [key, value] of scoped) {
    result.set(key, value);
  }
  return result;
}

module.exports = { extractScope, injectScope, listScopes, applyScopeOverrides };
