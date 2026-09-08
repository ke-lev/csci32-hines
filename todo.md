# todo

## roll out "how it works" to the rest of the pages

`/input` is the proof of concept and it shipped. the mechanism is done; what's left is copy.

### how it works (the mechanism)

- `PageShell` takes `info?: string[]` - one string per paragraph. pass it and the footer grows a
  `how it works` button, leave it out and there's no button at all.
- `**lead-in:**` at the front of a string renders bold. that's the only markup.
- copy lives in a `const pageInfo = [...]` at the top of the page file.
- `components/use-dialog.ts` holds the escape / scroll-lock / focus-trap behavior. `tips-modal-body.tsx`
  still has its own hand-rolled copy of that effect - worth retrofitting when touching it.

### the split

three tiers, and the whole point is keeping them separate:

- **h1** - the title
- **subhead** - the joke
- **body** - what you can actually *do* here (the affordances, keep them visible)
- **how it works** - the technical account

do not move affordances into the dialog. `/input` originally had the pipeline and the four "you can
do this" bullets crammed into one `body`; only the pipeline moved.

### pages worth doing, roughly in order

1. **`/games/random-number-guesser`** - easiest win, the `body` is *already* pure mechanism
   ("after every miss, the possible interval tightens and the midpoint becomes your next recommended
   move"). straight move, then write a real body about what you can do.
2. **`/admin`** - same deal, `body` is already technical ("routes and posts are baked in at build /
   users come straight from the database"). expand it with how the access check actually works.
3. **`/talk`** - the most to say and nothing said yet: the polling cursor, why moderation doesn't
   reach open rooms, rate limiting, why there are no dms or threads. overlaps with the open bugs in
   `ideas.md` - probably fix those first so the copy isn't describing broken behavior.
4. **`/users`** (shell) - what the terminal actually parses, what's real vs set dressing, how the
   room tail works.
5. **`/welcome`** - `body` already gestures at it ("real accounts. real backend"). password hashing,
   jwt, where the session lives.
6. **`/games/game-of-life`** - `body` is empty right now, so this is net-new: conway's rules, the
   tick loop, grid wrapping.
7. **`/input/roll`** - guestbook storage, pagination, how each portrait is redrawn from just a seed.
8. **`/dashboard`** - the editable intro copy and how it persists. note the `body` here is a live
   `<textarea>`, not a string, so it's a different shape from every other page.

**skip:** `/games`, `/buttons` (index + joke page, the `body` is idea notes), `/timeline`,
`error`, `not-found`. `/cursive` needs a look - it has no `PageIntro` body at all.

### open calls

- **the `/input` opener.** first entry is the literal string `/input` and it renders as plain prose,
  which reads a little odd. could style entry one as a mono route label. decide once, apply to all.
- **mobile.** the footer is a long scroll from the intro copy it's explaining. an inline
  `how it works ->` at the end of the body, opening the same dialog, would fix it. two triggers, one
  dialog.
- **`string[]` can't hold a link.** fine so far. if a page needs one, widen to `string[] | ReactNode` -
  the dialog won't need to change.
- **keep it honest.** the `/input` tangent describes dead code (hair, glasses - computed, never
  drawn). that goes stale the moment any of it gets wired up. same risk on every page.

### unrelated but noticed

`.next` keeps accumulating duplicate `* 2.*` generated files - there were 110, and they break
`check-types`. `apps/my-app/AGENTS.md` documents the cleanup. on a `~/Desktop` path this is usually
a sync client copying build output; excluding `.next` from it would stop the bleeding.
