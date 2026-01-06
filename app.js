// Pattern library data (loaded from JSON)
let patternsData = null;

// System Prompt - The DSL Context
const SYSTEM_PROMPT = `Introduction
It is important to be able to allow content designers and service designers to quickly iterate and test design ideas with a broad range of users. In doing user testing and research, it is important to be able to engage a wide range of users, including those with a wide range of visual disabilities. Text is simply the most inclusive way to share ideas to the broadest possible audience.
Accessibility is often encouraged to Shift-Left, and make sure that people with disabilities are included in the design process. There are no visual wireframe tools available today which are built to support the inclusion of screen reader users. If screen reader users cannot participate in the design process, then they cannot be engaged in co-designing to meet their needs.
This allows for a content-first approach to design. Because people are used to collaborating in documents, it also allows more people to be involved.
Legend / Patterns
GoogleDoc Heading 1 - Used here just to differentiate context from example
Default to Markdown to show structure
[](https://www.google.com/search?q=) Links - Undefined links identified with [] - only complete [example](link to /) if  page is defined.
[[]] Buttons - describe action
<> Images
# Headings


|| Landmarks
* Bullets
[__] Forms and labels

`;

// DOM Elements
const editor = document.getElementById('wireframe-editor');
const copyLLMBtn = document.getElementById('copy-llm-btn');
const exportPenpotBtn = document.getElementById('export-penpot-btn');
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');
const loadBtnTrigger = document.getElementById('load-btn-trigger');
const clearBtn = document.getElementById('clear-btn');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const helpBtn = document.getElementById('help-btn');
const helpModal = document.getElementById('help-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const shareBtn = document.getElementById('share-btn');
const shareModal = document.getElementById('share-modal');
const shareCloseBtn = document.getElementById('share-close-btn');
const shareMessage = document.getElementById('share-message');
const mastodonInstanceInput = document.getElementById('mastodon-instance');
const shareLinkedInBtn = document.getElementById('share-linkedin');
const shareMastodonBtn = document.getElementById('share-mastodon');
const shareBlueskyBtn = document.getElementById('share-bluesky');
const shareCopyBtn = document.getElementById('share-copy');
const toast = document.getElementById('toast');
const charCount = document.getElementById('char-count');
const sidebar = document.querySelector('.sidebar-left');
const offlineBanner = document.getElementById('offline-banner');
const documentSelect = document.getElementById('document-select');
const lineNumbers = document.getElementById('line-numbers');
const highlightLayer = document.getElementById('highlight-layer');

// LocalStorage Keys
const STORAGE_KEY = 'inclusive-design-wireframe';
const THEME_KEY = 'inclusive-design-theme';
const DOCUMENTS_KEY = 'inclusive-design-documents';
const CURRENT_DOC_KEY = 'inclusive-design-current-doc';

// Initialize
async function init() {
    checkOnlineStatus();
    setupOnlineListeners();
    await loadPatterns();
    renderPatternLibrary();
    loadDocumentsList();
    loadFromStorage();
    loadTheme();
    attachEventListeners();
    updateCharCount();
    updateLineNumbers();
    updateHighlight();
    updateButtonVisibility();
}

// Load patterns from JSON
async function loadPatterns() {
    try {
        const response = await fetch('patterns.json');
        if (!response.ok) {
            throw new Error('Failed to load patterns.json');
        }
        patternsData = await response.json();
    } catch (error) {
        console.error('Error loading patterns:', error);
        showToast('Failed to load pattern library');
        // Fallback to empty structure
        patternsData = { categories: [] };
    }
}

// Render pattern library from JSON
function renderPatternLibrary() {
    if (!patternsData || !patternsData.categories) {
        sidebar.innerHTML = '<p class="loading-hint">No patterns available</p>';
        return;
    }

    sidebar.innerHTML = '';

    patternsData.categories.forEach(category => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'pattern-group';

        const heading = document.createElement('h2');
        heading.textContent = category.name;
        groupDiv.appendChild(heading);

        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'pattern-buttons';

        category.patterns.forEach(pattern => {
            const button = document.createElement('button');
            const categoryClass = `category-${category.name.toLowerCase()}`;
            button.className = `pattern-btn ${categoryClass}`;
            button.textContent = pattern.label;
            button.title = pattern.description;
            button.setAttribute('data-pattern-id', pattern.id);
            button.setAttribute('data-syntax', pattern.syntax);
            
            button.addEventListener('click', () => {
                insertPatternText(pattern.syntax);
            });

            buttonsDiv.appendChild(button);
        });

        groupDiv.appendChild(buttonsDiv);
        sidebar.appendChild(groupDiv);
    });
}

// Toggle visibility of content-dependent buttons
function updateButtonVisibility() {
    const hasContent = editor.value.trim().length > 0;
    const contentButtons = [copyLLMBtn, exportPenpotBtn, saveBtn, clearBtn];
    
    contentButtons.forEach(btn => {
        btn.style.display = hasContent ? 'block' : 'none';
    });
}

// Event Listeners
function attachEventListeners() {
    // Editor auto-save and validation
    editor.addEventListener('input', () => {
        saveToStorage();
        updateCharCount();
        updateLineNumbers();
        updateHighlight();
        validateWireframe();
        updateButtonVisibility();
    });

    // Sync line numbers and highlight on scroll
    editor.addEventListener('scroll', () => {
        syncLineNumbers();
        syncHighlightScroll();
    });

    // Action buttons
    copyLLMBtn.addEventListener('click', copyForLLM);
    exportPenpotBtn.addEventListener('click', exportToPenpot);
    saveBtn.addEventListener('click', saveToFile);
    loadBtnTrigger.addEventListener('click', () => loadBtn.click());
    loadBtn.addEventListener('change', loadFromFile);
    documentSelect.addEventListener('change', handleDocumentChange);
    clearBtn.addEventListener('click', clearEditor);
    themeToggle.addEventListener('click', toggleTheme);
    helpBtn.addEventListener('click', showHelp);
    modalCloseBtn.addEventListener('click', hideHelp);
    shareBtn.addEventListener('click', showShare);
    shareCloseBtn.addEventListener('click', hideShare);
    shareLinkedInBtn.addEventListener('click', shareLinkedIn);
    shareMastodonBtn.addEventListener('click', shareMastodon);
    shareBlueskyBtn.addEventListener('click', shareBluesky);
    shareCopyBtn.addEventListener('click', copyShareMessage);
    
    // Close modal on overlay click
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            hideHelp();
        }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && helpModal.classList.contains('show')) {
            hideHelp();
        }
        if (e.key === 'Escape' && shareModal.classList.contains('show')) {
            hideShare();
        }
    });

    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            hideShare();
        }
    });
}

// Insert pattern text at cursor position
function insertPatternText(patternText) {
    if (!patternText) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;

    editor.value = text.substring(0, start) + patternText + text.substring(end);
    
    // Move cursor to end of inserted text
    const newCursorPos = start + patternText.length;
    editor.selectionStart = newCursorPos;
    editor.selectionEnd = newCursorPos;
    editor.focus();

    saveToStorage();
    updateCharCount();
    updateLineNumbers();
    updateHighlight();
    validateWireframe();
}

// Copy for LLM (with System Prompt)
async function copyForLLM() {
    const content = SYSTEM_PROMPT + '\n\n' + editor.value;
    
    try {
        await navigator.clipboard.writeText(content);
        showToast('Copied to clipboard! Ready for LLM.');
    } catch (err) {
        console.error('Failed to copy:', err);
        showToast('Failed to copy. Please try again.');
    }
}

// Export to Penpot (with Penpot generation instructions)
async function exportToPenpot() {
    const PENPOT_EXPORT_PROMPT = `You are an expert wireframe designer. Your team has generated a content-first, text-based wireframe that outlines the key elements of a page that they have been designing. I need you to take this and convert it into a visual .penpot file that can be seen visually to help us prepare for production. 

Provide all of the assets that are needed for a complete and validated Penpot file. Ensure that it has all of the elements to make it visually representative and to carry forward the semantics expressed in the text wireframe. 

**Important accessibility requirements:**
- It is critical that accessibility is preserved in the visual design
- The wireframe you create in Penpot must meet WCAG 2.2 AA standards
- Maintain semantic structure and landmark regions from the original wireframe
- Ensure proper heading hierarchy and contrast ratios

**Deliverables:**
- A complete .penpot file with all boards, components, and layers properly organized
- Clear naming for all objects and groups
- Consistent typography, spacing, and color system
- Reusable components for buttons, inputs, and cards
- All assets packaged and ready for import into Penpot

If you have any concerns or questions about accessibility or design choices, please let me know.

**After you've created the file:**
Please remind me how to import it into https://design.penpot.app and what to do if I don't already have an account.

---

## Wireframe to Convert:
`;

    const content = PENPOT_EXPORT_PROMPT + '\n\n' + editor.value;
    
    try {
        await navigator.clipboard.writeText(content);
        showToast('Penpot export instructions copied to clipboard! Paste into ChatGPT, Gemini, or Claude.');
    } catch (err) {
        console.error('Failed to copy:', err);
        showToast('Failed to copy. Please try again.');
    }
}

// Save to .txt file
function saveToFile() {
    const content = editor.value;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    // Extract title from metadata block
    const titleMatch = content.match(/^Title:\s*(.+)$/m);
    let filename;
    
    if (titleMatch && titleMatch[1].trim()) {
        // Use title, sanitize for filename
        filename = titleMatch[1].trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') + '.txt';
    } else {
        // Fallback to timestamp
        const timestamp = new Date().toISOString().slice(0, 10);
        filename = `wireframe-${timestamp}.txt`;
    }
    
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('File saved successfully!');
}

// Load from .txt file
function loadFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        
        // Extract title from content or use filename
        const titleMatch = content.match(/^Title:\s*(.+)$/m);
        const docName = titleMatch && titleMatch[1].trim() ? titleMatch[1].trim() : file.name.replace('.txt', '');
        
        // Create a unique document ID based on the name
        const docId = 'loaded-' + docName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        // Save as a new document
        const documents = getDocuments();
        documents[docId] = {
            content: content,
            timestamp: Date.now(),
            name: docName
        };
        localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
        localStorage.setItem(CURRENT_DOC_KEY, docId);
        
        // Update editor and UI
        editor.value = content;
        updateCharCount();
        updateLineNumbers();
        updateHighlight();
        validateWireframe();
        loadDocumentsList();
        documentSelect.value = docId;
        showToast(`Loaded: ${docName}`);
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// Clear editor
function clearEditor() {
    if (editor.value.trim() === '') {
        showToast('Editor is already empty.');
        return;
    }

    if (confirm('Are you sure you want to clear the editor? This cannot be undone.')) {
        editor.value = '';
        saveToStorage();
        updateCharCount();
        updateLineNumbers();
        updateHighlight();
        validateWireframe();
        editor.focus();
        showToast('Editor cleared.');
    }
}

// LocalStorage
function saveToStorage() {
    try {
        const currentDocId = localStorage.getItem(CURRENT_DOC_KEY) || 'current';
        const documents = getDocuments();
        documents[currentDocId] = {
            content: editor.value,
            timestamp: Date.now(),
            name: currentDocId === 'current' ? 'Current Document' : documents[currentDocId]?.name || 'Untitled'
        };
        localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
    } catch (err) {
        console.error('Failed to save to localStorage:', err);
    }
}

function loadFromStorage() {
    try {
        const currentDocId = localStorage.getItem(CURRENT_DOC_KEY) || 'current';
        const documents = getDocuments();
        const doc = documents[currentDocId];
        if (doc && doc.content !== undefined) {
            editor.value = doc.content;
            updateLineNumbers();
            updateHighlight();
            validateWireframe();
        }
    } catch (err) {
        console.error('Failed to load from localStorage:', err);
    }
}

function getDocuments() {
    try {
        const stored = localStorage.getItem(DOCUMENTS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (err) {
        console.error('Failed to get documents:', err);
        return {};
    }
}

// Load documents list into dropdown
function loadDocumentsList() {
    const documents = getDocuments();
    const currentDocId = localStorage.getItem(CURRENT_DOC_KEY) || 'current';
    
    // Clear existing options except current
    documentSelect.innerHTML = '<option value="current">Current Document</option>';
    
    // Add separator and examples section
    if (patternsData && patternsData.examples && patternsData.examples.length > 0) {
        const examplesOptGroup = document.createElement('optgroup');
        examplesOptGroup.label = 'Examples';
        
        patternsData.examples.forEach(example => {
            const option = document.createElement('option');
            option.value = `example:${example.file}`;
            option.textContent = example.name;
            examplesOptGroup.appendChild(option);
        });
        
        documentSelect.appendChild(examplesOptGroup);
    }
    
    // Add saved documents
    const savedDocs = Object.keys(documents).filter(key => key !== 'current');
    if (savedDocs.length > 0) {
        const savedOptGroup = document.createElement('optgroup');
        savedOptGroup.label = 'Saved Documents';
        
        savedDocs.forEach(docId => {
            const option = document.createElement('option');
            option.value = docId;
            option.textContent = documents[docId].name || docId;
            savedOptGroup.appendChild(option);
        });
        
        documentSelect.appendChild(savedOptGroup);
    }
    
    // Set current selection
    documentSelect.value = currentDocId;
}

// Handle document selection change
async function handleDocumentChange(event) {
    const selectedValue = event.target.value;
    
    if (selectedValue.startsWith('example:')) {
        // Load example file
        const exampleFile = selectedValue.replace('example:', '');
        try {
            const response = await fetch(exampleFile);
            if (!response.ok) throw new Error('Failed to load example');
            const content = await response.text();
            editor.value = content;
            updateCharCount();
            updateLineNumbers();
            updateHighlight();
            validateWireframe();
            showToast(`Loaded: ${event.target.options[event.target.selectedIndex].text}`);
            
            // Don't save to current doc, just display
            localStorage.setItem(CURRENT_DOC_KEY, 'current');
        } catch (err) {
            console.error('Failed to load example:', err);
            showToast('Failed to load example file');
            event.target.value = 'current';
        }
    } else {
        // Switch to saved document
        localStorage.setItem(CURRENT_DOC_KEY, selectedValue);
        loadFromStorage();
        updateCharCount();
        updateLineNumbers();
        updateHighlight();
        validateWireframe();
        showToast(`Switched to: ${event.target.options[event.target.selectedIndex].text}`);
    }
}

// Theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    
    try {
        localStorage.setItem(THEME_KEY, newTheme);
    } catch (err) {
        console.error('Failed to save theme:', err);
    }
}

function loadTheme() {
    try {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        } else {
            // Default to light theme
            document.documentElement.setAttribute('data-theme', 'light');
            themeIcon.textContent = '🌙';
        }
    } catch (err) {
        console.error('Failed to load theme:', err);
    }
}

// Toast notification
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Update character count
function updateCharCount() {
    const count = editor.value.length;
    charCount.textContent = `${count.toLocaleString()} characters`;
}

// Update line numbers gutter
function updateLineNumbers() {
    if (!lineNumbers) return;

    const lineCount = editor.value.split('\n').length || 1;
    const linesHtml = [];
    
    for (let i = 1; i <= lineCount; i++) {
        linesHtml.push(`<div>${i}</div>`);
    }

    lineNumbers.innerHTML = linesHtml.join('');
}

// Keep gutter aligned with textarea scroll
function syncLineNumbers() {
    if (!lineNumbers) return;
    lineNumbers.scrollTop = editor.scrollTop;
}

// Highlight rendering
function updateHighlight() {
    if (!highlightLayer) return;
    const lines = editor.value.split('\n');
    const metadataPattern = /^(Title|URL|Page language|Page Purpose|Page purpose|Referrer|Regions|Interactive Elements):/;
    const structurePattern = /^(#|##|###|####|#####|######|\|\|)/;
    const layoutPattern = /(\[.*?\s+(Start|End)\]|\[2 Columns\]|\[Sidebar\]|\[Card\/Block\]|---)/;
    const interactionPattern = /(\[\[.*\]\]|\[.*?\]|<.*?>|\w+:\s*\[|^\s+[_]+\s*$|^\s+[_]+\]|^\*\s)/;

    const html = lines.map(line => {
        let cls = '';
        if (metadataPattern.test(line)) cls = 'hl-metadata';
        else if (structurePattern.test(line)) cls = 'hl-structure';
        else if (layoutPattern.test(line)) cls = 'hl-layout';
        else if (interactionPattern.test(line)) cls = 'hl-interaction';
        else cls = 'hl-default';
        return `<span class="${cls}">${escapeHtml(line || ' ')}</span>`;
    }).join('\n');

    highlightLayer.innerHTML = html;
    syncHighlightScroll();
}

function syncHighlightScroll() {
    if (!highlightLayer) return;
    highlightLayer.scrollTop = editor.scrollTop;
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Keep numbers up to date on resize (in case wrapping changes line count)
window.addEventListener('resize', () => {
    updateLineNumbers();
    syncLineNumbers();
    updateHighlight();
});

// Validate wireframe structure
function validateWireframe() {
    const content = editor.value;
    const lines = content.split('\n');
    const warnings = [];
    
    // Check for headings
    const headings = [];
    const h1Pattern = /^# /;
    const h2Pattern = /^## /;
    const h3Pattern = /^### /;
    const h4Pattern = /^#### /;
    const h5Pattern = /^##### /;
    const h6Pattern = /^###### /;
    
    lines.forEach((line, index) => {
        if (h6Pattern.test(line)) headings.push({ level: 6, line: index + 1, text: line });
        else if (h5Pattern.test(line)) headings.push({ level: 5, line: index + 1, text: line });
        else if (h4Pattern.test(line)) headings.push({ level: 4, line: index + 1, text: line });
        else if (h3Pattern.test(line)) headings.push({ level: 3, line: index + 1, text: line });
        else if (h2Pattern.test(line)) headings.push({ level: 2, line: index + 1, text: line });
        else if (h1Pattern.test(line)) headings.push({ level: 1, line: index + 1, text: line });
    });
    
    // Validation 1: Should start with H1
    if (headings.length > 0 && headings[0].level !== 1) {
        warnings.push(`⚠️ First heading should be H1 (found H${headings[0].level} on line ${headings[0].line})`);
    }
    
    // Validation 2: Should only have one H1
    const h1Count = headings.filter(h => h.level === 1).length;
    if (h1Count > 1) {
        warnings.push(`⚠️ Page should have only one H1 (found ${h1Count})`);
    }
    
    // Validation 3: Headings should not skip levels
    for (let i = 1; i < headings.length; i++) {
        const prevLevel = headings[i - 1].level;
        const currentLevel = headings[i].level;
        
        if (currentLevel > prevLevel + 1) {
            warnings.push(`⚠️ Heading skips from H${prevLevel} to H${currentLevel} on line ${headings[i].line}`);
        }
    }
    
    // Validation 4: Check for multiple metadata blocks
    const metadataPattern = /^(Title|URL|Page language|Page Purpose|Page purpose|Referrer|Regions|Interactive Elements):/;
    let metadataBlocks = 0;
    let metadataEnded = false;
    let seenContent = false;

    lines.forEach((line) => {
        const isMetadata = metadataPattern.test(line);
        const isContent = line.trim() !== '' && !isMetadata;

        if (isMetadata && !metadataEnded) {
            // First metadata block (only counted once)
            if (metadataBlocks === 0) {
                metadataBlocks = 1;
            }
        } else if (isMetadata && metadataEnded) {
            // Any metadata after content counts as a new block
            metadataBlocks += 1;
        }

        if (isContent) {
            metadataEnded = true;
        }
    });
    
    if (metadataBlocks > 1) {
        warnings.push(`⚠️ Page should have only one metadata block (found ${metadataBlocks})`);
    }

    // Validation 5: Duplicate links with same text and destination
    const linkPattern = /\[([^\]]+)\](?:\(([^)]+)\))?/g;
    const linkMap = new Map(); // key: text|url, value: {text, url, lines: []}

    lines.forEach((line, index) => {
        let match;
        while ((match = linkPattern.exec(line)) !== null) {
            const rawText = match[1];
            const text = rawText.trim();
            const url = (match[2] || '').trim();

            // Ignore form-field style placeholders like [________]
            const noSpaces = text.replace(/\s+/g, '');
            if (/^_+$/.test(noSpaces)) continue;

            // Treat empty destination as the same key so duplicate link text without URLs is flagged
            const key = `${text}|${url || 'NO_URL'}`;
            if (!linkMap.has(key)) {
                linkMap.set(key, { text, url, lines: [] });
            }
            linkMap.get(key).lines.push(index + 1);
        }
    });

    linkMap.forEach(({ text, url, lines }) => {
        if (lines.length > 1) {
            const location = url ? ` → ${url}` : '';
            warnings.push(`⚠️ Duplicate links detected: "${text}"${location} appears on lines ${lines.join(', ')}`);
        }
    });
    
    // Display warnings
    displayValidationWarnings(warnings);
}

// Display validation warnings
function displayValidationWarnings(warnings) {
    let validationDiv = document.getElementById('validation-warnings');
    
    if (!validationDiv) {
        // Create validation warnings container
        validationDiv = document.createElement('div');
        validationDiv.id = 'validation-warnings';
        validationDiv.className = 'validation-warnings';
        validationDiv.setAttribute('role', 'status');
        validationDiv.setAttribute('aria-live', 'polite');
        
        const editorContainer = document.querySelector('.editor-container');
        const toolbar = document.querySelector('.editor-toolbar');
        editorContainer.insertBefore(validationDiv, toolbar.nextSibling);
    }
    
    if (warnings.length === 0) {
        validationDiv.style.display = 'none';
        validationDiv.innerHTML = '';
    } else {
        validationDiv.style.display = 'block';
        validationDiv.innerHTML = '<strong>Accessibility Issues:</strong><ul>' + 
            warnings.map(w => `<li>${w}</li>`).join('') + 
            '</ul>';
    }
}

// Show help modal
function showHelp() {
    helpModal.classList.add('show');
    modalCloseBtn.focus();
}

// Hide help modal
function hideHelp() {
    helpModal.classList.remove('show');
    helpBtn.focus();
}

// Share modal helpers
function buildShareMessage() {
    const titleMatch = editor.value.match(/^Title:\s*(.+)$/m);
    const title = titleMatch && titleMatch[1].trim() ? titleMatch[1].trim() : 'Content-first wireframe';
    return `${title} — drafted in the content-first wireframe tool.`;
}

function getShareUrl() {
    const href = window.location.href;
    return /^https?:/i.test(href) ? href.split('#')[0] : 'https://github.com/mgifford/content-first-wireframe';
}

function showShare() {
    shareMessage.value = buildShareMessage();
    if (!mastodonInstanceInput.value) {
        mastodonInstanceInput.value = 'mastodon.social';
    }
    shareModal.classList.add('show');
    shareMessage.focus();
}

function hideShare() {
    shareModal.classList.remove('show');
    shareBtn.focus();
}

function openShareWindow(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('Opening share dialog...');
}

function shareLinkedIn() {
    const message = shareMessage.value.trim() || buildShareMessage();
    const shareUrl = getShareUrl();
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(message)}`;
    openShareWindow(url);
}

function shareMastodon() {
    const message = shareMessage.value.trim() || buildShareMessage();
    const instance = (mastodonInstanceInput.value || 'mastodon.social')
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, '');
    const url = `https://${instance}/share?text=${encodeURIComponent(message)}`;
    openShareWindow(url);
}

function shareBluesky() {
    const message = shareMessage.value.trim() || buildShareMessage();
    const url = `https://bsky.app/intent/compose?text=${encodeURIComponent(message)}`;
    openShareWindow(url);
}

async function copyShareMessage() {
    const message = shareMessage.value.trim() || buildShareMessage();
    try {
        await navigator.clipboard.writeText(message);
        showToast('Share message copied. Paste into your post.');
    } catch (err) {
        console.error('Failed to copy share message:', err);
        showToast('Unable to copy share message.');
    }
}

// Online/Offline Detection
function checkOnlineStatus() {
    if (!navigator.onLine) {
        offlineBanner.classList.add('show');
    } else {
        offlineBanner.classList.remove('show');
    }
}

function setupOnlineListeners() {
    window.addEventListener('online', () => {
        offlineBanner.classList.remove('show');
        showToast('Back online!');
        // Retry loading patterns if they failed
        if (!patternsData || patternsData.categories.length === 0) {
            loadPatterns().then(renderPatternLibrary);
        }
    });

    window.addEventListener('offline', () => {
        offlineBanner.classList.add('show');
        showToast('You are now offline. Work is saved locally.');
    });
}

// Initialize on load
init();
