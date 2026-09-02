# guestbook / `/input/roll`

Done. The Prisma lab landed, item 16 of the workspace audit landed, and `apps/my-app` now consumes `@repo/database` directly.

Decided: identity field is the normalized seed (not display name). Route is `/input/roll/`, nested under the experiment it belongs to.

Verified with `yarn lint`, `yarn check-types`, `yarn test`, `yarn build`, and a real round trip against the Supabase database — signing from `/input`, the sheet regenerating on `/input/roll`, and a rejected name.

## schema

- [x] one table: `GuestbookEntry` — `seed` (identity), `kind` (`face`/`cat`) as a Prisma enum, `created_at`. Migration `20260901232354_add_guestbook_entry`
- [x] unique constraint on `(seed, kind)`. The action `upsert`s with an empty `update`, so a double-click is one query and no second row
- [x] no messages, accounts, likes, moderation flags, or profile fields

## sign-the-guestbook button

- [x] the checksum row is now the signing row: name on the left, `sign the guestbook` (medium primary) → `signing…` → `signed ✓` (medium secondary) on the right. Redrawing or toggling cat-mode resets it, because the button is keyed on `seed:kind` rather than held in an effect. `checksum` is still used for the download filename and the render keys, just no longer displayed
- [x] `signGuestbookAction` (`app/input/sign-guestbook.ts`) re-derives the seed from the submitted names with `normalizeFaceSeed` and validates `kind` against the enum. No client-sent seed is trusted
- [x] length and character validation in `app/input/guestbook-name.ts` — 40 characters per name, unicode letters/marks plus space, hyphen, period, apostrophe. Digits, markup, and control characters are rejected. 9 tests
- [x] per-IP fixed-window rate limit, 6 signings a minute (`app/lib/rate-limit.ts`, 4 tests). Best-effort by design: it is per-instance memory, and the unique constraint is what actually makes repeats cheap
- [x] names render as text through JSX. Nothing on either route uses `dangerouslySetInnerHTML`

## `/input/roll` page

- [x] reads rows and regenerates each SVG from the stored seed. No rendered image is ever stored
- [x] flat contact sheet — linework with the name under each cell, 4/3/2 columns by width, no rules between cells
- [x] `getGuestbookPage` reads one bounded page (48) with `skip`/`take` and a count; `newer`/`older` links appear only past one page
- [x] `/input` → `see the roll` after signing; `/input/roll` → `add another person` (medium primary)
- [x] manual-deletion path documented in the root README — Prisma Studio or a one-line `DELETE`. Nothing else references an entry, so the drawing is gone on the next request

## notes

- `/input/roll` is `force-dynamic` on purpose. CI builds with a `DATABASE_URL` that does not connect, so the route must never be prerendered
- `DATABASE_URL` resolves from `packages/database/.env` locally. **the Vercel deployment needs it set in its own environment** or signing and `/input/roll` fail at request time
- `next.config.ts` gained `transpilePackages: ['@repo/database']`, since that package exports raw TypeScript rather than a build like `@repo/ui`
- `/input/roll` was added to `sitemap.ts` and the `/admin` route table, but deliberately not to the homepage panel, which is a curated three

## explicitly not doing

- separate moderation console or approval queue
- accounts, likes, comments, profile pages
- admin console becoming a real auth boundary to manage this
