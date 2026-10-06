import { acceptedSpellings } from '../data/words'

/** Trim, ignore case, collapse repeated spaces. Nothing else is forgiven. */
export function normalize(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** True when `input` matches the main spelling of `word` or one of its accepted alternates. */
export function checkAnswer(input: string, word: string): boolean {
  const n = normalize(input)
  if (!n) return false
  return acceptedSpellings(word).some((a) => normalize(a) === n)
}
