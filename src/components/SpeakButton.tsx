import { useApp } from '../context/AppContext'

/** Small 🔊 button that says a word again (used in feedback, results and the word list). */
export default function SpeakButton({ text, label }: { text: string; label?: string }) {
  const { play, audioAvailable } = useApp()
  if (!audioAvailable) return null
  return (
    <button type="button" className="btn btn-secondary !min-h-[44px] !px-3" onClick={() => void play(text)} aria-label={label ?? `Hear ${text}`}>
      <span aria-hidden="true">🔊</span>
    </button>
  )
}
