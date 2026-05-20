import { NextResponse } from 'next/server'
import { getStoredRewards, hasDatabase, replaceStoredRewards } from '../../../lib/db'
import { normalizeRewards, rewards } from '../../../lib/rewards'

export async function GET() {
  if (!hasDatabase()) {
    return NextResponse.json({ rewards, source: 'default' })
  }

  try {
    const storedRewards = normalizeRewards(await getStoredRewards())
    return NextResponse.json({ rewards: storedRewards, source: 'database' })
  } catch (error) {
    return NextResponse.json(
      {
        rewards,
        source: 'default',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  if (!hasDatabase()) {
    return NextResponse.json({ error: 'DATABASE_URL is not configured' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const nextRewards = normalizeRewards(body?.rewards)
    await replaceStoredRewards(nextRewards)

    return NextResponse.json({ rewards: nextRewards, source: 'database' })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
