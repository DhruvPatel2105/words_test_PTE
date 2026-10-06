import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { WORDS } from '../data/words'
import { ALL_TYPES, type SessionConfig } from '../quiz/types'

const big =
  'btn flex-col !min-h-[88px] !items-start !justify-center !rounded-2xl !px-5 text-left text-xl w-full'

export default function Home() {
  const navigate = useNavigate()
  const { store, audioAvailable, voiceStatus } = useApp()
  const mistakes = store.mistakes.filter((w) => WORDS.includes(w))

  const start = (config: SessionConfig) => navigate('/quiz', { state: { config } })
  const base = { types: ALL_TYPES, pool: WORDS, audioAvailable }

  return (
    <div className="space-y-4">
      <p className="text-slate-700 dark:text-slate-300">
        Practise spelling the {WORDS.length} words for PTE Listening “Fill in the Blanks”. Your scores stay on this phone.
      </p>

      {voiceStatus === 'none' && (
        <div role="alert" className="rounded-xl border-2 border-amber-500 bg-amber-50 p-4 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
          <strong>No English voice found on this device.</strong> Don’t worry: the listening questions are switched off, and you can still practise with all the other question types.
          Try Chrome (Android) or Safari (iPhone) to hear the words.
        </div>
      )}

      <button
        className={`${big} btn-primary`}
        onClick={() => start({ ...base, mode: 'quick', count: 20, feedback: true, audioOnce: false })}
      >
        <span>⚡ Quick Practice</span>
        <span className="text-sm font-normal opacity-90">20 mixed questions · feedback after each one</span>
      </button>

      <button
        className={`${big} btn-primary !bg-slate-800 hover:!bg-slate-900 dark:!bg-slate-600`}
        onClick={() => start({ ...base, mode: 'mock', count: 30, feedback: false, timeLimitSec: 15 * 60, audioOnce: true })}
      >
        <span>📝 Mock Test</span>
        <span className="text-sm font-normal opacity-90">30 questions · 15 minutes · audio plays once · results at the end</span>
      </button>

      <Link to="/custom" className={`${big} btn-secondary`}>
        <span>🎛️ Custom Practice</span>
        <span className="text-sm font-normal text-slate-600 dark:text-slate-300">Choose question types, words and length</span>
      </Link>

      <button
        className={`${big} btn-secondary`}
        disabled={mistakes.length === 0}
        onClick={() =>
          start({ ...base, pool: mistakes, mode: 'mistakes', count: 20, feedback: true, audioOnce: false })
        }
      >
        <span>🔁 My Mistakes ({mistakes.length})</span>
        <span className="text-sm font-normal text-slate-600 dark:text-slate-300">
          {mistakes.length === 0 ? 'Nothing here yet. Words you get wrong will appear here.' : 'Practise only the words you got wrong before'}
        </span>
      </button>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link to="/words" className="btn btn-secondary">📖 Word List</Link>
        <Link to="/progress" className="btn btn-secondary">📊 My Progress</Link>
        <Link to="/settings" className="btn btn-secondary">⚙️ Settings</Link>
      </div>
    </div>
  )
}
