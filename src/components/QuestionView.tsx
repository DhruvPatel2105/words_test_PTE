import { useEffect, useRef, useState, type FormEvent } from 'react'
import AudioControl from './AudioControl'
import type { Answer, Evaluation, Question } from '../quiz/types'
import { typeInfo } from '../quiz/types'

interface Props {
  question: Question
  /** After answering with feedback on: inputs are read-only and the result is highlighted. */
  evaluation: Evaluation | null
  audioOnce: boolean
  onSubmit: (answer: Answer) => void
  onSkip: () => void
}

const optionBase =
  'min-h-[56px] w-full rounded-xl border-2 px-4 py-3 text-left text-lg font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/60 disabled:cursor-default'

function BlankSentence({ text }: { text: string }) {
  const parts = text.split('_____')
  return (
    <p className="rounded-xl bg-slate-100 p-4 text-lg leading-relaxed dark:bg-slate-900">
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && (
            <span className="mx-1 inline-block min-w-[5rem] border-b-4 border-brand-600 align-baseline" role="img" aria-label="blank">
              &nbsp;
            </span>
          )}
        </span>
      ))}
    </p>
  )
}

export default function QuestionView({ question: q, evaluation, audioOnce, onSubmit, onSkip }: Props) {
  const info = typeInfo(q.type)
  const locked = evaluation !== null
  const [text, setText] = useState('')
  const [chosen, setChosen] = useState<string | null>(null)
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // On desktop focus the box straight away; on phones leave it so the keyboard does not hide the Play button.
    if (q.input === 'type' && window.matchMedia('(pointer: fine)').matches) inputRef.current?.focus()
  }, [q.id, q.input])

  const submitText = (e: FormEvent) => {
    e.preventDefault()
    if (locked || text.trim() === '') return
    onSubmit(text)
  }

  const choose = (option: string) => {
    if (locked) return
    setChosen(option)
    onSubmit(option)
  }

  const optionClass = (option: string) => {
    if (!locked) return `${optionBase} border-slate-300 bg-white hover:border-brand-600 hover:bg-brand-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700`
    if (option === q.correct) return `${optionBase} border-green-600 bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-100`
    if (option === chosen) return `${optionBase} border-red-600 bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100`
    return `${optionBase} border-slate-200 bg-white opacity-60 dark:border-slate-700 dark:bg-slate-800`
  }

  const options = (cols: string) => (
    <div className={`grid gap-3 ${cols}`} role="group" aria-label="Answer choices">
      {q.options!.map((o) => (
        <button key={o} type="button" className={optionClass(o)} onClick={() => choose(o)} disabled={locked}>
          {o}
          {locked && o === q.correct && <span aria-label="correct answer"> ✅</span>}
          {locked && o === chosen && o !== q.correct && <span aria-label="your answer, wrong"> ❌</span>}
        </button>
      ))}
    </div>
  )

  return (
    <section className="card space-y-5" aria-labelledby={`qt-${q.id}`}>
      <div>
        <h2 id={`qt-${q.id}`} className="text-lg font-extrabold text-brand-700 dark:text-brand-100">
          {info.audio && <span aria-hidden="true">🔊 </span>}
          {info.name}
        </h2>
        <p className="text-slate-600 dark:text-slate-300">{info.instruction}</p>
      </div>

      {info.audio && <AudioControl questionId={q.id} text={q.audioText!} once={audioOnce} autoPlay={!locked} />}

      {q.sentenceBlank && <BlankSentence text={q.sentenceBlank} />}

      {q.type === 'fixSpelling' && <p className="text-center text-3xl font-extrabold tracking-wide" aria-label={`Misspelled word: ${q.display}`}>{q.display}</p>}

      {q.type === 'missingLetters' && (
        <p className="break-all text-center font-mono text-3xl font-extrabold tracking-[0.2em]" aria-label={`Word with missing letters: ${q.display!.replace(/_/g, ' blank ')}`}>
          {q.display}
        </p>
      )}

      {q.type === 'unscramble' && (
        <p className="text-center font-mono text-3xl font-extrabold uppercase tracking-[0.25em]" aria-label={`Scrambled letters: ${[...q.display!].join(' ')}`}>
          {q.display}
        </p>
      )}

      {q.type === 'rightOrWrong' && <p className="text-center text-3xl font-extrabold tracking-wide">{q.display}</p>}

      {q.input === 'type' && (
        <form onSubmit={submitText} className="space-y-3">
          <label htmlFor={`ans-${q.id}`} className="block text-sm font-semibold text-slate-600 dark:text-slate-300">
            Your answer
          </label>
          <input
            ref={inputRef}
            id={`ans-${q.id}`}
            className="input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            readOnly={locked}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="done"
            placeholder="Type here"
          />
          {!locked && (
            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary flex-1" disabled={text.trim() === ''}>Submit</button>
              <button type="button" className="btn btn-secondary" onClick={onSkip}>Skip</button>
            </div>
          )}
        </form>
      )}

      {q.input === 'choice' && q.type === 'rightOrWrong' && options('grid-cols-2')}
      {q.input === 'choice' && q.type !== 'rightOrWrong' && options(q.options!.length > 3 ? 'sm:grid-cols-2' : '')}

      {q.input === 'hunt' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3" role="group" aria-label="Words. Tap the misspelled ones.">
            {q.hunt!.map((item) => {
              const on = flagged.has(item.text)
              let cls = on ? 'border-brand-600 bg-brand-100 text-brand-700 dark:bg-brand-700/40 dark:text-white' : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'
              if (locked) {
                if (item.wrong) cls = on ? 'border-green-600 bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-100' : 'border-amber-500 bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100'
                else if (on) cls = 'border-red-600 bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100'
                else cls = 'border-slate-200 opacity-60 dark:border-slate-700'
              }
              return (
                <button
                  key={item.text}
                  type="button"
                  aria-pressed={on}
                  disabled={locked}
                  className={`${optionBase} text-center ${cls}`}
                  onClick={() =>
                    setFlagged((prev) => {
                      const next = new Set(prev)
                      if (next.has(item.text)) next.delete(item.text)
                      else next.add(item.text)
                      return next
                    })
                  }
                >
                  {item.text}
                  {on && !locked && <span aria-hidden="true"> ✓</span>}
                  {locked && item.wrong && <span aria-label="misspelled"> ✗</span>}
                </button>
              )
            })}
          </div>
          {!locked && (
            <div className="flex gap-3">
              <button type="button" className="btn btn-primary flex-1" onClick={() => onSubmit([...flagged])}>
                Submit ({flagged.size} selected)
              </button>
              <button type="button" className="btn btn-secondary" onClick={onSkip}>Skip</button>
            </div>
          )}
        </div>
      )}

      {q.input === 'choice' && !locked && (
        <div className="text-center">
          <button type="button" className="btn btn-ghost" onClick={onSkip}>Skip this question</button>
        </div>
      )}
    </section>
  )
}
