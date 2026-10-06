import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { WORDS } from '../data/words'
import { ALL_TYPES, type SessionConfig } from '../quiz/types'

/** Start Quick Practice / Mock Test / My Mistakes from the Home cards or the desktop nav bar. */
export function useStartSession() {
  const navigate = useNavigate()
  const { audioAvailable, store } = useApp()
  const start = (config: SessionConfig) => navigate('/quiz', { state: { config } })
  const base = { types: ALL_TYPES, pool: WORDS, audioAvailable }
  const mistakes = store.mistakes.filter((w) => WORDS.includes(w))
  return {
    mistakes,
    quick: () => start({ ...base, mode: 'quick', count: 20, feedback: true, audioOnce: false }),
    mock: () => start({ ...base, mode: 'mock', count: 30, feedback: false, timeLimitSec: 15 * 60, audioOnce: true }),
    practiceMistakes: () => start({ ...base, pool: mistakes, mode: 'mistakes', count: 20, feedback: true, audioOnce: false }),
  }
}
