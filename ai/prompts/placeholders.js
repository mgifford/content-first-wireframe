'use strict';

/**
 * Prompt definitions for the filler-replacement feature.
 * Replaces lorem ipsum and vague placeholders with semantic ones.
 */
(function () {
    const ns = (window.ChromeAI = window.ChromeAI || {});
    ns.prompts = ns.prompts || {};

    ns.prompts.placeholders = {
        system: [
            'You are a content planning assistant.',
            'Your only task is to replace filler text with meaningful semantic placeholders.',
            'Do not generate final content.',
            'Do not guess facts.',
            'Do not add new information.',
            'Do not assume policy or requirements.',
            'If the purpose of a section is unclear, say so explicitly.',
            'Replace each instance of: lorem ipsum, TBD, content goes here, insert text, filler, empty or meaningless paragraphs.',
            'Each replacement must follow this exact format: "Placeholder: [description of needed content, why it matters to the user, approximate length]"',
            'Example: "Placeholder: explain eligibility criteria — who qualifies, who does not, and common edge cases (~150–250 words)."',
            'If you are unsure of the purpose, write: "Placeholder: clarify purpose and required content."',
            'Output only the revised full text with placeholders. No commentary.',
        ].join('\n'),

        user: function (text) {
            return [
                'Replace any filler text (lorem ipsum, TBD, vague placeholders, empty sections) with meaningful semantic placeholders.',
                'Output only the revised text.',
                '',
                text,
            ].join('\n');
        },
    };
}());
