import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useApp } from '../context/AppContext'
import { WORDS } from '../data/words'
import { useStartSession } from '../lib/useStartSession'

// Phone: full-width buttons (icon + title on one line, description underneath).
// md+: a grid of cards (icon above the title).
const card =
  'btn flex-col !min-h-[88px] !items-start !justify-center !rounded-2xl !px-5 text-left text-xl w-full ' +
  'md:!min-h-[170px] md:!justify-start md:!gap-1 md:!p-6 md:shadow-sm md:transition md:hover:-translate-y-0.5 md:hover:shadow-lg'

function Body({ icon, title, desc, muted }: { icon: string; title: ReactNode; desc: string; muted?: boolean }) {
  return (
    <>
      <span className="flex items-center gap-2 md:flex-col md:items-start md:gap-3">
        <span aria-hidden="true" className="md:text-5xl">{icon}</span>
        <span className="md:text-2xl">{title}</span>
      </span>
      <span className={`text-sm font-normal md:text-base ${muted ? 'text-slate-600 dark:text-slate-300' : 'opacity-90'}`}>{desc}</span>
    </>
  )
}

export default function Home() {
  const { voiceStatus } = useApp()
  const { quick, mock, practiceMistakes, mistakes } = useStartSession()

  return (
    <div className="space-y-4 md:space-y-6">
      <p className="text-slate-700 dark:text-slate-300 md:text-lg">
        Practise spelling the {WORDS.length} words for PTE Listening “Fill in the Blanks”. Your scores stay on this phone.
      </p>

      {voiceStatus === 'none' && (
        <div role="alert" className="rounded-xl border-2 border-amber-500 bg-amber-50 p-4 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
          <strong>No English voice found on this device.</strong> Don’t worry: the listening questions are switched off, and you can still practise with all the other question types.
          Try Chrome (Android) or Safari (iPhone) to hear the words.
        </div>
      )}

      <div className="space-y-4 md:grid md:grid-cols-2 md:gap-5 md:space-y-0 lg:grid-cols-3">
        <button className={`${card} btn-primary`} onClick={quick}>
          <Body icon="⚡" title="Quick Practice" desc="20 mixed questions · feedback after each one" />
        </button>

        <button className={`${card} btn-primary !bg-slate-800 hover:!bg-slate-900 dark:!bg-slate-600`} onClick={mock}>
          <Body icon="📝" title="Mock Test" desc="30 questions · 15 minutes · audio plays once · results at the end" />
        </button>

        <Link to="/custom" className={`${card} btn-secondary`}>
          <Body icon="🎛️" title="Custom Practice" desc="Choose question types, words and length" muted />
        </Link>

        <button className={`${card} btn-secondary`} disabled={mistakes.length === 0} onClick={practiceMistakes}>
          <Body
            icon="🔁"
            title={`My Mistakes (${mistakes.length})`}
            desc={mistakes.length === 0 ? 'Nothing here yet. Words you get wrong will appear here.' : 'Practise only the words you got wrong before'}
            muted
          />
        </button>

        <Link to="/words" className={`${card} btn-secondary hidden md:flex`}>
          <Body icon="📖" title="Word List" desc="All 218 words with search, audio and your accuracy" muted />
        </Link>
        <Link to="/progress" className={`${card} btn-secondary hidden md:flex`}>
          <Body icon="📊" title="My Progress" desc="Past tests, overall accuracy and your weakest words" muted />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:hidden">
        <Link to="/words" className="btn btn-secondary">📖 Word List</Link>
        <Link to="/progress" className="btn btn-secondary">📊 My Progress</Link>
        <Link to="/settings" className="btn btn-secondary">⚙️ Settings</Link>
      </div>
    </div>
  )
}
