import { BASIC_ROLE_ID, PermissionName, PrismaClient, RoleName } from '@repo/database'
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
  permissions: PermissionName[]
  role: RoleName | null
  user_id: string
  username: string
}

// Shared select for the queries that need to resolve a user's role and permissions
// (in addition to the base user fields), so the shape used to build a CurrentUser
// stays in one place instead of being hand-rolled per query.
const userWithRoleSelect = {
  user_id: true,
  email: true,
  username: true,
  role: {
    select: {
      name: true,
      role_permissions: { select: { permission: { select: { name: true } } } },
    },
  },
} as const

type UserWithRole = {
  user_id: string
  email: string | null
  username: string
  role: {
    name: RoleName
    role_permissions: { permission: { name: PermissionName } }[]
  } | null
}

function flattenUser(user: UserWithRole): CurrentUser {
  return {
    user_id: user.user_id,
    email: user.email,
    username: user.username,
    role: user.role?.name ?? null,
    permissions: user.role?.role_permissions.map((rp) => rp.permission.name) ?? [],
  }
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

  async findById(userId: string): Promise<CurrentUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      select: userWithRoleSelect,
    })

    return user ? flattenUser(user) : null
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
    const created = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        username: normalizedUsername,
        passwordHash,
        role: { connect: { role_id: BASIC_ROLE_ID } },
      },
      select: userWithRoleSelect,
    })
    const user = flattenUser(created)
    // These claims are a convenience for the client. Authorization reads permissions from the
    // database on every request (see authChecker), so a stale claim cannot widen access.
    const token = signToken({
      sub: user.user_id,
      email: user.email,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
    })

    return { user, token }
  }

  async authenticateUser({ username, password }: SignInInput) {
    const found = await this.prisma.user.findUnique({
      where: { username: normalizeUsername(username) },
      select: {
        ...userWithRoleSelect,
        passwordHash: true,
      },
    })

    // One generic error for "no such user" and "wrong password" alike, so the
    // response cannot be used to discover which usernames have accounts.
    if (!found?.passwordHash || !(await comparePassword(password, found.passwordHash))) {
      throw new Error('Invalid username or password')
    }

    const user = flattenUser(found)
    // These claims are a convenience for the client. Authorization reads permissions from the
    // database on every request (see authChecker), so a stale claim cannot widen access.
    const token = signToken({
      sub: user.user_id,
      email: user.email,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
    })

    return { user, token }
  }
}
