import type { PermissionName } from '@repo/database'
import type { AuthChecker } from 'type-graphql'
import type { Context } from './graphql'

/**
 * TypeGraphQL calls this after the GraphQL context has verified the bearer token.
 * An empty permission list represents authentication only; otherwise every
 * permission requested by @Authorized must be present in the token.
 */
export const customAuthChecker: AuthChecker<Context, PermissionName> = ({ context }, requiredPermissions) => {
  if (!context.auth) {
    return false
  }

  if (requiredPermissions.length === 0) {
    return true
  }

  const userPermissions = context.auth.permissions ?? []
  return requiredPermissions.every((permission) => userPermissions.includes(permission))
}
