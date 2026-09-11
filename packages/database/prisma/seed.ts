import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { seedPermissions } from './seeders/seedPermissions.js'
import { seedRoles } from './seeders/seedRoles.js'
import { seedUsers } from './seeders/seedUsers.js'
import { seedMessages } from './seeders/seedMessages.js'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')
  await seedPermissions(prisma)
  await seedRoles(prisma)
  await seedUsers(prisma)
  await seedMessages(prisma)
  console.log('✅ All seeds completed successfully!')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error('❌ Seed error:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
