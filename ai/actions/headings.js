'use strict';

/**
 * Heading coaching action.
 * Extracts headings from the wireframe and asks AI to review them.
 * Returns suggestions only — headings are never auto-renamed.
 */
(function () {
    const ns = (window.ChromeAI = window.ChromeAI || {});
    ns.actions = ns.actions || {};

    /**
     * Extracts headings from wireframe DSL text.
     * @param {string} text
     * @returns {Array<{level: number, text: string, line: number}>}
     */
    function extractHeadings(text) {
        var lines = text.split('\n');
        var headings = [];
        lines.forEach(function (line, index) {
            var match = line.match(/^(#{1,6})\s+(.+)/);
            if (match) {
                headings.push({
                    level: match[1].length,
                    text: match[2].trim(),
                    line: index + 1,
                });
            }
        });
        return headings;
    }

    /**
     * Safely parses a JSON array from AI output.
     * The AI is instructed to return raw JSON; this extracts it defensively.
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
     * Reviews headings for vagueness, noun framing, and inconsistency.
     * @param {string} documentText - Full wireframe text.
     * @returns {Promise<{result?: Array, headings?: Array, note?: string, error?: string}>}
     */
    ns.actions.reviewHeadings = async function reviewHeadings(documentText) {
        var headings = extractHeadings(documentText);
        if (headings.length === 0) {
            return { result: [], headings: [], note: 'No headings found in the document.' };
        }

        var headingTexts = headings.map(function (h) {
            return '#'.repeat(h.level) + ' ' + h.text;
        });

        var session;
        try {
            session = await ns.createSession(ns.prompts.headings.system);
            var raw = await session.prompt(ns.prompts.headings.user(headingTexts));
            var suggestions = safeParseArray(raw);
            if (!suggestions) {
                return { result: [], headings: headings, note: 'No heading suggestions from AI.' };
            }
            return { result: suggestions, headings: headings };
        } catch (err) {
            return { error: 'AI request failed: ' + err.message };
        } finally {
            if (session) {
                try { session.destroy(); } catch (_) { /* ignore */ }
            }
        }
    };
}());
