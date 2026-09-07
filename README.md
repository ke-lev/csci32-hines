# kelev

[csci32-hines.vercel.app](https://csci32-hines.vercel.app)

## what’s here

- `/buttons` — small interaction experiments
- `/input` — deterministic single-line portraits generated from a name, and the guestbook signing control
- `/input/roll` — roll call: every signed name, redrawn from its stored seed
- `/games` — a random-number guesser and Conway’s Game of Life
- `/timeline` — dated build notes and course updates
- `/users` — a playful zsh-style shell with GraphQL-backed account commands
- `/admin` — a local-only admin-console easter egg reached through the shell
- homepage Spotify now-playing status, when configured (vercel deployment has my env vars set so it should work there)

## getting started

requirements:

- Node.js 22.13 or newer
- Yarn 1.22.22

install dependencies from the repository root:

```bash
yarn install
```

start the development server:

```bash
yarn dev
```

then open [http://localhost:3000](http://localhost:3000).

use the workspace scripts for checks and production builds:

```bash
yarn lint
yarn check-types
yarn test
yarn build
```

### backend setup

the Next.js app sends account requests to `NEXT_PUBLIC_API_URL` and the Fastify API serves GraphQL at `/api/graphql`. configure the three local environment files before using accounts:

1. copy `apps/backend/.env.example` to `apps/backend/.env` and fill in `PRIVATE_KEY`, `PUBLIC_KEY`, `ALGORITHM`, `EXPIRATION`, `AUD`, `ISS`, `BCRYPT_ROUNDS`, and `CORS_ORIGIN`
2. copy `packages/database/.env.example` to `packages/database/.env` and set `DATABASE_URL`
3. copy `apps/my-app/.env.example` to `apps/my-app/.env.local` and set `NEXT_PUBLIC_API_URL` to `http://127.0.0.1:4000` (the origin must match the API's `CORS_ORIGIN`)

generate the Prisma client and apply committed migrations against the configured database:

```bash
yarn workspace @repo/database db:generate
yarn workspace @repo/database prisma migrate deploy
yarn workspace @repo/database db:seed:roles
```

the third command is required, not optional, and it belongs in every environment including
production. the migrations create the `Role` and `Permission` tables but insert no rows, while
signup connects each new account to the `Basic` role — so on a database that has only been
migrated, every signup fails. the seed is idempotent, so re-running it is safe.

`yarn workspace @repo/database seed` is a different thing: it also creates demo accounts,
including an `admin` whose password is published in this repository. use it for local development
only, never as the production substitute for `db:seed:roles`.

the dashboard's saved intro and drawing live in the `PersonalPage` table added by the
`20260904140000_add_personal_page` migration, so run the command above after pulling it or that
page will fail to load.

for development, `yarn dev` starts both workspaces. to run the built API separately:

```bash
yarn workspace backend build
yarn workspace backend start
```

for deployment, provide the same backend variables in the API service, set its `CORS_ORIGIN` to the deployed frontend origin, set the frontend's `NEXT_PUBLIC_API_URL` to the deployed API origin before the Next build, and run `prisma migrate deploy` followed by `db:seed:roles` against the production `DATABASE_URL`
before starting the API. never put private keys, database URLs, or other secret values in documentation or committed `.env` files.

CI runs the same checks plus `prisma validate` on every push and pull request; see [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

### toolchain lanes

the workspaces deliberately run two toolchain generations: the Next.js app stays on TypeScript 5 and ESLint 9 to match `eslint-config-next`, while the shared packages (`@repo/ui`, `@repo/math`, `@repo/database`) run TypeScript 7 and ESLint 10. `@types/node` is pinned to the same major (`^26.4.0`) everywhere. don't "align" the TypeScript majors without checking that the app still typechecks.

## the guestbook and `/input/roll`

`/input` can sign a drawing into a guestbook, and `/input/roll` is the contact sheet of everything signed.

the table stores one row per signature — the normalized name (`seed`), the drawing kind (`face` or `cat`), and a timestamp. it does not store rendered images: `/input/roll` regenerates every portrait from its seed on each request. a unique `(seed, kind)` pair makes a repeat signing a no-op, so a double-click cannot duplicate a row.

the write path is the `signGuestbookAction` server action in `apps/my-app/app/input/sign-guestbook.ts`. it re-derives the seed from the submitted names rather than trusting a client-sent one, validates length and characters (`app/input/guestbook-name.ts`), and applies a per-IP rate limit. `/input/roll` is `force-dynamic` so it is never prerendered — CI builds against a `DATABASE_URL` that does not connect — but its bounded database pages are cached and invalidated after a successful signing. the page shell streams before an uncached database read finishes.

`DATABASE_URL` is read from `packages/database/.env` locally. **the deployment needs `DATABASE_URL` set in its own environment**, or `/input/roll` and signing will fail at request time.

### removing an entry

there is deliberately no moderation UI. to remove an abusive entry, delete the row directly:

```bash
yarn workspace @repo/database prisma studio
```

then delete the row from `GuestbookEntry`. or from a psql session against `DATABASE_URL`:

```sql
DELETE FROM "GuestbookEntry" WHERE seed = 'the offending name';
```

the drawing disappears from a fresh `/input/roll` read after the cache is invalidated. a direct Prisma Studio or SQL delete does not invalidate the `guestbook` tag, so allow up to one hour for cached pages to expire; a new signing invalidates that tag sooner.

## ideas and receipts

ideas submitted through the tips dialog are private by default. a successful submission returns a random receipt code; the receipt lookup reveals only `heard`, `trying it`, or `shipped`, plus an optional site-relative link when something ships. it never returns the suggestion text.

reading the inbox requires an account holding the `UserWrite` permission, which only the `Admin` role has. an admin can use `ideas` and `ideas update <receipt> <heard|trying|shipped> [site/path]` in `/users`, and the `admin` command there opens the console for the same accounts. authorization is checked against the database on every request, so changing an account's role takes effect immediately rather than at its next sign-in.

## optional Spotify integration

the homepage can show the currently playing or most recently played track from the site owner’s Spotify account.

1. create a Spotify developer app with the Web API enabled
2. add `http://127.0.0.1:3000/api/spotify/callback` as a local redirect URI
3. copy `apps/my-app/.env.example` to `apps/my-app/.env.local`
4. fill in `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`
5. visit [the local login route](http://127.0.0.1:3000/api/spotify/login)
6. authorize the requested permissions and copy the refresh token into `SPOTIFY_REFRESH_TOKEN`

for production, add the same variables to the deployment environment and use `https://csci32-hines.vercel.app/api/spotify/callback` for `SPOTIFY_REDIRECT_URI`. never commit `.env.local` or any client secret.

the Spotify card is optional and fails quietly when the integration is not configured.

## project layout

```text
apps/my-app/       Next.js application
apps/backend/      Fastify + GraphQL API
packages/database/ Prisma schema, migrations, and the shared client
packages/math/     shared math helpers
packages/ui/       shared UI components and styles
packages/*         workspace configuration packages
```

timeline entries are md files in `apps/my-app/app/timeline/posts` and use `M-D.md` filenames, such as `8-31.md`.

## deployment

the app can be deployed as a standard Next.js application. the production site is configured for Vercel at [csci32-hines.vercel.app](https://csci32-hines.vercel.app).

<!-- new link: https://www.youtube.com/watch?v=dQw4w9WgXcQ -->
