import { normalize } from './check'

export type DiffKind = 'same' | 'wrong' | 'missing' | 'extra'
export interface DiffPart {
  kind: DiffKind
  /** Character the student typed (absent for "missing"). */
  given?: string
  /** Character that should be there (absent for "extra"). */
  expected?: string
}

/**
 * Letter-by-letter comparison using edit-distance alignment.
 *  same    - letter is right
 *  wrong   - student typed a different letter in this place
 *  missing - student left out a letter
 *  extra   - student added a letter that should not be there
 */
export function diffLetters(given: string, expected: string): DiffPart[] {
  const a = [...normalize(given)]
  const b = [...normalize(expected)]
  const n = a.length
  const m = b.length
  const d: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = 0; i <= n; i++) d[i][0] = i
  for (let j = 0; j <= m; j++) d[0][j] = j
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const sub = d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      d[i][j] = Math.min(sub, d[i - 1][j] + 1, d[i][j - 1] + 1)
    }
  }
  const parts: DiffPart[] = []
  let i = n
  let j = m
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) {
      parts.push(
        a[i - 1] === b[j - 1]
          ? { kind: 'same', given: a[i - 1], expected: b[j - 1] }
          : { kind: 'wrong', given: a[i - 1], expected: b[j - 1] },
      )
      i--
      j--
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
      parts.push({ kind: 'extra', given: a[i - 1] })
      i--
    } else {
      parts.push({ kind: 'missing', expected: b[j - 1] })
      j--
    }
  }
  return parts.reverse()
}
