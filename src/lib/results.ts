export function buildMessage(percent: number): { text: string; emoji: string; className: string } {
  if (percent >= 90) return { text: 'Excellent!', emoji: '🌟', className: 'text-green-700 dark:text-green-400' }
  if (percent >= 70) return { text: 'Good', emoji: '👍', className: 'text-brand-700 dark:text-brand-100' }
  return { text: 'Keep practising', emoji: '💪', className: 'text-amber-700 dark:text-amber-300' }
}
