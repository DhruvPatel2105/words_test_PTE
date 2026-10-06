import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { WORDS } from '../data/words'
import { ALL_TYPES, TYPE_INFO, type QuestionType } from '../quiz/types'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const COUNTS = [10, 20, 30, 50, 'all'] as const

type WordChoice = 'all' | 'range' | 'mistakes'

export default function Custom() {
  const navigate = useNavigate()
  const { store, audioAvailable } = useApp()
  const [types, setTypes] = useState<Set<QuestionType>>(new Set(ALL_TYPES.filter((t) => audioAvailable || !TYPE_INFO.find((i) => i.id === t)!.audio)))
  const [count, setCount] = useState<(typeof COUNTS)[number]>(20)
  const [choice, setChoice] = useState<WordChoice>('all')
  const [from, setFrom] = useState('A')
  const [to, setTo] = useState('F')
  const [feedback, setFeedback] = useState(true)

  const mistakes = useMemo(() => store.mistakes.filter((w) => WORDS.includes(w)), [store.mistakes])
  const pool = useMemo(() => {
    if (choice === 'mistakes') return mistakes
    if (choice === 'range') {
      const lo = from < to ? from : to
      const hi = from < to ? to : from
      return WORDS.filter((w) => {
        const c = w[0].toUpperCase()
        return c >= lo && c <= hi
      })
    }
    return WORDS
  }, [choice, from, to, mistakes])

  const available = (t: QuestionType) => audioAvailable || !TYPE_INFO.find((i) => i.id === t)!.audio
  const chosenTypes = ALL_TYPES.filter((t) => types.has(t) && available(t))
  const canStart = chosenTypes.length > 0 && pool.length > 0

  const toggle = (t: QuestionType) =>
    setTypes((prev) => {
      const next = new Set(prev)
      if (next.has(t)) next.delete(t)
      else next.add(t)
      return next
    })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Custom Practice</h1>

      <fieldset className="card space-y-3">
        <legend className="px-1 text-lg font-bold">Question types</legend>
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary !min-h-[44px]" onClick={() => setTypes(new Set(ALL_TYPES.filter(available)))}>Select all</button>
          <button type="button" className="btn btn-secondary !min-h-[44px]" onClick={() => setTypes(new Set())}>Clear</button>
        </div>
        {TYPE_INFO.map((t) => {
          const off = !available(t.id)
          return (
            <label key={t.id} className={`flex min-h-[44px] cursor-pointer items-center gap-3 ${off ? 'opacity-50' : ''}`}>
              <input type="checkbox" className="h-6 w-6 accent-brand-600" checked={types.has(t.id) && !off} disabled={off} onChange={() => toggle(t.id)} />
              <span>
                {t.audio && <span aria-hidden="true">🔊 </span>}
                {t.name}
                {off && <span className="text-sm"> (needs an English voice)</span>}
              </span>
            </label>
          )
        })}
      </fieldset>

      <fieldset className="card space-y-2">
        <legend className="px-1 text-lg font-bold">Number of questions</legend>
        <div className="flex flex-wrap gap-2">
          {COUNTS.map((c) => (
            <label key={c} className="cursor-pointer">
              <input type="radio" name="count" className="peer sr-only" checked={count === c} onChange={() => setCount(c)} />
              <span className="btn btn-secondary peer-checked:!border-brand-600 peer-checked:!bg-brand-600 peer-checked:!text-white peer-focus-visible:ring-4 peer-focus-visible:ring-brand-500/60">
                {c === 'all' ? 'All' : c}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="card space-y-3">
        <legend className="px-1 text-lg font-bold">Words</legend>
        <label className="flex min-h-[44px] items-center gap-3">
          <input type="radio" name="words" className="h-6 w-6 accent-brand-600" checked={choice === 'all'} onChange={() => setChoice('all')} />
          All {WORDS.length} words
        </label>
        <label className="flex min-h-[44px] items-center gap-3">
          <input type="radio" name="words" className="h-6 w-6 accent-brand-600" checked={choice === 'range'} onChange={() => setChoice('range')} />
          A letter range
        </label>
        {choice === 'range' && (
          <div className="ml-9 flex items-center gap-2">
            <label className="sr-only" htmlFor="from">From letter</label>
            <select id="from" className="input !w-24" value={from} onChange={(e) => setFrom(e.target.value)}>
              {LETTERS.map((l) => <option key={l}>{l}</option>)}
            </select>
            <span aria-hidden="true">–</span>
            <label className="sr-only" htmlFor="to">To letter</label>
            <select id="to" className="input !w-24" value={to} onChange={(e) => setTo(e.target.value)}>
              {LETTERS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
        )}
        <label className={`flex min-h-[44px] items-center gap-3 ${mistakes.length === 0 ? 'opacity-50' : ''}`}>
          <input type="radio" name="words" className="h-6 w-6 accent-brand-600" checked={choice === 'mistakes'} disabled={mistakes.length === 0} onChange={() => setChoice('mistakes')} />
          My Mistakes ({mistakes.length})
        </label>
        <p className="text-sm text-slate-600 dark:text-slate-300">{pool.length} word{pool.length === 1 ? '' : 's'} selected</p>
      </fieldset>

      <label className="card flex min-h-[44px] cursor-pointer items-center justify-between gap-3">
        <span className="font-bold">Show feedback after each question</span>
        <input type="checkbox" className="h-7 w-7 accent-brand-600" checked={feedback} onChange={(e) => setFeedback(e.target.checked)} />
      </label>

      {!canStart && (
        <p role="alert" className="text-red-700 dark:text-red-300">
          {chosenTypes.length === 0 ? 'Choose at least one question type.' : 'There are no words in this selection.'}
        </p>
      )}
      <button
        className="btn btn-primary w-full !min-h-[56px] text-lg"
        disabled={!canStart}
        onClick={() =>
          navigate('/quiz', {
            state: {
              config: {
                mode: choice === 'mistakes' ? 'mistakes' : 'custom',
                types: chosenTypes,
                count,
                pool,
                feedback,
                audioOnce: false,
                audioAvailable,
              },
            },
          })
        }
      >
        Start practice
      </button>
    </div>
  )
}
