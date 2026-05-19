'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { Reward } from '../lib/rewards'

type SpinWheelProps = {
  rewards: Reward[]
  onComplete: (reward: string) => void
}

type WheelSegment = {
  reward: Reward
  start: number
  end: number
  mid: number
}

export default function SpinWheel({ rewards, onComplete }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winningReward, setWinningReward] = useState<Reward | null>(null)
  const [message, setMessage] = useState('')

  const totalWeight = useMemo(() => rewards.reduce((sum, reward) => sum + reward.probability, 0), [rewards])

  const segments = useMemo<WheelSegment[]>(() => {
    let cursor = 0
    return rewards.map(reward => {
      const sweep = (reward.probability / totalWeight) * 360
      const segment = {
        reward,
        start: cursor,
        end: cursor + sweep,
        mid: cursor + sweep / 2,
      }
      cursor += sweep
      return segment
    })
  }, [rewards, totalWeight])

  const gradient = useMemo(() => {
    return `conic-gradient(${segments
      .map(segment => `${segment.reward.color} ${segment.start}deg ${segment.end}deg`)
      .join(', ')})`
  }, [segments])

  const chooseWinner = () => {
    const random = Math.random() * totalWeight
    let cursor = 0
    for (const segment of segments) {
      cursor += segment.reward.probability
      if (random <= cursor) {
        return segment
      }
    }
    return segments[segments.length - 1]
  }

  const spin = () => {
    if (spinning) return
    const winner = chooseWinner()
    setWinningReward(winner.reward)
    setMessage('Spinning…')
    setSpinning(true)
    const target = 360 * 7 + (360 - winner.mid)
    setRotation(target)
  }

  useEffect(() => {
    if (!spinning) return
    const timer = window.setTimeout(() => {
      setSpinning(false)
      setMessage(`You won ${winningReward?.label}!`)
      if (winningReward) {
        onComplete(winningReward.label)
      }
    }, 4500)

    return () => window.clearTimeout(timer)
  }, [spinning, winningReward, onComplete])

  return (
    <div className="space-y-6">
      <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-brand-100 bg-brand-50/90 p-6 shadow-xl shadow-brand-100/40">
        <div className="relative mx-auto flex h-[320px] w-[320px] items-center justify-center rounded-full border-4 border-brand-100 bg-white shadow-inner shadow-brand-200/20 sm:h-[360px] sm:w-[360px]">
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: gradient, transform: `rotate(${rotation}deg)` }}
          />
          <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.6),transparent_35%)]" />
          <div className="absolute inset-0 rounded-full border border-brand-100" />
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <div className="h-12 w-12 rotate-[45deg] rounded-b-3xl bg-brand-700 shadow-2xl shadow-brand-700/30" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-brand-900 text-center text-sm font-semibold text-white shadow-lg shadow-brand-900/30">
              Spin
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-[2rem] border border-brand-200 bg-white/90 p-5 text-sm text-brand-700 shadow-sm">
        <p>
          Tap the button below to spin the wheel. The reward distribution is configured by probability, so every spin has a chance to win a surprise gift.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {rewards.map(reward => (
            <div key={reward.label} className="rounded-3xl border border-brand-100 bg-brand-50 px-4 py-3">
              <p className="text-sm font-semibold text-brand-900">{reward.label}</p>
              <p className="text-xs text-brand-600">Chance: {reward.probability}%</p>
            </div>
          ))}
        </div>
      </div>

      <button
        className="w-full rounded-full bg-brand-700 px-6 py-4 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-brand-300"
        onClick={spin}
        disabled={spinning}
      >
        {spinning ? 'Spinning...' : 'Start Spin'}
      </button>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4 text-center text-sm font-medium text-emerald-900"
        >
          {message}
        </motion.div>
      )}
    </div>
  )
}
