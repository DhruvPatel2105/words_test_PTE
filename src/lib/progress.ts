import type { Mode, QuestionType } from '../quiz/types'

export interface WordStat {
  seen: number
  correct: number
  last: boolean | null
  /** Correct answers in a row since the last mistake. */
  streak: number
}

export interface TestRecord {
  id: string
  date: string
  mode: Mode
  score: number
  total: number
  percent: number
  seconds: number
  byType?: Partial<Record<QuestionType, { correct: number; total: number }>>
}

export interface Settings {
  voiceURI: string | null
  rate: number
  dark: boolean
}

export interface Store {
  words: Record<string, WordStat>
  mistakes: string[]
  history: TestRecord[]
  settings: Settings
}

export const MAX_HISTORY = 50
/** Correct answers in a row needed to leave My Mistakes. */
export const STREAK_TO_CLEAR = 2

export function defaultStore(dark = false): Store {
  return { words: {}, mistakes: [], history: [], settings: { voiceURI: null, rate: 1, dark } }
}

/** Save the result of one word: seen/correct counts, last result, and My Mistakes. */
export function recordResult(store: Store, word: string, correct: boolean): Store {
  const prev = store.words[word] ?? { seen: 0, correct: 0, last: null, streak: 0 }
  const stat: WordStat = {
    seen: prev.seen + 1,
    correct: prev.correct + (correct ? 1 : 0),
    last: correct,
    streak: correct ? prev.streak + 1 : 0,
  }
  let mistakes = store.mistakes
  if (!correct) {
    if (!mistakes.includes(word)) mistakes = [...mistakes, word]
  } else if (stat.streak >= STREAK_TO_CLEAR && mistakes.includes(word)) {
    mistakes = mistakes.filter((w) => w !== word)
  }
  return { ...store, words: { ...store.words, [word]: stat }, mistakes }
}

export function addHistory(store: Store, record: TestRecord): Store {
  return { ...store, history: [record, ...store.history].slice(0, MAX_HISTORY) }
}

export function accuracy(stat: WordStat | undefined): number | null {
  return stat && stat.seen > 0 ? Math.round((stat.correct / stat.seen) * 100) : null
}

export function totals(store: Store): { answered: number; correct: number; percent: number | null } {
  let answered = 0
  let correct = 0
  for (const s of Object.values(store.words)) {
    answered += s.seen
    correct += s.correct
  }
  return { answered, correct, percent: answered ? Math.round((correct / answered) * 100) : null }
}

/** Words with the lowest accuracy (at least one wrong answer), worst first. */
export function weakestWords(store: Store, limit = 10): { word: string; percent: number; seen: number }[] {
  return Object.entries(store.words)
    .filter(([, s]) => s.seen > 0 && s.correct < s.seen)
    .map(([word, s]) => ({ word, percent: Math.round((s.correct / s.seen) * 100), seen: s.seen }))
    .sort((a, b) => a.percent - b.percent || b.seen - a.seen || a.word.localeCompare(b.word))
    .slice(0, limit)
}
