// Free, built-in browser text-to-speech (Web Speech API). No external service.

export type VoiceStatus = 'loading' | 'ready' | 'none'

export const speechSupported = (): boolean => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

const ORDER = ['en-au', 'en-gb', 'en-us']

/** English voices, best first: en-AU, en-GB, en-US, then any other en-*. */
export function englishVoices(all: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const rank = (v: SpeechSynthesisVoice) => {
    const lang = v.lang.replace('_', '-').toLowerCase()
    const i = ORDER.indexOf(lang)
    return i >= 0 ? i : ORDER.length
  }
  return all
    .filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith('en'))
    .map((v, i) => ({ v, i }))
    .sort((a, b) => rank(a.v) - rank(b.v) || a.i - b.i)
    .map((x) => x.v)
}

export function readVoices(): SpeechSynthesisVoice[] {
  try {
    return speechSupported() ? englishVoices(window.speechSynthesis.getVoices()) : []
  } catch {
    return []
  }
}

/** Calls `onChange` now, when voices load (they load asynchronously), and after a short wait. */
export function watchVoices(onChange: (voices: SpeechSynthesisVoice[], settled: boolean) => void): () => void {
  if (!speechSupported()) {
    onChange([], true)
    return () => {}
  }
  const synth = window.speechSynthesis
  const update = (settled: boolean) => onChange(readVoices(), settled)
  const handler = () => update(false)
  update(false)
  synth.addEventListener?.('voiceschanged', handler)
  const timer = window.setTimeout(() => update(true), 2500)
  return () => {
    synth.removeEventListener?.('voiceschanged', handler)
    window.clearTimeout(timer)
  }
}

export interface SpeakOptions {
  voiceURI: string | null
  rate: number
  /** Called when the browser actually starts speaking. */
  onStart?: () => void
}

let current = 0

export function stopSpeaking(): void {
  current++
  try {
    if (speechSupported()) window.speechSynthesis.cancel()
  } catch {
    /* ignore */
  }
}

/**
 * Speak `text`. Resolves true when speech started, false if the browser blocked it or failed.
 * Must first be called from a tap on iPhone/Safari.
 */
export function speak(text: string, opts: SpeakOptions): Promise<boolean> {
  return new Promise((resolve) => {
    if (!speechSupported()) return resolve(false)
    const synth = window.speechSynthesis
    try {
      synth.cancel()
      const id = ++current
      const u = new SpeechSynthesisUtterance(text)
      const voices = readVoices()
      const voice = voices.find((v) => v.voiceURI === opts.voiceURI) ?? voices[0]
      if (voice) {
        u.voice = voice
        u.lang = voice.lang
      } else {
        u.lang = 'en-GB'
      }
      u.rate = opts.rate
      let started = false
      const giveUp = window.setTimeout(() => {
        if (!started) resolve(false)
      }, 3000)
      u.onstart = () => {
        started = true
        window.clearTimeout(giveUp)
        opts.onStart?.()
        resolve(true)
      }
      u.onerror = (e) => {
        window.clearTimeout(giveUp)
        // "canceled"/"interrupted" just means another sound replaced this one
        if (!started && id === current && e.error !== 'canceled' && e.error !== 'interrupted') resolve(false)
      }
      synth.speak(u)
    } catch {
      resolve(false)
    }
  })
}

/** Silent utterance fired from the student's first tap so iOS lets later speech play on its own. */
export function unlockAudio(): void {
  try {
    if (!speechSupported()) return
    const u = new SpeechSynthesisUtterance(' ')
    u.volume = 0
    window.speechSynthesis.speak(u)
  } catch {
    /* ignore */
  }
}
