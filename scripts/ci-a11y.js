#!/usr/bin/env node
/*
 * Playwright + axe-core scan for key pages.
 * Blocks on serious/critical issues; warns on moderate.
 */
const { chromium, firefox, webkit } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const { URL } = require('url');
const path = require('path');

const pageList = (process.env.A11Y_PAGES || 'index.html')
  .split(',')
  .map((p) => p.trim())
  .filter(Boolean);

const baseDir = process.cwd();
const visitTimeoutMs = 20000;
const settleMs = 400;
const browserPreference = (process.env.A11Y_BROWSER || 'webkit').toLowerCase();

function pickBrowser(name) {
  if (name === 'firefox') return firefox;
  if (name === 'webkit') return webkit;
  return chromium;
}

function resolveUrl(target) {
  if (/^https?:\/\//i.test(target)) return target;
  const asUrl = new URL(target, 'file://' + path.join(baseDir, '/'));
  return asUrl.toString();
}

(async () => {
  let browser;
  let context;
  let page;
  const candidates = Array.from(new Set([browserPreference, 'chromium', 'webkit', 'firefox']));

  let launchError;
  for (const candidate of candidates) {
    try {
      browser = await pickBrowser(candidate).launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
      context = await browser.newContext();
      page = await context.newPage();
      break;
    } catch (err) {
      launchError = err;
      console.warn(`Failed to launch ${candidate}: ${err.message}`);
      if (context) {
        try { await context.close(); } catch (e) {}
      }
      if (browser) {
        try { await browser.close(); } catch (e) {}
      }
    }
  }

  if (!page) {
    console.error('Unable to launch any browser for a11y scan.', launchError);
    process.exit(1);
  }

  let hasBlocking = false;
  const summary = [];

  try {
    for (const target of pageList) {
      const url = resolveUrl(target);
      await page.goto(url, { waitUntil: 'load', timeout: visitTimeoutMs });
      await page.waitForTimeout(settleMs);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();

      const violations = (results.violations || []).map((v) => ({
        id: v.id,
        impact: v.impact || 'unknown',
        help: v.help,
        nodes: v.nodes.map((n) => n.target.join(' ')),
      }));

      const seriousOrAbove = violations.filter((v) => ['serious', 'critical'].includes(v.impact));
      const moderate = violations.filter((v) => v.impact === 'moderate');

      if (seriousOrAbove.length) {
        hasBlocking = true;
        console.error(`\n[a11y][blocker] ${url}`);
        seriousOrAbove.forEach((v) => console.error(`  ${v.id}: ${v.help} (${v.nodes.join(' | ')})`));
      }
      if (moderate.length) {
        console.warn(`\n[a11y][warn] ${url}`);
        moderate.forEach((v) => console.warn(`  ${v.id}: ${v.help} (${v.nodes.join(' | ')})`));
      }

      summary.push({ url, serious: seriousOrAbove.length, moderate: moderate.length, total: violations.length });
    }
  } finally {
    if (context) {
      try { await context.close(); } catch (e) {}
    }
    if (browser) {
      try { await browser.close(); } catch (e) {}
    }
  }

  console.log('\nA11y summary:');
  summary.forEach((item) => {
    console.log(`- ${item.url}: ${item.serious} serious/critical, ${item.moderate} moderate, ${item.total} total`);
  });

  if (hasBlocking) {
    console.error('\nAccessibility scan failed due to serious/critical issues.');
    process.exit(1);
  }

  console.log('\nAccessibility scan completed with no blocking issues.');
})();
