import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useBlocker, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { buildSession } from '../quiz/session'
import { evaluate, huntWordResults } from '../quiz/generators'
import type { Answer, AnswerRecord, SessionConfig } from '../quiz/types'
import type { TestRecord } from '../lib/progress'
import QuestionView from '../components/QuestionView'
import FeedbackPanel from '../components/FeedbackPanel'
import Modal from '../components/Modal'
import { stopSpeaking } from '../lib/audio'

export interface ResultState {
  config: SessionConfig
  records: AnswerRecord[]
  seconds: number
  score: number
  total: number
}

export default function Quiz() {
  const location = useLocation()
  const config = (location.state as { config?: SessionConfig } | null)?.config
  if (!config) return <Navigate to="/" replace />
  // A new key means a brand-new session (e.g. "New Test" from the results page).
  return <QuizSession key={location.key} config={config} />
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

function QuizSession({ config }: { config: SessionConfig }) {
  const navigate = useNavigate()
  const { recordWord, addTest } = useApp()
  const questions = useMemo(() => buildSession(config), [config])
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'ask' | 'feedback'>('ask')
  const [records, setRecords] = useState<AnswerRecord[]>([])
  const [done, setDone] = useState<ResultState | null>(null)
  const startedAt = useRef(Date.now())
  const recordsRef = useRef<AnswerRecord[]>([])
  const finishedRef = useRef(false)
  const limit = config.timeLimitSec
  const [secondsLeft, setSecondsLeft] = useState(limit ?? 0)

  const inProgress = done === null && questions.length > 0
  const blocker = useBlocker(inProgress)

  useEffect(() => {
    if (!inProgress) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [inProgress])

  useEffect(() => () => stopSpeaking(), [])

  const finish = (answered: AnswerRecord[]) => {
    if (finishedRef.current) return
    finishedRef.current = true
    stopSpeaking()
    const all: AnswerRecord[] = [
      ...answered,
      ...questions.slice(answered.length).map((q) => ({ question: q, evaluation: evaluate(q, null), answered: false })),
    ]
    const score = all.filter((r) => r.evaluation.correct).length
    const total = questions.length
    const seconds = Math.min(Math.round((Date.now() - startedAt.current) / 1000), limit ?? Infinity)
    const byType: NonNullable<TestRecord['byType']> = {}
    for (const r of all) {
      const t = (byType[r.question.type] ??= { correct: 0, total: 0 })
      t.total++
      if (r.evaluation.correct) t.correct++
    }
    addTest({
      id: `${Date.now()}`,
      date: new Date().toISOString(),
      mode: config.mode,
      score,
      total,
      percent: total ? Math.round((score / total) * 100) : 0,
      seconds,
      byType,
    })
    setDone({ config, records: all, seconds, score, total })
  }

  // Mock Test timer
  useEffect(() => {
    if (!limit || !inProgress) return
    const tick = window.setInterval(() => {
      const left = Math.max(0, limit - Math.floor((Date.now() - startedAt.current) / 1000))
      setSecondsLeft(left)
      if (left === 0) finish(recordsRef.current)
    }, 500)
    return () => window.clearInterval(tick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, inProgress])

  // Leave for the results page once finished (declared after useBlocker so the block is already lifted).
  useEffect(() => {
    if (done) navigate('/results', { replace: true, state: done })
  }, [done, navigate])

  const q = questions[index]
  const current = records[index]

  const advance = (list: AnswerRecord[]) => {
    if (index + 1 >= questions.length) finish(list)
    else {
      setIndex(index + 1)
      setPhase('ask')
    }
  }

  const submit = (answer: Answer) => {
    if (phase !== 'ask' || finishedRef.current || !q) return
    const evaluation = evaluate(q, answer)
    if (q.input === 'hunt') {
      for (const r of huntWordResults(q, answer)) recordWord(r.word, r.correct)
    } else {
      recordWord(q.word, evaluation.correct)
    }
    const next = [...recordsRef.current, { question: q, evaluation, answered: true }]
    recordsRef.current = next
    setRecords(next)
    if (config.feedback) setPhase('feedback')
    else advance(next)
  }

  const next = () => advance(recordsRef.current)

  // Enter on the feedback screen goes to the next question.
  useEffect(() => {
    if (phase !== 'feedback') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.repeat) {
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index])

  if (questions.length === 0) {
    return (
      <div className="card space-y-4 text-center">
        <p className="text-lg">There are no questions to ask for this selection.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Home</button>
      </div>
    )
  }
  if (!q) return null

  const pct = Math.round((index / questions.length) * 100)

  return (
    <div className="mx-auto space-y-4 md:max-w-[720px] md:space-y-5">
      {/* Phone: label + controls, bar underneath. md+: one neat bar above the card. */}
      <div className="grid grid-cols-[1fr_auto] items-center gap-2 md:grid-cols-[auto_1fr_auto] md:gap-5 md:rounded-2xl md:border md:border-slate-200 md:bg-white md:px-5 md:py-3 md:shadow-sm md:dark:border-slate-700 md:dark:bg-slate-800">
        <p className="text-lg font-bold md:whitespace-nowrap">
          Question {index + 1} of {questions.length}
        </p>
        <div className="flex items-center gap-2 md:col-start-3 md:row-start-1">
          {limit ? (
            <span className={`rounded-lg px-3 py-1 font-mono text-lg font-bold ${secondsLeft <= 60 ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`} role="timer" aria-label={`Time left ${mmss(secondsLeft)}`}>
              ⏱ {mmss(secondsLeft)}
            </span>
          ) : null}
          <button type="button" className="btn btn-ghost !min-h-[44px]" onClick={() => navigate('/')}>Quit</button>
        </div>
        <div className="col-span-2 h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 md:col-span-1 md:col-start-2 md:row-start-1" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={index} aria-label="Test progress">
          <div className="h-full bg-brand-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <QuestionView
        key={q.id}
        question={q}
        evaluation={phase === 'feedback' && current ? current.evaluation : null}
        audioOnce={config.audioOnce}
        onSubmit={submit}
        onSkip={() => submit(null)}
      />

      {phase === 'feedback' && current && (
        <>
          <FeedbackPanel evaluation={current.evaluation} question={q} />
          <button type="button" className="btn btn-primary w-full" onClick={next} autoFocus>
            {index + 1 >= questions.length ? 'See results' : 'Next question'} <span aria-hidden="true">→</span>
          </button>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">Press Enter to continue</p>
        </>
      )}

      {blocker.state === 'blocked' && (
        <Modal
          title="Leave this test?"
          confirmLabel="Leave test"
          cancelLabel="Keep going"
          danger
          onConfirm={() => {
            stopSpeaking()
            blocker.proceed()
          }}
          onCancel={() => blocker.reset()}
        >
          Your test is still in progress. If you leave now, this test will not be scored.
        </Modal>
      )}
    </div>
  )
}
