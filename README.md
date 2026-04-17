# Content-First Text-Based Wireframes

A text-based wireframing tool that prioritizes semantic structure and accessibility from the start. Built with a content-first approach using a Domain Specific Language (DSL) that enables screen reader users and non-designers to participate in the design process.

> ⚠️ **Experimental Project** — This tool is still in early development. Most of the content and code was generated with AI and **has not been fully validated** in real-world use. Please treat everything here as a starting point, not a finished product.
>
> 💬 **We need your feedback!** If you try this tool, please [share your results in the issue queue](https://github.com/mgifford/content-first-wireframe/issues)—both positive and negative experiences are valuable. Include links and references so claims can be discussed.

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
5. **Export to Penpot:** Use the "Export to Penpot" button to generate instructions for creating a Penpot file

**Text is the most inclusive medium.** By starting with text, you ensure everyone—including people with disabilities—can participate in creating better experiences.

## Exporting to Penpot

Click the **"Export to Penpot"** button in the web tool to copy wireframe content with Penpot-specific instructions. Paste the result into ChatGPT, Gemini, Claude, or another LLM to generate a `.penpot` file. Then:

1. Download the generated `.penpot` file
2. Open [penpot.app](https://penpot.app)
3. Create a new design
4. Import the `.penpot` file
5. Refine visually in Penpot

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

## In-Browser AI Writing Assistance

This tool includes optional author-side writing assistance powered by **Chrome Built-in AI** (the Prompt API). All AI processing happens locally in your browser — no data leaves your machine, no API keys are needed.

### Opt-in

AI writing tools are **off by default**. When you first open the tool in a browser that supports Chrome Built-in AI, a small banner appears in the sidebar asking if you want to try them:

> "Your browser supports on-device AI writing assistance. Would you like to try it?"

- Click **Turn on AI tools** to enable them for this browser. Your choice is saved in `localStorage` and the tools activate immediately without a page reload.
- Click **No thanks** to dismiss the banner. The tools stay hidden and the banner is not shown again.

To change your mind later, clear site data (DevTools → Application → Storage → Clear site data) to reset the preference.

To turn AI tools off after enabling them, click the **Turn off AI tools** link at the bottom of the AI Writing Tools panel. This saves the dismissed preference to `localStorage`.

### What the AI assists with

| Feature | What it does |
|---|---|
| **Fix spelling & grammar** | Fixes spelling and grammar errors in selected text or the whole document, preserving meaning and tone |
| **Rewrite in plain language** | Rewrites text for clarity at your chosen reading level (general public, Grade 6, Grade 8, or public service standard) |
| **Review headings** | Flags vague, noun-only, or poorly task-framed headings and suggests improvements |
| **Replace filler with placeholders** | Detects lorem ipsum, TBD, and vague filler; replaces each with a semantic placeholder describing what real content belongs there |
| **Review language quality** | Identifies overlong sentences, passive voice, undefined acronyms, inconsistent terminology, and missing purpose statements |

### What the AI does NOT do

- **Does not invent content or policy.** Every prompt explicitly instructs the AI not to add new facts.
- **Does not auto-apply any changes.** Every suggestion is shown as a diff preview; the author clicks **Apply** or **Dismiss**.
- **Does not silently rewrite.** All output is reviewed before it touches the document.
- **Does not send data to a server.** Processing is entirely in-browser via the Chrome AI API.
- **Does not generate visual layouts.** This is an editorial tool, not a design generator.

### Browser requirements

Chrome Built-in AI uses the experimental **Prompt API** (`window.ai.languageModel`), which is available in:

- Chrome 127+ with the **Prompt API for Gemini Nano** flag enabled (`chrome://flags/#prompt-api-for-gemini-nano`)
- Chrome Dev or Canary channels where the flag may be on by default

When AI is **not available**, the AI Writing Tools section shows an explanatory message and all five AI buttons are hidden. The rest of the tool works exactly as before — **authoring without AI is always supported.**

### Privacy

All AI processing happens locally in your browser using Chrome's on-device Gemini Nano model. No wireframe content, suggestions, or usage data is transmitted to any external server.



Yes. AI was used in creating this tool. There be dragons! 
