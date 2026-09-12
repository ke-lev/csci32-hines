# Auto-maintained changelog and in-app help

## Problem

Features ship with no record of what changed and no instructions for using them.
Documentation that lives only in an agent's instructions rots, because nothing
fails when it is skipped.

## Intent

Producing a user-facing feature has two required side effects: a changelog entry
and a help doc. Both are readable inside the running site, and both are enforced
mechanically rather than by memory.

## Content model

File-based markdown, matching the existing timeline pipeline
(`app/timeline/posts.ts`), per PRODUCT.md's preference for file-based content and
static generation.

### Help docs — `app/help/docs/<slug>.md`

Frontmatter:

- `title` (required) — display name, lowercase site voice
- `route` (required) — the path this documents, e.g. `input/roll`. Must resolve
  to a real page. `home` maps to `/`.
- `summary` (required) — one line, used in the help index
- `admin` (optional, `true`) — excluded from the public index and `noindex`

Body convention: a `## what it does` section and a `## how to use` section with
numbered steps.

There is deliberately no `order` field: index order derives from `SITE_ROUTES`,
so the help index matches the order the `/users` shell already lists routes in.

There is deliberately no manual `isNew` flag. "New" is derived — a feature reads
as new when a changelog entry naming it is dated within the last 30 days — so the
badge expires on its own instead of requiring a cleanup pass nobody performs.

### Changelog entries — `app/changelog/entries/YYYY-MM-DD-slug.md`

The filename supplies the date and the slug, mirroring the timeline's
filename-derives-date convention where a malformed name fails the build.

Frontmatter:

- `title` (required)
- `kind` (required) — `feature`, `improvement`, or `fix`
- `features` (optional) — comma-separated help doc slugs this change touched

Entries live inside `apps/my-app/` rather than repo-root `docs/changelog/`
because the page reads them at build time from `process.cwd()`; reaching across
the workspace root is fragile under turbo prune and Vercel.

Internal refactoring, infrastructure, and dependency bumps get no entry.

## Surfaces

`/changelog` — the shared `PageShell`. Dated entries newest-first in the right
card, each tagged with its kind. No per-entry route.

`/help` — feature list on the left, doc body in the right card. `/help/[slug]` is
statically generated for direct links. Server-rendered; no client selection
state.

Both routes join `SITE_ROUTES`, so `cd help` works in the `/users` shell and both
appear in `ls` and `tree`. As registry members they must document themselves to
pass their own coverage test.

A quiet `help` link joins the theme toggle and tips button in the shell header.

### Admin docs

`/admin` is absent from `SITE_ROUTES` and already sets `robots: noindex`, because
PRODUCT.md treats it as a hidden payoff. A doc marked `admin: true` inherits that
posture: excluded from the `/help` index and from the public doc list, `noindex`,
and linked from inside the admin console. Reachable by URL, never advertised.

## Module boundaries

Parsing and validation live in plain modules that vitest can import directly;
filesystem reads live in `server-only` loaders layered on top. This is the split
the repo already uses between `post-dates.ts` and `posts.ts`.

- `app/help/doc-schema.ts` — types, frontmatter parsing, validation (pure)
- `app/help/docs.ts` — `server-only` filesystem loader
- `app/changelog/entry-schema.ts` — types, parsing, date and kind validation (pure)
- `app/changelog/entries.ts` — `server-only` filesystem loader

Invalid frontmatter or an unresolvable route throws at load time, so a broken doc
fails the build rather than rendering empty.

## Enforcement

1. `tests/help-docs.test.ts` — every `SITE_ROUTES` entry has a doc; every doc's
   `route` resolves; no duplicate slugs or routes; every doc has a non-empty
   summary and a `## how to use` section; admin docs never appear in the public
   list.
2. `tests/changelog.test.ts` — filenames parse to real dates; `kind` is one of the
   three; every `features:` slug resolves to an existing help doc.
3. CI job `changelog` — a pull request touching `apps/my-app/app/**` (excluding
   tests and the docs directories themselves) with no added entry under
   `app/changelog/entries/` fails. `[skip changelog]` in the PR title is the
   escape hatch for genuine internal work.
4. `apps/my-app/AGENTS.md` gains a "completing user-facing work" checklist so the
   workflow is known before CI has to enforce it.

The tests are the durable half: instructions can be skipped, a red build cannot.

## Backfill

Help docs for every page: the twelve `SITE_ROUTES` entries plus `admin`,
`games/game-of-life`, `games/random-number-guesser`, and `timeline/[slug]`.
Changelog seeded from recent real commits so the page is not empty on arrival.

## Out of scope

Per-entry changelog routes, doc search, versioning, and any public marketing
surface. The site has one audience and one deploy.
