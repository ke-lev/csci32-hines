import { BASIC_ROLE_ID, PermissionName, Prisma, PrismaClient, RoleName } from '@repo/database'
import type { SignUpInput } from '@/resolvers/types/AuthTypes'
import type { SignInInput } from '@/resolvers/types/SignInTypes'
import type { FindManyUsersFilters } from '@/resolvers/types/FindManyUsersFilters'
import { UserSortColumn, type FindManyUsersInput } from '@/resolvers/types/FindManyUsersInput'
import { SortOrder } from '@/resolvers/types/SortOrder'
import { validationError } from '@/utils/auth-errors'
import { comparePassword, hashPassword, signToken } from '@/utils/auth'
import { normalizeUsername, validateSignupInput } from './auth-validation'

// A page size the caller can move but not remove: an unbounded `take` lets one request
// pull the whole table, so an absent or oversized value is clamped rather than trusted.
const DEFAULT_TAKE = 15
const MAX_TAKE = 100

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

  // Computed property name: the column is chosen at runtime, but UserSortColumn means the
  // only keys that can land here are ones we published in the schema.
  getOrderBy({ sortColumn, sortDirection }: FindManyUsersInput): Prisma.UserOrderByWithRelationInput {
    return { [sortColumn ?? UserSortColumn.USERNAME]: sortDirection ?? SortOrder.ASC }
  }

  // Shared by the listing and the count so a page and its total can never disagree about
  // what "matching" means. No query means no clause at all, which Prisma reads as "every row".
  getUsersWhereClause(filters?: FindManyUsersFilters): Prisma.UserWhereInput {
    const query = filters?.query?.trim()

    if (!query) {
      return {}
    }

    return {
      OR: [
        { username: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    }
  }

  findMany(params: FindManyUsersInput = {}) {
    const { skip = 0, take = DEFAULT_TAKE } = params

    return this.prisma.user.findMany({
      skip: Math.max(0, skip),
      take: Math.min(Math.max(1, take), MAX_TAKE),
      orderBy: this.getOrderBy(params),
      where: this.getUsersWhereClause(params.filters),
      select: {
        user_id: true,
        username: true,
      },
    })
  }

  getTotalUsers(filters?: FindManyUsersFilters) {
    return this.prisma.user.count({ where: this.getUsersWhereClause(filters) })
  }

  /**
   * Hand-written because this runs on every authenticated request, before the query the caller
   * actually came to make. The equivalent nested `select` (user -> role -> role_permissions ->
   * permission) is four separate round trips, one per relation hop; against a remote database
   * that cost more than the rest of the request combined. One join is one round trip.
   *
   * The table names are Prisma's defaults for these models. Adding an `@@map` to User, Role,
   * RolePermission or Permission means editing this query too.
   */
  async findById(userId: string): Promise<CurrentUser | null> {
    const rows = await this.prisma.$queryRaw<CurrentUser[]>`
      SELECT u.user_id,
             u.email,
             u.username,
             r.name AS role,
             COALESCE(ARRAY_AGG(p.name) FILTER (WHERE p.name IS NOT NULL), '{}') AS permissions
      FROM "User" u
      LEFT JOIN "Role" r ON r.role_id = u.role_id
      LEFT JOIN "RolePermission" rp ON rp.role_id = r.role_id
      LEFT JOIN "Permission" p ON p.permission_id = rp.permission_id
      WHERE u.user_id = ${userId}
      GROUP BY u.user_id, u.email, u.username, r.name`

    return rows[0] ?? null
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
