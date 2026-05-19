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

const mobileLabelMap: Record<string, string> = {
  'Free Lipbalm': 'Lipbalm',
  'Free Soap Sample': 'Soap Sample',
  '₹30 OFF': '₹30 OFF',
  'Buy 2 Get 1': 'Buy 2 Get 1',
  'Surprise Gift': 'Surprise',
  'Expo Combo Offer': 'Combo',
}

const spinDurationMs = 8000
const spinTransition = 'transform 8s cubic-bezier(0.12, 0.85, 0.08, 1)'

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
    const target = 360 * 9 + (360 - winner.mid)
    setRotation(target)
  }

  const submitReward = () => {
    if (!winningReward || spinning) return
    onComplete(winningReward.label)
  }

  useEffect(() => {
    if (!spinning) return
    const timer = window.setTimeout(() => {
      setSpinning(false)
      setMessage(`You won ${winningReward?.label}! Tap submit to continue.`)
    }, spinDurationMs)

    return () => window.clearTimeout(timer)
  }, [spinning, winningReward])

  return (
    <div className="space-y-6">
      <div className="relative mx-auto w-full max-w-xl overflow-visible rounded-[2rem] border border-brand-100 bg-brand-50/90 p-5 shadow-xl shadow-brand-100/40 sm:p-6">
        <div className="relative mx-auto flex h-[300px] w-[300px] items-center justify-center sm:h-[440px] sm:w-[440px]">
          <div className="absolute inset-0 rounded-full border-[12px] border-slate-950 bg-slate-950/5 sm:border-[16px]" />
          <div className="absolute inset-3 rounded-full border-4 border-slate-950/80 bg-slate-100/90 shadow-inner shadow-slate-900/10 sm:inset-4" />
          <div className="absolute top-0 left-1/2 z-20 -translate-x-1/2 -translate-y-3 flex flex-col items-center gap-1">
            <div className="h-0 w-0 border-x-[16px] border-x-transparent border-b-[30px] border-b-rose-600 shadow-2xl shadow-rose-700/30 sm:border-x-[20px] sm:border-b-[36px]" />
            <div className="h-4 w-4 rounded-full bg-slate-950 border-2 border-white sm:h-5 sm:w-5" />
          </div>
          <div className="relative flex h-[260px] w-[260px] items-center justify-center rounded-full border-[12px] border-slate-950/90 bg-white shadow-2xl shadow-slate-950/10 sm:h-[370px] sm:w-[370px] sm:border-[16px]">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: gradient,
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? spinTransition : undefined,
                willChange: 'transform',
              }}
            />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? spinTransition : undefined,
                willChange: 'transform',
              }}
            >
              {segments.map(segment => {
                const isTinySegment = segment.reward.probability <= 5
                const isSmallSegment = segment.reward.probability <= 10
                const mobileLabelRadius = isTinySegment ? 76 : isSmallSegment ? 88 : 80
                const desktopLabelRadius = isTinySegment ? 116 : isSmallSegment ? 116 : 110
                const mobileLabelWidth = isTinySegment ? 58 : isSmallSegment ? 64 : 82
                const desktopLabelWidth = isTinySegment ? 62 : isSmallSegment ? 68 : 82
                const labelRotation = isTinySegment || isSmallSegment ? 90 : -segment.mid
                const mobileLabel = mobileLabelMap[segment.reward.label] || segment.reward.label

                return (
                  <div key={segment.reward.label} className="contents">
                    <div
                      key={`${segment.reward.label}-mobile`}
                      className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-md bg-white/85 px-1 py-0.5 text-center shadow-sm ring-1 ring-slate-950/10 backdrop-blur-sm sm:hidden"
                      style={{
                        width: mobileLabelWidth,
                        transform: `translate(-50%, -50%) rotate(${segment.mid}deg) translateY(-${mobileLabelRadius}px) rotate(${labelRotation}deg)`,
                      }}
                    >
                      <span
                        className="font-bold leading-tight text-slate-950"
                        style={{ fontSize: isTinySegment ? 8 : isSmallSegment ? 9 : 10 }}
                      >
                        {mobileLabel}
                      </span>
                    </div>
                    <div
                      key={`${segment.reward.label}-desktop`}
                      className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-xl bg-white/85 px-2 py-1 text-center shadow-sm ring-1 ring-slate-950/10 backdrop-blur-sm sm:flex"
                      style={{
                        width: desktopLabelWidth,
                        transform: `translate(-50%, -50%) rotate(${segment.mid}deg) translateY(-${desktopLabelRadius}px) rotate(${labelRotation}deg)`,
                      }}
                    >
                      <span
                        className="font-bold leading-tight text-slate-950"
                        style={{ fontSize: isTinySegment ? 8 : isSmallSegment ? 8 : 9 }}
                      >
                        {segment.reward.label}
                      </span>
                      <span className="mt-0.5 text-[7px] font-semibold leading-none text-slate-700">
                        Chance: {segment.reward.probability}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.75),transparent_35%)]" />
            <div className="absolute inset-0 rounded-full border border-slate-950/10" />
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.03),transparent_40%)]" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 text-center text-sm font-semibold text-white shadow-2xl shadow-slate-950/40 sm:h-20 sm:w-20">
                Spin
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[1.25rem] border border-slate-950/10 bg-white/90 p-4 shadow-sm sm:mt-6 sm:rounded-[1.5rem] sm:p-5">
          <p className="text-xs leading-5 text-slate-700 sm:text-sm">
            Tap the button below to spin the wheel. The reward distribution is configured by probability, so every spin has a chance to win a surprise gift.
          </p>
        </div>
      </div>

      <button
        className="w-full rounded-full bg-brand-700 px-6 py-4 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-brand-300"
        onClick={winningReward && !spinning ? submitReward : spin}
        disabled={spinning}
      >
        {spinning ? 'Spinning...' : winningReward ? 'Submit Reward' : 'Start Spin'}
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
