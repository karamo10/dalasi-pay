import { PrismaClient } from '@/src/lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

/**
 * Augmented global object used to persist the Prisma singleton across
 * Next.js hot-module replacements in development.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/** PostgreSQL connection string read from the environment. */
const connectionString = `${process.env.DATABASE_URL}`

/** Prisma driver adapter that connects to PostgreSQL. */
const adapter = new PrismaPg({ connectionString })

/**
 * Singleton PrismaClient instance backed by the PostgreSQL adapter.
 * Re-uses the client cached on `globalThis` in development to avoid
 * exhausting the connection pool during hot-module replacement.
 */
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}