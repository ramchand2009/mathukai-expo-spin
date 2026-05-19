'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import LeadForm, { FormValues } from '../components/LeadForm'
import SpinWheel from '../components/SpinWheel'
import { rewards } from '../lib/rewards'

const sourceTag = 'expo_may_2026'

export default function HomePage() {
  const [stage, setStage] = useState<'form' | 'spin' | 'result'>('form')
  const [visitor, setVisitor] = useState<FormValues | null>(null)
  const [reward, setReward] = useState<string>('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [feedback, setFeedback] = useState<string>('')

  const heading = useMemo(() => {
    if (stage === 'form') return 'Spin & Win at Mathukai Organic Expo'
    if (stage === 'spin') return 'Ready to Spin?'
    return 'Congratulations 🎉'
  }, [stage])

  const handleSubmit = (values: FormValues) => {
    setVisitor(values)
    setStage('spin')
    setReward('')
    setStatus('idle')
    setFeedback('')
  }

  const handleSpinComplete = async (selectedReward: string) => {
    if (!visitor) return
    setReward(selectedReward)
    setStage('result')
    setStatus('saving')
    setFeedback('Sending your reward details…')

    const payload = {
      name: visitor.name,
      phone: visitor.phone,
      skin_concern: visitor.skinConcern || 'Not specified',
      optin: visitor.optin,
      reward: selectedReward,
      source: sourceTag,
      timestamp: new Date().toISOString(),
    }

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(errorBody || 'Webhook request failed')
      }

      setStatus('success')
      setFeedback('Your reward has been recorded. Please show this message at the stall to claim it.')
    } catch (error) {
      setStatus('error')
      setFeedback(`Could not send your entry. ${error instanceof Error ? error.message : ''}`)
    }
  }

  const resetFlow = () => {
    setStage('form')
    setVisitor(null)
    setReward('')
    setStatus('idle')
    setFeedback('')
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-brand-100 text-brand-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-brand-200 bg-white/95 p-6 shadow-2xl shadow-brand-200/40 backdrop-blur sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-start">
            <section className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="rounded-3xl bg-brand-50 p-3 text-brand-700 ring-1 ring-brand-100">
                  <div className="text-xl font-semibold">🌿</div>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-brand-600">Mathukai Organic Expo</p>
                  <h1 className="mt-2 text-4xl font-bold tracking-tight text-brand-900 sm:text-5xl">
                    {heading}
                  </h1>
                </div>
              </div>

              <div className="space-y-4 rounded-3xl border border-brand-100 bg-brand-50/80 p-6">
                <p className="text-brand-700">
                  Scan QR, fill your details, opt in for WhatsApp offers, and spin to win one of our herbal rewards.
                </p>
                <ul className="grid gap-2 text-sm text-brand-700 sm:grid-cols-2">
                  <li>✓ Free Lipbalm</li>
                  <li>✓ Free Soap Sample</li>
                  <li>✓ ₹30 OFF</li>
                  <li>✓ Buy 2 Get 1</li>
                  <li>✓ Surprise Gift</li>
                  <li>✓ Expo Combo Offer</li>
                </ul>
              </div>

              <AnimatePresence mode="wait">
                {stage === 'form' ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                  >
                    <LeadForm onSubmit={handleSubmit} />
                  </motion.div>
                ) : stage === 'spin' ? (
                  <motion.div
                    key="spin"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                  >
                    <SpinWheel rewards={rewards} onComplete={handleSpinComplete} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-6 shadow-inner shadow-emerald-100/60">
                      <p className="text-sm uppercase tracking-[0.3em] text-emerald-700">You won</p>
                      <h2 className="mt-3 text-3xl font-bold text-emerald-900 sm:text-4xl">{reward}</h2>
                      <p className="mt-4 text-brand-700">{feedback}</p>
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button
                          className="inline-flex items-center justify-center rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
                          onClick={resetFlow}
                        >
                          New attendee
                        </button>
                        <a
                          href="https://wa.me/yourwhatsappnumber"
                          className="inline-flex items-center justify-center rounded-full border border-brand-700 bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                        >
                          Contact support
                        </a>
                      </div>
                      {status === 'error' && (
                        <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                          Unable to record entry. Please try again or ask the stall staff for help.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <aside className="space-y-6 rounded-[2rem] border border-brand-100 bg-brand-50/90 p-6 text-brand-800 shadow-xl shadow-brand-100/50 sm:p-8">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.3em] text-brand-600">How it works</p>
                <ol className="space-y-4 text-sm leading-7">
                  <li>1. Enter your name, phone, and skin concern.</li>
                  <li>2. Opt in to receive WhatsApp offers.</li>
                  <li>3. Tap “Spin Now” and watch the wheel land on your reward.</li>
                  <li>4. Show the message at the stall to claim your gift.</li>
                </ol>
              </div>
              <div className="rounded-3xl bg-brand-100/80 p-5">
                <p className="text-sm font-semibold text-brand-900">Expo lead tracking</p>
                <p className="mt-3 text-sm text-brand-700">
                  Entries are forwarded to your n8n webhook, stored in PostgreSQL, and then delivered to WhatsApp and Meta tracking workflows.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  )
}
