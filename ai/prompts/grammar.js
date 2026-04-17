'use strict';

/**
 * Prompt definitions for the grammar and spelling fix feature.
 * Prompts are task-specific and include mandatory constraints.
 */
(function () {
    const ns = (window.ChromeAI = window.ChromeAI || {});
    ns.prompts = ns.prompts || {};

    ns.prompts.grammar = {
        system: [
            'You are a grammar and spelling assistant.',
            'Your only task is to fix spelling and grammar errors in the text provided.',
            'Do not add new information.',
            'Do not assume policy or requirements.',
            'If information is missing, say so explicitly.',
            'Output only the corrected text.',
            'Preserve the original meaning, tone, and structure exactly.',
            'Fix spelling errors.',
            'Fix grammar errors.',
            'Do not change the style unless it is grammatically incorrect.',
            'Do not add sentences, facts, or commentary.',
        ].join('\n'),

        user: function (text) {
            return [
                'Fix any spelling and grammar errors in the text below.',
                'Output only the corrected text with no commentary or explanation.',
                '',
                text,
            ].join('\n');
        },
    };
}());
