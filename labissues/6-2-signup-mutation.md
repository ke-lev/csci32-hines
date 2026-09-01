# signup mutation lab issues

## the JWT helper creates a 3-second token

compatibility: the lab sets `EXPIRATION="3600"` in `.env`, reads it through `process.env`, and passes the resulting string directly to `jsonwebtoken` as `expiresIn`. `jsonwebtoken` treats a bare numeric string as milliseconds, so the generated token has an `exp - iat` lifetime of 3 seconds instead of the intended 3600 seconds. this reproduces with the lab's backend environment and helper code.

workaround: convert digit-only expiration values to numbers before signing, while leaving duration strings such as `"1h"` unchanged.

```ts
const expiration = process.env.EXPIRATION ?? '3600'
const expiresIn = /^\d+$/.test(expiration) ? Number(expiration) : expiration
```

## the signup password is printed in the backend logs

compatibility: the backend setup enables both `logBody: true` and `logVariables: true` in `apps/backend/src/utils/graphql.ts`. when the lab's `signUp` mutation is tested, `mercurius-logging` prints the submitted password in plaintext. variables expose it under `variables.input.password`, while putting the credentials directly in the lab's example mutation exposes it in `body` instead.

workaround: do not log GraphQL bodies or variables on an authentication endpoint. set both options to `false`, or add explicit redaction before enabling either one.

```ts
await fastify.register(mercuriusLogging, {
  prependAlias: true,
  logBody: false,
  logVariables: false,
})
```
