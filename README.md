# content-first-wireframe
Content-First Text-Based Wireframe

A text-based wireframing tool that prioritizes semantic structure and accessibility from the start. Built with a content-first approach using a Domain Specific Language (DSL) that enables screen reader users and non-designers to participate in the design process.

## About This Project

This project was built with AI assistance using GitHub Copilot and Claude (Anthropic). The conversational development approach helped rapidly prototype accessibility-first features, implement quality checks, and refine the DSL syntax based on inclusive design principles.

## Setup

For local development and quality checks:

```bash
npm install
npx playwright install webkit
```

## Quality Checks

Run the full test suite:

```bash
npm test
```

Or run checks individually:

```bash
npm run lint:html       # HTML validation
npm run scan:security   # Security hygiene
npm run test:a11y       # Accessibility scan
```

HTML validation covers `index.html`; security and accessibility scans block on critical issues and warn on moderate ones.

## GitHub Pages Deployment

The site runs as a static GitHub Pages site. No build step required—the HTML, CSS, and JavaScript files work directly.

Only source files are tracked in git. Dependencies (`node_modules`, `package-lock.json`) are only needed for local quality checks and are excluded via `.gitignore`.
