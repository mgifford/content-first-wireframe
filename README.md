# content-first-wireframe
Content-First Text-Based Wireframe

## Quality Checks

Install dependencies then run the checks:

```bash
npm install
npx playwright install --with-deps chromium
npm run lint:html
npm run scan:security
npm run test:a11y
```

`npm test` runs all three in sequence. HTML validation covers `index.html`; security and accessibility scans block on critical issues and warn on moderate ones.
