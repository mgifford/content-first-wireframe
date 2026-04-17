'use strict';

/**
 * Plain language rewrite action.
 * Uses Chrome Built-in AI Prompt API with the plain-language prompt.
 */
(function () {
    const ns = (window.ChromeAI = window.ChromeAI || {});
    ns.actions = ns.actions || {};

    /**
     * Rewrites the given text in plain language at the specified level.
     * @param {string} text - The text to rewrite.
     * @param {string} level - One of: 'general', 'grade6', 'grade8', 'public-service'.
     * @returns {Promise<{result?: string, error?: string}>}
     */
    ns.actions.rewritePlainLanguage = async function rewritePlainLanguage(text, level) {
        if (!text || !text.trim()) {
            return { error: 'No text provided.' };
        }

        let session;
        try {
            session = await ns.createSession(ns.prompts.plainLanguage.system);
            const result = await session.prompt(ns.prompts.plainLanguage.user(text, level || 'general'));
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
