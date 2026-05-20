import { NextResponse } from 'next/server'
import { clearLeadEntries, getLeadEntries, hasDatabase } from '../../../lib/db'

export async function GET() {
  if (!hasDatabase()) {
    return NextResponse.json({ entries: [], source: 'local' })
  }

  try {
    const entries = await getLeadEntries()
    return NextResponse.json({ entries, source: 'database' })
  } catch (error) {
    return NextResponse.json(
      {
        entries: [],
        source: 'database',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  if (!hasDatabase()) {
    return NextResponse.json({ error: 'DATABASE_URL is not configured' }, { status: 500 })
  }

  try {
    await clearLeadEntries()
    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
