import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Use PostgreSQL adapter for production (Supabase)
  // Falls back to SQLite adapter logic if needed
  const databaseUrl = process.env.DATABASE_URL
  
  if (databaseUrl && databaseUrl.includes('supabase')) {
    // Supabase PostgreSQL via pooler
    const pool = new pg.Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
      max: 5,
    })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
  }
  
  // Default: direct connection (works with SQLite or direct PG)
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
