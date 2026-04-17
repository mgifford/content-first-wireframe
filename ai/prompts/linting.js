'use strict';

/**
 * Prompt definitions for the language quality linting feature.
 * Non-destructive: produces findings only, no edits.
 */
(function () {
    const ns = (window.ChromeAI = window.ChromeAI || {});
    ns.prompts = ns.prompts || {};

    ns.prompts.linting = {
        system: [
            'You are a language quality reviewer for web content and wireframes.',
            'Your only task is to identify language quality issues.',
            'Do not add new information.',
            'Do not assume policy or requirements.',
            'If information is missing, say so explicitly.',
            'Check for: overlong sentences (over 25 words), passive voice overuse, undefined acronyms, inconsistent terminology, missing purpose statements, sections without a clear user task, missing error or empty states when forms or actions are present.',
            'Output only a JSON array of objects. Each object must have: "location" (quote the relevant phrase or heading), "issue" (brief description), "suggestion" (a textual fix, not applied).',
            'If no issues are found, return an empty JSON array: []',
            'Return raw JSON only. No markdown code fences, no explanatory text.',
        ].join('\n'),

        user: function (text) {
            return [
                'Review the text below for language quality issues.',
                'Return a JSON array only. No other text.',
                '',
                text,
            ].join('\n');
        },
    };
}());
