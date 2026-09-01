import { PrismaClient } from '@repo/database'
import type { SignUpInput } from '@/resolvers/types/AuthTypes'
import { hashPassword, signToken } from '@/utils/auth'

export interface UserServiceProps {
  prisma: PrismaClient
}

export class UserService {
  prisma: PrismaClient

  constructor({ prisma }: UserServiceProps) {
    this.prisma = prisma
  }

  findMany() {
    return this.prisma.user.findMany()
  }

  async createUser({ email, password, name }: SignUpInput) {
    const existing = await this.prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      throw new Error('Email already in use')
    }

    const passwordHash = await hashPassword(password)
    const user = await this.prisma.user.create({
      data: {
        email,
        name: name ?? null,
        passwordHash,
      },
      select: {
        user_id: true,
        email: true,
        name: true,
      },
    })
    const token = signToken({
      sub: user.user_id,
      email: user.email,
      name: user.name ?? undefined,
    })

    return { user, token }
  }
}
