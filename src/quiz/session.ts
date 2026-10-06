import { WORDS } from '../data/words'
import { type Rng, shuffle } from '../lib/rng'
import { EXTRA_WORDS, canMake, makeQuestion } from './generators'
import { ALL_TYPES, TYPE_INFO, type Question, type QuestionType, type SessionConfig } from './types'

/**
 * Build the questions for a session.
 *  - no word repeats (every word shown in any question is used once)
 *  - question types are mixed evenly
 *  - audio types are dropped when no audio is available
 */
export function buildSession(config: SessionConfig, rnd: Rng = Math.random): Question[] {
  const audioOk = (t: QuestionType) => config.audioAvailable || !TYPE_INFO.find((i) => i.id === t)!.audio
  let types = config.types.filter(audioOk)
  if (types.length === 0) types = ALL_TYPES.filter(audioOk)
  // Drop types no pool word can be used for (e.g. Which Word Fits? with a tiny pool)
  const feasible = types.filter((t) => config.pool.some((w) => canMake(t, w)))
  types = feasible.length > 0 ? feasible : types

  const pool = shuffle([...new Set(config.pool)], rnd)
  const target = config.count === 'all' ? pool.length : Math.min(config.count, pool.length)

  const used = new Set<string>()
  const remainingPool = () => pool.filter((w) => !used.has(w))

  const extraPicker = (own: string) => (n: number): string[] => {
    const free = WORDS.filter((w) => !used.has(w) && w !== own)
    const poolLeft = new Set(remainingPool())
    // Prefer words outside the remaining pool so the pool is not used up by distractors.
    const preferred = shuffle(free.filter((w) => !poolLeft.has(w)), rnd)
    const chosen = [...preferred, ...shuffle(free.filter((w) => poolLeft.has(w)), rnd)].slice(0, n)
    if (chosen.length < n) throw new Error('not enough unused words')
    return chosen
  }
  const unusedWords = () => WORDS.filter((w) => !used.has(w)).length

  // Evenly spread the types, then shuffle the order.
  const rotation = shuffle(types, rnd)
  const sequence = shuffle(Array.from({ length: target }, (_, i) => rotation[i % rotation.length]), rnd)

  const questions: Question[] = []
  for (const wanted of sequence) {
    const candidates = [wanted, ...rotation.filter((t) => t !== wanted)]
    let built = false
    for (const type of candidates) {
      const needed = EXTRA_WORDS[type] ?? 0
      if (needed > 0 && unusedWords() < needed + 1) continue
      const word = remainingPool().find((w) => canMake(type, w))
      if (!word) continue
      used.add(word)
      let q: Question
      try {
        q = makeQuestion(type, word, extraPicker(word), rnd)
      } catch {
        used.delete(word)
        continue
      }
      q.words.forEach((w) => used.add(w))
      questions.push(q)
      built = true
      break
    }
    if (!built) break
  }
  return questions
}
