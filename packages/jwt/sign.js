import fs from 'node:fs'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

const privateKey = process.env.PRIVATE_KEY
const payload = JSON.parse(process.env.JWT_PAYLOAD)

const token = jwt.sign(payload, privateKey, {
  algorithm: process.env.ALGORITHM, // e.g. ES256
  expiresIn: Number(process.env.EXPIRATION), // e.g. 3600 (seconds) or "1h"
  audience: process.env.AUD, // e.g. csci32-frontend
  issuer: process.env.ISS, // e.g. csci32-backend
  header: { typ: 'JWT' },
})

fs.writeFileSync('token.txt', token)
console.log('Signed token written to token.txt')
