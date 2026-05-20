'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { entriesStorageKey, LeadEntry, normalizeRewards, Reward, rewards, rewardsStorageKey } from '../../lib/rewards'

const blankReward: Reward = {
  label: '',
  probability: 10,
  color: '#34d399',
  inventoryLimit: null,
}

function csvValue(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

export default function DashboardPage() {
  const [draftRewards, setDraftRewards] = useState<Reward[]>(rewards)
  const [entries, setEntries] = useState<LeadEntry[]>([])
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingEntries, setLoadingEntries] = useState(true)

  const totalChance = useMemo(
    () => draftRewards.reduce((sum, reward) => sum + Number(reward.probability || 0), 0),
    [draftRewards]
  )

  useEffect(() => {
    const loadRewards = async () => {
      try {
        const response = await fetch('/api/offers?scope=dashboard', { cache: 'no-store' })
        if (!response.ok) throw new Error('Could not load offers')
        const body = await response.json()
        setDraftRewards(normalizeRewards(body.rewards))
      } catch {
        try {
          const savedRewards = window.localStorage.getItem(rewardsStorageKey)
          setDraftRewards(normalizeRewards(savedRewards ? JSON.parse(savedRewards) : rewards))
        } catch {
          setDraftRewards(rewards)
        }
      }
    }

    loadRewards()

    const loadEntries = async () => {
      setLoadingEntries(true)
      try {
        const response = await fetch('/api/entries', { cache: 'no-store' })
        if (!response.ok) throw new Error('Could not load entries')
        const body = await response.json()
        setEntries(Array.isArray(body.entries) ? body.entries : [])
      } catch {
        try {
          const savedEntries = window.localStorage.getItem(entriesStorageKey)
          setEntries(savedEntries ? JSON.parse(savedEntries) : [])
        } catch {
          setEntries([])
        }
      } finally {
        setLoadingEntries(false)
      }
    }

    loadEntries()
  }, [])

  const updateReward = (index: number, field: keyof Reward, value: string) => {
    setDraftRewards(current =>
      current.map((reward, rewardIndex) => {
        if (rewardIndex !== index) return reward

        const nextValue =
          field === 'probability'
            ? Number(value)
            : field === 'inventoryLimit'
              ? value.trim() === ''
                ? null
                : Number(value)
              : value

        return {
          ...reward,
          [field]: nextValue,
        }
      })
    )
    setMessage('')
  }

  const addReward = () => {
    setDraftRewards(current => [...current, { ...blankReward }])
    setMessage('')
  }

  const removeReward = (index: number) => {
    setDraftRewards(current => current.filter((_, rewardIndex) => rewardIndex !== index))
    setMessage('')
  }

  const resetRewards = async () => {
    setDraftRewards(rewards)
    window.localStorage.setItem(rewardsStorageKey, JSON.stringify(rewards))
    setMessage('Default offers restored. Click Save offers to publish them to all devices.')
  }

  const saveRewards = async () => {
    const normalized = normalizeRewards(draftRewards)
    setSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewards: normalized }),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.error || 'Could not save offers')
      }

      const body = await response.json()
      const savedRewards = normalizeRewards(body.rewards)
      window.localStorage.setItem(rewardsStorageKey, JSON.stringify(savedRewards))
      setDraftRewards(savedRewards)
      setMessage('Offers saved globally. Mobile and desktop will load this latest wheel.')
    } catch (error) {
      window.localStorage.setItem(rewardsStorageKey, JSON.stringify(normalized))
      setDraftRewards(normalized)
      setMessage(
        `Saved in this browser only. ${error instanceof Error ? error.message : 'Database save failed.'}`
      )
    } finally {
      setSaving(false)
    }
  }

  const exportEntries = () => {
    const header = ['Name', 'Phone', 'Skin problems', 'Reward', 'Opt in', 'Source', 'Timestamp']
    const rows = entries.map(entry => [
      entry.name,
      entry.phone,
      entry.skin_concern,
      entry.reward,
      entry.optin ? 'Yes' : 'No',
      entry.source,
      entry.timestamp,
    ])
    const csv = [header, ...rows].map(row => row.map(csvValue).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `mathukai-spin-leads-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearEntries = async () => {
    try {
      const response = await fetch('/api/entries', { method: 'DELETE' })
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.error || 'Could not clear database entries')
      }
      setEntries([])
      window.localStorage.removeItem(entriesStorageKey)
      setMessage('Lead entries cleared from the database.')
    } catch (error) {
      window.localStorage.removeItem(entriesStorageKey)
      setEntries([])
      setMessage(`Local leads cleared. ${error instanceof Error ? error.message : 'Database clear failed.'}`)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-brand-100 px-4 py-8 text-brand-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-brand-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-600">Banu Herbals</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">Spin Wheel Dashboard</h1>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-brand-700 bg-white px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Open spin wheel
          </Link>
        </header>

        <section className="rounded-3xl border border-brand-200 bg-white p-5 shadow-xl shadow-brand-200/30 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-brand-900">Dynamic offers</h2>
              <p className="mt-1 text-sm text-brand-700">
                Add offers, winning chance, and optional stock limit. Total configured chance: {totalChance}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-full border border-brand-700 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                onClick={addReward}
              >
                Add offer
              </button>
              <button
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={resetRewards}
              >
                Reset
              </button>
              <button
                className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-brand-300"
                disabled={saving}
                onClick={saveRewards}
              >
                {saving ? 'Saving...' : 'Save offers'}
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {draftRewards.map((reward, index) => (
              <div
                className="grid gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-4 sm:grid-cols-[1fr_110px_140px_96px_auto] sm:items-end"
                key={index}
              >
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Offer</span>
                  <input
                    className="w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none ring-brand-400 transition focus:ring-2"
                    value={reward.label}
                    onChange={event => updateReward(index, 'label', event.target.value)}
                    placeholder="Example: Free sample"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Chance</span>
                  <input
                    className="w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none ring-brand-400 transition focus:ring-2"
                    min="1"
                    type="number"
                    value={reward.probability}
                    onChange={event => updateReward(index, 'probability', event.target.value)}
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Limit</span>
                  <input
                    className="w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none ring-brand-400 transition focus:ring-2"
                    min="0"
                    placeholder="Unlimited"
                    type="number"
                    value={reward.inventoryLimit ?? ''}
                    onChange={event => updateReward(index, 'inventoryLimit', event.target.value)}
                  />
                  {reward.inventoryLimit !== null && reward.inventoryLimit !== undefined && (
                    <span className="block text-xs font-medium text-brand-700">
                      Claimed: {reward.claimedCount || 0}/{reward.inventoryLimit}
                    </span>
                  )}
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Color</span>
                  <input
                    className="h-12 w-full rounded-2xl border border-brand-200 bg-white px-2 py-2"
                    type="color"
                    value={reward.color}
                    onChange={event => updateReward(index, 'color', event.target.value)}
                  />
                </label>
                <button
                  className="rounded-full border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                  onClick={() => removeReward(index)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {message && (
            <p className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-900">
              {message}
            </p>
          )}
        </section>

        <section className="rounded-3xl border border-brand-200 bg-white p-5 shadow-xl shadow-brand-200/30 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-brand-900">Customer entries</h2>
              <p className="mt-1 text-sm text-brand-700">
                {loadingEntries ? 'Loading entries...' : `${entries.length} entries captured after successful submission.`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-brand-300"
                disabled={!entries.length || loadingEntries}
                onClick={exportEntries}
              >
                Export CSV
              </button>
              <button
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!entries.length || loadingEntries}
                onClick={clearEntries}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.2em] text-brand-600">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Skin problems</th>
                  <th className="px-3 py-2">Reward</th>
                  <th className="px-3 py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {loadingEntries ? (
                  <tr>
                    <td className="rounded-2xl bg-brand-50/70 px-3 py-6 text-center text-brand-700" colSpan={5}>
                      Loading customer entries...
                    </td>
                  </tr>
                ) : entries.length ? (
                  entries.slice(0, 25).map(entry => (
                    <tr className="bg-brand-50/70" key={`${entry.phone}-${entry.timestamp}`}>
                      <td className="rounded-l-2xl px-3 py-3 font-semibold text-brand-900">{entry.name}</td>
                      <td className="px-3 py-3 text-brand-800">{entry.phone}</td>
                      <td className="px-3 py-3 text-brand-800">{entry.skin_concern}</td>
                      <td className="px-3 py-3 font-semibold text-brand-900">{entry.reward}</td>
                      <td className="rounded-r-2xl px-3 py-3 text-brand-700">
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="rounded-2xl bg-brand-50/70 px-3 py-6 text-center text-brand-700" colSpan={5}>
                      No customer entries saved yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
