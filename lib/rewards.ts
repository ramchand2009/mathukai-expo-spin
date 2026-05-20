export type Reward = {
  label: string
  probability: number
  color: string
}

export type LeadEntry = {
  name: string
  phone: string
  skin_concern: string
  optin: boolean
  reward: string
  source: string
  timestamp: string
}

export const rewardsStorageKey = 'mathukai-spin-wheel-rewards'
export const entriesStorageKey = 'mathukai-spin-wheel-entries'

export const rewards: Reward[] = [
  {
    label: 'Free Lipbalm',
    probability: 20,
    color: '#f97316',
  },
  {
    label: 'Free Soap Sample',
    probability: 20,
    color: '#facc15',
  },
  {
    label: 'Rs.30 OFF',
    probability: 25,
    color: '#60a5fa',
  },
  {
    label: 'Buy 2 Get 1',
    probability: 20,
    color: '#34d399',
  },
  {
    label: 'Surprise Gift',
    probability: 10,
    color: '#a855f7',
  },
  {
    label: 'Expo Combo Offer',
    probability: 5,
    color: '#ec4899',
  },
]

export function normalizeRewards(candidate: unknown): Reward[] {
  if (!Array.isArray(candidate)) return rewards

  const normalized = candidate
    .map(item => {
      if (!item || typeof item !== 'object') return null

      const reward = item as Partial<Reward>
      const label = typeof reward.label === 'string' ? reward.label.trim() : ''
      const probability = Number(reward.probability)
      const color =
        typeof reward.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(reward.color) ? reward.color : '#34d399'

      if (!label || !Number.isFinite(probability) || probability <= 0) return null

      return {
        label,
        probability,
        color,
      }
    })
    .filter((item): item is Reward => Boolean(item))

  return normalized.length ? normalized : rewards
}
