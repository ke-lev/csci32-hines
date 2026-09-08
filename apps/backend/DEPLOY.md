# deploy the GraphQL backend on Vercel

The existing Vercel project deploys `apps/my-app` (Next.js). Its server-side
Prisma features can use `DATABASE_URL` directly. Sign-in, sign-up, and authenticated
GraphQL features instead call `apps/backend`, which needs its own deployment.
This is custom JWT auth backed by your database, not Supabase Auth.

Vercel supports Fastify: https://vercel.com/docs/frameworks/backend/fastify
Use a second Vercel project from the same repository. Keep the existing frontend
project and its `DATABASE_URL`.

## 1. create the backend project

Import the same Git repository into Vercel again, with these settings:

| setting | value |
| --- | --- |
| project name | `csci32-hines-backend` (or another available name) |
| root directory | `apps/backend` |
| framework preset | Fastify |
| include source files outside the root directory | enabled (needed for `@repo/database`) |
| Node.js version | 22.x |

`vercel.json` installs from the workspace root and leaves the custom build command
empty. The root `postinstall` generates Prisma. Vercel compiles `src/app.ts` into
a function; do not set an output directory or a `yarn workspace backend start`
command in Vercel. Explicit plugin imports let the function builder trace the
backend dependencies without runtime directory discovery. The entrypoint loads
the Reflect polyfill before dynamically importing `server.ts`, preventing
decorated classes from executing before the polyfill.

## 2. set backend environment variables before deploying

Set these on the **backend project**, for Production and any Preview deployment
you intend to test:

| variable | value |
| --- | --- |
| `DATABASE_URL` | the same Supabase transaction-pooler URL used by the frontend |
| `CORS_ORIGIN` | `https://csci32-hines.vercel.app` (use the actual frontend origin if different) |
| `PRIVATE_KEY` | the existing ES256 private PEM key from the local backend environment |
| `PUBLIC_KEY` | its matching public PEM key |
| `ALGORITHM` | `ES256` |
| `EXPIRATION` | `7d` |
| `AUD` | `csci32-frontend` |
| `ISS` | `csci32-backend` |
| `BCRYPT_ROUNDS` | `12` |
| `ENABLE_GRAPHIQL` | `false` |

Paste PEM values without the surrounding `.env` quotes. Actual line breaks and
literal `\n` separators are both supported by the backend. Keep keys on the
backend; never use `NEXT_PUBLIC_` for secrets.

`CORS_ORIGIN` accepts comma-separated exact origins, so add a frontend preview
origin if testing from one. No trailing slashes or paths. Do not set `PORT`.

For public browser requests, the backend deployment must be accessible without
Vercel's deployment-protection login. Check the project protection settings if
requests return a Vercel login page or an unexpected 401.

## 3. verify the deployed backend

Replace the hostname below with the backend project's actual production domain:

```bash
curl -sS https://csci32-hines-backend.vercel.app/api/graphql \
  -H 'content-type: application/json' \
  --data '{"query":"{ __typename }"}'
```

Expected: `{"data":{"__typename":"Query"}}`.
This verifies routing and schema startup, not successful sign-in.

## 4. connect the existing frontend

On the **frontend project**, add:

```text
NEXT_PUBLIC_API_URL=https://csci32-hines-backend.vercel.app
```

Use the actual backend origin, without `/api/graphql` or a trailing slash.
Keep `DATABASE_URL` as it is. Redeploy the frontend: this public URL and the
content-security-policy are compiled at build time.

Sign in with an existing account. In browser Network tools, confirm the request
goes to the backend's `/api/graphql`, sign-in returns a token, and `currentUser`
succeeds with an `Authorization: Bearer ...` header. A 404 means the wrong
project/path; a CORS failure means the frontend origin is missing from the
backend allowlist; a signing-key error means the backend PEM values need fixing.

## local verification

- `yarn workspace backend start` uses `tsx`, matching the local development
  runtime. Its GraphQL startup was verified locally. This is not Vercel's entrypoint.
- The previous `node dist/app.js` startup was reproduced failing with
  `ReflectMetadataMissingError`. That error concerns the Reflect polyfill being
  available when decorators execute; it does not prove that `tsx` emits TypeScript
  decorator metadata. The bootstrap now fixes the compiled startup order too.
  The resolvers supply explicit GraphQL type functions.
- The Vercel backend compiler output was built and started locally; GraphQL
  answered `{ __typename }` and rejected anonymous `currentUser` requests.
- Signing and verifying tokens passed with real and escaped PEM line breaks.
- Listening on `0.0.0.0` and honoring `PORT` is compatible with local and hosted use.
- `PORT` in the Turbo lint environment list only declares lint's environment;
  it does not deploy the backend or configure Vercel.

No database reset or migration is needed simply to deploy another API pointing
at the same existing database. Only migrate/seed if the target database actually
lacks the schema or roles.
