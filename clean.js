#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const decomment = require('decomment');

const ROOT = process.cwd();
const DEFAULT_EXTENSIONS = new Set(['.html', '.css', '.js']);
const DEFAULT_EXCLUDED_DIRS = new Set([
  '.git',
  '.github',
  '.husky',
  '.idea',
  '.next',
  '.nuxt',
  '.output',
  '.parcel-cache',
  '.svelte-kit',
  '.turbo',
  '.vercel',
  '.vscode',
  'coverage',
  'dist',
  'node_modules',
]);
const DEFAULT_EXCLUDED_FILES = new Set([
  'package-lock.json',
  'classes.js.map',
]);
const IMPORTANT_JS_COMMENT = /(^!|@preserve|@license|@copyright|eslint|jshint|jslint|istanbul|sourceMappingURL|sourceURL|#__(?:PURE|NO_SIDE_EFFECTS)__|TODO|FIXME|NOTE|HACK|BUG|XXX|ts-(?:ignore|expect-error|nocheck|check)|vite-ignore|webpack)/i;
const SCRIPT_TYPE_PATTERN = /type\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;
const KEYWORDS_ALLOW_REGEX = new Set([
  'await',
  'case',
  'delete',
  'do',
  'else',
  'in',
  'instanceof',
  'new',
  'of',
  'return',
  'throw',
  'typeof',
  'void',
  'yield',
]);

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  console.log('🧹 Starting clean process...');
  
  const targets = options.targets.length > 0 ? options.targets : ['functions', 'public'];
  console.log(`📁 Scanning targets: ${targets.join(', ')}`);
  
  const files = collectFiles(targets, options);
  console.log(`📄 Found ${files.length} files to process`);
  
  const results = [];
  const errors = [];
  let processedCount = 0;

  console.log('🔄 Processing files...');
  
  for (const filePath of files) {
    try {
      processedCount++;
      if (!options.verbose && processedCount % 10 === 0 || processedCount === files.length) {
        process.stdout.write(`\r⏳ Progress: ${processedCount}/${files.length} files (${Math.round(processedCount/files.length*100)}%)`);
      }
      
      const result = processFile(filePath, options);
      if (result) {
        results.push(result);
      }
    } catch (error) {
      errors.push({
        filePath,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
  
  if (!options.verbose) {
    process.stdout.write('\r');
  }
  console.log('✅ Processing complete!');

  printSummary(results, errors, options);

  if (errors.length > 0) {
    process.exitCode = 1;
    return;
  }

  if (options.check && results.length > 0) {
    process.exitCode = 1;
  }
}

function parseArgs(args) {
  const options = {
    check: false,
    verbose: false,
    include: [],
    exclude: ['public/assist/games'],
    targets: [],
    help: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--check' || arg === '--dry-run') {
      options.check = true;
      continue;
    }

    if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg.startsWith('--include=')) {
      options.include.push(arg.slice('--include='.length));
      continue;
    }

    if (arg === '--include') {
      index += 1;
      options.include.push(args[index]);
      continue;
    }

    if (arg.startsWith('--exclude=')) {
      options.exclude.push(arg.slice('--exclude='.length));
      continue;
    }

    if (arg === '--exclude') {
      index += 1;
      options.exclude.push(args[index]);
      continue;
    }

    options.targets.push(arg);
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node clean.js [options] [paths...]

Remove comments from .html, .css, and .js files.

Defaults:
  - HTML: removes all HTML comments, plus comments inside inline <style> and <script> blocks
  - CSS: removes all comments
  - JS: removes non-essential comments and keeps important directives/licenses

Options:
  --check, --dry-run   Report files that would change without writing
  --verbose, -v        Print every changed file
  --include <pattern>  Only process paths containing this text (can repeat)
  --exclude <pattern>  Skip paths containing this text (can repeat)
  --help, -h           Show this help

Examples:
  node clean.js
  node clean.js --check
  node clean.js public functions
  node clean.js --exclude=public/assist/games`);
}

function collectFiles(targets, options) {
  const files = [];
  console.log('🔍 Collecting files...');

  for (const target of targets) {
    if (!target) {
      continue;
    }

    const absoluteTarget = path.resolve(ROOT, target);

    if (!fs.existsSync(absoluteTarget)) {
      console.log(`⚠️  Path does not exist: ${target}`);
      continue;
    }

    const stats = fs.statSync(absoluteTarget);

    if (stats.isDirectory()) {
      console.log(`📂 Scanning directory: ${target}`);
      walkDirectory(absoluteTarget, files, options);
      continue;
    }

    if (shouldProcessFile(absoluteTarget, options)) {
      files.push(absoluteTarget);
    }
  }

  console.log(`✅ Found ${files.length} eligible files`);
  return files.sort();
}

function walkDirectory(directoryPath, files, options) {
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(directoryPath, entry.name);
    const relativePath = toDisplayPath(absolutePath);

    if (entry.isDirectory()) {
      if (shouldSkipDirectory(entry.name, relativePath, options)) {
        continue;
      }

      walkDirectory(absolutePath, files, options);
      continue;
    }

    if (shouldProcessFile(absolutePath, options)) {
      files.push(absolutePath);
    }
  }
}

function shouldSkipDirectory(name, relativePath, options) {
  if (DEFAULT_EXCLUDED_DIRS.has(name)) {
    return true;
  }

  return matchesAny(relativePath, options.exclude);
}

function shouldProcessFile(filePath, options) {
  const relativePath = toDisplayPath(filePath);
  const extension = path.extname(filePath).toLowerCase();
  const fileName = path.basename(filePath);

  if (!DEFAULT_EXTENSIONS.has(extension)) {
    return false;
  }

  if (DEFAULT_EXCLUDED_FILES.has(fileName)) {
    return false;
  }

  if (path.resolve(filePath) === path.resolve(ROOT, 'clean.js')) {
    return false;
  }

  if (matchesAny(relativePath, options.exclude)) {
    return false;
  }

  if (options.include.length > 0 && !matchesAny(relativePath, options.include)) {
    return false;
  }

  return true;
}

function matchesAny(value, patterns) {
  return patterns.some((pattern) => pattern && value.includes(normalizePattern(pattern)));
}

function normalizePattern(pattern) {
  return pattern.replaceAll('\\', '/');
}

function processFile(filePath, options) {
  const source = fs.readFileSync(filePath, 'utf8');
  const extension = path.extname(filePath).toLowerCase();
  let cleaned = source;

  if (extension === '.html') {
    cleaned = cleanHtml(source);
  } else if (extension === '.css') {
    cleaned = finalizeText(decomment.text(source, { trim: true }), source);
  } else if (extension === '.js') {
    cleaned = cleanJavaScript(source);
  }

  if (cleaned === source) {
    return null;
  }

  if (!options.check) {
    fs.writeFileSync(filePath, cleaned, 'utf8');
  }

  const result = {
    filePath,
    bytesSaved: Buffer.byteLength(source, 'utf8') - Buffer.byteLength(cleaned, 'utf8'),
  };

  if (options.verbose) {
    const mode = options.check ? 'Would clean' : 'Cleaned';
    const icon = options.check ? '👁️' : '✨';
    console.log(`${icon} ${mode}: ${toDisplayPath(filePath)} (${result.bytesSaved} bytes saved)`);
  }

  return result;
}

function cleanHtml(source) {
  let output = '';
  let index = 0;

  while (index < source.length) {
    if (source.startsWith('<!--', index)) {
      const endIndex = source.indexOf('-->', index + 4);

      if (endIndex === -1) {
        output += source.slice(index);
        break;
      }

      index = endIndex + 3;
      continue;
    }

    if (source[index] === '<') {
      if (/^<script\b/i.test(source.slice(index))) {
        const tagEnd = findTagEnd(source, index);

        if (tagEnd === -1) {
          output += source.slice(index);
          break;
        }

        const openTag = source.slice(index, tagEnd + 1);
        output += openTag;

        const closingTagStart = findClosingTag(source, 'script', tagEnd + 1);

        if (closingTagStart === -1) {
          output += source.slice(tagEnd + 1);
          break;
        }

        const innerContent = source.slice(tagEnd + 1, closingTagStart);
        const closingTagEnd = findTagEnd(source, closingTagStart);

        output += shouldProcessInlineScript(openTag) ? cleanJavaScript(innerContent) : innerContent;
        output += source.slice(closingTagStart, closingTagEnd + 1);
        index = closingTagEnd + 1;
        continue;
      }

      if (/^<style\b/i.test(source.slice(index))) {
        const tagEnd = findTagEnd(source, index);

        if (tagEnd === -1) {
          output += source.slice(index);
          break;
        }

        const openTag = source.slice(index, tagEnd + 1);
        output += openTag;

        const closingTagStart = findClosingTag(source, 'style', tagEnd + 1);

        if (closingTagStart === -1) {
          output += source.slice(tagEnd + 1);
          break;
        }

        const innerContent = source.slice(tagEnd + 1, closingTagStart);
        const closingTagEnd = findTagEnd(source, closingTagStart);

        output += finalizeText(decomment.text(innerContent, { trim: true }), innerContent);
        output += source.slice(closingTagStart, closingTagEnd + 1);
        index = closingTagEnd + 1;
        continue;
      }
    }

    output += source[index];
    index += 1;
  }

  return finalizeText(output, source);
}

function shouldProcessInlineScript(openTag) {
  if (/\ssrc\s*=/i.test(openTag)) {
    return false;
  }

  const typeMatch = openTag.match(SCRIPT_TYPE_PATTERN);

  if (!typeMatch) {
    return true;
  }

  const typeValue = (typeMatch[1] || typeMatch[2] || typeMatch[3] || '').trim().toLowerCase();

  if (!typeValue) {
    return true;
  }

  return [
    'application/javascript',
    'application/ecmascript',
    'module',
    'text/ecmascript',
    'text/javascript',
  ].includes(typeValue);
}

function findTagEnd(source, startIndex) {
  let quote = '';

  for (let index = startIndex; index < source.length; index += 1) {
    const char = source[index];

    if (quote) {
      if (char === quote) {
        quote = '';
      }

      continue;
    }

    if (char === '"' || char === '\'') {
      quote = char;
      continue;
    }

    if (char === '>') {
      return index;
    }
  }

  return -1;
}

function findClosingTag(source, tagName, fromIndex) {
  const pattern = `</${tagName}`;
  const lowerSource = source.toLowerCase();
  return lowerSource.indexOf(pattern, fromIndex);
}

function cleanJavaScript(source) {
  const shebang = source.startsWith('#!') ? source.slice(0, source.indexOf('\n') + 1 || source.length) : '';
  const body = shebang ? source.slice(shebang.length) : source;
  const comments = scanJsComments(body);

  if (comments.length === 0) {
    return finalizeText(source, source);
  }

  const removalRanges = comments
    .filter((comment) => !isImportantJsComment(comment, body))
    .map((comment) => expandJsCommentRange(body, comment))
    .filter(Boolean)
    .sort((left, right) => right.start - left.start);

  if (removalRanges.length === 0) {
    return finalizeText(source, source);
  }

  let cleanedBody = body;

  for (const range of removalRanges) {
    cleanedBody = cleanedBody.slice(0, range.start) + cleanedBody.slice(range.end);
  }

  return shebang + finalizeText(cleanedBody, body);
}

function scanJsComments(source) {
  const comments = [];

  scanJsCode(source, 0, comments, null);

  return comments;
}

function scanJsCode(source, startIndex, comments, stopChar) {
  let index = startIndex;
  let regexAllowed = true;

  while (index < source.length) {
    const char = source[index];
    const next = source[index + 1];

    if (stopChar && char === stopChar) {
      return index + 1;
    }

    if (isWhitespace(char)) {
      index += 1;
      continue;
    }

    if (char === '\'' || char === '"') {
      index = consumeQuotedString(source, index, char);
      regexAllowed = false;
      continue;
    }

    if (char === '`') {
      index = consumeTemplateLiteral(source, index, comments);
      regexAllowed = false;
      continue;
    }

    if (char === '/' && next === '/') {
      const end = findLineEnd(source, index + 2);
      comments.push({
        type: 'Line',
        range: [index, end],
        value: source.slice(index + 2, end),
      });
      index = end;
      continue;
    }

    if (char === '/' && next === '*') {
      const end = source.indexOf('*/', index + 2);
      const safeEnd = end === -1 ? source.length : end + 2;
      comments.push({
        type: 'Block',
        range: [index, safeEnd],
        value: source.slice(index + 2, Math.max(index + 2, safeEnd - 2)),
      });
      index = safeEnd;
      continue;
    }

    if (char === '/' && regexAllowed) {
      index = consumeRegexLiteral(source, index);
      regexAllowed = false;
      continue;
    }

    if (isIdentifierStart(char)) {
      const end = consumeIdentifier(source, index);
      const token = source.slice(index, end);
      regexAllowed = KEYWORDS_ALLOW_REGEX.has(token);
      index = end;
      continue;
    }

    if (isDigit(char)) {
      index = consumeNumberLiteral(source, index);
      regexAllowed = false;
      continue;
    }

    const punctuator = readPunctuator(source, index);
    regexAllowed = punctuatorAllowsRegex(punctuator);
    index += punctuator.length;
  }

  return index;
}

function consumeQuotedString(source, startIndex, quote) {
  let index = startIndex + 1;

  while (index < source.length) {
    const char = source[index];

    if (char === '\\') {
      index += 2;
      continue;
    }

    if (char === quote) {
      return index + 1;
    }

    index += 1;
  }

  return index;
}

function consumeTemplateLiteral(source, startIndex, comments) {
  let index = startIndex + 1;

  while (index < source.length) {
    const char = source[index];
    const next = source[index + 1];

    if (char === '\\') {
      index += 2;
      continue;
    }

    if (char === '`') {
      return index + 1;
    }

    if (char === '$' && next === '{') {
      index = scanTemplateExpression(source, index + 2, comments);
      continue;
    }

    index += 1;
  }

  return index;
}

function scanTemplateExpression(source, startIndex, comments) {
  let index = startIndex;
  let depth = 1;
  let regexAllowed = true;

  while (index < source.length && depth > 0) {
    const char = source[index];
    const next = source[index + 1];

    if (char === '\'' || char === '"') {
      index = consumeQuotedString(source, index, char);
      regexAllowed = false;
      continue;
    }

    if (char === '`') {
      index = consumeTemplateLiteral(source, index, comments);
      regexAllowed = false;
      continue;
    }

    if (char === '/' && next === '/') {
      const end = findLineEnd(source, index + 2);
      comments.push({
        type: 'Line',
        range: [index, end],
        value: source.slice(index + 2, end),
      });
      index = end;
      continue;
    }

    if (char === '/' && next === '*') {
      const end = source.indexOf('*/', index + 2);
      const safeEnd = end === -1 ? source.length : end + 2;
      comments.push({
        type: 'Block',
        range: [index, safeEnd],
        value: source.slice(index + 2, Math.max(index + 2, safeEnd - 2)),
      });
      index = safeEnd;
      continue;
    }

    if (char === '/' && regexAllowed) {
      index = consumeRegexLiteral(source, index);
      regexAllowed = false;
      continue;
    }

    if (char === '{') {
      depth += 1;
      regexAllowed = true;
      index += 1;
      continue;
    }

    if (char === '}') {
      depth -= 1;
      index += 1;
      regexAllowed = false;
      continue;
    }

    if (isWhitespace(char)) {
      index += 1;
      continue;
    }

    if (isIdentifierStart(char)) {
      const end = consumeIdentifier(source, index);
      const token = source.slice(index, end);
      regexAllowed = KEYWORDS_ALLOW_REGEX.has(token);
      index = end;
      continue;
    }

    if (isDigit(char)) {
      index = consumeNumberLiteral(source, index);
      regexAllowed = false;
      continue;
    }

    const punctuator = readPunctuator(source, index);
    regexAllowed = punctuatorAllowsRegex(punctuator);
    index += punctuator.length;
  }

  return index;
}

function consumeRegexLiteral(source, startIndex) {
  let index = startIndex + 1;
  let inCharacterClass = false;

  while (index < source.length) {
    const char = source[index];

    if (char === '\\') {
      index += 2;
      continue;
    }

    if (char === '[') {
      inCharacterClass = true;
      index += 1;
      continue;
    }

    if (char === ']' && inCharacterClass) {
      inCharacterClass = false;
      index += 1;
      continue;
    }

    if (char === '/' && !inCharacterClass) {
      index += 1;

      while (/[a-z]/i.test(source[index] || '')) {
        index += 1;
      }

      return index;
    }

    index += 1;
  }

  return index;
}

function consumeIdentifier(source, startIndex) {
  let index = startIndex + 1;

  while (index < source.length && isIdentifierPart(source[index])) {
    index += 1;
  }

  return index;
}

function consumeNumberLiteral(source, startIndex) {
  let index = startIndex;

  if (source[index] === '0' && /[box]/i.test(source[index + 1] || '')) {
    index += 2;

    while (/[0-9a-f_]/i.test(source[index] || '')) {
      index += 1;
    }

    return /n/i.test(source[index] || '') ? index + 1 : index;
  }

  while (/[0-9_]/.test(source[index] || '')) {
    index += 1;
  }

  if (source[index] === '.' && /[0-9]/.test(source[index + 1] || '')) {
    index += 1;

    while (/[0-9_]/.test(source[index] || '')) {
      index += 1;
    }
  }

  if (/[eE]/.test(source[index] || '')) {
    index += 1;

    if (/[+-]/.test(source[index] || '')) {
      index += 1;
    }

    while (/[0-9_]/.test(source[index] || '')) {
      index += 1;
    }
  }

  return /n/i.test(source[index] || '') ? index + 1 : index;
}

function readPunctuator(source, index) {
  const candidates = [
    '>>>=',
    '===',
    '!==',
    '>>>',
    '<<=',
    '>>=',
    '&&=',
    '||=',
    '??=',
    '**=',
    '=>',
    '==',
    '!=',
    '<=',
    '>=',
    '++',
    '--',
    '&&',
    '||',
    '??',
    '?.',
    '<<',
    '>>',
    '**',
    '+=',
    '-=',
    '*=',
    '/=',
    '%=',
    '&=',
    '|=',
    '^=',
    '...',
  ];

  for (const candidate of candidates) {
    if (source.startsWith(candidate, index)) {
      return candidate;
    }
  }

  return source[index] || '';
}

function punctuatorAllowsRegex(punctuator) {
  return new Set([
    '',
    '!',
    '!=',
    '!==',
    '%',
    '%=',
    '&',
    '&=',
    '&&',
    '&&=',
    '(',
    '*',
    '**',
    '**=',
    '*=',
    '+',
    '+=',
    ',',
    '-',
    '-=',
    ':',
    ';',
    '<',
    '<<',
    '<<=',
    '<=',
    '=',
    '==',
    '===',
    '=>',
    '>',
    '>=',
    '>>',
    '>>=',
    '>>>',
    '>>>=',
    '?',
    '??',
    '??=',
    '[',
    '^',
    '^=',
    '{',
    '|',
    '|=',
    '||',
    '||=',
    '~',
  ]).has(punctuator);
}

function isWhitespace(char) {
  return /\s/.test(char);
}

function isIdentifierStart(char) {
  return /[$A-Z_a-z]/.test(char);
}

function isIdentifierPart(char) {
  return /[$0-9A-Z_a-z]/.test(char);
}

function isDigit(char) {
  return /[0-9]/.test(char);
}

function isImportantJsComment(comment, source) {
  const text = comment.value.trim();

  if (comment.type === 'Block' && source.slice(comment.range[0], comment.range[0] + 3) === '/*!') {
    return true;
  }

  return IMPORTANT_JS_COMMENT.test(text);
}

function expandJsCommentRange(source, comment) {
  let [start, end] = comment.range;
  const lineStart = findLineStart(source, start);
  const lineEnd = findLineEnd(source, end);
  const before = source.slice(lineStart, start);
  const after = source.slice(end, lineEnd);
  const isFullLine = before.trim() === '' && after.trim() === '';

  if (isFullLine) {
    start = lineStart;
    end = consumeLineBreak(source, lineEnd);
    return { start, end };
  }

  while (start > lineStart && /[ \t]/.test(source[start - 1])) {
    start -= 1;
  }

  while (end < lineEnd && /[ \t]/.test(source[end])) {
    end += 1;
  }

  return { start, end };
}

function findLineStart(source, index) {
  let cursor = index;

  while (cursor > 0 && source[cursor - 1] !== '\n' && source[cursor - 1] !== '\r') {
    cursor -= 1;
  }

  return cursor;
}

function findLineEnd(source, index) {
  let cursor = index;

  while (cursor < source.length && source[cursor] !== '\n' && source[cursor] !== '\r') {
    cursor += 1;
  }

  return cursor;
}

function consumeLineBreak(source, index) {
  if (source[index] === '\r' && source[index + 1] === '\n') {
    return index + 2;
  }

  if (source[index] === '\r' || source[index] === '\n') {
    return index + 1;
  }

  return index;
}

function finalizeText(text, originalText) {
  const eol = detectEol(originalText);
  const normalized = text
    .replace(/\r\n|\r|\n/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd();

  return normalized ? `${normalized}${eol}` : '';
}

function detectEol(text) {
  const crlfCount = (text.match(/\r\n/g) || []).length;
  const lfCount = (text.match(/(?<!\r)\n/g) || []).length;
  return crlfCount > lfCount ? '\r\n' : '\n';
}

function printSummary(results, errors, options) {
  const changedCount = results.length;
  const bytesSaved = results.reduce((sum, result) => sum + result.bytesSaved, 0);
  const mode = options.check ? 'check' : 'write';

  console.log('\n📊 CLEAN SUMMARY');
 console.log('='.repeat(50));
 console.log(`✨ Mode: ${mode}`);
  console.log(`📝 Files processed: ${changedCount}`);
  console.log(`💾 Bytes removed: ${bytesSaved.toLocaleString()}`);
  
  if (bytesSaved > 0) {
    console.log(`📉 Space saved: ${(bytesSaved / 1024).toFixed(2)} KB`);
  }

  if (errors.length > 0) {
    console.log(`\n❌ Errors encountered: ${errors.length}`);
    for (const error of errors) {
      console.log(`   • ${toDisplayPath(error.filePath)}: ${error.message}`);
    }
  }
  
  if (changedCount === 0) {
    console.log('\n🎉 All files are already clean!');
  } else {
    console.log(`\n🎯 Successfully cleaned ${changedCount} file${changedCount === 1 ? '' : 's'}!`);
  }
  
  console.log('='.repeat(50));
}

function toDisplayPath(filePath) {
  return path.relative(ROOT, filePath).replaceAll('\\', '/');
}

main();
