import { useApp } from '../context/AppContext'
import { totals, weakestWords } from '../lib/progress'
import { fmtDate, modeLabel } from '../lib/format'

export default function Progress() {
  const { store } = useApp()
  const t = totals(store)
  const weak = weakestWords(store, 10)

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">My Progress</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <p className="text-3xl font-extrabold">{t.answered}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">questions answered</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-extrabold">{t.percent === null ? '–' : `${t.percent}%`}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">overall accuracy</p>
        </div>
      </div>

      <section className="card">
        <h2 className="mb-2 text-lg font-bold">10 weakest words</h2>
        {weak.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-300">No mistakes yet. Keep practising!</p>
        ) : (
          <ol className="divide-y divide-slate-200 dark:divide-slate-700">
            {weak.map((w) => (
              <li key={w.word} className="flex min-h-[44px] items-center justify-between py-2">
                <span className="text-lg font-semibold">{w.word}</span>
                <span className="text-sm text-slate-600 dark:text-slate-300">{w.percent}% correct · seen {w.seen}×</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="card">
        <h2 className="mb-2 text-lg font-bold">Past tests</h2>
        {store.history.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-300">Finish a test and it will show up here.</p>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {store.history.map((h) => (
              <li key={h.id} className="flex min-h-[44px] items-center justify-between gap-3 py-2">
                <span>
                  <span className="block font-semibold">{modeLabel(h.mode)}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-300">{fmtDate(h.date)}</span>
                </span>
                <span className="text-right">
                  <span className={`block text-lg font-extrabold ${h.percent >= 70 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>{h.percent}%</span>
                  <span className="text-sm text-slate-600 dark:text-slate-300">{h.score}/{h.total}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
