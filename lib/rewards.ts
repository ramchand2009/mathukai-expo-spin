export type Reward = {
  label: string
  probability: number
  color: string
}

export const rewards: Reward[] = [
  {
    label: 'Free Lipbalm',
    probability: 20,
    color: '#d7f6d7',
  },
  {
    label: 'Free Soap Sample',
    probability: 20,
    color: '#c3edc2',
  },
  {
    label: '₹30 OFF',
    probability: 25,
    color: '#b7e5b0',
  },
  {
    label: 'Buy 2 Get 1',
    probability: 20,
    color: '#97d18b',
  },
  {
    label: 'Surprise Gift',
    probability: 10,
    color: '#76b96b',
  },
  {
    label: 'Expo Combo Offer',
    probability: 5,
    color: '#4b7f47',
  },
]
