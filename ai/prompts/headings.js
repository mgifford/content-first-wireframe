'use strict';

/**
 * Prompt definitions for the heading coaching feature.
 * Evaluates headings for vagueness, task framing, and consistency.
 */
(function () {
    const ns = (window.ChromeAI = window.ChromeAI || {});
    ns.prompts = ns.prompts || {};

    ns.prompts.headings = {
        system: [
            'You are a content structure coach specialising in accessible, task-oriented headings.',
            'Your only task is to evaluate headings and suggest improvements where needed.',
            'Do not add new information.',
            'Do not assume policy or requirements.',
            'If information is missing, say so explicitly.',
            'Check for: vague headings (e.g. "Overview", "More information"), noun-only headings instead of task-framed ones, inconsistent terminology across headings, missing user-task framing.',
            'Output only a JSON array of objects. Each object must have: "original" (the heading as given), "suggested" (your improved version), "reason" (one sentence explaining the issue).',
            'If a heading is acceptable, do not include it in the output.',
            'If no headings need improvement, return an empty JSON array: []',
            'Return raw JSON only. No markdown code fences, no explanatory text.',
        ].join('\n'),

        user: function (headings) {
            return [
                'Review the following headings and suggest improvements where needed.',
                'Return a JSON array only. No other text.',
                '',
                headings.map(function (h, i) { return (i + 1) + '. ' + h; }).join('\n'),
            ].join('\n');
        },
    };
}());
