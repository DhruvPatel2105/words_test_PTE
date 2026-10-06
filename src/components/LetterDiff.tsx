import { diffLetters, type DiffPart } from '../lib/diff'

const show = (c?: string) => (c === ' ' ? ' ' : c)

function describe(parts: DiffPart[], given: string, expected: string): string {
  const notes = parts
    .filter((p) => p.kind !== 'same')
    .map((p) =>
      p.kind === 'wrong' ? `wrong letter ${p.given}, should be ${p.expected}` : p.kind === 'missing' ? `missing letter ${p.expected}` : `extra letter ${p.given}`,
    )
  return `You wrote ${given || 'nothing'}. Correct spelling: ${expected}. ${notes.join('; ')}`
}

/** Letter-by-letter comparison: wrong, missing and extra letters are highlighted (and marked, not only coloured). */
export default function LetterDiff({ given, expected }: { given: string; expected: string }) {
  const parts = diffLetters(given, expected)
  return (
    <div className="space-y-2" role="group" aria-label={describe(parts, given, expected)}>
      <div>
        <span className="mb-0.5 block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">You wrote</span>
        <div className="flex flex-wrap gap-0.5" aria-hidden="true">
          {parts.map((p, i) =>
            p.kind === 'missing' ? (
              <span key={i} className="tile border-2 border-dashed border-red-500 text-red-600 dark:text-red-400" title="missing letter">_</span>
            ) : (
              <span
                key={i}
                className={`tile ${p.kind === 'same' ? 'bg-slate-100 dark:bg-slate-700' : 'bg-red-600 text-white'} ${p.kind === 'extra' ? 'line-through' : ''}`}
              >
                {show(p.given)}
              </span>
            ),
          )}
        </div>
      </div>
      <div>
        <span className="mb-0.5 block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Correct</span>
        <div className="flex flex-wrap gap-0.5" aria-hidden="true">
          {parts
            .filter((p) => p.kind !== 'extra')
            .map((p, i) => (
              <span key={i} className={`tile ${p.kind === 'same' ? 'bg-slate-100 dark:bg-slate-700' : 'bg-green-600 text-white'}`}>
                {show(p.expected)}
              </span>
            ))}
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400" aria-hidden="true">
        <span className="font-semibold text-red-600 dark:text-red-400">Red</span> = wrong or extra letter ·{' '}
        <span className="font-semibold text-green-700 dark:text-green-400">Green</span> = letter you needed
      </p>
    </div>
  )
}
