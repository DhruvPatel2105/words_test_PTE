import { describe, expect, it } from 'vitest'
import { ALTERNATES, WORDS } from '../data/words'
import { MISSPELLINGS } from '../data/misspellings'
import { EXTRA_WORDS, canMake, evaluate, makeQuestion, maskWord, scrambleWord } from './generators'
import { buildSession } from './session'
import { ALL_TYPES, type QuestionType, type SessionConfig } from './types'
import { shuffle } from '../lib/rng'

/** A picker over a fixed list of unused words, like the session builder provides. */
const pickerFor = (own: string) => (n: number) => shuffle(WORDS.filter((w) => w !== own)).slice(0, n)

const config = (over: Partial<SessionConfig> = {}): SessionConfig => ({
  mode: 'custom',
  types: ALL_TYPES,
  count: 20,
  pool: WORDS,
  feedback: true,
  audioOnce: false,
  audioAvailable: true,
  ...over,
})

describe('generators (every word, every type)', () => {
  for (const type of ALL_TYPES) {
    it(`${type}: valid question for all eligible words`, () => {
      for (const word of WORDS) {
        if (!canMake(type, word)) continue
        for (let run = 0; run < 3; run++) {
          const q = makeQuestion(type, word, pickerFor(word))
          expect(q.word).toBe(word)
          expect(q.words[0]).toBe(word)
          if (q.options) {
            expect(new Set(q.options).size).toBe(q.options.length)
            expect(q.options).toContain(q.correct)
          }
          if (type === 'listenChoose' || type === 'chooseCorrect') {
            expect(q.options).toHaveLength(4)
            expect(q.correct).toBe(word)
            expect(q.options!.filter((o) => o === word)).toHaveLength(1)
          }
        }
      }
    })
  }

  it('Find the Wrong One: 4 different words, exactly one misspelled', () => {
    for (const word of WORDS) {
      const q = makeQuestion('findWrong', word, pickerFor(word))
      expect(q.options).toHaveLength(4)
      expect(new Set(q.words).size).toBe(4)
      const misspelled = q.options!.filter((o) => !WORDS.includes(o))
      expect(misspelled).toHaveLength(1)
      expect(misspelled[0]).toBe(q.correct)
      expect(MISSPELLINGS[word]).toContain(q.correct)
    }
  })

  it('Error Hunt: 8 words, 2-4 misspelled, the main word is one of the misspelled', () => {
    for (let i = 0; i < 100; i++) {
      const word = WORDS[i % WORDS.length]
      const q = makeQuestion('errorHunt', word, pickerFor(word))
      expect(q.hunt).toHaveLength(8)
      const wrong = q.hunt!.filter((h) => h.wrong)
      expect(wrong.length).toBeGreaterThanOrEqual(2)
      expect(wrong.length).toBeLessThanOrEqual(4)
      expect(wrong.some((h) => h.word === word)).toBe(true)
      expect(new Set(q.hunt!.map((h) => h.text)).size).toBe(8)
      for (const h of q.hunt!) expect(WORDS.includes(h.text)).toBe(!h.wrong)
    }
  })

  it('Right or Wrong: shows a correct or misspelled word; roughly 50/50', () => {
    let correct = 0
    for (let i = 0; i < 400; i++) {
      const q = makeQuestion('rightOrWrong', WORDS[i % WORDS.length], pickerFor(WORDS[0]))
      const isRight = q.display === q.word
      expect(q.correct).toBe(isRight ? 'Correct' : 'Incorrect')
      if (isRight) correct++
    }
    expect(correct).toBeGreaterThan(140)
    expect(correct).toBeLessThan(260)
  })

  it('Unscramble never equals the word and keeps the same letters', () => {
    for (const word of WORDS) {
      if (!canMake('unscramble', word)) continue
      for (let i = 0; i < 5; i++) {
        const s = scrambleWord(word)
        expect(s).not.toBe(word)
        expect([...s].sort().join('')).toBe([...word].sort().join(''))
      }
    }
    expect(canMake('unscramble', 'real estate')).toBe(false)
    expect(canMake('unscramble', 'twenty-six')).toBe(false)
  })

  it('Missing Letters never hides the first letter and hides 2 / 3-4 letters', () => {
    for (const word of WORDS) {
      for (let i = 0; i < 5; i++) {
        const m = maskWord(word)
        expect(m).toHaveLength(word.length)
        expect(m[0]).toBe(word[0])
        const hidden = [...m].filter((c) => c === '_').length
        const letters = [...word].filter((c) => /[a-z]/.test(c)).length
        if (letters <= 6) expect(hidden).toBe(2)
        else if (letters <= 9) expect(hidden).toBe(3)
        else expect(hidden).toBe(4)
      }
    }
  })

  it('Which Word Fits? options are the group words and include the answer', () => {
    const q = makeQuestion('whichFits', 'career', pickerFor('career'))
    expect([...q.options!].sort()).toEqual(['career', 'carrier'])
    expect(q.sentenceBlank).toContain('_____')
    expect(q.sentenceBlank).not.toMatch(/career/i)
    const q3 = makeQuestion('whichFits', 'professional', pickerFor('professional'))
    expect(q3.options).toHaveLength(3)
  })

  it('Listen & Fill the Blank hides the word in the shown sentence but speaks the full sentence', () => {
    const q = makeQuestion('listenFill', 'recommended', pickerFor('recommended'))
    expect(q.sentenceBlank).toContain('_____')
    expect(q.sentenceBlank).not.toMatch(/recommended/i)
    expect(q.audioText).toMatch(/recommended/)
  })
})

describe('evaluate', () => {
  it('typed answers: exact, case/space tolerant, alternates', () => {
    const q = makeQuestion('listenType', 'color', pickerFor('color'))
    expect(evaluate(q, ' COLOR ').correct).toBe(true)
    expect(evaluate(q, 'colour').correct).toBe(true)
    expect(evaluate(q, 'colur').correct).toBe(false)
    expect(evaluate(q, 'colur').expected).toBe('color')
    expect(evaluate(q, null).skipped).toBe(true)
  })
  it('real estate / twenty-six alternates', () => {
    expect(evaluate(makeQuestion('listenType', 'real estate', pickerFor('x')), 'real-estate').correct).toBe(true)
    expect(evaluate(makeQuestion('listenType', 'twenty-six', pickerFor('x')), 'twenty six').correct).toBe(true)
  })
  it('choice answers', () => {
    const q = makeQuestion('chooseCorrect', 'ability', pickerFor('ability'))
    expect(evaluate(q, 'ability').correct).toBe(true)
    expect(evaluate(q, q.options!.find((o) => o !== 'ability')!).correct).toBe(false)
    expect(evaluate(q, null).correct).toBe(false)
  })
  it('Error Hunt is all-or-nothing and reports misses', () => {
    const q = makeQuestion('errorHunt', 'ability', pickerFor('ability'))
    const wrongTexts = q.hunt!.filter((h) => h.wrong).map((h) => h.text)
    expect(evaluate(q, wrongTexts).correct).toBe(true)
    const partial = evaluate(q, wrongTexts.slice(1))
    expect(partial.correct).toBe(false)
    expect(partial.missed).toHaveLength(1)
    const extra = evaluate(q, [...wrongTexts, q.hunt!.find((h) => !h.wrong)!.text])
    expect(extra.correct).toBe(false)
    expect(extra.falseFlags).toHaveLength(1)
  })
  it('Right or Wrong feedback always includes the right spelling', () => {
    for (let i = 0; i < 20; i++) {
      const q = makeQuestion('rightOrWrong', 'ability', pickerFor('ability'))
      expect(evaluate(q, 'Correct').expected).toBe('ability')
    }
  })
})

describe('buildSession', () => {
  it('no word repeats in a session, with every shown word counted', () => {
    for (let run = 0; run < 30; run++) {
      const qs = buildSession(config({ count: 30 }))
      expect(qs).toHaveLength(30)
      const all = qs.flatMap((q) => q.words)
      expect(new Set(all).size).toBe(all.length)
      expect(new Set(qs.map((q) => q.word)).size).toBe(qs.length)
    }
  })

  it('mixes types evenly', () => {
    const qs = buildSession(config({ count: 22 }))
    const counts = new Map<QuestionType, number>()
    qs.forEach((q) => counts.set(q.type, (counts.get(q.type) ?? 0) + 1))
    expect(counts.size).toBe(11)
    for (const n of counts.values()) expect(n).toBe(2)
  })

  it('excludes audio types when no audio is available', () => {
    const qs = buildSession(config({ audioAvailable: false, count: 30 }))
    expect(qs.some((q) => ['listenType', 'listenFill', 'listenChoose', 'whichFits'].includes(q.type))).toBe(false)
    expect(qs).toHaveLength(30)
  })

  it('only tests words from the pool (My Mistakes) and handles a tiny pool', () => {
    const pool = ['ability', 'color', 'unique']
    const qs = buildSession(config({ pool, count: 20 }))
    expect(qs).toHaveLength(3)
    for (const q of qs) expect(pool).toContain(q.word)
  })

  it('respects the selected types and the "All" count', () => {
    const qs = buildSession(config({ types: ['fixSpelling', 'listenType'], count: 'all' }))
    expect(qs).toHaveLength(218)
    expect(new Set(qs.map((q) => q.word)).size).toBe(218)
    expect(qs.every((q) => q.type === 'fixSpelling' || q.type === 'listenType')).toBe(true)
  })

  it('"All" with every type never repeats a word', () => {
    const qs = buildSession(config({ count: 'all' }))
    const all = qs.flatMap((q) => q.words)
    expect(new Set(all).size).toBe(all.length)
    expect(qs.length).toBeGreaterThan(100)
  })

  it('extra words needed by multi-word types are declared', () => {
    expect(EXTRA_WORDS.findWrong).toBe(3)
    expect(EXTRA_WORDS.errorHunt).toBe(7)
    expect(Object.keys(ALTERNATES).length).toBe(5)
  })
})
