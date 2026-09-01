import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { Algorithm, SignOptions } from 'jsonwebtoken'

function readPrivateKey(): string {
  const key = process.env.PRIVATE_KEY

  if (!key) {
    throw new Error('Missing PRIVATE_KEY in .env')
  }

  return key
}

function getExpiration(): NonNullable<SignOptions['expiresIn']> {
  const expiration = process.env.EXPIRATION ?? '3600'

  return /^\d+$/.test(expiration)
    ? Number(expiration)
    : (expiration as NonNullable<SignOptions['expiresIn']>)
}

export async function hashPassword(plain: string): Promise<string> {
  const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12)

  return bcrypt.hash(plain, rounds)
}

export function signToken(claims: Record<string, unknown>): string {
  const privateKey = readPrivateKey()
  const algorithm = (process.env.ALGORITHM ?? 'ES256') as Algorithm

  return jwt.sign(claims, privateKey, {
    algorithm,
    expiresIn: getExpiration(),
    audience: process.env.AUD ?? 'csci32-frontend',
    issuer: process.env.ISS ?? 'csci32-backend',
    header: { alg: algorithm, typ: 'JWT' },
  })
}
