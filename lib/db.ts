import { Pool } from 'pg'
import type { LeadEntry, Reward } from './rewards'

let pool: Pool | null = null

function getPool() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) return null

  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    })
  }

  return pool
}

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL)
}

async function ensureOfferTable() {
  const client = getPool()
  if (!client) throw new Error('DATABASE_URL is not configured')

  await client.query(`
    create table if not exists spin_wheel_offers (
      id serial primary key,
      label text not null,
      probability numeric not null,
      color text not null,
      sort_order integer not null default 0,
      is_active boolean not null default true,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `)
}

async function ensureEntryTable() {
  const client = getPool()
  if (!client) throw new Error('DATABASE_URL is not configured')

  await client.query(`
    create table if not exists spin_wheel_entries (
      id serial primary key,
      name text not null,
      phone text not null,
      skin_concern text not null,
      optin boolean not null default false,
      reward text not null,
      source text not null,
      entry_timestamp timestamptz not null,
      created_at timestamptz not null default now()
    )
  `)
}

export async function getStoredRewards() {
  await ensureOfferTable()

  const client = getPool()
  if (!client) throw new Error('DATABASE_URL is not configured')

  const result = await client.query<Reward>(`
    select label, probability::float as probability, color
    from spin_wheel_offers
    where is_active = true
    order by sort_order asc, id asc
  `)

  return result.rows
}

export async function replaceStoredRewards(rewards: Reward[]) {
  await ensureOfferTable()

  const client = getPool()
  if (!client) throw new Error('DATABASE_URL is not configured')

  const dbClient = await client.connect()

  try {
    await dbClient.query('begin')
    await dbClient.query('delete from spin_wheel_offers')

    for (const [index, reward] of rewards.entries()) {
      await dbClient.query(
        `
          insert into spin_wheel_offers (label, probability, color, sort_order)
          values ($1, $2, $3, $4)
        `,
        [reward.label, reward.probability, reward.color, index]
      )
    }

    await dbClient.query('commit')
  } catch (error) {
    await dbClient.query('rollback')
    throw error
  } finally {
    dbClient.release()
  }
}

export async function saveLeadEntry(entry: LeadEntry) {
  await ensureEntryTable()

  const client = getPool()
  if (!client) throw new Error('DATABASE_URL is not configured')

  await client.query(
    `
      insert into spin_wheel_entries (name, phone, skin_concern, optin, reward, source, entry_timestamp)
      values ($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      entry.name,
      entry.phone,
      entry.skin_concern,
      entry.optin,
      entry.reward,
      entry.source,
      entry.timestamp,
    ]
  )
}

export async function getLeadEntries(limit = 500) {
  await ensureEntryTable()

  const client = getPool()
  if (!client) throw new Error('DATABASE_URL is not configured')

  const result = await client.query<LeadEntry>(
    `
      select
        name,
        phone,
        skin_concern,
        optin,
        reward,
        source,
        entry_timestamp::text as timestamp
      from spin_wheel_entries
      order by entry_timestamp desc, id desc
      limit $1
    `,
    [limit]
  )

  return result.rows
}

export async function clearLeadEntries() {
  await ensureEntryTable()

  const client = getPool()
  if (!client) throw new Error('DATABASE_URL is not configured')

  await client.query('delete from spin_wheel_entries')
}
