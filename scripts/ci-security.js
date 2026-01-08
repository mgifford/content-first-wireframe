#!/usr/bin/env node
/*
 * Lightweight static security checks for built HTML.
 * Fails on suspected secrets; warns on weaker patterns.
 */
const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();

const secretPattern = /(?<!uses-)(api[_-]?key|secret|token|password)\s*[:=]\s*["'][A-Za-z0-9_\-\.]{16,}["']/i;
const inlineScriptPattern = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
const targetBlankPattern = /<a[^>]*target=["']_blank["'][^>]*>/gi;
const httpPattern = /https?:\/\//gi;

function findHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && (entry.name === 'node_modules' || entry.name.startsWith('.git'))) {
      return [];
    }
    if (entry.isDirectory()) return findHtmlFiles(fullPath);
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) return [fullPath];
    return [];
  });
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const rel = path.relative(rootDir, filePath);
  const issues = [];

  if (secretPattern.test(content)) {
    issues.push({ severity: 'error', message: 'Suspected hardcoded secret/token found.' });
  }

  const inlineScripts = [...content.matchAll(inlineScriptPattern)]
    .map((m) => (m[1] || '').trim())
    .filter((body) => body.length > 0);
  if (inlineScripts.length > 0) {
    issues.push({ severity: 'warn', message: 'Inline <script> detected. Prefer external JS to reduce XSS risk.' });
  }

  const targetBlankLinks = [...content.matchAll(targetBlankPattern)];
  for (const link of targetBlankLinks) {
    if (!/rel\s*=\s*["'][^"']*(noopener|noreferrer)[^"']*["']/i.test(link[0])) {
      issues.push({ severity: 'warn', message: 'target="_blank" without rel="noopener"/"noreferrer".' });
    }
  }

  if (/src=["']http:\/\//i.test(content) || /href=["']http:\/\//i.test(content)) {
    issues.push({ severity: 'warn', message: 'HTTP asset detected; prefer HTTPS.' });
  }

  // Broad HTTP check for other attributes
  if (httpPattern.test(content) && !/https:\/\//i.test(content)) {
    issues.push({ severity: 'warn', message: 'Unsecured HTTP reference found.' });
  }

  return { file: rel, issues };
}

function main() {
  const files = findHtmlFiles(rootDir);
  if (files.length === 0) {
    console.warn('No HTML files found to scan.');
    return;
  }

  let hasErrors = false;
  const results = files.map(scanFile);

  for (const result of results) {
    if (result.issues.length === 0) continue;
    console.log(`\n[security] ${result.file}`);
    for (const issue of result.issues) {
      const prefix = issue.severity === 'error' ? 'ERROR' : 'WARN';
      const logger = issue.severity === 'error' ? console.error : console.warn;
      logger(`  ${prefix}: ${issue.message}`);
      if (issue.severity === 'error') hasErrors = true;
    }
  }

  if (hasErrors) {
    console.error('\nSecurity scan failed due to errors.');
    process.exit(1);
  }

  console.log('\nSecurity scan completed with no blocking errors.');
}

main();
