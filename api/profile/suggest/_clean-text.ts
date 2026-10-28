/** Longest text passed on to extraction; anything past this is cut and flagged. */
export const MAX_EXTRACTED_CHARS = 50_000;

/**
 * Tidies text pulled from a PDF or Word file so it reads like the original:
 * unified line endings, no invisible characters or ligatures, words rejoined
 * across line-break hyphens, page markers removed, and blank runs collapsed.
 * Column spacing is kept (as up to two spaces) because credit tables rely on it.
 */
export function cleanExtractedText(raw: string): string {
  return raw
    .normalize('NFKC')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u00a0\u2007\u202f]/g, ' ')
    .replace(/[\u00ad\u200b-\u200d\u2060\ufeff]/g, '')
    .replace(/[^\S\n\t ]/g, ' ')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/^\s*-- \d+ of \d+ --\s*$/gm, '')
    .replace(/([a-z])-\n([a-z])/g, '$1$2')
    .replace(/ {3,}/g, '  ')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
