// envAnnotate.js — add, read, and strip inline annotations from .env entries

/**
 * Parse an annotation comment from a line, e.g. # @tag:value or # @required
 * Returns an object of annotation key->value pairs (value is true if no value)
 */
function parseAnnotations(line) {
  const annotations = {};
  const match = line.match(/#\s*(.*)$/);
  if (!match) return annotations;
  const parts = match[1].split(/\s+/);
  for (const part of parts) {
    const annMatch = part.match(/^@([\w-]+)(?::(.+))?$/);
    if (annMatch) {
      annotations[annMatch[1]] = annMatch[2] !== undefined ? annMatch[2] : true;
    }
  }
  return annotations;
}

/**
 * Extract all annotations from a parsed env map's source lines.
 * Returns Map<key, annotations>
 */
function extractAnnotations(lines) {
  const result = new Map();
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const annotations = parseAnnotations(trimmed);
    if (Object.keys(annotations).length > 0) {
      result.set(key, annotations);
    }
  }
  return result;
}

/**
 * Add an annotation to a specific key in raw .env content string.
 * If the key already has a comment, appends to it.
 */
function addAnnotation(content, key, annotationKey, annotationValue) {
  const tag = annotationValue && annotationValue !== true
    ? `@${annotationKey}:${annotationValue}`
    : `@${annotationKey}`;
  const lines = content.split('\n');
  const updated = lines.map(line => {
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) return line;
    const k = line.slice(0, eqIdx).trim();
    if (k !== key) return line;
    const commentIdx = line.indexOf('#');
    if (commentIdx !== -1) {
      return line.slice(0, commentIdx) + '# ' + line.slice(commentIdx + 1).trim() + ' ' + tag;
    }
    return line + ' # ' + tag;
  });
  return updated.join('\n');
}

/**
 * Strip all annotations (@ tags) from a .env content string, leaving other comments intact.
 */
function stripAnnotations(content) {
  return content.split('\n').map(line => {
    return line.replace(/(@[\w-]+(?::[^\s#]+)?\s*)/g, '').replace(/\s*#\s*$/, '').trimEnd();
  }).join('\n');
}

/**
 * Filter env map entries that have a specific annotation.
 */
function filterByAnnotation(lines, annotationKey) {
  const annotated = extractAnnotations(lines);
  const keys = [];
  for (const [key, anns] of annotated) {
    if (annotationKey in anns) keys.push(key);
  }
  return keys;
}

module.exports = { parseAnnotations, extractAnnotations, addAnnotation, stripAnnotations, filterByAnnotation };
