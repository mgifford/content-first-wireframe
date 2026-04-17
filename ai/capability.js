'use strict';

/**
 * Chrome Built-in AI capability detection.
 * Checks for the Prompt API (window.ai.languageModel).
 * All AI processing is local to the browser. No external APIs. No keys.
 */
(function () {
    const ns = (window.ChromeAI = window.ChromeAI || {});

    /**
     * Detects whether Chrome Built-in AI is available.
     * Handles 'readily', 'after-download', and 'no' states.
     * @returns {Promise<boolean>}
     */
    ns.detect = async function detectChromeAI() {
        if (typeof window === 'undefined') return false;
        if (!('ai' in window) || !window.ai) return false;
        if (!('languageModel' in window.ai)) return false;

        try {
            const capabilities = await window.ai.languageModel.capabilities();
            if (!capabilities) return false;
            // 'readily' = available now; 'after-download' = available soon
            return capabilities.available === 'readily' || capabilities.available === 'after-download';
        } catch {
            return false;
        }
    };

    /**
     * Creates a new AI language model session.
     * @param {string} systemPrompt
     * @returns {Promise<object>} session
     */
    ns.createSession = async function createSession(systemPrompt) {
        return window.ai.languageModel.create({ systemPrompt });
    };
}());
