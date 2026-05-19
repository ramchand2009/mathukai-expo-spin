'use client'

import { FormEvent, useState } from 'react'

export type FormValues = {
  name: string
  phone: string
  skinConcern: string
  optin: boolean
}

type LeadFormProps = {
  onSubmit: (values: FormValues) => void
}

const skinOptions = [
  'Pimples',
  'Dry Skin',
  'Pigmentation',
  'Hair Fall',
  'Tan',
  'Others',
]

export default function LeadForm({ onSubmit }: LeadFormProps) {
  const [form, setForm] = useState<FormValues>({
    name: '',
    phone: '',
    skinConcern: '',
    optin: true,
  })
  const [error, setError] = useState('')

  const handleChange = (field: keyof FormValues, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.name.trim()) {
      setError('Please enter your name.')
      return
    }

    if (!/^[0-9]{10,15}$/.test(form.phone)) {
      setError('Please enter a valid mobile number.')
      return
    }

    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-brand-800">Name *</label>
        <input
          value={form.name}
          onChange={event => handleChange('name', event.target.value)}
          placeholder="Priya Sharma"
          className="w-full rounded-3xl border border-brand-200 bg-brand-50/80 px-4 py-3 text-sm text-brand-900 outline-none ring-1 ring-transparent transition focus:border-brand-400 focus:ring-brand-200"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-brand-800">Mobile number *</label>
        <input
          type="tel"
          value={form.phone}
          onChange={event => handleChange('phone', event.target.value)}
          placeholder="9876543210"
          className="w-full rounded-3xl border border-brand-200 bg-brand-50/80 px-4 py-3 text-sm text-brand-900 outline-none ring-1 ring-transparent transition focus:border-brand-400 focus:ring-brand-200"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-brand-800">Skin concern</label>
        <select
          value={form.skinConcern}
          onChange={event => handleChange('skinConcern', event.target.value)}
          className="w-full rounded-3xl border border-brand-200 bg-brand-50/80 px-4 py-3 text-sm text-brand-900 outline-none ring-1 ring-transparent transition focus:border-brand-400 focus:ring-brand-200"
        >
          <option value="">Select one</option>
          {skinOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-start gap-3 rounded-3xl border border-brand-100 bg-brand-50/80 p-4 text-sm text-brand-800">
        <input
          type="checkbox"
          checked={form.optin}
          onChange={event => handleChange('optin', event.target.checked)}
          className="mt-1 h-5 w-5 rounded border-brand-300 text-brand-700 focus:ring-brand-500"
        />
        <span>
          I agree to receive WhatsApp offers and updates from Mathukai Organic.
        </span>
      </label>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        className="w-full rounded-full bg-brand-700 px-6 py-4 text-sm font-semibold text-white transition hover:bg-brand-800"
      >
        Spin Now
      </button>
    </form>
  )
}
