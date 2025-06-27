import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// 支持本地和 Vercel PostgreSQL
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL

if (!connectionString) {
  console.warn('No database connection string found. Database operations will fail gracefully.')
}

// 针对 Vercel 环境优化的连接池配置
const sql = connectionString ? postgres(connectionString, {
  max: 1,                    // 最大连接数 - Vercel 限制严格
  idle_timeout: 20,          // 空闲20秒后关闭连接
  max_lifetime: 60 * 30,     // 连接最大生存30分钟
  connect_timeout: 10,       // 连接超时10秒
  prepare: false,            // 禁用预准备语句，减少内存使用
  onnotice: () => {},        // 忽略通知，减少噪音
  transform: {
    undefined: null          // 将 undefined 转换为 null
  }
}) : null

export const db = sql ? drizzle(sql, { schema }) : null

export * from './schema' 