import LetterDiff from './LetterDiff'
import SpeakButton from './SpeakButton'
import type { Evaluation, Question } from '../quiz/types'

/** ✅/❌, the correct spelling, a letter comparison and a 🔊 button. */
export default function FeedbackPanel({ evaluation: ev, question: q }: { evaluation: Evaluation; question: Question }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`card space-y-3 border-2 ${ev.correct ? 'border-green-600' : 'border-red-600'}`}
    >
      <p className="text-xl font-extrabold">
        {ev.correct ? '✅ Correct!' : ev.skipped ? '❌ Skipped (counts as wrong)' : '❌ Not quite'}
      </p>
      <div className="flex items-center gap-3">
        <p className="text-lg">
          Correct spelling: <strong className="text-2xl">{ev.expected}</strong>
        </p>
        {q.input !== 'hunt' && <SpeakButton text={q.word} />}
      </div>
      {ev.note && <p className="text-slate-700 dark:text-slate-300">{ev.note}</p>}
      {ev.compare && ev.compare.given.trim() !== '' && <LetterDiff given={ev.compare.given} expected={ev.compare.expected} />}
      {q.input === 'hunt' && !ev.correct && <HuntDetails evaluation={ev} />}
    </div>
  )
}

export function HuntDetails({ evaluation: ev }: { evaluation: Evaluation }) {
  return (
    <div className="space-y-1 text-sm">
      {ev.missed && ev.missed.length > 0 && (
        <p>
          <strong>You missed:</strong> {ev.missed.map((m) => `${m.text} → ${m.word}`).join(', ')}
        </p>
      )}
      {ev.falseFlags && ev.falseFlags.length > 0 && (
        <p>
          <strong>These were already correct:</strong> {ev.falseFlags.map((m) => m.text).join(', ')}
        </p>
      )}
    </div>
  )
}
