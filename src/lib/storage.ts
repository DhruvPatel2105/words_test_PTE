import { type Store, type TestRecord, type WordStat, MAX_HISTORY, defaultStore } from './progress'

export const STORAGE_KEY = 'fibquiz:v1'

const prefersDark = (): boolean => {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

/** Read saved progress. Always returns a valid store, even if storage is blocked or corrupt. */
export function loadStore(): Store {
  const base = defaultStore(prefersDark())
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const data = JSON.parse(raw) as Partial<Store>
    const words: Record<string, WordStat> = {}
    for (const [w, s] of Object.entries(data.words ?? {})) {
      if (s && typeof s.seen === 'number' && typeof s.correct === 'number') {
        words[w] = { seen: s.seen, correct: s.correct, last: typeof s.last === 'boolean' ? s.last : null, streak: Number(s.streak) || 0 }
      }
    }
    const settings = { ...base.settings, ...(data.settings ?? {}) }
    return {
      words,
      mistakes: Array.isArray(data.mistakes) ? data.mistakes.filter((m): m is string => typeof m === 'string') : [],
      history: Array.isArray(data.history) ? (data.history as TestRecord[]).slice(0, MAX_HISTORY) : [],
      settings: { voiceURI: settings.voiceURI ?? null, rate: settings.rate === 0.8 ? 0.8 : 1, dark: !!settings.dark },
    }
  } catch {
    return base
  }
}

export function saveStore(store: Store): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    /* storage full or blocked: the app keeps working for this visit */
  }
}

export function clearStore(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
