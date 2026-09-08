# deploy the GraphQL backend on Vercel

this is the setup that finally worked on September 7, 2026, plus the failures we
actually hit getting there. Vercel can host the Fastify backend. Railway is not
required.

## why the database worked but auth did not

the frontend's Next.js server can use Prisma and `DATABASE_URL` directly. sign-in,
sign-up, and authenticated GraphQL requests instead go to `apps/backend`. deploying
only the frontend does not deploy that separate API.

this app uses custom JWT auth backed by Supabase's Postgres database. it does not
use Supabase Auth. a working database connection on the frontend therefore does
not mean the auth backend is running.

## 1. deploy the same repo as a second Vercel project

keep the existing frontend project. import `ke-lev/csci32-hines` again for the
backend and check these settings, even if Vercel detects them automatically:

| setting | backend value |
| --- | --- |
| project name | `csci32-hines-backend` |
| root directory | `apps/backend` |
| framework preset | Fastify |
| include source files outside the root directory | enabled, for `@repo/database` |
| install command | `cd ../.. && yarn install --frozen-lockfile --production=false` |
| build command | `yarn build` |
| output directory | `dist` |

the merged `apps/backend/vercel.json` supplies the install, build, and output
settings. use the version containing `buildCommand: "yarn build"` and
`outputDirectory: "dist"`; the earlier instructions to leave them empty were
wrong for this repo. the root `postinstall` generates the Prisma client.

Vercel runs the compiled Fastify app as a function. do not enter
`yarn workspace backend start` as a Vercel start command.

## 2. fill in the backend environment variables

set these on **csci32-hines-backend**, scoped to **Production**. also set them for
Preview if you want to test preview deployments. each Vercel project has its own
environment variables; adding one to the frontend does not add it to the backend.

Vercel appeared to detect variable names during setup, but that did not mean their
values were populated. check every value. we confirmed at least one blank value
was enough to crash startup.

| variable | value |
| --- | --- |
| `DATABASE_URL` | the same complete Supabase transaction-pooler connection string that works on the frontend |
| `CORS_ORIGIN` | `https://csci32-hines.vercel.app` |
| `PRIVATE_KEY` | the existing ES256 private PEM key from the local backend environment |
| `PUBLIC_KEY` | the matching public PEM key |
| `ALGORITHM` | `ES256` |
| `EXPIRATION` | `7d` |
| `AUD` | `csci32-frontend` |
| `ISS` | `csci32-backend` |
| `BCRYPT_ROUNDS` | `12` |
| `ENABLE_GRAPHIQL` | `false` |
| `NODE_ENV` | `production` |

paste values without the surrounding `.env` quotes. for PEM keys, include the
whole `BEGIN`/`END` block. the backend supports both actual line breaks and literal
`\n` separators. save `PRIVATE_KEY` and `DATABASE_URL` as Sensitive. `PUBLIC_KEY`
can be plain text. never put a secret in a `NEXT_PUBLIC_` variable.

`CORS_ORIGIN` is the **frontend origin**, not the backend URL. include `https://`,
with no trailing slash or path. the backend accepts comma-separated exact origins
if you also need a frontend preview URL. do not set `PORT` manually.

### use the transaction pooler for the deployed database connection

our local direct connection used `db.<project-ref>.supabase.co:5432`. when copied
to the Vercel backend, it failed with Prisma `P1001`: `Can't reach database server`.
replacing it with the transaction-pooler connection fixed the deployed app.

in Supabase, open **Connect → Transaction pooler** and copy the complete connection
string, filling in the database password. it uses a `pooler.supabase.com` hostname
and port `6543`. copy the full URL rather than just changing the port: the hostname
and username format also differ. use the same database as the frontend.

Supabase documents the default direct connection as IPv6 and the shared transaction
pooler as IPv4-compatible and suitable for serverless functions. this does not mean
direct connections never work; this deployment could not reach ours.
[Supabase connection guide](https://supabase.com/docs/guides/database/connecting-to-postgres)

save the variables, then **redeploy the backend**. changing settings does not update
an already running deployment. no database reset, migration, or reseed was needed
for this fix.

## 3. connect and redeploy the frontend

on **csci32-hines**, keep its existing `DATABASE_URL` and add:

```text
NEXT_PUBLIC_API_URL=https://csci32-hines-backend.vercel.app
```

this is the **backend origin**, with `https://` but no trailing slash or
`/api/graphql`. the client appends `/api/graphql` itself.

save for **Production**, then **redeploy the frontend**. `NEXT_PUBLIC_API_URL` and
the frontend's content-security-policy are read at build time.

## 4. verify the API before debugging the browser

check the GraphQL endpoint:

```bash
curl -i https://csci32-hines-backend.vercel.app/api/graphql \
  -H 'content-type: application/json' \
  --data '{"query":"{ __typename }"}'
```

expected: HTTP 200 and `{"data":{"__typename":"Query"}}`. this checks API startup
and routing, not successful sign-in.

check the same preflight the browser needs:

```bash
curl -i -X OPTIONS https://csci32-hines-backend.vercel.app/api/graphql \
  -H 'Origin: https://csci32-hines.vercel.app' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: authorization,content-type'
```

expected: HTTP 204 with
`access-control-allow-origin: https://csci32-hines.vercel.app`, permission for POST,
and allowed `authorization` and `content-type` headers.

then sign in on the frontend. check that sign-in returns a token and subsequent
requests send `Authorization: Bearer ...`. an anonymous `currentUser` request
returning `UNAUTHENTICATED` is expected; a successful sign-in is the final check.

a Vercel login page or platform 401 means deployment protection may be intercepting
the request. the production API must be accessible to the public frontend.

## what actually broke along the way

### the browser said CORS, but the backend was crashing

we repeatedly saw `No Access-Control-Allow-Origin header` and `net::ERR_FAILED`.
the actual OPTIONS response was HTTP 500 with
`x-vercel-error: FUNCTION_INVOCATION_FAILED`. the crashed function could not send
CORS headers, so changing the allowlist alone would not fix it.

check **backend project → Logs** for the request's real error before changing CORS.
these were the confirmed failures:

| failure | what fixed it |
| --- | --- |
| `ReflectMetadataMissingError` when starting the earlier tsup output | load `reflect-metadata` before dynamically importing the server, so decorators execute after the polyfill |
| `ERR_MODULE_NOT_FOUND` for `src/utils/graphql` imported from `src/server.js` on Vercel | explicitly build and deploy `dist`, and retain a direct Fastify import in the bootstrap so Vercel selects `dist/app.js` |
| `Invalid boolean environment variable: ENABLE_GRAPHIQL=` | replace the blank backend value with `false`, then redeploy |
| Prisma `P1001`, `Can't reach database server` at the direct Supabase hostname | replace the backend `DATABASE_URL` with the working transaction-pooler URL, then redeploy |

Vercel's Fastify entrypoint detection looks for a direct framework import. our
bootstrap originally lacked one, so the deployed builder selected `server.ts` and
bypassed the bootstrap. a local test using another Vercel compiler path passed but
did not catch that selection difference. the follow-up fix checked the actual
Fastify entrypoint selector and verified it chose `dist/app.js`.

plugins now use explicit imports so the build includes them without discovering
TypeScript files from a directory at runtime. `yarn workspace backend start` still
uses `tsx` locally, but that is not how Vercel starts the function. the polyfill fix
also allowed the compiled `node dist/app.js` startup to work.

### the Permissions-Policy warning was separate

we also saw `Unrecognized feature: 'attribution-reporting'`. the live `/users`
response inspected during debugging did not contain that directive, so its source
was not established. it was not the cause of the independently confirmed backend
500s. the frontend's content-security-policy already allowed the backend origin.

## outcome and related changes

after the compiled-entrypoint fix, populated environment values, the transaction
pooler, and both redeployments, the user confirmed the live app worked.

- [PR #17](https://github.com/ke-lev/csci32-hines/pull/17): backend Vercel setup, Reflect bootstrap, explicit plugins, and PEM newline handling.
- [PR #18](https://github.com/ke-lev/csci32-hines/pull/18): corrected Vercel entrypoint selection and deployment of compiled output.

local verification included lint, type checking, the full build, 57 existing tests,
Prisma schema validation, JWT signing/verification with both PEM formats, compiled
GraphQL startup, and a CORS preflight. those checks helped, but the production logs
were necessary to diagnose the deployed environment and entrypoint failures.

this file records the deployment troubleshooting. `labissues/` contains separate
course-lab issue logs; not every deployment finding was added there.
