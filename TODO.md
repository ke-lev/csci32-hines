# deferred: guestbook / `/roll`

Blocked on the Prisma lab (in progress next). Don't start this until the db is actually wired up in `packages/csci32-database` and consumed by `apps/my-app` — see item 16 in [AUDIT-TODO.md](AUDIT-TODO.md) for the workspace-level fixes that need to happen first regardless.

Decided: identity field is the normalized seed (not display name). Route is `/roll`.

## schema

- [ ] one table: seed (identity), drawing kind (`face`/`cat`), created_at
- [ ] unique constraint on (seed, drawing kind) — an accidental double-click shouldn't create a duplicate row
- [ ] no messages, accounts, likes, moderation flags, or profile fields — checked, keep it that way

## sign-the-guestbook button

- [ ] replace the checksum row (`name-drawing-page.tsx:306-312`) with a "sign the guestbook" button — states: idle → `signing…` → `signed ✓`
- [ ] submit through a server action / route handler that normalizes the name and re-derives the seed server-side — don't trust a client-sent seed
- [ ] server-side input length + character validation on whatever's still user-supplied
- [ ] basic rate limit or other spam barrier on the write path — hygiene, not a moderation product
- [ ] render stored names strictly as text, never as injected HTML

## `/roll` page

- [ ] reads guestbook rows, regenerates each SVG from its stored seed (don't store rendered images)
- [ ] flat contact-sheet layout — names + linework, not profile cards
- [ ] bounded/paginated reads once the table has any real size
- [ ] links: `/input` → `/roll` after signing, `/roll` → `/input` to add another person
- [ ] a documented manual-deletion path for an abusive entry (direct DB delete is fine — no admin UI needed for this)

## explicitly not doing

- separate moderation console or approval queue
- accounts, likes, comments, profile pages
- admin console becoming a real auth boundary to manage this
