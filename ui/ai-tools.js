'use strict';

/**
 * AI Writing Tools UI coordinator.
 * - Detects Chrome Built-in AI availability at startup.
 * - Reveals the AI tools panel when AI is available.
 * - Wires up button handlers for all five AI features.
 * - Shows a results modal with diff preview and Apply/Dismiss controls.
 *
 * All AI output is treated as untrusted text and HTML-escaped before display.
 * AI suggestions are never auto-applied — the author always reviews first.
 */
(function () {
    // ── Helpers ──────────────────────────────────────────────────────────────

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function getEditor() {
        return document.getElementById('wireframe-editor');
    }

    // ── Results panel ─────────────────────────────────────────────────────────

    var pendingApplyFn = null;

    /**
     * Opens the AI results modal with the given content.
     * @param {string} title       - Modal heading (plain text).
     * @param {string} bodyHtml    - Safe HTML for the body (built from escaped values).
     * @param {Function|null} applyFn - Called when the author clicks "Apply". Null = no apply button.
     */
    function showAIResults(title, bodyHtml, applyFn) {
        var modal   = document.getElementById('ai-results-modal');
        var titleEl = document.getElementById('ai-results-title');
        var body    = document.getElementById('ai-results-body');
        var footer  = document.getElementById('ai-results-footer');
        if (!modal || !titleEl || !body || !footer) return;

        titleEl.textContent = escapeHtml(title);
        // bodyHtml is constructed solely from escaped values — safe to set as innerHTML
        body.innerHTML = bodyHtml;
        footer.innerHTML = '';

        if (typeof applyFn === 'function') {
            pendingApplyFn = applyFn;
            var applyBtn = document.createElement('button');
            applyBtn.type = 'button';
            applyBtn.className = 'ai-apply-btn btn-primary';
            applyBtn.textContent = 'Apply';
            applyBtn.addEventListener('click', function () {
                if (typeof pendingApplyFn === 'function') pendingApplyFn();
                hideAIResults();
            });
            footer.appendChild(applyBtn);
        } else {
            pendingApplyFn = null;
        }

        var dismissBtn = document.createElement('button');
        dismissBtn.type = 'button';
        dismissBtn.className = 'ai-dismiss-btn';
        dismissBtn.textContent = 'Dismiss';
        dismissBtn.addEventListener('click', hideAIResults);
        footer.appendChild(dismissBtn);

        modal.classList.add('show');

        // Move focus to the close button for keyboard users
        var closeBtn = document.getElementById('ai-results-close-btn');
        if (closeBtn) closeBtn.focus();

        // Wire up per-item dismiss buttons injected by renderAnnotationList
        body.querySelectorAll('.ai-dismiss-item').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                var idx = e.currentTarget.dataset.index;
                var item = document.getElementById('ai-annotation-' + idx);
                if (item) item.remove();
            });
        });
    }

    function hideAIResults() {
        var modal = document.getElementById('ai-results-modal');
        if (modal) modal.classList.remove('show');
        pendingApplyFn = null;
    }

    // ── Loading state ─────────────────────────────────────────────────────────

    function setButtonLoading(btnId, loading) {
        var btn = document.getElementById(btnId);
        if (!btn) return;
        btn.disabled = loading;
        btn.setAttribute('aria-busy', loading ? 'true' : 'false');
        if (loading) {
            btn.dataset.originalText = btn.textContent;
            btn.textContent = 'Working\u2026';
        } else {
            btn.textContent = btn.dataset.originalText || btn.textContent;
        }
    }

    // ── Feature: Fix spelling & grammar ───────────────────────────────────────

    async function handleFixGrammar() {
        var editor    = getEditor();
        var selStart  = editor.selectionStart;
        var selEnd    = editor.selectionEnd;
        var hasSelection = selStart !== selEnd;
        var text = hasSelection ? editor.value.substring(selStart, selEnd) : editor.value;

        if (!text.trim()) {
            alert('Please enter some text in the editor first.');
            return;
        }

        setButtonLoading('ai-grammar-btn', true);
        try {
            var res = await window.ChromeAI.actions.fixGrammar(text);
            if (res.error) {
                showAIResults('Fix spelling and grammar', '<p class="ai-error">' + escapeHtml(res.error) + '</p>', null);
                return;
            }
            var diffHtml = window.ChromeAI.renderDiff(text, res.result);
            var bodyHtml =
                '<p class="ai-preview-info">Preview — <ins class="diff-add">additions</ins> and <del class="diff-del">removals</del> highlighted:</p>' +
                '<div class="ai-diff-preview" aria-label="Diff preview">' + diffHtml + '</div>';

            showAIResults('Fix spelling and grammar', bodyHtml, function () {
                if (hasSelection) {
                    editor.value = editor.value.substring(0, selStart) + res.result + editor.value.substring(selEnd);
                } else {
                    editor.value = res.result;
                }
                editor.dispatchEvent(new Event('input'));
            });
        } finally {
            setButtonLoading('ai-grammar-btn', false);
        }
    }

    // ── Feature: Rewrite in plain language ───────────────────────────────────

    async function handlePlainLanguage() {
        var editor    = getEditor();
        var levelSel  = document.getElementById('ai-plain-language-level');
        var level     = levelSel ? levelSel.value : 'general';
        var selStart  = editor.selectionStart;
        var selEnd    = editor.selectionEnd;
        var hasSelection = selStart !== selEnd;
        var text = hasSelection ? editor.value.substring(selStart, selEnd) : editor.value;

        if (!text.trim()) {
            alert('Please enter some text in the editor first.');
            return;
        }

        setButtonLoading('ai-plain-language-btn', true);
        try {
            var res = await window.ChromeAI.actions.rewritePlainLanguage(text, level);
            if (res.error) {
                showAIResults('Rewrite in plain language', '<p class="ai-error">' + escapeHtml(res.error) + '</p>', null);
                return;
            }
            var diffHtml = window.ChromeAI.renderDiff(text, res.result);
            var bodyHtml =
                '<p class="ai-preview-info">Preview — <ins class="diff-add">additions</ins> and <del class="diff-del">removals</del> highlighted:</p>' +
                '<div class="ai-diff-preview" aria-label="Diff preview">' + diffHtml + '</div>';

            showAIResults('Rewrite in plain language', bodyHtml, function () {
                if (hasSelection) {
                    editor.value = editor.value.substring(0, selStart) + res.result + editor.value.substring(selEnd);
                } else {
                    editor.value = res.result;
                }
                editor.dispatchEvent(new Event('input'));
            });
        } finally {
            setButtonLoading('ai-plain-language-btn', false);
        }
    }

    // ── Feature: Review headings ──────────────────────────────────────────────

    async function handleReviewHeadings() {
        var editor = getEditor();
        var text   = editor.value;
        if (!text.trim()) {
            alert('Please enter some text in the editor first.');
            return;
        }

        setButtonLoading('ai-headings-btn', true);
        try {
            var res = await window.ChromeAI.actions.reviewHeadings(text);
            if (res.error) {
                showAIResults('Review headings', '<p class="ai-error">' + escapeHtml(res.error) + '</p>', null);
                return;
            }
            var noteHtml = res.note ? '<p class="ai-preview-info">' + escapeHtml(res.note) + '</p>' : '';
            var listHtml = window.ChromeAI.renderAnnotationList(res.result);
            showAIResults('Review headings', noteHtml + listHtml, null);
        } finally {
            setButtonLoading('ai-headings-btn', false);
        }
    }

    // ── Feature: Replace filler with placeholders ─────────────────────────────

    async function handleReplaceFiller() {
        var editor = getEditor();
        var text   = editor.value;
        if (!text.trim()) {
            alert('Please enter some text in the editor first.');
            return;
        }

        if (!window.ChromeAI.actions.containsFiller(text)) {
            showAIResults(
                'Replace filler with placeholders',
                '<p class="ai-no-issues">No filler content detected (lorem ipsum, TBD, etc.).</p>',
                null
            );
            return;
        }

        setButtonLoading('ai-placeholders-btn', true);
        try {
            var res = await window.ChromeAI.actions.replaceFiller(text);
            if (res.error) {
                showAIResults('Replace filler with placeholders', '<p class="ai-error">' + escapeHtml(res.error) + '</p>', null);
                return;
            }
            var noteHtml = res.note ? '<p class="ai-preview-info">' + escapeHtml(res.note) + '</p>' : '';
            var diffHtml = window.ChromeAI.renderDiff(text, res.result);
            var bodyHtml =
                noteHtml +
                '<p class="ai-preview-info">Preview — <ins class="diff-add">new placeholders</ins> highlighted:</p>' +
                '<div class="ai-diff-preview" aria-label="Diff preview">' + diffHtml + '</div>';

            showAIResults('Replace filler with placeholders', bodyHtml, function () {
                editor.value = res.result;
                editor.dispatchEvent(new Event('input'));
            });
        } finally {
            setButtonLoading('ai-placeholders-btn', false);
        }
    }

    // ── Feature: Review language quality ─────────────────────────────────────

    async function handleLintLanguage() {
        var editor = getEditor();
        var text   = editor.value;
        if (!text.trim()) {
            alert('Please enter some text in the editor first.');
            return;
        }

        setButtonLoading('ai-linting-btn', true);
        try {
            var res = await window.ChromeAI.actions.lintLanguage(text);
            if (res.error) {
                showAIResults('Review language quality', '<p class="ai-error">' + escapeHtml(res.error) + '</p>', null);
                return;
            }
            var listHtml = window.ChromeAI.renderAnnotationList(res.result);
            showAIResults('Review language quality', listHtml, null);
        } finally {
            setButtonLoading('ai-linting-btn', false);
        }
    }

    // ── Initialisation ────────────────────────────────────────────────────────

    async function initAITools() {
        var section       = document.getElementById('ai-tools-section');
        var unavailableEl = document.getElementById('ai-tools-unavailable');
        var buttonsDiv    = document.getElementById('ai-tools-buttons');
        if (!section) return;

        var available = await window.ChromeAI.detect();

        if (!available) {
            if (unavailableEl) unavailableEl.hidden = false;
            if (buttonsDiv)    buttonsDiv.hidden    = true;
            return;
        }

        if (unavailableEl) unavailableEl.hidden = true;
        if (buttonsDiv)    buttonsDiv.hidden    = false;

        // Wire up feature buttons
        var grammarBtn      = document.getElementById('ai-grammar-btn');
        var plainLangBtn    = document.getElementById('ai-plain-language-btn');
        var headingsBtn     = document.getElementById('ai-headings-btn');
        var placeholdersBtn = document.getElementById('ai-placeholders-btn');
        var lintingBtn      = document.getElementById('ai-linting-btn');

        if (grammarBtn)      grammarBtn.addEventListener('click', handleFixGrammar);
        if (plainLangBtn)    plainLangBtn.addEventListener('click', handlePlainLanguage);
        if (headingsBtn)     headingsBtn.addEventListener('click', handleReviewHeadings);
        if (placeholdersBtn) placeholdersBtn.addEventListener('click', handleReplaceFiller);
        if (lintingBtn)      lintingBtn.addEventListener('click', handleLintLanguage);

        // Close results modal on overlay click
        var modal = document.getElementById('ai-results-modal');
        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) hideAIResults();
            });
        }

        // Close results modal on × button
        var closeBtn = document.getElementById('ai-results-close-btn');
        if (closeBtn) closeBtn.addEventListener('click', hideAIResults);

        // Close results modal on Escape key
        document.addEventListener('keydown', function (e) {
            var m = document.getElementById('ai-results-modal');
            if (e.key === 'Escape' && m && m.classList.contains('show')) {
                hideAIResults();
            }
        });
    }

    // Start after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAITools);
    } else {
        initAITools();
    }
}());
