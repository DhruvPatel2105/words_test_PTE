import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'

interface Props {
  questionId: string
  text: string
  /** Mock Test: audio plays once only. */
  once: boolean
  /** Do not start by itself (e.g. while reviewing feedback). */
  autoPlay: boolean
}

type State = 'idle' | 'played' | 'blocked'

/** Big ▶ Play button. Auto-plays after the student's first tap and falls back to the button if that fails. */
export default function AudioControl({ questionId, text, once, autoPlay }: Props) {
  const { play, audioUnlocked, voiceStatus } = useApp()
  const [state, setState] = useState<State>('idle')
  const [count, setCount] = useState(0)
  const tried = useRef<string | null>(null)

  const start = async () => {
    const ok = await play(text, () => {
      setCount((c) => c + 1)
      setState('played')
    })
    if (!ok) setState('blocked')
  }

  useEffect(() => {
    if (!autoPlay || tried.current === questionId) return
    if (!audioUnlocked() || voiceStatus === 'loading') return
    tried.current = questionId
    void start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId, autoPlay, voiceStatus])

  const locked = once && count > 0
  const label = locked ? 'Played' : count > 0 ? 'Replay' : 'Play'
  return (
    <div className="text-center">
      <button
        type="button"
        className="btn btn-primary mx-auto !min-h-[84px] w-full max-w-xs !rounded-2xl text-2xl"
        onClick={() => void start()}
        disabled={locked}
        aria-label={locked ? 'Audio already played' : count > 0 ? 'Replay audio' : 'Play audio'}
      >
        <span aria-hidden="true">{locked ? '✔' : count > 0 ? '🔁' : '▶'}</span> {label}
      </button>
      {once && !locked && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Mock Test: the audio plays only once.</p>}
      {state === 'blocked' && (
        <p role="status" className="mt-2 text-sm text-amber-700 dark:text-amber-300">
          The sound did not start. Tap ▶ Play to listen (check your phone is not on silent).
        </p>
      )}
    </div>
  )
}
