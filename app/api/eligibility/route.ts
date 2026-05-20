import { NextResponse } from 'next/server'
import { hasDatabase, hasLeadEntryForPhone } from '../../../lib/db'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const phone = url.searchParams.get('phone')?.trim()

  if (!phone) {
    return NextResponse.json({ eligible: false, reason: 'Mobile number is required' }, { status: 400 })
  }

  if (!hasDatabase()) {
    return NextResponse.json({ eligible: true, source: 'local' })
  }

  try {
    const alreadyClaimed = await hasLeadEntryForPhone(phone)

    if (alreadyClaimed) {
      return NextResponse.json({
        eligible: false,
        reason: 'This mobile number has already claimed a reward.',
        source: 'database',
      })
    }

    return NextResponse.json({ eligible: true, source: 'database' })
  } catch (error) {
    return NextResponse.json(
      {
        eligible: false,
        reason: error instanceof Error ? error.message : 'Could not check eligibility',
        source: 'database',
      },
      { status: 500 }
    )
  }
}
