# repo audit

rechecked september 6, 2026 against the current working tree. four of the five original findings are addressed; dashboard account isolation is partially fixed.

## medium, still open: pending saves can restore the previous account's state

locations: `apps/my-app/app/dashboard/use-personal-page.ts:153` and `:179`; `apps/my-app/app/dashboard/dashboard.tsx:114`.

the loader now resets when the user ID changes, and the drawing component is keyed by account. that fixes ordinary account switching. however, `saveIntro` and `saveDrawing` still apply their responses without checking which session started the request.

reproduction: start saving A's page, switch to B in another tab, let B's page load, then allow A's save response to finish. the old callback replaces B's displayed saved intro and strokes with A's content. another edit/save can then overwrite B's page. an old authentication failure also calls `recoverSession` without checking whether the session changed. the dashboard's awaiting submit handler likewise updates draft/status state after the account switch.

verification: executed the actual `saveIntro` callback in isolation with a deferred request and synthetic data. after simulating B's state loading, resolving A's response changed the saved state back to A. no real account or database writes were made.

fix: capture a session token/generation for every load and save; ignore stale success, error, and completion work, including the caller's draft/status updates. add a regression check that switches accounts while a save is pending.

## original findings rechecked

| finding | status | evidence |
| --- | --- | --- |
| deleted accounts retain privileged access | fixed | `authChecker.ts:16` requires an existing account and uses current database permissions; synthetic deleted-account and revoked-permission checks are rejected |
| delayed current-user checks corrupt newer logins | fixed for the reported request path | `use-auth.ts:207` compares the initiating token before success, failure, and completion updates; token changes trigger revalidation |
| dashboard state survives account switching | partially fixed | loader/drafts reset by user ID and drawing remounts; pending saves remain unguarded as described above |
| fresh setup lacks the basic role | fixed in source/docs | `db:seed:roles` initializes permissions and roles without demo users; README includes it after migrations locally and in deployment |
| multibyte passwords bypass bcrypt's limit | fixed for new signups | backend and frontend enforce UTF-8 byte length; synthetic checks accept 72-byte boundaries and reject 73-byte accented/emoji inputs |

## verification and limits

| check | result |
| --- | --- |
| `yarn test` | 57 tests passed across 9 files; suite executed fresh |
| `yarn lint` | passed; all lint tasks reused Turbo cache |
| `yarn check-types` | passed; type checks reused Turbo cache |
| `yarn build` | passed; application/package builds reused Turbo cache; Prisma generation ran |
| targeted checks | authorization and byte-boundary checks passed; pending-save reproduction confirmed the remaining bug |

this was a focused recheck of the original findings and their fixes, not a new full audit. role initialization was inspected without provisioning a database. signup validation does not change existing password hashes. no browser or production tests were performed, no secret environment files were read, and no application source or lab logs were changed.
