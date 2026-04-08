import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL

  if (databaseUrl) {
    // Use PostgreSQL adapter with the provided DATABASE_URL
    const pool = new pg.Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('supabase') ? { rejectUnauthorized: false } : false,
      max: 5,
    })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
  }

  // Fallback: try without adapter (may fail in Prisma 7)
  // This should only happen if DATABASE_URL is not set
  console.warn('DATABASE_URL not set, attempting PrismaClient without adapter')
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
