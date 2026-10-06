import { describe, expect, it } from 'vitest'
import englishWords from 'an-array-of-english-words'
import { ALTERNATES, WORDS, acceptedSpellings } from './words'
import { MISSPELLINGS } from './misspellings'
import { SENTENCES } from './sentences'
import { CONFUSABLES } from './confusables'
import { countWholeWord } from '../lib/text'

const dictionary = new Set<string>(englishWords as string[])
const inList = new Set(WORDS.map((w) => w.toLowerCase()))
const alternates = new Set(Object.values(ALTERNATES).flat().map((w) => w.toLowerCase()))

describe('word list', () => {
  it('has exactly 218 unique words', () => {
    expect(WORDS).toHaveLength(218)
    expect(new Set(WORDS).size).toBe(218)
  })
  it('alternates belong to listed words and are not themselves listed', () => {
    for (const [w, alts] of Object.entries(ALTERNATES)) {
      expect(WORDS).toContain(w)
      for (const a of alts) expect(inList.has(a)).toBe(false)
    }
  })
})

describe('misspellings', () => {
  it('only exist for listed words, and every word has an entry', () => {
    expect(Object.keys(MISSPELLINGS).sort()).toEqual([...WORDS].sort())
  })
  for (const word of WORDS) {
    it(`"${word}" has 3+ unique, believable misspellings`, () => {
      const list = MISSPELLINGS[word] ?? []
      expect(new Set(list).size).toBe(list.length)
      expect(list.length).toBeGreaterThanOrEqual(3)
      const accepted = acceptedSpellings(word).map((s) => s.toLowerCase())
      for (const m of list) {
        const lower = m.toLowerCase()
        expect(accepted, `${m} equals an accepted spelling`).not.toContain(lower)
        expect(inList.has(lower), `${m} is in the word list`).toBe(false)
        expect(alternates.has(lower), `${m} is an alternate`).toBe(false)
        expect(dictionary.has(lower), `${m} is a real English word`).toBe(false)
      }
    })
  }
})

describe('sentences', () => {
  it('exist for every word and only for listed words', () => {
    expect(Object.keys(SENTENCES).sort()).toEqual([...WORDS].sort())
  })
  for (const word of WORDS) {
    it(`sentence for "${word}" contains it exactly once (10-18 words)`, () => {
      const s = SENTENCES[word] ?? ''
      expect(countWholeWord(s, word)).toBe(1)
      const n = s.trim().split(/\s+/).length
      expect(n).toBeGreaterThanOrEqual(10)
      expect(n).toBeLessThanOrEqual(18)
    })
  }
})

describe('confusables', () => {
  it('covers the required groups', () => {
    expect(CONFUSABLES).toHaveLength(19)
  })
  for (const group of CONFUSABLES) {
    it(`group ${group.id}: one sentence per word, each containing only its own word once`, () => {
      expect(group.id.split('/').sort()).toEqual(Object.keys(group.sentences).sort())
      for (const [word, sentence] of Object.entries(group.sentences)) {
        expect(countWholeWord(sentence, word)).toBe(1)
        for (const other of Object.keys(group.sentences)) {
          if (other !== word) expect(countWholeWord(sentence, other), `${other} in ${word} sentence`).toBe(0)
        }
      }
    })
  }
})
