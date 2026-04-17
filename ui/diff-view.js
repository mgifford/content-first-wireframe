'use strict';

/**
 * Diff view renderer.
 * Produces safe HTML showing word-level differences between two texts.
 * All user-derived content is HTML-escaped before rendering.
 */
(function () {
    const ns = (window.ChromeAI = window.ChromeAI || {});

    // Maximum word count for word-level diff; beyond this, use plain comparison.
    const DIFF_WORD_LIMIT = 600;

    /**
     * Escapes HTML entities. Applied to all content before insertion.
     * @param {string} str
     * @returns {string}
     */
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /**
     * Computes the Longest Common Subsequence of two arrays.
     * Uses O(m*n) DP; only called within DIFF_WORD_LIMIT.
     * @param {string[]} a
     * @param {string[]} b
     * @returns {string[]}
     */
    function computeLCS(a, b) {
        var m = a.length;
        var n = b.length;
        var dp = [];
        var i, j;
        for (i = 0; i <= m; i++) {
            dp[i] = new Array(n + 1).fill(0);
        }
        for (i = 1; i <= m; i++) {
            for (j = 1; j <= n; j++) {
                if (a[i - 1] === b[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }
        var result = [];
        i = m;
        j = n;
        while (i > 0 && j > 0) {
            if (a[i - 1] === b[j - 1]) {
                result.unshift(a[i - 1]);
                i--;
                j--;
            } else if (dp[i - 1][j] > dp[i][j - 1]) {
                i--;
            } else {
                j--;
            }
        }
        return result;
    }

    /**
     * Renders a word-level diff of original vs revised as safe HTML.
     * Removed words are wrapped in <del>, added words in <ins>.
     * Falls back to a side-by-side view for very large texts.
     * @param {string} original
     * @param {string} revised
     * @returns {string} Safe HTML string.
     */
    ns.renderDiff = function renderDiff(original, revised) {
        if (original === revised) {
            return '<p class="ai-no-changes">No changes suggested.</p>';
        }

        // Split on whitespace, keeping separators
        var origTokens = original.split(/(\s+)/);
        var revTokens = revised.split(/(\s+)/);

        // Fall back for large documents
        var origWords = origTokens.filter(function (t) { return !/^\s+$/.test(t); });
        var revWords = revTokens.filter(function (t) { return !/^\s+$/.test(t); });
        if (origWords.length > DIFF_WORD_LIMIT || revWords.length > DIFF_WORD_LIMIT) {
            return (
                '<p class="ai-diff-fallback">Document is too large for inline diff. Showing proposed text:</p>' +
                '<div class="ai-diff-plain">' + escapeHtml(revised) + '</div>'
            );
        }

        var lcs = computeLCS(origTokens, revTokens);
        var html = '';
        var i = 0;
        var j = 0;
        var k = 0;

        while (i < origTokens.length || j < revTokens.length) {
            var inLCS = (
                k < lcs.length &&
                i < origTokens.length &&
                j < revTokens.length &&
                origTokens[i] === lcs[k] &&
                revTokens[j] === lcs[k]
            );

            if (inLCS) {
                html += escapeHtml(lcs[k]);
                i++;
                j++;
                k++;
            } else if (
                j < revTokens.length &&
                (k >= lcs.length || revTokens[j] !== lcs[k])
            ) {
                // Added token
                if (/^\s+$/.test(revTokens[j])) {
                    html += escapeHtml(revTokens[j]);
                } else {
                    html += '<ins class="diff-add">' + escapeHtml(revTokens[j]) + '</ins>';
                }
                j++;
            } else if (i < origTokens.length) {
                // Removed token
                if (/^\s+$/.test(origTokens[i])) {
                    html += escapeHtml(origTokens[i]);
                } else {
                    html += '<del class="diff-del">' + escapeHtml(origTokens[i]) + '</del>';
                }
                i++;
            } else {
                break;
            }
        }

        return html;
    };

    /**
     * Renders a list of annotation-style items as safe HTML.
     * Used for heading coaching and language linting results.
     * @param {Array<object>} items
     * @returns {string} Safe HTML string.
     */
    ns.renderAnnotationList = function renderAnnotationList(items) {
        if (!items || items.length === 0) {
            return '<p class="ai-no-issues">No issues found. Your content looks good!</p>';
        }

        return items.map(function (item, index) {
            var parts = [];
            if (item.original) {
                parts.push('<strong>Current:</strong> ' + escapeHtml(item.original));
            }
            if (item.suggested) {
                parts.push('<strong>Suggested:</strong> ' + escapeHtml(item.suggested));
            }
            if (item.location) {
                parts.push('<strong>Location:</strong> ' + escapeHtml(item.location));
            }
            if (item.issue) {
                parts.push('<strong>Issue:</strong> ' + escapeHtml(item.issue));
            }
            if (item.suggestion) {
                parts.push('<strong>Fix:</strong> ' + escapeHtml(item.suggestion));
            }
            if (item.reason) {
                parts.push('<strong>Why:</strong> ' + escapeHtml(item.reason));
            }
            return (
                '<div class="ai-annotation-item" id="ai-annotation-' + index + '">' +
                '<div class="ai-annotation-content">' + parts.join('<br>') + '</div>' +
                '<button type="button" class="ai-dismiss-item" data-index="' + index + '" aria-label="Dismiss this suggestion">Dismiss</button>' +
                '</div>'
            );
        }).join('');
    };
}());
