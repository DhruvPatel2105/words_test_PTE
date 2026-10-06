import { MISSPELLINGS } from '../data/misspellings'
import { SENTENCES } from '../data/sentences'
import { CONFUSABLES } from '../data/confusables'
import { blankOut } from '../lib/text'
import { checkAnswer } from '../lib/check'
import { type Rng, pick, randInt, sample, shuffle } from '../lib/rng'
import type { Answer, Evaluation, HuntItem, Question, QuestionType } from './types'

/** Returns n unused list words (other than the question's own word) and marks them used. */
export type ExtraPicker = (n: number) => string[]

const SPACE_OR_HYPHEN = /[\s-]/

/** Number of extra words a type needs besides its main word. */
export const EXTRA_WORDS: Partial<Record<QuestionType, number>> = { findWrong: 3, errorHunt: 7 }

function groupFor(word: string) {
  return CONFUSABLES.find((g) => word in g.sentences)
}

/** Can this question type be built for this word? */
export function canMake(type: QuestionType, word: string): boolean {
  switch (type) {
    case 'unscramble':
      return !SPACE_OR_HYPHEN.test(word)
    case 'whichFits':
      return groupFor(word) !== undefined
    default:
      return true
  }
}

export const misspell = (word: string, rnd: Rng): string => pick(MISSPELLINGS[word], rnd)

/** Hide letters: 2 for short words, 3-4 for long words; never the first letter. */
export function maskWord(word: string, rnd: Rng = Math.random): string {
  const chars = [...word]
  const eligible = chars.map((c, i) => (i > 0 && /[a-z]/i.test(c) ? i : -1)).filter((i) => i >= 0)
  const letters = chars.filter((c) => /[a-z]/i.test(c)).length
  const want = letters <= 6 ? 2 : letters <= 9 ? 3 : 4
  const count = Math.min(want, eligible.length)
  let chosen: number[] = []
  for (let attempt = 0; attempt < 30; attempt++) {
    chosen = sample(eligible, count, rnd)
    const sorted = [...chosen].sort((a, b) => a - b)
    if (sorted.every((v, i) => i === 0 || v - sorted[i - 1] > 1)) break // prefer non-adjacent gaps
  }
  return chars.map((c, i) => (chosen.includes(i) ? '_' : c)).join('')
}

/** Shuffle the letters so the result is never the original word. */
export function scrambleWord(word: string, rnd: Rng = Math.random): string {
  const letters = [...word]
  for (let attempt = 0; attempt < 50; attempt++) {
    const s = shuffle(letters, rnd).join('')
    if (s !== word) return s
  }
  return [...letters.slice(1), letters[0]].join('') // deterministic fallback (rotate)
}

let counter = 0
const nextId = () => `q${++counter}`

export function makeQuestion(type: QuestionType, word: string, extra: ExtraPicker, rnd: Rng = Math.random): Question {
  const base = { id: nextId(), type, word, words: [word] }
  switch (type) {
    case 'listenType':
      return { ...base, input: 'type', audioText: word }

    case 'listenFill': {
      const sentence = SENTENCES[word]
      return { ...base, input: 'type', audioText: sentence, sentenceBlank: blankOut(sentence, word) }
    }

    case 'listenChoose':
      return { ...base, input: 'choice', audioText: word, options: spellingOptions(word, rnd), correct: word }

    case 'fixSpelling':
      return { ...base, input: 'type', display: misspell(word, rnd) }

    case 'chooseCorrect':
      return { ...base, input: 'choice', options: spellingOptions(word, rnd), correct: word }

    case 'findWrong': {
      const wrong = misspell(word, rnd)
      const others = extra(3)
      return {
        ...base,
        words: [word, ...others],
        input: 'choice',
        options: shuffle([wrong, ...others], rnd),
        correct: wrong,
      }
    }

    case 'missingLetters':
      return { ...base, input: 'type', display: maskWord(word, rnd) }

    case 'unscramble':
      return {
        ...base,
        input: 'type',
        display: scrambleWord(word, rnd),
        sentenceBlank: blankOut(SENTENCES[word], word),
      }

    case 'rightOrWrong': {
      const showCorrect = rnd() < 0.5
      return {
        ...base,
        input: 'choice',
        display: showCorrect ? word : misspell(word, rnd),
        options: ['Correct', 'Incorrect'],
        correct: showCorrect ? 'Correct' : 'Incorrect',
      }
    }

    case 'errorHunt': {
      const others = extra(7)
      const wrongCount = randInt(2, 4, rnd)
      const wrongOthers = new Set(sample(others, wrongCount - 1, rnd))
      const items: HuntItem[] = [
        { text: misspell(word, rnd), word, wrong: true },
        ...others.map((w) => {
          const wrong = wrongOthers.has(w)
          return { text: wrong ? misspell(w, rnd) : w, word: w, wrong }
        }),
      ]
      return { ...base, words: [word, ...others], input: 'hunt', hunt: shuffle(items, rnd) }
    }

    case 'whichFits': {
      const group = groupFor(word)!
      const sentence = group.sentences[word]
      return {
        ...base,
        input: 'choice',
        audioText: sentence,
        sentenceBlank: blankOut(sentence, word),
        options: shuffle(Object.keys(group.sentences), rnd),
        correct: word,
      }
    }
  }
}

/** 1 correct spelling + 3 misspellings, all different. */
function spellingOptions(word: string, rnd: Rng): string[] {
  const wrong = sample(MISSPELLINGS[word], 3, rnd)
  return shuffle([word, ...wrong], rnd)
}

const huntNote = 'Tap all the misspelled words.'

export function evaluate(q: Question, answer: Answer): Evaluation {
  const skipped = answer === null || (Array.isArray(answer) ? false : answer.trim() === '' && q.input !== 'hunt')
  const expected = q.word

  if (q.input === 'hunt') {
    const selected = new Set(Array.isArray(answer) ? answer : [])
    const items = q.hunt ?? []
    const missed = items.filter((i) => i.wrong && !selected.has(i.text))
    const falseFlags = items.filter((i) => !i.wrong && selected.has(i.text))
    const correct = answer !== null && missed.length === 0 && falseFlags.length === 0
    return {
      correct,
      skipped: answer === null,
      given: [...selected].join(', '),
      expected: items.filter((i) => i.wrong).map((i) => i.word).join(', '),
      note: correct ? undefined : huntNote,
      missed,
      falseFlags,
    }
  }

  if (skipped) return { correct: false, skipped: true, given: '', expected }

  const given = String(answer)

  if (q.input === 'type') {
    const correct = checkAnswer(given, q.word)
    return { correct, skipped: false, given, expected, compare: correct ? undefined : { given, expected } }
  }

  // Choice questions
  const correct = given === q.correct
  switch (q.type) {
    case 'findWrong':
      return {
        correct,
        skipped: false,
        given,
        expected,
        note: correct ? undefined : `The misspelled word was "${q.correct}".`,
        compare: { given: q.correct!, expected },
      }
    case 'rightOrWrong': {
      const shownCorrect = q.display === q.word
      return {
        correct,
        skipped: false,
        given,
        expected,
        note: shownCorrect ? `"${q.display}" is spelled correctly.` : `"${q.display}" is misspelled.`,
        compare: shownCorrect ? undefined : { given: q.display!, expected },
      }
    }
    case 'whichFits':
      return { correct, skipped: false, given, expected }
    default:
      return { correct, skipped: false, given, expected, compare: correct ? undefined : { given, expected } }
  }
}

