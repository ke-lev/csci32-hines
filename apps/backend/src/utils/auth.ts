import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { Algorithm, JwtPayload, SignOptions } from 'jsonwebtoken'
import type { PermissionName, RoleName } from '@repo/database'

export type AuthTokenPayload = JwtPayload & {
  email?: string | null
  permissions?: PermissionName[]
  role?: RoleName
  sub: string
  username?: string
}

function readPrivateKey(): string {
  const key = process.env.PRIVATE_KEY

  if (!key) {
    throw new Error('Missing PRIVATE_KEY in .env')
  }

  return key.replace(/\\n/g, '\n')
}

function readPublicKey(): string {
  const key = process.env.PUBLIC_KEY

  if (!key) {
    throw new Error('Missing PUBLIC_KEY in .env')
  }

  return key.replace(/\\n/g, '\n')
}

function getAlgorithm(): Algorithm {
  return (process.env.ALGORITHM ?? 'ES256') as Algorithm
}

function getAudience() {
  return process.env.AUD ?? 'csci32-frontend'
}

function getIssuer() {
  return process.env.ISS ?? 'csci32-backend'
}

function getExpiration(): NonNullable<SignOptions['expiresIn']> {
  const expiration = process.env.EXPIRATION ?? '3600'

  return /^\d+$/.test(expiration) ? Number(expiration) : (expiration as NonNullable<SignOptions['expiresIn']>)
}

export async function hashPassword(plain: string): Promise<string> {
  const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12)

  return bcrypt.hash(plain, rounds)
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export function signToken(claims: Record<string, unknown>): string {
  const privateKey = readPrivateKey()
  const algorithm = getAlgorithm()

  return jwt.sign(claims, privateKey, {
    algorithm,
    expiresIn: getExpiration(),
    audience: getAudience(),
    issuer: getIssuer(),
    header: { alg: algorithm, typ: 'JWT' },
  })
}

/**
 * Verifies the bearer token with the public half of the signing key and the same issuer/audience
 * constraints used when the token was created. Invalid, expired, and malformed tokens all become
 * an anonymous request to keep auth failures safe for GraphQL resolvers.
 */
export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    const payload = jwt.verify(token, readPublicKey(), {
      algorithms: [getAlgorithm()],
      audience: getAudience(),
      issuer: getIssuer(),
    })

    if (typeof payload === 'string' || typeof payload.sub !== 'string') {
      return null
    }

    return payload as AuthTokenPayload
  } catch {
    return null
  }
}
