/** Split Italian lyric line into clickable tokens (words + attached punctuation). */
export function tokenizeItalian(line: string): string[] {
  return line.split(/(\s+)/).filter((t) => t.length > 0);
}

export function normalizeWord(token: string): string {
  return token
    .replace(/^[«»"'„‚\[\(=]+/, '')
    .replace(/[»"'„‚\]\)=,;:!?…]+$/u, '')
    .replace(/\.$/, '');
}

export function isWhitespace(token: string): boolean {
  return /^\s+$/.test(token);
}

/** Non-whitespace word tokens only (for cloze wordIndex). */
export function wordTokens(line: string): string[] {
  return line.split(/\s+/).filter(Boolean);
}
