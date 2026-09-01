# site todo

Database-dependent work (guestbook/`/roll`) lives in [TODO.md](TODO.md) — still blocked on the Prisma lab.

Everything below is done unless noted. Verified with `yarn lint`, `yarn check-types`, `yarn test`, `yarn build`, plus a production server check of headers, 404, robots, sitemap, and metadata.

## now

1. [x] short-viewport shell clipping — added a `short` variant (`max-height: 760px`) in `globals.css`; `page-shell.tsx` now goes `h-auto min-h-svh overflow-visible` and tightens section padding below that height, so wide-but-short viewports scroll instead of clipping
2. [x] Game of Life keyboard model — roving `tabIndex` (1 tab stop instead of 432), arrow keys move between cells, Home/End jump to row edges, `sr-only` instructions updated. Also pauses the simulation interval while the tab is hidden
3. [x] admin console counts — `routes` and `5 mounted` now derive from `routes.length`; timeline post count comes from `getTimelinePosts()` via a prop from the server component. The `routes` array itself was stale too, so `/input`, `/games`, and both game routes were added (5 → 9)
4. [x] admin console local stats — new `app/lib/session-stats.ts` persists a command count and snake best to `sessionStorage`; the metrics grid is now 6 cells (3 across) and shows both. `local sessions: 01` and `tracked visitors: 00` stay as the punchline
5. [x] nuclear meltdown extracted to `app/components/use-reactor-meltdown.ts`; `nuclear-button.tsx` is now a thin consumer, and both `rm -rf /` and `sudo rm -rf /` trigger it from the shell (auto-recovers after 2.4s with a closing line). Scramble selector picks up `[data-scramble]` so the terminal's own log glitches too
6. [~] timeline future detection — `future` (post dated after the reader's actual today, resolved client-side via `useSyncExternalStore` so there's no hydration mismatch) is wired up and currently only feeds the accessible name, which gets ", not yet". **No visual treatment** — dashed and dotted markers were both tried and rejected; the dots look normal. The detection is left in place for whatever the visual answer turns out to be
7. [x] timeline `popstate` — going back to bare `/timeline` now re-runs the closest-to-today rule instead of grabbing the newest post. Rule extracted to `app/timeline/closest-post.ts` so the client can share it
8. [x] timeline client nav now syncs `document.title` and the meta description, not just the URL
9. [~] `9-7.md` — fixed the duplicated word in the title. **The body still ends mid-sentence at "prisma migration," — that one's yours to write**

## metadata, errors, headers

10. [x] metadata — real description in `layout.tsx`, `metadataBase`, a `%s | kelev` title template (route titles dropped their manual suffix), OG/Twitter defaults, canonical URLs per route, and `noindex` on `/admin`. Added missing metadata for `/buttons` and `/input`
11. [x] `not-found.tsx` and `error.tsx` in the site's voice, both using `PageShell`
12. [x] modal bodies split into `terms-modal-body.tsx` / `tips-modal-body.tsx` and loaded with `next/dynamic` on first open; the QR preload effect is gone. Confirmed the terms chunk is no longer referenced on first load
13. [x] `/timeline` dropped `connection()` for `revalidate = 86400` — it's static with daily revalidation now instead of dynamic per request
14. [x] global security headers in `next.config.ts`: CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`. **Note:** `script-src` keeps `'unsafe-inline'` — the App Router emits inline flight scripts alongside the theme bootstrap, and a strict nonce policy needs middleware that risks breaking streaming. Everything else is locked to `'self'`
15. [x] `DESIGN.md` — added a Themes section (full light/dark token table, toggle behavior, the no-flash bootstrap), documented the two intentional non-token color sets, and added a "where the identity comes from" rule that explicitly excludes the Terms modal

## hygiene / cleanup

16. [x] database workspace — reproduced and fixed the `TS1295` failure (`"type": "module"`), added `check-types`/`lint`/`db:generate`/`db:validate` scripts so Turbo stops skipping it, added `dotenv` as a direct dependency, marked it private, renamed the package to `@repo/database` (directory name unchanged). Root `check-types` now runs 4 packages instead of 3
17. [x] deleted unused `Card`/`Code` from `@repo/ui` (the malformed UTM URL went with them)
18. [~] `@types/node` aligned to `^26.4.0` across all three workspaces. **Deliberately did not align the TypeScript/ESLint majors** — the app is on TS 5/ESLint 9 to match `eslint-config-next` while shared packages are on TS 7/ESLint 10, and forcing them together risked breaking a working build for cosmetic consistency. Documented the lanes in the root README instead
19. [x] tests + CI — Vitest with 21 tests in `apps/my-app/tests` covering inclusive random bounds, timeline filename/date validation, closest-post selection, and portrait determinism. `.github/workflows/ci.yml` runs install/lint/typecheck/test/prisma-validate/build. Extracted `getDateFromSlug` into `post-dates.ts` so the validation is reachable without the `server-only` import
20. [x] `robots.ts`, `sitemap.ts`, and an on-brand `opengraph-image.tsx`
21. [x] misc — `12-18.md` typo, deleted 7 unused assets from `public/`, GitHub icon is now an inline SVG (no more `<img>` warning, one fewer request), breadcrumb hit areas raised to 28px, README route list and check commands updated

## deferred

See [TODO.md](TODO.md) — guestbook, `/roll`, and everything downstream of the Prisma lab.

## out of scope (don't re-propose)

- lab-to-artifact / coursework-as-portfolio framing
- repo-wide content/route manifest
- storing idea-tips submissions in the database
- guestbook moderation, accounts, likes, or a separate moderated route
- admin console becoming real auth
