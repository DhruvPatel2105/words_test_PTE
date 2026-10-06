import { describe, expect, it } from 'vitest'
import { checkAnswer, normalize } from './check'
import { diffLetters } from './diff'

describe('checkAnswer', () => {
  it('ignores case and surrounding spaces', () => {
    expect(checkAnswer('  Recommended ', 'recommended')).toBe(true)
    expect(checkAnswer('RECOMMENDED', 'recommended')).toBe(true)
  })
  it('collapses multiple spaces', () => {
    expect(checkAnswer('real    estate', 'real estate')).toBe(true)
    expect(normalize('  a   b  ')).toBe('a b')
  })
  it('is exact otherwise: one wrong letter is wrong', () => {
    expect(checkAnswer('recomended', 'recommended')).toBe(false)
    expect(checkAnswer('recommendedd', 'recommended')).toBe(false)
    expect(checkAnswer('', 'recommended')).toBe(false)
    expect(checkAnswer('   ', 'recommended')).toBe(false)
  })
  it('accepts the alternate spellings', () => {
    expect(checkAnswer('colour', 'color')).toBe(true)
    expect(checkAnswer('Favourite', 'favorite')).toBe(true)
    expect(checkAnswer('travelling', 'traveling')).toBe(true)
    expect(checkAnswer('real-estate', 'real estate')).toBe(true)
    expect(checkAnswer('twenty six', 'twenty-six')).toBe(true)
  })
  it('does not accept an alternate for the wrong word', () => {
    expect(checkAnswer('colour', 'favorite')).toBe(false)
  })
})

describe('diffLetters', () => {
  const kinds = (g: string, e: string) => diffLetters(g, e).map((p) => p.kind)
  it('marks everything as same for a perfect answer', () => {
    expect(kinds('cat', 'cat').every((k) => k === 'same')).toBe(true)
  })
  it('finds a missing letter', () => {
    const parts = diffLetters('recomended', 'recommended')
    expect(parts.filter((p) => p.kind === 'missing')).toHaveLength(1)
    expect(parts.filter((p) => p.kind !== 'same' && p.kind !== 'missing')).toHaveLength(0)
    expect(parts.map((p) => p.expected).join('')).toBe('recommended')
  })
  it('finds an extra letter', () => {
    const parts = diffLetters('benefitt', 'benefit')
    expect(parts.filter((p) => p.kind === 'extra')).toHaveLength(1)
    expect(parts.map((p) => p.given).join('')).toBe('benefitt')
  })
  it('finds a wrong letter', () => {
    const parts = diffLetters('acheived', 'achieved')
    expect(parts.some((p) => p.kind === 'wrong' || p.kind === 'missing' || p.kind === 'extra')).toBe(true)
    expect(parts.filter((p) => p.kind !== 'same').length).toBeLessThanOrEqual(2)
    const sub = diffLetters('cot', 'cat')
    expect(sub).toEqual([
      { kind: 'same', given: 'c', expected: 'c' },
      { kind: 'wrong', given: 'o', expected: 'a' },
      { kind: 'same', given: 't', expected: 't' },
    ])
  })
  it('handles empty answers and ignores case', () => {
    expect(kinds('', 'cat')).toEqual(['missing', 'missing', 'missing'])
    expect(kinds('CAT', 'cat').every((k) => k === 'same')).toBe(true)
  })
  it('always reconstructs both strings', () => {
    const parts = diffLetters('transisioning', 'transitioning')
    expect(parts.map((p) => p.given ?? '').join('')).toBe('transisioning')
    expect(parts.map((p) => p.expected ?? '').join('')).toBe('transitioning')
  })
})
