import type { AuthChecker } from 'type-graphql'
import type { PermissionName } from '@repo/database'
import type { Context } from './graphql'

/**
 * TypeGraphQL calls this after the GraphQL context has verified the bearer token.
 *
 * Two things have to hold. `auth` proves the token is validly signed, and `currentUser` proves
 * the account behind it still exists — without the second check an unexpired token keeps working
 * after its account is deleted. Permissions are then read from `currentUser` rather than from the
 * token's claims, so a role change takes effect on the next request instead of the next sign-in.
 *
 * An empty permission list represents authentication only.
 */
export const customAuthChecker: AuthChecker<Context, PermissionName> = ({ context }, requiredPermissions) => {
  if (!context.auth || !context.currentUser) {
    return false
  }

  if (requiredPermissions.length === 0) {
    return true
  }

  const userPermissions = context.currentUser.permissions
  return requiredPermissions.every((permission) => userPermissions.includes(permission))
}
