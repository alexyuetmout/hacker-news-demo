import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// 支持本地和 Vercel PostgreSQL
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL

if (!connectionString) {
  console.warn('No database connection string found. Database operations will fail gracefully.')
}

const sql = connectionString ? postgres(connectionString) : null
export const db = sql ? drizzle(sql, { schema }) : null

export * from './schema' 