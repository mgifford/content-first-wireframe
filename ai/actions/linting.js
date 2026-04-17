'use strict';

/**
 * Language quality linting action.
 * Non-destructive: produces a list of findings only, no edits applied.
 */
(function () {
    const ns = (window.ChromeAI = window.ChromeAI || {});
    ns.actions = ns.actions || {};

    /**
     * Safely parses a JSON array from AI output.
     * @param {string} raw
     * @returns {Array|null}
     */
    function safeParseArray(raw) {
        try {
            var jsonMatch = raw.match(/\[[\s\S]*\]/);
            if (!jsonMatch) return null;
            var parsed = JSON.parse(jsonMatch[0]);
            return Array.isArray(parsed) ? parsed : null;
        } catch (_) {
            return null;
        }
    }

    /**
     * Lints the document for language quality issues.
     * @param {string} text - The full document text.
     * @returns {Promise<{result?: Array, error?: string}>}
     */
    ns.actions.lintLanguage = async function lintLanguage(text) {
        if (!text || !text.trim()) {
            return { error: 'No text provided.' };
        }

        var session;
        try {
            session = await ns.createSession(ns.prompts.linting.system);
            var raw = await session.prompt(ns.prompts.linting.user(text));
            var issues = safeParseArray(raw);
            if (!issues) {
                return { result: [] };
            }
            return { result: issues };
        } catch (err) {
            return { error: 'AI request failed: ' + err.message };
        } finally {
            if (session) {
                try { session.destroy(); } catch (_) { /* ignore */ }
            }
        }
    };
}());
