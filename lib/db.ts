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
      inventory_limit integer,
      sort_order integer not null default 0,
      is_active boolean not null default true,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `)

  await client.query(`
    alter table spin_wheel_offers
    add column if not exists inventory_limit integer
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

  await client.query(`
    create index if not exists spin_wheel_entries_phone_idx
    on spin_wheel_entries (phone)
  `)

  await client.query(`
    create index if not exists spin_wheel_entries_reward_idx
    on spin_wheel_entries (reward)
  `)
}

export async function getStoredRewards(options: { includeSoldOut?: boolean } = {}) {
  await ensureEntryTable()
  await ensureOfferTable()

  const client = getPool()
  if (!client) throw new Error('DATABASE_URL is not configured')

  const result = await client.query<Reward>(
    `
      select
        offer.label,
        offer.probability::float as probability,
        offer.color,
        offer.inventory_limit as "inventoryLimit",
        count(entry.id)::int as "claimedCount"
      from spin_wheel_offers offer
      left join spin_wheel_entries entry on entry.reward = offer.label
      where offer.is_active = true
      group by offer.id
      having $1::boolean = true
        or offer.inventory_limit is null
        or count(entry.id) < offer.inventory_limit
      order by offer.sort_order asc, offer.id asc
    `,
    [Boolean(options.includeSoldOut)]
  )

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
          insert into spin_wheel_offers (label, probability, color, inventory_limit, sort_order)
          values ($1, $2, $3, $4, $5)
        `,
        [reward.label, reward.probability, reward.color, reward.inventoryLimit ?? null, index]
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
  await ensureOfferTable()
  await ensureEntryTable()

  const client = getPool()
  if (!client) throw new Error('DATABASE_URL is not configured')

  const dbClient = await client.connect()

  try {
    await dbClient.query('begin')
    await dbClient.query('select pg_advisory_xact_lock(hashtext($1))', [`phone:${entry.phone}`])
    await dbClient.query('select pg_advisory_xact_lock(hashtext($1))', [`reward:${entry.reward}`])

    const duplicateResult = await dbClient.query<{ exists: boolean }>(
      'select exists(select 1 from spin_wheel_entries where phone = $1) as exists',
      [entry.phone]
    )

    if (duplicateResult.rows[0]?.exists) {
      throw new Error('This mobile number has already claimed a reward.')
    }

    const inventoryResult = await dbClient.query<{ inventory_limit: number | null; claimed_count: number }>(
      `
        select
          offer.inventory_limit,
          count(entry.id)::int as claimed_count
        from spin_wheel_offers offer
        left join spin_wheel_entries entry on entry.reward = offer.label
        where offer.label = $1 and offer.is_active = true
        group by offer.id
        limit 1
      `,
      [entry.reward]
    )

    const inventory = inventoryResult.rows[0]
    if (inventory?.inventory_limit !== null && inventory?.inventory_limit !== undefined) {
      if (inventory.claimed_count >= inventory.inventory_limit) {
        throw new Error('This reward has reached its claim limit. Please spin again.')
      }
    }

    await dbClient.query(
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

    await dbClient.query('commit')
  } catch (error) {
    await dbClient.query('rollback')
    throw error
  } finally {
    dbClient.release()
  }
}

export async function hasLeadEntryForPhone(phone: string) {
  await ensureEntryTable()

  const client = getPool()
  if (!client) throw new Error('DATABASE_URL is not configured')

  const result = await client.query<{ exists: boolean }>(
    'select exists(select 1 from spin_wheel_entries where phone = $1) as exists',
    [phone]
  )

  return Boolean(result.rows[0]?.exists)
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
