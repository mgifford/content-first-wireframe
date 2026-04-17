'use strict';

/**
 * Filler content detection and placeholder replacement action.
 * Detects lorem ipsum, TBD, and vague placeholder text.
 * Never generates final content — replaces filler with semantic placeholders only.
 */
(function () {
    const ns = (window.ChromeAI = window.ChromeAI || {});
    ns.actions = ns.actions || {};

    // Patterns that indicate filler or placeholder content
    var FILLER_PATTERNS = [
        /lorem\s+ipsum/i,
        /\btbd\b/i,
        /\bplaceholder\s+text\b/i,
        /content\s+goes\s+here/i,
        /insert\s+text\s+here/i,
        /insert\s+content\s+here/i,
        /\[insert\b/i,
        /\bfiller\b/i,
        /sample\s+text/i,
    ];

    /**
     * Checks whether the given text contains filler content.
     * @param {string} text
     * @returns {boolean}
     */
    ns.actions.containsFiller = function containsFiller(text) {
        return FILLER_PATTERNS.some(function (pattern) {
            return pattern.test(text);
        });
    };

    /**
     * Replaces filler content with meaningful semantic placeholders.
     * @param {string} text - The full document text.
     * @returns {Promise<{result?: string, note?: string, error?: string}>}
     */
    ns.actions.replaceFiller = async function replaceFiller(text) {
        if (!text || !text.trim()) {
            return { error: 'No text provided.' };
        }

        if (!ns.actions.containsFiller(text)) {
            return { result: text, note: 'No filler content detected.' };
        }

        var session;
        try {
            session = await ns.createSession(ns.prompts.placeholders.system);
            var result = await session.prompt(ns.prompts.placeholders.user(text));
            return { result: result.trim() };
        } catch (err) {
            return { error: 'AI request failed: ' + err.message };
        } finally {
            if (session) {
                try { session.destroy(); } catch (_) { /* ignore */ }
            }
        }
    };
}());
