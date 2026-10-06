import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { WORDS } from '../data/words'
import { accuracy } from '../lib/progress'
import SpeakButton from '../components/SpeakButton'

export default function WordList() {
  const { store } = useApp()
  const [query, setQuery] = useState('')
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...WORDS].sort((a, b) => a.localeCompare(b)).filter((w) => w.includes(q))
  }, [query])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Word List</h1>
      <div className="md:max-w-xl">
        <label htmlFor="search" className="mb-1 block text-sm font-semibold">Search words</label>
        <input
          id="search"
          className="input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type to search…"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300" aria-live="polite">
        Showing {shown.length} of {WORDS.length} words
      </p>
      <ul className="card divide-y divide-slate-200 !p-0 dark:divide-slate-700 lg:grid lg:grid-cols-3 lg:gap-3 lg:divide-y-0 lg:!border-0 lg:!bg-transparent lg:!shadow-none lg:dark:!bg-transparent">
        {shown.map((w) => {
          const stat = store.words[w]
          const pct = accuracy(stat)
          return (
            <li key={w} className="flex min-h-[56px] items-center justify-between gap-3 px-4 py-2 lg:rounded-xl lg:border lg:border-slate-200 lg:bg-white lg:transition lg:hover:border-brand-500 lg:hover:shadow-md lg:dark:border-slate-700 lg:dark:bg-slate-800">
              <span className="min-w-0 text-lg font-semibold">{w}</span>
              <span className="flex items-center gap-3">
                {pct !== null && (
                  <span
                    className={`rounded-full px-2 py-1 text-sm font-bold ${pct >= 70 ? 'bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100' : 'bg-red-100 text-red-900 dark:bg-red-900/50 dark:text-red-100'}`}
                    title={`${stat.correct} correct out of ${stat.seen}`}
                  >
                    {pct}%
                  </span>
                )}
                <SpeakButton text={w} />
              </span>
            </li>
          )
        })}
        {shown.length === 0 && <li className="px-4 py-6 text-center text-slate-600 dark:text-slate-300 lg:col-span-full">No words match “{query}”.</li>}
      </ul>
    </div>
  )
}
