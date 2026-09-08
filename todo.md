# todo

the only backlog. `## calls` need a decision from you, `## work` needs code. put a `>` line under
any item and the next agent to touch this file acts on it. rules in `AGENTS.md`.

## calls

- **mobile `how it works`.** the footer button is a long scroll from the intro copy it explains. an
  inline `how it works ->` at the end of the body would fix it. two triggers, one dialog.

> maybe, not sold on it yet

## work

### render the first info entry as a mono route label

every page's `pageInfo` opens with its own route (`'/input'` in
`app/input/name-drawing-page.tsx:100`) and `app/components/info-modal-body.tsx` renders it as a plain
`<p>` like any other paragraph, so it reads as prose. give it the label treatment once, in the
dialog, and every page picks it up for free.

in `InfoDialog`, pull `paragraphs[0]` out of the `.map` when it matches a bare route (`^/[a-z0-9/-]*$`)
and render it above the prose column as a mono label — small, letter-spaced, `text-muted`, lowercase,
matching the breadcrumb and footer type treatment already in `PageShell`. a first entry that is
ordinary prose keeps rendering as a paragraph, so nothing else has to change.

do not derive the label from `usePathname()` instead. it reads tempting, but it takes the label out of
the page's own copy and leaves a page no way to override it.

do this before writing the eight pages of copy below, so the convention lands once instead of eight
times. verify `/input` shows a label rather than a paragraph, and that the modal still opens with the
prose intact underneath.

### roll out `how it works` to the rest of the pages

`/input` is the proof of concept and it shipped. the mechanism is done; what's left is copy.

the mechanism: `PageShell` takes `info?: string[]`, one string per paragraph. pass it and the footer
grows a `how it works` button, leave it out and there's no button. `**lead-in:**` at the front of a
string renders bold — that's the only markup. copy lives in a `const pageInfo = [...]` at the top of
the page file. `components/use-dialog.ts` holds the escape / scroll-lock / focus-trap behavior;
`tips-modal-body.tsx` still has its own hand-rolled copy of that effect, worth retrofitting when
touching it.

three tiers, and the whole point is keeping them separate:

- **h1** — the title
- **subhead** — the joke
- **body** — what you can actually _do_ here (the affordances, keep them visible)
- **how it works** — the technical account

do not move affordances into the dialog. `/input` originally had the pipeline and the four "you can
do this" bullets crammed into one `body`; only the pipeline moved.

pages worth doing, roughly in order:

1. **`/games/random-number-guesser`** — easiest win, the `body` is _already_ pure mechanism ("after
   every miss, the possible interval tightens and the midpoint becomes your next recommended move").
   straight move, then write a real body about what you can do.
2. **`/admin`** — same deal, `body` is already technical ("routes and posts are baked in at build /
   users come straight from the database"). expand it with how the access check actually works.
3. **`/talk`** — the most to say and nothing said yet: the polling cursor, why moderation doesn't
   reach open rooms, rate limiting, why there are no dms or threads. describe the limit itself (10 a
   minute, counted per account) rather than how the refusal surfaces, so the allowance work below
   doesn't invalidate the copy.
4. **`/users`** (shell) — what the terminal actually parses, what's real vs set dressing, how the
   room tail works.
5. **`/welcome`** — `body` already gestures at it ("real accounts. real backend"). password hashing,
   jwt, where the session lives.
6. **`/games/game-of-life`** — `body` is empty, so this is net-new: conway's rules, the tick loop,
   grid wrapping.
7. **`/input/roll`** — guestbook storage, pagination, how each portrait is redrawn from just a seed.
8. **`/dashboard`** — the editable intro copy and how it persists. note the `body` here is a live
   `<textarea>`, not a string, so it's a different shape from every other page.

skip `/games`, `/buttons` (index + joke page, the `body` is idea notes), `/timeline`, `error`,
`not-found`.

### show the posting allowance in `/talk` before you spend it

the limit is 10 posts per 60 seconds keyed on `user_id`
(`POSTS_PER_WINDOW` / `WINDOW_MS` in `apps/backend/src/resolvers/RoomResolver.ts:18`), enforced by the
in-process fixed window in `apps/backend/src/utils/rate-limit.ts`. today the only signal is the
refusal: `postMessage` throws `slow down - try again in Ns` as `BAD_USER_INPUT` and
`app/talk/use-room.ts:224` surfaces that text. you find the ceiling by hitting it.

add a non-consuming read. `peekRateLimit({ key, limit, windowMs })` in `rate-limit.ts` returning
`{ remaining, resetAt }` without touching the window — `checkRateLimit` already has the window in
hand, so this is the same lookup minus the mutation. expose it as a `postingAllowance` query on
`RoomResolver` behind `requireCurrentUser`, and have `use-room.ts` ask for it in the poll it already
runs rather than on its own timer. surface it in the composer in `app/talk/room.tsx` only once it is
low (3 or fewer left) so it stays quiet in normal use.

do not mirror the window client-side instead. the counter is per-process and resets when the backend
restarts, so a locally-kept count would state a number that is confidently wrong.

verify: post 8 lines and the composer starts warning, the 11th still gets the server refusal with its
countdown, and restarting the backend clears the count with the display following it down.

### say plainly that signing the guestbook is public

`app/input/name-drawing-page.tsx` — the sign control and the status line above it never state that
the submitted normalized name and the drawing become publicly visible on `/input/roll`. the terms
parody stays as a set piece; this is separate, plain copy near the button. humor and understandable
submission behavior can coexist.

### scrap `/cursive`

failed experiment, nothing links to it — it isn't in `app/lib/site-routes.ts` and no nav or page
references it, so removal is contained:

- delete `apps/my-app/app/cursive/` (`page.tsx`, `layout.tsx`, `cursive-title.tsx`)
- drop `'/cursive/'` from `app/sitemap.ts:10`
- drop the css block in `app/globals.css` (roughly lines 59-108): `.cursive-home-title`,
  `.cursive-title-art`, `.cursive-title-stroke`, `.cursive-title-stroke-second`,
  `@keyframes cursive-title-draw`, and the two media-query overrides at the end of it. all four
  classes are used only by `cursive-title.tsx`, so none of it is shared with the home hero despite
  the `-home-` in that first name

verify with `yarn check-types` and `yarn build`, and that `grep -ri cursive` comes back empty outside
build logs.

### the route registry omits `dashboard`

`app/lib/site-routes.ts` lists nine routes; `dashboard` isn't one, so `open dashboard`, `ls`, and
`tree` in the terminal don't know it exists. it is auth-gated, so decide whether it belongs in the
listing for signed-out visitors or only resolves for signed-in ones.
