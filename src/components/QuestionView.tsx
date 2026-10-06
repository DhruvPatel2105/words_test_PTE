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
    <p className="rounded-xl bg-slate-100 p-4 text-lg leading-relaxed dark:bg-slate-900 md:p-6 md:text-2xl md:leading-relaxed">
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && (
            <span className="mx-1 inline-block min-w-[5rem] border-b-4 md:min-w-[7rem] border-brand-600 align-baseline" role="img" aria-label="blank">
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

  // Desktop shortcuts: 1-4 pick an option (1-8 flag words in Error Hunt), Enter submits Error Hunt.
  const answerRef = useRef({ choose, flagged, onSubmit })
  answerRef.current = { choose, flagged, onSubmit }
  useEffect(() => {
    if (locked) return
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return
      const t = e.target as HTMLElement | null
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
      if (q.input === 'choice' && /^[1-9]$/.test(e.key)) {
        const option = q.options![Number(e.key) - 1]
        if (option) {
          e.preventDefault()
          answerRef.current.choose(option)
        }
      } else if (q.input === 'hunt') {
        if (/^[1-8]$/.test(e.key)) {
          e.preventDefault()
          const item = q.hunt![Number(e.key) - 1]
          setFlagged((prev) => {
            const next = new Set(prev)
            if (next.has(item.text)) next.delete(item.text)
            else next.add(item.text)
            return next
          })
        } else if (e.key === 'Enter' && !(t && t.tagName === 'BUTTON')) {
          e.preventDefault()
          answerRef.current.onSubmit([...answerRef.current.flagged])
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [locked, q])

  const hint =
    q.input === 'type'
      ? 'Enter to submit · Enter again for the next question'
      : q.input === 'hunt'
        ? 'Keys 1–8 tap a word · Enter to submit'
        : `Keys 1–${q.options!.length} pick an answer${q.audioText ? ' · P plays the audio' : ''}`

  const optionClass = (option: string) => {
    if (!locked) return `${optionBase} border-slate-300 bg-white hover:border-brand-600 hover:bg-brand-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700`
    if (option === q.correct) return `${optionBase} border-green-600 bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-100`
    if (option === chosen) return `${optionBase} border-red-600 bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100`
    return `${optionBase} border-slate-200 bg-white opacity-60 dark:border-slate-700 dark:bg-slate-800`
  }

  const options = (cols: string) => (
    <div className={`grid gap-3 ${cols}`} role="group" aria-label="Answer choices">
      {q.options!.map((o, i) => (
        <button key={o} type="button" className={`${optionClass(o)} md:text-xl`} onClick={() => choose(o)} disabled={locked}>
          <kbd aria-hidden="true" className="mr-3 hidden rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-sm font-semibold text-slate-600 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-200 md:inline">{i + 1}</kbd>
          {o}
          {locked && o === q.correct && <span aria-label="correct answer"> ✅</span>}
          {locked && o === chosen && o !== q.correct && <span aria-label="your answer, wrong"> ❌</span>}
        </button>
      ))}
    </div>
  )

  return (
    <>
    <section className="card space-y-5 md:space-y-6 md:p-8" aria-labelledby={`qt-${q.id}`}>
      <div>
        <h2 id={`qt-${q.id}`} className="text-lg font-extrabold text-brand-700 dark:text-brand-100 md:text-xl">
          {info.audio && <span aria-hidden="true">🔊 </span>}
          {info.name}
        </h2>
        <p className="text-slate-600 dark:text-slate-300 md:text-lg">{info.instruction}</p>
      </div>

      {info.audio && <AudioControl questionId={q.id} text={q.audioText!} once={audioOnce} autoPlay={!locked} hotkey={q.input !== 'type' && !locked} />}

      {q.sentenceBlank && <BlankSentence text={q.sentenceBlank} />}

      {q.type === 'fixSpelling' && <p className="text-center text-3xl font-extrabold tracking-wide md:text-5xl" aria-label={`Misspelled word: ${q.display}`}>{q.display}</p>}

      {q.type === 'missingLetters' && (
        <p className="break-all text-center font-mono text-3xl font-extrabold tracking-[0.2em] md:text-5xl" aria-label={`Word with missing letters: ${q.display!.replace(/_/g, ' blank ')}`}>
          {q.display}
        </p>
      )}

      {q.type === 'unscramble' && (
        <p className="break-all text-center font-mono text-3xl font-extrabold uppercase tracking-[0.25em] md:text-5xl" aria-label={`Scrambled letters: ${[...q.display!].join(' ')}`}>
          {q.display}
        </p>
      )}

      {q.type === 'rightOrWrong' && <p className="text-center text-3xl font-extrabold tracking-wide md:text-5xl">{q.display}</p>}

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
      {q.input === 'choice' && q.type !== 'rightOrWrong' && options(q.options!.length > 3 ? 'sm:grid-cols-2' : q.options!.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2')}

      {q.input === 'hunt' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4" role="group" aria-label="Words. Tap the misspelled ones.">
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
                  className={`${optionBase} break-words !px-2 text-center !text-base md:!text-lg ${cls}`}
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
    <p className="hidden text-center text-sm text-slate-500 dark:text-slate-400 md:block" data-testid="shortcut-hint">
      ⌨ {locked ? 'Enter for the next question' : hint}
    </p>
    </>
  )
}
