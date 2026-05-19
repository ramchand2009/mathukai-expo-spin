import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  const payload = await request.json()

  // If no webhook URL is set or it's a placeholder, just return success
  if (!webhookUrl || webhookUrl.includes('example.com') || webhookUrl.includes('YOUR_N8N')) {
    console.log('Webhook URL not configured. Entry would be saved:', payload)
    return NextResponse.json({ status: 'ok', message: 'Entry received. Webhook not configured yet.' })
  }

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
