import { PrismaClient } from '@repo/database'
import type { SignUpInput } from '@/resolvers/types/AuthTypes'
import type { SignInInput } from '@/resolvers/types/SignInTypes'
import { comparePassword, hashPassword, signToken } from '@/utils/auth'

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

  async authenticateUser({ email, password }: SignInInput) {
    const found = await this.prisma.user.findUnique({
      where: { email },
      select: {
        user_id: true,
        email: true,
        name: true,
        passwordHash: true,
      },
    })

    // One generic error for "no such user" and "wrong password" alike, so the
    // response cannot be used to discover which emails have accounts.
    if (!found?.passwordHash || !(await comparePassword(password, found.passwordHash))) {
      throw new Error('Invalid email or password')
    }

    const { passwordHash: _passwordHash, ...user } = found
    const token = signToken({
      sub: user.user_id,
      email: user.email,
      name: user.name ?? undefined,
    })

    return { user, token }
  }
}
