import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema.js'
import { logger } from '../logger.js'

const { Pool } = pg

let _db: ReturnType<typeof drizzle> | null = null
let _pool: pg.Pool | null = null

export function getDb() {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    _pool = new Pool({ connectionString })
    _db = drizzle(_pool, { schema })
    logger.info('Database connection pool created')
  }
  return _db
}

export async function closeDb() {
  if (_pool) {
    await _pool.end()
    _pool = null
    _db = null
    logger.info('Database connection pool closed')
  }
}

export { schema }
