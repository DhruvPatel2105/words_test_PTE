import type { Mode } from '../quiz/types'

export const modeLabel = (m: Mode): string =>
  ({ quick: 'Quick Practice', mock: 'Mock Test', custom: 'Custom Practice', mistakes: 'My Mistakes', retry: 'Retry Wrong Words' })[m]

export function fmtDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function fmtDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m} min ${s} sec` : `${s} sec`
}
