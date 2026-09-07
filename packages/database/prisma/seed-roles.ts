import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { seedPermissions } from './seeders/seedPermissions.js'
import { seedRoles } from './seeders/seedRoles.js'

/**
 * Reference data, not demo data.
 *
 * Signup connects every new account to the Basic role, and the migrations only create the tables —
 * they insert no rows. Without this step a fresh database rejects every signup, so this has to run
 * anywhere the app runs, production included. It is idempotent (upsert / skipDuplicates), so
 * re-running it is safe.
 *
 * Deliberately does not seed demo users: `seeders/seedUsers.ts` creates an admin account whose
 * password is published in this repo. That belongs to `yarn seed`, for local development only.
 */
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding roles and permissions...')
  await seedPermissions(prisma)
  await seedRoles(prisma)
  console.log('✅ Roles and permissions ready.')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error('❌ Seed error:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
