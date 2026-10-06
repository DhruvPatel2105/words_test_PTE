import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'
import SpeakButton from '../components/SpeakButton'

export default function Settings() {
  const { settings, setSettings, voices, voiceStatus, resetProgress } = useApp()
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState(false)
  const selected = voices.find((v) => v.voiceURI === settings.voiceURI)?.voiceURI ?? ''

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">Settings</h1>

      <section className="card space-y-4">
        <h2 className="text-lg font-bold">Voice</h2>
        {voiceStatus === 'none' ? (
          <p role="alert" className="text-amber-800 dark:text-amber-200">
            No English voice was found on this device, so audio questions are switched off. Try another browser (Chrome on Android, Safari on iPhone).
          </p>
        ) : (
          <>
            <div>
              <label htmlFor="voice" className="mb-1 block text-sm font-semibold">Voice</label>
              <select id="voice" className="input" value={selected} onChange={(e) => setSettings({ voiceURI: e.target.value || null })}>
                <option value="">Automatic (best English voice)</option>
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>
                ))}
              </select>
            </div>
            <fieldset>
              <legend className="mb-1 text-sm font-semibold">Speed</legend>
              <div className="flex gap-2">
                {[{ label: 'Slow (0.8)', value: 0.8 }, { label: 'Normal (1.0)', value: 1 }].map((o) => (
                  <label key={o.value} className="flex-1 cursor-pointer">
                    <input type="radio" name="speed" className="peer sr-only" checked={settings.rate === o.value} onChange={() => setSettings({ rate: o.value })} />
                    <span className="btn btn-secondary w-full peer-checked:!border-brand-600 peer-checked:!bg-brand-600 peer-checked:!text-white peer-focus-visible:ring-4 peer-focus-visible:ring-brand-500/60">
                      {o.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="flex items-center gap-3">
              <SpeakButton text="Hello! This is how I sound. Spelling is easy with practice." label="Test the voice" />
              <span className="text-sm text-slate-600 dark:text-slate-300">Test the voice</span>
            </div>
          </>
        )}
      </section>

      <section className="card">
        <label className="flex min-h-[44px] cursor-pointer items-center justify-between gap-3">
          <span className="text-lg font-bold">Dark mode</span>
          <input type="checkbox" className="h-7 w-7 accent-brand-600" checked={settings.dark} onChange={(e) => setSettings({ dark: e.target.checked })} />
        </label>
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-bold">Reset</h2>
        <p className="text-slate-700 dark:text-slate-300">Delete your scores, test history and My Mistakes from this device.</p>
        <button className="btn btn-danger" onClick={() => setConfirming(true)}>Reset all progress</button>
        {done && <p role="status" className="font-semibold text-green-700 dark:text-green-400">✅ All progress has been reset.</p>}
      </section>

      {confirming && (
        <Modal
          title="Reset all progress?"
          confirmLabel="Yes, delete everything"
          cancelLabel="Cancel"
          danger
          onConfirm={() => {
            resetProgress()
            setConfirming(false)
            setDone(true)
          }}
          onCancel={() => setConfirming(false)}
        >
          This deletes all your scores, test history and My Mistakes. You cannot undo this.
        </Modal>
      )}
    </div>
  )
}
