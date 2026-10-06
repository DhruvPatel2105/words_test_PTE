export type QuestionType =
  | 'listenType'
  | 'listenFill'
  | 'listenChoose'
  | 'fixSpelling'
  | 'chooseCorrect'
  | 'findWrong'
  | 'missingLetters'
  | 'unscramble'
  | 'rightOrWrong'
  | 'errorHunt'
  | 'whichFits'

export interface TypeInfo {
  id: QuestionType
  name: string
  instruction: string
  audio: boolean
}

export const TYPE_INFO: TypeInfo[] = [
  { id: 'listenType', name: 'Listen & Type', instruction: 'Listen to the word, then type it.', audio: true },
  { id: 'listenFill', name: 'Listen & Fill the Blank', instruction: 'Listen to the sentence, then type the missing word.', audio: true },
  { id: 'listenChoose', name: 'Listen & Choose', instruction: 'Listen to the word, then pick the correct spelling.', audio: true },
  { id: 'fixSpelling', name: 'Fix the Spelling', instruction: 'This word is spelled wrong. Type the correct spelling.', audio: false },
  { id: 'chooseCorrect', name: 'Choose the Correct Spelling', instruction: 'Only one of these spellings is correct. Tap it.', audio: false },
  { id: 'findWrong', name: 'Find the Wrong One', instruction: 'One of these words is misspelled. Tap it.', audio: false },
  { id: 'missingLetters', name: 'Missing Letters', instruction: 'Some letters are hidden. Type the full word.', audio: false },
  { id: 'unscramble', name: 'Unscramble', instruction: 'Put the letters in the right order and type the word.', audio: false },
  { id: 'rightOrWrong', name: 'Right or Wrong?', instruction: 'Is this word spelled correctly?', audio: false },
  { id: 'errorHunt', name: 'Error Hunt', instruction: 'Tap every misspelled word, then press Submit.', audio: false },
  { id: 'whichFits', name: 'Which Word Fits?', instruction: 'Listen to the sentence and choose the word that fits the blank.', audio: true },
]

export const ALL_TYPES: QuestionType[] = TYPE_INFO.map((t) => t.id)
export const typeInfo = (id: QuestionType): TypeInfo => TYPE_INFO.find((t) => t.id === id)!

export interface HuntItem {
  text: string
  word: string
  wrong: boolean
}

export interface Question {
  id: string
  type: QuestionType
  /** The word this question is mainly about (progress is saved against it). */
  word: string
  /** Every list word used in this question (for the "no repeats in a session" rule). */
  words: string[]
  input: 'type' | 'choice' | 'hunt'
  /** Text to speak for audio questions. */
  audioText?: string
  /** A sentence with the target replaced by a blank. */
  sentenceBlank?: string
  /** A word, mask or scramble shown to the student. */
  display?: string
  options?: string[]
  hunt?: HuntItem[]
  /** Choice questions: the option that is correct. */
  correct?: string
}

export type Answer = string | string[] | null

export interface Evaluation {
  correct: boolean
  skipped: boolean
  /** What the student answered, as text. */
  given: string
  /** The correct (main) spelling. */
  expected: string
  /** One line of extra explanation. */
  note?: string
  /** Strings to compare letter by letter (given vs expected). */
  compare?: { given: string; expected: string }
  /** Error Hunt: misspelled words the student did not tap. */
  missed?: HuntItem[]
  /** Error Hunt: correctly spelled words the student tapped by mistake. */
  falseFlags?: HuntItem[]
}

export type Mode = 'quick' | 'mock' | 'custom' | 'mistakes' | 'retry'

export interface SessionConfig {
  mode: Mode
  types: QuestionType[]
  count: number | 'all'
  /** Words the session may test. */
  pool: string[]
  feedback: boolean
  timeLimitSec?: number
  audioOnce: boolean
  audioAvailable: boolean
}

export interface AnswerRecord {
  question: Question
  evaluation: Evaluation
  /** False when the mock test timer ran out before the question was answered. */
  answered: boolean
}
