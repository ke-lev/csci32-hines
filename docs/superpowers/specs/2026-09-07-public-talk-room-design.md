# public talk room

replaces the dashboard drawing pad with one public chat room, and gives signed-in
accounts a reason to exist.

## problem

`/dashboard` is a dead end. an account gets an editable intro and a drawing pad;
both save, both restore on return, and nobody else ever sees either. the drawing
pad is single-player by construction — it stores a save file, not a site. meanwhile
the site's public surfaces (guestbook, timeline, games) have no relationship to
accounts at all, and the `Role`/`Permission` work has no real job.

the fix is not a read-only profile page. mirroring private content to a public URL
is a web-2.0 idea wearing a terminal costume, and it goes nowhere. a shared room is
the one feature whose entire value is that other people are in it.

## decisions

settled during brainstorming, recorded so they are not relitigated:

- **one room.** no DMs, no threads, no channels, no reactions, no edit.
- **public read, signed-in to post.** visitors see real conversation; that is what
  makes an account worth making. an invisible room never gains anyone.
- **the machine talks.** the room's baseline content is real site events rendered
  as system lines, so an empty room reads as a live terminal on a quiet channel
  rather than a chat nobody came to. no fabricated activity.
- **the drawing pad is removed**, along with its stored strokes. one page has a
  saved drawing (the author's own); it is dropped.
- **profile copy is public.** the intro copy on the left of the dashboard is the
  account's profile text — the AIM away message shown when someone clicks a handle
  in the room. it is no longer described as private.

## non-goals

- direct messages, private rooms, or any second room
- presence, typing indicators, or read receipts
- message editing, replies, threading, or reactions
- realtime transport (websockets/SSE) in v1 — see *transport*
- announcing new timeline posts — see *system lines*

## surfaces

three views onto one room.

| route | who | what |
|---|---|---|
| `/talk` | everyone | the room, server-rendered and read-only for signed-out visitors; linkable and indexable |
| `/dashboard` | account holders | the same room in the right-hand card, with a composer. the left column keeps the intro copy, reframed as profile text |
| `/users` shell | everyone | a `talk` command tailing the last 10 lines, consistent with `ls`/`tree`/`open` |

`/talk` is the unix command for interactive chat and fits the shell metaphor better
than `/chat`. the name is cosmetic and cheap to change before launch.

the room component is written once and mounted in both `/talk` and `/dashboard`;
the composer is a prop, present wherever there is a session and absent otherwise —
so a signed-in visitor can post from `/talk` directly without routing through the
dashboard.

the shell's `talk` **reads only** in v1. the shell already owns `login`/`signup`, so
posting from it is tempting, but it would be a second write path against the same
mutation with its own validation surface. it can be added once the room is real.

## data model

one table, one ordered timeline, a `kind` discriminator instead of two tables — a
single pagination path and a single query.

```prisma
enum MessageKind {
  user
  system
}

model Message {
  message_id String      @id @default(cuid())
  kind       MessageKind
  body       String
  user_id    String?
  created_at DateTime    @default(now())
  deleted_at DateTime?

  user User? @relation(fields: [user_id], references: [user_id], onDelete: SetNull)

  @@index([created_at, message_id])
}
```

- `user_id` is nullable: system lines have no author, and `SetNull` keeps room
  history intact if an account is ever deleted.
- `deleted_at` is a soft delete. hard deletion would tear holes in the cursors;
  soft-deleted rows are filtered on read and keep ordering stable.
- cuid is not monotonic, so ordering and cursors are `(created_at, message_id)`.
  the compound index matches.

`User` also gains `created_at DateTime @default(now())`. it does not have one today,
which is why account-join lines cannot be backfilled honestly (see below).

## api

added to the existing type-graphql schema on the Fastify backend.

```
query roomMessages(after: ID, before: ID, limit: Int): [RoomMessage!]!
query publicProfile(username: String!): PublicProfile
mutation postMessage(body: String!): RoomMessage!
mutation deleteMessage(messageId: ID!): Boolean!
```

- `roomMessages` takes **no** auth. `Context.currentUser` is already nullable, so a
  public resolver just does not call `requireCurrentUser`.
- `postMessage` calls `requireCurrentUser`, exactly like `PersonalPageResolver`.
- `deleteMessage` requires the `Admin` role through the existing `customAuthChecker`.
  this is the first real job the `Role`/`Permission` work has had.
- `RoomMessage.author` carries only the handle. profile text is **not** inlined on
  every message — it would repeat per row. clicking a handle fetches
  `publicProfile(username)`, which returns the account's intro copy.

read patterns: initial load takes the newest 50; polling asks for everything
`after` the newest id held; scrollback asks for 50 `before` the oldest id held.
`limit` is clamped server-side to 100, as `UserService.findMany` already does.

## transport

**cursor polling**, not subscriptions.

mercurius supports subscriptions server-side, so the backend is not the blocker —
the client is. `graphql-request` has no subscription support, so subscriptions mean
adding `graphql-ws`, a second client, and connection auth, for an effect nobody
perceives in a room this size.

the client polls `roomMessages(after:)` every **5 seconds**, **only while the tab
is visible** (`document.visibilityState`), and degrades to a manual refresh if a
poll fails. the resolver boundary stays clean so a later swap to subscriptions is a
transport change, not a rewrite.

## system lines

the room's baseline content, so it is never empty.

**v1 sources, both real:**

1. **guestbook signatures.** `GuestbookEntry` already stores a real `created_at`,
   is already public, and has 4 existing rows dated 2026-09-02 to 2026-09-05.
   these are backfilled with their true timestamps, and the guestbook server action
   writes a line on every new signature. this also connects the anonymous guestbook
   to the room — two existing features that currently know nothing about each other.
2. **account joins.** written when an account is created. **not backfilled**: `User`
   has no `created_at`, so every existing account would claim to have joined at the
   migration timestamp. that is fabricated activity, and the whole point of this
   feature is that the machine only says true things. the 9 existing accounts get
   no join lines; accounts created after ship do.

the motd is static text rendered above the timeline, not a stored row — it is
chrome, not history.

**deliberately excluded from v1:** timeline post announcements. the timeline is
file-backed and statically generated, so a new post has no runtime moment to hook.
inventing a build-time writer is more machinery than the line is worth; it can be
added when there is a reason.

tip ideas are also excluded — they are submitted as suggestions, not as public speech.

## moderation

this is the site's first public, persistent, attributed write surface open to anyone
who can sign up. `PRODUCT.md` currently states there is deliberately no moderation
UI; that claim narrows to the guestbook and is updated.

- **length cap** of 500 characters on the message body, enforced on the server and
  mirrored in the client, following the existing `personal-page.ts` /
  `personal-page-validation.ts` split so the composer never offers what the server
  refuses.
- **rate limit per account** on `postMessage`: 10 messages per rolling minute. the
  backend has none today — the guestbook's IP limiter lives in the Next app's server
  action and does not cover a GraphQL mutation. add `@fastify/rate-limit`, or a small
  keyed limiter beside the resolver.
- **blank and whitespace-only bodies rejected**, bodies trimmed.
- **admin soft delete**, surfaced in `/admin`. deleted lines are filtered on read.
- rendering is strictly text, matching the guestbook's existing rule. no markdown,
  no links parsed out of message bodies.

## what gets removed

- `apps/my-app/app/dashboard/personal-drawing.tsx`
- `PersonalPage.strokes`, plus the migration that drops it
- the stroke half of `personal-page-validation.ts` and its client mirror
- the stroke cases in `apps/my-app/tests/personal-page.test.ts`
- `savePersonalDrawing` and the stroke fields on the personal page queries
- the drawing-related paragraphs in `PRODUCT.md`

the intro copy, its bounds, and `savePersonalIntro` all stay — that half of the
personal page becomes the profile text.

## testing

the repo tests pure logic with vitest and has no component-testing setup; adding
one is out of scope. covered by unit tests:

- message body validation: length bound, blank/whitespace rejection, trimming
- cursor ordering: `(created_at, message_id)` comparison, including equal timestamps
- system line formatting for each source
- the rate limiter's window behaviour

verification, per `AGENTS.md`: `yarn check-types`, `yarn lint`, `yarn build` from
the root, plus `yarn test` in `apps/my-app`.

## risks

- **the room may still be quiet.** system lines make an empty room legible, but 4
  backfilled guestbook lines are a thin history. if the room stays silent the
  feature has not failed, but it has not yet succeeded either — worth revisiting
  the system-line sources rather than adding features on top.
- **moderation is manual.** one admin, soft delete, no queue. that is right at this
  scale and wrong at any larger one.
- **`/talk` is indexable.** public and attributed by handle. that is the intent, but
  it is a change in kind for this site, which has had no public user-generated text
  outside the guestbook's names.

## product doc updates

`PRODUCT.md` needs: the new `/talk` surface; the dashboard rewritten from
intro-plus-drawing to profile-plus-room; the "nothing on the dashboard is public"
line removed; the personal page bounds paragraph reduced to the intro copy; and the
no-moderation claim narrowed to the guestbook.
