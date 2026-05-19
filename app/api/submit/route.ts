import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) {
    return NextResponse.json({ error: 'Missing N8N_WEBHOOK_URL environment variable' }, { status: 500 })
  }

  const payload = await request.json()

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const text = await response.text()
    if (!response.ok) {
      return NextResponse.json({ error: 'Webhook request failed', details: text }, { status: 500 })
    }

    return NextResponse.json({ status: 'ok', body: text })
  } catch (error) {
    return NextResponse.json(
      { error: 'Network request failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
