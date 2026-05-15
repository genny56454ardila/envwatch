// envTagging.js — tag env keys with metadata labels (e.g. 'required', 'secret', 'deprecated')

const VALID_TAGS = ['required', 'secret', 'deprecated', 'internal', 'readonly'];

/**
 * Parse a tags comment line like: # @tags required,secret
 * Returns array of tag strings or empty array.
 */
function parseTagComment(line) {
  const match = line.match(/^#\s*@tags?\s+([\w,\s]+)/i);
  if (!match) return [];
  return match[1].split(',').map(t => t.trim()).filter(Boolean);
}

/**
 * Extract tags from env content by scanning comments above each key.
 * Returns a Map of key -> string[]
 */
function extractTags(envContent) {
  const lines = envContent.split('\n');
  const tagMap = new Map();
  let pendingTags = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) {
      const tags = parseTagComment(trimmed);
      if (tags.length > 0) pendingTags = tags;
      else pendingTags = [];
      continue;
    }
    const kvMatch = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=/);
    if (kvMatch && pendingTags.length > 0) {
      tagMap.set(kvMatch[1], [...pendingTags]);
      pendingTags = [];
    } else {
      pendingTags = [];
    }
  }
  return tagMap;
}

/**
 * Filter an env Map to only keys that have a specific tag.
 */
function filterByTag(envMap, tagMap, tag) {
  const result = new Map();
  for (const [key, value] of envMap) {
    const tags = tagMap.get(key) || [];
    if (tags.includes(tag)) result.set(key, value);
  }
  return result;
}

/**
 * Validate that all tags are from the known set.
 * Returns array of { key, tag } for unknown tags.
 */
function validateTags(tagMap) {
  const issues = [];
  for (const [key, tags] of tagMap) {
    for (const tag of tags) {
      if (!VALID_TAGS.includes(tag)) {
        issues.push({ key, tag });
      }
    }
  }
  return issues;
}

/**
 * Format tag issues for display.
 */
function formatTagIssues(issues) {
  return issues.map(i => `  [unknown tag] ${i.key}: "${i.tag}"`).join('\n');
}

module.exports = {
  VALID_TAGS,
  parseTagComment,
  extractTags,
  filterByTag,
  validateTags,
  formatTagIssues,
};
