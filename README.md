# content-first-wireframe

A text-based wireframing tool that prioritizes semantic structure and accessibility from the start. Built with a content-first approach using a Domain Specific Language (DSL) that enables screen reader users and non-designers to participate in the design process.

## Why Text-First Design?

### The Problem with Visual-First Wireframing

Traditional tools like **Figma** and **Penpot** prioritize visual layout before content and structure. This approach:

- **Excludes screen reader users** from the design process entirely
- Makes accessibility an afterthought instead of a foundation
- Creates barriers for non-designers to participate in early design decisions
- Focuses on pixels before meaning

### The Text-First Advantage

This tool inverts that paradigm:

- **Shift-Left Accessibility:** Screen reader users can participate in wireframing and co-design
- **Semantic Structure First:** Define what things ARE before how they LOOK
- **Inclusive Collaboration:** Anyone comfortable with text documents can contribute
- **Content-First Thinking:** Forces clarity about information architecture and user flows
- **LLM-Friendly:** Structured text is perfect for AI-assisted design validation and testing

### The Workflow

1. **Design in text:** Build your wireframe using semantic patterns
2. **Copy for LLM:** Get your design with full context included
3. **Test with AI agents:** Ask LLMs to act as screen reader users, cognitive accessibility auditors, or service designers
4. **Iterate quickly:** Fix issues in text before they become expensive to fix in code

**Text is the most inclusive medium.** By starting with text, you ensure everyone—including people with disabilities—can participate in creating better experiences.

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
