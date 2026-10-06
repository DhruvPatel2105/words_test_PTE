import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { buildMessage } from '../lib/results'
import { fmtDuration } from '../lib/format'
import { TYPE_INFO, type SessionConfig } from '../quiz/types'
import type { ResultState } from './Quiz'
import LetterDiff from '../components/LetterDiff'
import SpeakButton from '../components/SpeakButton'
import { HuntDetails } from '../components/FeedbackPanel'

export default function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const { audioAvailable } = useApp()
  const result = location.state as ResultState | null
  if (!result?.records) return <Navigate to="/" replace />

  const { records, score, total, seconds, config } = result
  const percent = total ? Math.round((score / total) * 100) : 0
  const msg = buildMessage(percent)
  const wrong = records.filter((r) => !r.evaluation.correct)
  const wrongWords = [...new Set(wrong.map((r) => r.question.word))]

  const byType = TYPE_INFO.map((t) => {
    const rs = records.filter((r) => r.question.type === t.id)
    return { ...t, total: rs.length, correct: rs.filter((r) => r.evaluation.correct).length }
  }).filter((t) => t.total > 0)

  const start = (cfg: SessionConfig) => navigate('/quiz', { state: { config: cfg } })
  const shareText = `I scored ${score}/${total} (${percent}%) on the Kalindri Spelling Test spelling quiz! Try it: ${window.location.origin}`

  return (
    <div className="space-y-5 lg:grid lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start lg:gap-8 lg:space-y-0">
      <div className="space-y-5 lg:sticky lg:top-4">
      <section className="card text-center" aria-live="polite">
        <p className="text-5xl font-extrabold">{score}/{total}</p>
        <p className="text-2xl font-bold">{percent}%</p>
        <p className={`mt-2 text-xl font-bold ${msg.className}`}>{msg.emoji} {msg.text}</p>
        <p className="mt-1 text-slate-600 dark:text-slate-300">Time taken: {fmtDuration(seconds)}</p>
        {records.some((r) => !r.answered) && (
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">Time ran out: unanswered questions count as wrong.</p>
        )}
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <button
          className="btn btn-primary"
          disabled={wrongWords.length === 0}
          onClick={() =>
            start({ ...config, mode: 'retry', pool: wrongWords, count: 'all', feedback: true, timeLimitSec: undefined, audioOnce: false, audioAvailable })
          }
        >
          🔁 Retry Wrong Words
        </button>
        <button className="btn btn-primary" onClick={() => start({ ...config, audioAvailable })}>🆕 New Test</button>
        <Link to="/" className="btn btn-secondary">🏠 Home</Link>
        <a className="btn btn-secondary !bg-green-600 !text-white hover:!bg-green-700 !border-green-700" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">
          💬 Share on WhatsApp
        </a>
      </div>

      <section className="card">
        <h2 className="mb-2 text-lg font-bold">Accuracy by question type</h2>
        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
          {byType.map((t) => (
            <li key={t.id} className="flex min-h-[44px] items-center justify-between gap-3 py-2">
              <span>{t.name}</span>
              <span className="whitespace-nowrap font-bold">
                {t.correct}/{t.total} <span className="font-normal text-slate-600 dark:text-slate-300">({Math.round((t.correct / t.total) * 100)}%)</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">{wrong.length === 0 ? 'No wrong answers. Perfect!' : `Wrong answers (${wrong.length})`}</h2>
        {wrong.map((r) => {
          const ev = r.evaluation
          const q = r.question
          return (
            <article key={q.id} className="card space-y-3 border-red-300 dark:border-red-800">
              <p className="text-sm font-semibold uppercase text-slate-500 dark:text-slate-400">{TYPE_INFO.find((t) => t.id === q.type)!.name}</p>
              <div className="flex items-center justify-between gap-3">
                <p>
                  Correct spelling: <strong className="text-xl">{ev.expected}</strong>
                </p>
                {q.input !== 'hunt' && <SpeakButton text={q.word} />}
              </div>
              <p>
                Your answer: <strong>{ev.skipped || !r.answered ? (r.answered ? 'Skipped' : 'Not answered') : ev.given || '(nothing)'}</strong>
              </p>
              {ev.note && <p className="text-sm text-slate-700 dark:text-slate-300">{ev.note}</p>}
              {ev.compare && ev.compare.given.trim() !== '' && <LetterDiff given={ev.compare.given} expected={ev.compare.expected} />}
              {q.input === 'hunt' && <HuntDetails evaluation={ev} />}
            </article>
          )
        })}
      </section>
    </div>
  )
}
