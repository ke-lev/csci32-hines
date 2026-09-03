import { PrismaClient } from '@repo/database'
import type { SignUpInput } from '@/resolvers/types/AuthTypes'
import type { SignInInput } from '@/resolvers/types/SignInTypes'
import { comparePassword, hashPassword, signToken } from '@/utils/auth'

export interface UserServiceProps {
  prisma: PrismaClient
}

function normalizeUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export class UserService {
  prisma: PrismaClient

  constructor({ prisma }: UserServiceProps) {
    this.prisma = prisma
  }

  findMany() {
    return this.prisma.user.findMany()
  }

  async createUser({ email, password, username }: SignUpInput) {
    const normalizedUsername = normalizeUsername(username)
    const normalizedEmail = email.trim().toLowerCase()

    if (!/^[a-z0-9][a-z0-9_-]{1,31}$/.test(normalizedUsername)) {
      throw new Error('Username must be 2–32 characters using letters, numbers, underscores, or hyphens')
    }

    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { username: normalizedUsername }],
      },
    })

    if (existing) {
      throw new Error(existing.username === normalizedUsername ? 'Username already in use' : 'Email already in use')
    }

    const passwordHash = await hashPassword(password)
    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        username: normalizedUsername,
        passwordHash,
      },
      select: {
        user_id: true,
        email: true,
        username: true,
      },
    })
    const token = signToken({
      sub: user.user_id,
      email: user.email,
      username: user.username,
    })

    return { user, token }
  }

  async authenticateUser({ username, password }: SignInInput) {
    const found = await this.prisma.user.findUnique({
      where: { username: normalizeUsername(username) },
      select: {
        user_id: true,
        email: true,
        username: true,
        passwordHash: true,
      },
    })

    // One generic error for "no such user" and "wrong password" alike, so the
    // response cannot be used to discover which usernames have accounts.
    if (!found?.passwordHash || !(await comparePassword(password, found.passwordHash))) {
      throw new Error('Invalid username or password')
    }

    const user = {
      user_id: found.user_id,
      email: found.email,
      username: found.username,
    }
    const token = signToken({
      sub: user.user_id,
      email: user.email,
      username: user.username,
    })

    return { user, token }
  }
}
