const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Case-insensitive whole-word regex (letters on either side do not count as a boundary). */
export function wholeWordRegex(word: string, flags = 'gi'): RegExp {
  return new RegExp(`(?<![A-Za-z])${escapeRe(word)}(?![A-Za-z])`, flags)
}

export function countWholeWord(text: string, word: string): number {
  return (text.match(wholeWordRegex(word)) ?? []).length
}

/** Replace the (single) whole-word occurrence of `word` in `sentence` with a blank. */
export function blankOut(sentence: string, word: string, blank = '_____'): string {
  return sentence.replace(wholeWordRegex(word), blank)
}
