export * from '../prisma/seeders/seedRoles.js'
export * from '../prisma/seeders/seedPermissions.js'
export * from '../prisma/seeders/seedUsers.js'

import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export * from '@prisma/client'
