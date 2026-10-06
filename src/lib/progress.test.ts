import { describe, expect, it } from 'vitest'
import { addHistory, defaultStore, recordResult, totals, weakestWords } from './progress'

describe('progress', () => {
  it('a wrong answer adds the word to My Mistakes', () => {
    const s = recordResult(defaultStore(), 'ability', false)
    expect(s.mistakes).toEqual(['ability'])
    expect(s.words.ability).toMatchObject({ seen: 1, correct: 0, last: false, streak: 0 })
  })
  it('two correct answers in a row remove it; one does not', () => {
    let s = recordResult(defaultStore(), 'ability', false)
    s = recordResult(s, 'ability', true)
    expect(s.mistakes).toEqual(['ability'])
    s = recordResult(s, 'ability', true)
    expect(s.mistakes).toEqual([])
  })
  it('a wrong answer resets the streak', () => {
    let s = recordResult(defaultStore(), 'ability', false)
    s = recordResult(s, 'ability', true)
    s = recordResult(s, 'ability', false)
    s = recordResult(s, 'ability', true)
    expect(s.mistakes).toEqual(['ability'])
  })
  it('correct first-time answers never enter My Mistakes', () => {
    expect(recordResult(defaultStore(), 'ability', true).mistakes).toEqual([])
  })
  it('keeps only the last 50 tests', () => {
    let s = defaultStore()
    for (let i = 0; i < 60; i++) s = addHistory(s, { id: String(i), date: '', mode: 'quick', score: 1, total: 2, percent: 50, seconds: 1 })
    expect(s.history).toHaveLength(50)
    expect(s.history[0].id).toBe('59')
  })
  it('totals and weakest words', () => {
    let s = defaultStore()
    s = recordResult(s, 'a', true)
    s = recordResult(s, 'b', false)
    s = recordResult(s, 'b', false)
    expect(totals(s)).toEqual({ answered: 3, correct: 1, percent: 33 })
    expect(weakestWords(s)[0].word).toBe('b')
  })
})

import { buildMessage } from './results'
describe('results message', () => {
  it('uses the right band', () => {
    expect(buildMessage(90).text).toBe('Excellent!')
    expect(buildMessage(89).text).toBe('Good')
    expect(buildMessage(70).text).toBe('Good')
    expect(buildMessage(69).text).toBe('Keep practising')
  })
})
