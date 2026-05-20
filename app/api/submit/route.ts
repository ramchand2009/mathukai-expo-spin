import { NextResponse } from 'next/server'
import { hasDatabase, saveLeadEntry } from '../../../lib/db'
import type { LeadEntry } from '../../../lib/rewards'

function normalizeEntry(payload: Partial<LeadEntry>): LeadEntry {
  return {
    name: String(payload.name || '').trim(),
    phone: String(payload.phone || '').trim(),
    skin_concern: String(payload.skin_concern || 'Not specified').trim(),
    optin: Boolean(payload.optin),
    reward: String(payload.reward || '').trim(),
    source: String(payload.source || 'expo_spin').trim(),
    timestamp: String(payload.timestamp || new Date().toISOString()),
  }
}

export async function POST(request: Request) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  const payload = normalizeEntry(await request.json())

  if (!payload.name || !payload.phone || !payload.reward) {
    return NextResponse.json({ error: 'Name, phone, and reward are required' }, { status: 400 })
  }

  try {
    if (hasDatabase()) {
      await saveLeadEntry(payload)
    } else {
      console.log('DATABASE_URL not configured. Entry would be saved:', payload)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const status = message.includes('already claimed') ? 409 : message.includes('claim limit') ? 410 : 500

    return NextResponse.json(
      { error: message || 'Database save failed' },
      { status }
    )
  }

  if (!webhookUrl || webhookUrl.includes('example.com') || webhookUrl.includes('YOUR_N8N')) {
    return NextResponse.json({ status: 'ok', message: 'Entry saved. Webhook not configured yet.' })
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const text = await response.text()

    return NextResponse.json({
      status: 'ok',
      webhook_status: response.ok ? 'sent' : 'failed',
      webhook_body: text,
    })
  } catch (error) {
    return NextResponse.json({
      status: 'ok',
      webhook_status: 'failed',
      webhook_error: error instanceof Error ? error.message : String(error),
    })
  }
}
