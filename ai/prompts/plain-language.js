'use strict';

/**
 * Prompt definitions for the plain language rewrite feature.
 * Supports multiple reading-level modes.
 */
(function () {
    const ns = (window.ChromeAI = window.ChromeAI || {});
    ns.prompts = ns.prompts || {};

    const LEVEL_INSTRUCTIONS = {
        general: 'Write for the general public. Use plain, everyday English.',
        grade6: 'Write at a Grade 6 reading level. Use very short sentences (under 15 words). Avoid any jargon or technical terms.',
        grade8: 'Write at a Grade 8 reading level. Use clear, direct language and short sentences (under 20 words).',
        'public-service': 'Follow plain-language public service writing standards. Use active voice, direct address ("you"), and concrete verbs.',
    };

    ns.prompts.plainLanguage = {
        system: [
            'You are a plain-language writing assistant.',
            'Your only task is to rewrite text for clarity and accessibility.',
            'Do not add new information.',
            'Do not assume policy or requirements.',
            'If information is missing, say so explicitly.',
            'Do not remove any meaning from the original text.',
            'Use short sentences and active voice.',
            'Do not add sentences, facts, or commentary.',
            'Output only the rewritten text with no commentary.',
        ].join('\n'),

        user: function (text, level) {
            const instruction = LEVEL_INSTRUCTIONS[level] || LEVEL_INSTRUCTIONS.general;
            return [
                'Rewrite the text below for plain language.',
                instruction,
                'Output only the rewritten text.',
                '',
                text,
            ].join('\n');
        },
    };
}());
