export type Reward = {
  label: string
  probability: number
  color: string
}

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
    label: '₹30 OFF',
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
