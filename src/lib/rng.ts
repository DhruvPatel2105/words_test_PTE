export type Rng = () => number

export function shuffle<T>(items: readonly T[], rnd: Rng = Math.random): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function pick<T>(items: readonly T[], rnd: Rng = Math.random): T {
  return items[Math.floor(rnd() * items.length)]
}

export function sample<T>(items: readonly T[], n: number, rnd: Rng = Math.random): T[] {
  return shuffle(items, rnd).slice(0, n)
}

export function randInt(min: number, max: number, rnd: Rng = Math.random): number {
  return min + Math.floor(rnd() * (max - min + 1))
}
