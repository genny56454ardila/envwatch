# envAnnotate

Add, read, and manage inline annotation tags on `.env` entries.

## Overview

Annotations are special `@tag` or `@tag:value` markers embedded in inline comments. They allow you to attach metadata to individual env keys — such as marking them as `@required`, specifying a `@type:string`, or flagging them as `@deprecated`.

## Format

```
FOO=bar # @required @type:string
DB_PORT=5432 # @type:number @default:5432
OLD_KEY=xyz # @deprecated:USE_NEW_KEY
```

## API

### `parseAnnotations(line)`
Parses annotation tags from a single `.env` line string. Returns an object mapping annotation keys to their values (`true` if no value specified).

### `extractAnnotations(lines)`
Accepts an array of raw `.env` lines and returns a `Map<key, annotations>` for all keys that have at least one annotation.

### `addAnnotation(content, key, annotationKey, annotationValue?)`
Adds an annotation tag to the specified key in a `.env` content string. Appends to existing inline comment if present.

### `stripAnnotations(content)`
Removes all `@tag` and `@tag:value` markers from a `.env` content string, preserving other comment text.

### `filterByAnnotation(lines, annotationKey)`
Returns an array of env keys that have the specified annotation tag.

## CLI Usage

```bash
# Add an annotation
envwatch annotate add FOO required
envwatch annotate add DB_PORT type number

# List all annotations
envwatch annotate list

# Filter keys by annotation
envwatch annotate filter required

# Strip all annotations
envwatch annotate strip

# Specify a custom file
envwatch annotate --file .env.production list
```
