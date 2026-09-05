import { PrismaClient } from '@repo/database'
import type { SignUpInput } from '@/resolvers/types/AuthTypes'
import type { SignInInput } from '@/resolvers/types/SignInTypes'
import { validationError } from '@/utils/auth-errors'
import { comparePassword, hashPassword, signToken } from '@/utils/auth'
import { normalizeUsername, validateSignupInput } from './auth-validation'

export interface UserServiceProps {
  prisma: PrismaClient
}

export type CurrentUser = {
  email: string | null
  user_id: string
  username: string
}

export class UserService {
  prisma: PrismaClient

  constructor({ prisma }: UserServiceProps) {
    this.prisma = prisma
  }

  findMany() {
    return this.prisma.user.findMany({
      select: {
        user_id: true,
        username: true,
      },
    })
  }

  findById(userId: string): Promise<CurrentUser | null> {
    return this.prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        email: true,
        user_id: true,
        username: true,
      },
    })
  }

  async createUser(input: SignUpInput) {
    const validation = validateSignupInput(input)

    if (!validation.ok) {
      throw validationError(validation.fieldErrors)
    }

    const { email: normalizedEmail, password, username: normalizedUsername } = validation.value

    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { username: normalizedUsername }],
      },
    })

    if (existing) {
      const field = existing.username === normalizedUsername ? 'username' : 'email'
      const message = field === 'username' ? 'username is already in use' : 'email is already in use'

      throw validationError({ [field]: message })
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
