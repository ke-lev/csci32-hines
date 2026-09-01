import jwt from 'jsonwebtoken'
import fs from 'node:fs'
import 'dotenv/config'

const publicKey = process.env.PUBLIC_KEY
const token = fs.readFileSync('token.txt', 'utf8')

try {
  const result = jwt.verify(token, publicKey, {
    algorithms: [process.env.ALGORITHM], // e.g. ES256
    audience: process.env.AUD, // e.g. csci32-frontend
    issuer: process.env.ISS, // e.g. csci32-backend
    clockTolerance: 5, // small grace period for clock skew
  })
  console.log('Verified payload:', result)
} catch (e) {
  console.error('JWT verification failed:', e.message)
}
