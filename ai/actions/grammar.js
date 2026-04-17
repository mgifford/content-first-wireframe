'use strict';

/**
 * Grammar and spelling fix action.
 * Uses Chrome Built-in AI Prompt API with the grammar prompt.
 */
(function () {
    const ns = (window.ChromeAI = window.ChromeAI || {});
    ns.actions = ns.actions || {};

    /**
     * Runs the grammar fix AI action on the given text.
     * @param {string} text - The text to fix.
     * @returns {Promise<{result?: string, error?: string}>}
     */
    ns.actions.fixGrammar = async function fixGrammar(text) {
        if (!text || !text.trim()) {
            return { error: 'No text provided.' };
        }

        let session;
        try {
            session = await ns.createSession(ns.prompts.grammar.system);
            const result = await session.prompt(ns.prompts.grammar.user(text));
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
