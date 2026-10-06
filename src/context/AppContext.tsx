import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { type Settings, type Store, type TestRecord, addHistory, defaultStore, recordResult } from '../lib/progress'
import { clearStore, loadStore, saveStore } from '../lib/storage'
import { type VoiceStatus, speak, stopSpeaking, unlockAudio, watchVoices } from '../lib/audio'

interface AppContextValue {
  store: Store
  settings: Settings
  setSettings: (patch: Partial<Settings>) => void
  recordWord: (word: string, correct: boolean) => void
  addTest: (record: TestRecord) => void
  resetProgress: () => void
  voices: SpeechSynthesisVoice[]
  voiceStatus: VoiceStatus
  /** False when the device has no English voice (audio question types are then switched off). */
  audioAvailable: boolean
  /** True once the student has tapped something (needed before iPhone allows speech). */
  audioUnlocked: () => boolean
  play: (text: string, onStart?: () => void) => Promise<boolean>
}

const Ctx = createContext<AppContextValue | null>(null)

export function useApp(): AppContextValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp must be used inside AppProvider')
  return v
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(loadStore)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('loading')
  const unlocked = useRef(false)

  useEffect(() => saveStore(store), [store])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', store.settings.dark)
  }, [store.settings.dark])

  // Voices load asynchronously ("voiceschanged").
  useEffect(
    () =>
      watchVoices((list, settled) => {
        setVoices(list)
        setVoiceStatus(list.length > 0 ? 'ready' : settled ? 'none' : 'loading')
      }),
    [],
  )

  // The first tap anywhere unlocks speech (iPhone/Safari only allows speech after a tap).
  useEffect(() => {
    const events = ['click', 'touchend', 'keydown'] as const
    const unlock = () => {
      if (unlocked.current) return
      unlocked.current = true
      unlockAudio()
      events.forEach((e) => window.removeEventListener(e, unlock))
    }
    events.forEach((e) => window.addEventListener(e, unlock))
    return () => events.forEach((e) => window.removeEventListener(e, unlock))
  }, [])

  const settingsRef = useRef(store.settings)
  settingsRef.current = store.settings

  const play = useCallback(
    (text: string, onStart?: () => void) => speak(text, { voiceURI: settingsRef.current.voiceURI, rate: settingsRef.current.rate, onStart }),
    [],
  )

  const value = useMemo<AppContextValue>(
    () => ({
      store,
      settings: store.settings,
      setSettings: (patch) => setStore((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
      recordWord: (word, correct) => setStore((s) => recordResult(s, word, correct)),
      addTest: (record) => setStore((s) => addHistory(s, record)),
      resetProgress: () => {
        stopSpeaking()
        clearStore()
        setStore((s) => ({ ...defaultStore(s.settings.dark), settings: s.settings }))
      },
      voices,
      voiceStatus,
      audioAvailable: voiceStatus !== 'none',
      audioUnlocked: () => unlocked.current,
      play,
    }),
    [store, voices, voiceStatus, play],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
