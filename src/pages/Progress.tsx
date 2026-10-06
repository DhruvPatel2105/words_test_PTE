import { useApp } from '../context/AppContext'
import { totals, weakestWords } from '../lib/progress'
import { fmtDate, fmtDuration, modeLabel } from '../lib/format'
import { WORDS } from '../data/words'

export default function Progress() {
  const { store } = useApp()
  const t = totals(store)
  const weak = weakestWords(store, 10)

  return (
    <div className="space-y-5 md:space-y-6">
      <h1 className="text-2xl font-extrabold">My Progress</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        <div className="card text-center">
          <p className="text-3xl font-extrabold">{t.answered}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">questions answered</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-extrabold">{t.percent === null ? '–' : `${t.percent}%`}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">overall accuracy</p>
        </div>
        <div className="card hidden text-center md:block">
          <p className="text-3xl font-extrabold">{store.history.length}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">tests finished</p>
        </div>
        <div className="card hidden text-center md:block">
          <p className="text-3xl font-extrabold">{Object.keys(store.words).length}<span className="text-lg font-semibold text-slate-500"> / {WORDS.length}</span></p>
          <p className="text-sm text-slate-600 dark:text-slate-300">words practised</p>
        </div>
      </div>

      <div className="space-y-5 lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start lg:gap-8 lg:space-y-0">
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
          <>
          <table className="hidden w-full text-left md:table">
            <thead>
              <tr className="border-b-2 border-slate-200 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                <th scope="col" className="py-2 pr-3 font-semibold">Date</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Mode</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Score</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">%</th>
                <th scope="col" className="py-2 text-right font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {store.history.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="py-2 pr-3">{fmtDate(h.date)}</td>
                  <td className="py-2 pr-3">{modeLabel(h.mode)}</td>
                  <td className="py-2 pr-3 text-right">{h.score}/{h.total}</td>
                  <td className={`py-2 pr-3 text-right font-bold ${h.percent >= 70 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>{h.percent}%</td>
                  <td className="py-2 text-right text-slate-600 dark:text-slate-300">{fmtDuration(h.seconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="divide-y divide-slate-200 dark:divide-slate-700 md:hidden">
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
          </>
        )}
      </section>
      </div>
    </div>
  )
}
