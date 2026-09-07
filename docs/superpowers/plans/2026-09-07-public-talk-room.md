# Public Talk Room Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dashboard drawing pad with one public chat room that anyone can read and any signed-in account can post to.

**Architecture:** One `Message` table holds an append-only timeline of two line kinds — `user` messages and `system` lines emitted by real site events. A public type-graphql resolver reads it with opaque `(created_at, message_id)` cursors; a session-gated mutation writes to it. The frontend polls the cursor while the tab is visible and mounts the same room component at `/talk` and in the dashboard card.

**Tech Stack:** Next.js 16 (App Router, webpack), Fastify + mercurius + type-graphql, Prisma/PostgreSQL, graphql-request + graphql-codegen, vitest, Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-09-07-public-talk-room-design.md`

## Global Constraints

- Conventional Commits for every commit: `<type>(<optional-scope>): <description>` (`AGENTS.md`).
- Message body cap is **500 characters**, enforced server-side and mirrored client-side.
- Post rate limit is **10 messages per rolling 60 seconds, per account**.
- Room page size is **50**; server clamps any requested `limit` to **100**.
- Poll interval is **5 seconds**, and only while `document.visibilityState === 'visible'`.
- Message bodies render as **plain text only** — no markdown, no link parsing.
- Copy is lowercase and casual, matching the site's voice (`PRODUCT.md`).
- Reuse `PageShell` and `PageIntro` where their layout fits (`PRODUCT.md`).
- Tailwind classes in `packages/ui` must stay complete static strings; app-level classes follow the same habit.
- Verification after each task: `yarn check-types`, `yarn lint` from the root; `yarn test` in `apps/my-app`. `yarn build` before the final task's commit.
- No fabricated activity: system lines are written only from real events with real timestamps.

---

### Task 1: Message model and migration

**Files:**
- Modify: `packages/database/prisma/schema.prisma`
- Create: `packages/database/prisma/migrations/20260907120000_add_message/migration.sql`

**Interfaces:**
- Consumes: nothing
- Produces: Prisma models `Message`, enum `MessageKind` (`user` | `system`), and `User.created_at: DateTime`. Field names used by every later task: `message_id`, `kind`, `body`, `user_id`, `created_at`, `deleted_at`.

- [ ] **Step 1: Add the enum and model to the schema**

Append to `packages/database/prisma/schema.prisma`:

```prisma
enum MessageKind {
  user
  system
}

/// One public room. `kind` discriminates a posted message from a system line emitted by a real
/// site event, so both share one ordered timeline and one pagination path. cuid is not
/// monotonic, so ordering and cursors are always (created_at, message_id).
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

- [ ] **Step 2: Add the back-relation and created_at to User**

In the `User` model in the same file, add these two lines:

```prisma
  created_at    DateTime  @default(now())
  messages      Message[]
```

- [ ] **Step 3: Write the migration SQL**

Create `packages/database/prisma/migrations/20260907120000_add_message/migration.sql`:

```sql
-- CreateEnum
CREATE TYPE "MessageKind" AS ENUM ('user', 'system');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Message" (
    "message_id" TEXT NOT NULL,
    "kind" "MessageKind" NOT NULL,
    "body" TEXT NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("message_id")
);

-- CreateIndex
CREATE INDEX "Message_created_at_message_id_idx" ON "Message"("created_at", "message_id");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
```

- [ ] **Step 4: Apply and verify**

Run from `packages/database`:

```bash
npx prisma migrate dev --name add_message
yarn db:validate
```

Expected: migration applies, `prisma validate` reports the schema is valid. If `migrate dev` wants to create a second migration directory because the hand-written SQL drifted, delete the generated one and fix the hand-written SQL instead — the repo keeps hand-written migrations.

- [ ] **Step 5: Verify types across the monorepo**

Run from the repo root: `yarn check-types`
Expected: PASS. The regenerated client now exports `MessageKind`.

- [ ] **Step 6: Commit**

```bash
git add packages/database/prisma/schema.prisma packages/database/prisma/migrations
git commit -m "feat(database): add the message model for the public room"
```

---

### Task 2: Message validation, shared bounds

**Files:**
- Create: `apps/backend/src/services/message-validation.ts`
- Create: `apps/my-app/app/lib/room.ts`
- Create: `apps/my-app/tests/room-message.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - Backend `MAX_MESSAGE_LENGTH: number`, `normalizeMessageBody(value: string): string`, `validateMessageBody(body: unknown): MessageValidation` where `MessageValidation = { ok: true; value: string } | { ok: false; reason: string }`
  - Client mirror `MAX_MESSAGE_LENGTH`, `normalizeMessageBody`, `checkMessageBody(body: string): string | null` returning an error string or `null`

The backend is the trust boundary; the client copy exists so the composer never offers what the server refuses. This mirrors the existing `personal-page-validation.ts` / `app/lib/personal-page.ts` split exactly.

- [ ] **Step 1: Write the failing test**

Create `apps/my-app/tests/room-message.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { checkMessageBody, MAX_MESSAGE_LENGTH, normalizeMessageBody } from '../app/lib/room'
import {
  MAX_MESSAGE_LENGTH as BACKEND_MAX_MESSAGE_LENGTH,
  validateMessageBody,
} from '../../backend/src/services/message-validation'

describe('message body validation', () => {
  it('keeps the client and server bounds identical', () => {
    expect(MAX_MESSAGE_LENGTH).toBe(BACKEND_MAX_MESSAGE_LENGTH)
  })

  it('accepts a body the backend also accepts', () => {
    expect(checkMessageBody('  hey  ')).toBeNull()
    expect(validateMessageBody('  hey  ')).toEqual({ ok: true, value: 'hey' })
  })

  it('rejects a blank body on both sides', () => {
    expect(checkMessageBody('   ')).toBe('type something first')
    expect(validateMessageBody('   ')).toEqual({ ok: false, reason: 'type something first' })
  })

  it('rejects a body over the cap on both sides', () => {
    const tooLong = 'a'.repeat(MAX_MESSAGE_LENGTH + 1)

    expect(checkMessageBody(tooLong)).toBe(`keep it under ${MAX_MESSAGE_LENGTH} characters`)
    expect(validateMessageBody(tooLong)).toEqual({
      ok: false,
      reason: `keep it under ${MAX_MESSAGE_LENGTH} characters`,
    })
  })

  it('collapses newlines and strips control characters', () => {
    expect(normalizeMessageBody('a\r\nb\tc')).toBe('a b c')
  })

  it('refuses a non-string body on the server', () => {
    expect(validateMessageBody(42)).toEqual({ ok: false, reason: 'type something first' })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run from `apps/my-app`: `yarn test room-message`
Expected: FAIL — cannot resolve `../app/lib/room`.

- [ ] **Step 3: Write the backend validation**

Create `apps/backend/src/services/message-validation.ts`:

```ts
export const MAX_MESSAGE_LENGTH = 500

export type MessageValidation = { ok: true; value: string } | { ok: false; reason: string }

/**
 * A room line is a single run of printable text. Unlike the intro copy, newlines are collapsed
 * rather than kept: a message is one line in a transcript, and a pasted wall of newlines would
 * otherwise let one post own the whole viewport.
 */
export function normalizeMessageBody(value: string) {
  let stripped = ''

  for (const character of value.replace(/[\r\n\t]+/g, ' ')) {
    const code = character.codePointAt(0) ?? 0

    if (code < 32 || code === 127) continue

    stripped += character
  }

  return stripped.replace(/ {2,}/g, ' ').trim()
}

export function validateMessageBody(body: unknown): MessageValidation {
  if (typeof body !== 'string') return { ok: false, reason: 'type something first' }

  const value = normalizeMessageBody(body)

  if (!value) return { ok: false, reason: 'type something first' }
  if (value.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, reason: `keep it under ${MAX_MESSAGE_LENGTH} characters` }
  }

  return { ok: true, value }
}
```

- [ ] **Step 4: Write the client mirror**

Create `apps/my-app/app/lib/room.ts`:

```ts
// Mirrors apps/backend/src/services/message-validation.ts. The backend is the trust boundary;
// this copy keeps the composer from offering a message the server refuses.

export const MAX_MESSAGE_LENGTH = 500

export function normalizeMessageBody(value: string) {
  let stripped = ''

  for (const character of value.replace(/[\r\n\t]+/g, ' ')) {
    const code = character.codePointAt(0) ?? 0

    if (code < 32 || code === 127) continue

    stripped += character
  }

  return stripped.replace(/ {2,}/g, ' ').trim()
}

/** Returns the reason the body cannot be sent, or null when it can. */
export function checkMessageBody(body: string): string | null {
  const value = normalizeMessageBody(body)

  if (!value) return 'type something first'
  if (value.length > MAX_MESSAGE_LENGTH) return `keep it under ${MAX_MESSAGE_LENGTH} characters`

  return null
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run from `apps/my-app`: `yarn test room-message`
Expected: PASS, 6 tests.

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/services/message-validation.ts apps/my-app/app/lib/room.ts apps/my-app/tests/room-message.test.ts
git commit -m "feat(backend): validate room message bodies"
```

---

### Task 3: Room cursors

**Files:**
- Create: `apps/backend/src/services/room-cursor.ts`
- Create: `apps/my-app/tests/room-cursor.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `encodeRoomCursor(createdAt: Date, messageId: string): string` and `decodeRoomCursor(cursor: unknown): { createdAt: Date; messageId: string } | null`

Ordering is `(created_at, message_id)` because cuid is not monotonic. Encoding both halves into one opaque string means paging costs one query instead of a lookup followed by a query.

- [ ] **Step 1: Write the failing test**

Create `apps/my-app/tests/room-cursor.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { decodeRoomCursor, encodeRoomCursor } from '../../backend/src/services/room-cursor'

describe('room cursors', () => {
  it('round-trips a timestamp and id', () => {
    const createdAt = new Date('2026-09-07T12:00:00.000Z')
    const decoded = decodeRoomCursor(encodeRoomCursor(createdAt, 'abc123'))

    expect(decoded?.createdAt.toISOString()).toBe(createdAt.toISOString())
    expect(decoded?.messageId).toBe('abc123')
  })

  it('sorts lexically in the same order as the rows', () => {
    const older = encodeRoomCursor(new Date('2026-09-07T12:00:00.000Z'), 'aaa')
    const newer = encodeRoomCursor(new Date('2026-09-07T12:00:01.000Z'), 'aaa')

    expect(older < newer).toBe(true)
  })

  it('rejects malformed cursors rather than throwing', () => {
    expect(decodeRoomCursor('not-a-cursor')).toBeNull()
    expect(decodeRoomCursor('')).toBeNull()
    expect(decodeRoomCursor(undefined)).toBeNull()
    expect(decodeRoomCursor(12)).toBeNull()
  })

  it('rejects a cursor carrying an unparseable date', () => {
    expect(decodeRoomCursor(Buffer.from('nope|abc123').toString('base64url'))).toBeNull()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run from `apps/my-app`: `yarn test room-cursor`
Expected: FAIL — cannot resolve `room-cursor`.

- [ ] **Step 3: Write the implementation**

Create `apps/backend/src/services/room-cursor.ts`:

```ts
/**
 * An opaque (created_at, message_id) pair. Both halves travel together because cuid is not
 * monotonic: ordering by timestamp alone is ambiguous when two lines land in the same
 * millisecond, and a cursor of just an id would cost a lookup before every page.
 *
 * The ISO timestamp leads, so base64url cursors compare lexically in timeline order - the room
 * hook relies on that to keep merged pages sorted without decoding.
 */
export function encodeRoomCursor(createdAt: Date, messageId: string) {
  return Buffer.from(`${createdAt.toISOString()}|${messageId}`).toString('base64url')
}

export function decodeRoomCursor(cursor: unknown): { createdAt: Date; messageId: string } | null {
  if (typeof cursor !== 'string' || !cursor) return null

  const decoded = Buffer.from(cursor, 'base64url').toString('utf8')
  const separator = decoded.indexOf('|')

  if (separator < 1) return null

  const createdAt = new Date(decoded.slice(0, separator))
  const messageId = decoded.slice(separator + 1)

  if (Number.isNaN(createdAt.getTime()) || !messageId) return null

  return { createdAt, messageId }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run from `apps/my-app`: `yarn test room-cursor`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/services/room-cursor.ts apps/my-app/tests/room-cursor.test.ts
git commit -m "feat(backend): add opaque room cursors"
```

---

### Task 4: Backend rate limiter

**Files:**
- Create: `apps/backend/src/utils/rate-limit.ts`
- Create: `apps/my-app/tests/backend-rate-limit.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `checkRateLimit({ key, limit, windowMs, now? }): { allowed: boolean; retryAfterMs: number }` and `resetRateLimits(): void`

This is a port of `apps/my-app/app/lib/rate-limit.ts`. That copy guards a Next server action and cannot cover a GraphQL mutation on the Fastify backend. Porting keeps the behaviour identical and adds no dependency; `@fastify/rate-limit` would be a per-route limiter, not a per-account one.

- [ ] **Step 1: Write the failing test**

Create `apps/my-app/tests/backend-rate-limit.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { checkRateLimit, resetRateLimits } from '../../backend/src/utils/rate-limit'

describe('backend rate limit', () => {
  beforeEach(() => {
    resetRateLimits()
  })

  it('allows up to the limit inside one window', () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      expect(checkRateLimit({ key: 'user-1', limit: 10, windowMs: 60_000, now: 1_000 }).allowed).toBe(true)
    }
  })

  it('refuses the attempt past the limit and reports the wait', () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      checkRateLimit({ key: 'user-1', limit: 10, windowMs: 60_000, now: 1_000 })
    }

    const refused = checkRateLimit({ key: 'user-1', limit: 10, windowMs: 60_000, now: 31_000 })

    expect(refused.allowed).toBe(false)
    expect(refused.retryAfterMs).toBe(30_000)
  })

  it('starts a fresh window once the old one expires', () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      checkRateLimit({ key: 'user-1', limit: 10, windowMs: 60_000, now: 1_000 })
    }

    expect(checkRateLimit({ key: 'user-1', limit: 10, windowMs: 60_000, now: 62_000 }).allowed).toBe(true)
  })

  it('counts each key separately', () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      checkRateLimit({ key: 'user-1', limit: 10, windowMs: 60_000, now: 1_000 })
    }

    expect(checkRateLimit({ key: 'user-2', limit: 10, windowMs: 60_000, now: 1_000 }).allowed).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run from `apps/my-app`: `yarn test backend-rate-limit`
Expected: FAIL — cannot resolve `../../backend/src/utils/rate-limit`.

- [ ] **Step 3: Port the limiter**

Create `apps/backend/src/utils/rate-limit.ts` by copying `apps/my-app/app/lib/rate-limit.ts` verbatim — the `Window` type, the `windows` map, `MAX_TRACKED_KEYS`, `RateLimitOptions`, `checkRateLimit`, and `resetRateLimits` — replacing only the leading comment with:

```ts
/**
 * A fixed-window counter kept in process memory, ported from the guestbook limiter in
 * apps/my-app/app/lib/rate-limit.ts. That copy guards a Next server action and cannot see a
 * GraphQL mutation. This is a spam barrier, not a distributed limiter: each backend instance
 * counts on its own and the counts reset whenever the process does.
 */
```

- [ ] **Step 4: Run the test to verify it passes**

Run from `apps/my-app`: `yarn test backend-rate-limit`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/utils/rate-limit.ts apps/my-app/tests/backend-rate-limit.test.ts
git commit -m "feat(backend): add a per-account rate limiter"
```

---

### Task 5: Room resolver, public read

**Files:**
- Create: `apps/backend/src/resolvers/RoomResolver.ts`
- Modify: `apps/backend/src/utils/graphql.ts` (the resolver import block and the `resolvers` array, lines 29-32)

**Interfaces:**
- Consumes: `decodeRoomCursor`, `encodeRoomCursor` (Task 3)
- Produces: GraphQL `RoomMessage { messageId: ID!, kind: MessageKind!, body: String!, authorUsername: String, createdAt: String!, cursor: String! }` and `query roomMessages(after: String, before: String, limit: Int): [RoomMessage!]!`, always returned oldest-first. Also exports `ROOM_PAGE_SIZE` and `ROOM_MAX_PAGE_SIZE`.

The spec's `author` object is realized as a flat nullable `authorUsername`; a wrapper type would add a level for one string. Profile text is fetched separately (Task 7), never inlined per row.

- [ ] **Step 1: Write the resolver**

Create `apps/backend/src/resolvers/RoomResolver.ts`:

```ts
import 'reflect-metadata'
import { Arg, Ctx, Field, ID, Int, ObjectType, Query, Resolver, registerEnumType } from 'type-graphql'
import { MessageKind } from '@repo/database'
import type { Context } from '@/utils/graphql'
import { decodeRoomCursor, encodeRoomCursor } from '@/services/room-cursor'

registerEnumType(MessageKind, {
  name: 'MessageKind',
  description: 'Whether a room line was posted by an account or emitted by a site event',
})

export const ROOM_PAGE_SIZE = 50
export const ROOM_MAX_PAGE_SIZE = 100

@ObjectType()
export class RoomMessage {
  @Field(() => ID)
  messageId!: string

  @Field(() => MessageKind)
  kind!: MessageKind

  @Field(() => String)
  body!: string

  @Field(() => String, { nullable: true })
  authorUsername?: string | null

  @Field(() => String)
  createdAt!: string

  @Field(() => String)
  cursor!: string
}

type MessageRow = {
  message_id: string
  kind: MessageKind
  body: string
  created_at: Date
  user: { username: string } | null
}

const messageSelection = {
  message_id: true,
  kind: true,
  body: true,
  created_at: true,
  user: { select: { username: true } },
} as const

function toView(row: MessageRow): RoomMessage {
  return {
    messageId: row.message_id,
    kind: row.kind,
    body: row.body,
    authorUsername: row.user?.username ?? null,
    createdAt: row.created_at.toISOString(),
    cursor: encodeRoomCursor(row.created_at, row.message_id),
  }
}

@Resolver()
export class RoomResolver {
  /**
   * Public on purpose: the room is readable without an account, which is what makes signing up
   * worth anything. Deleted lines are filtered here rather than removed, so the cursors either
   * side of a moderated line keep resolving.
   */
  @Query(() => [RoomMessage])
  async roomMessages(
    @Ctx() context: Context,
    @Arg('after', () => String, { nullable: true }) after?: string,
    @Arg('before', () => String, { nullable: true }) before?: string,
    @Arg('limit', () => Int, { nullable: true }) limit?: number,
  ): Promise<RoomMessage[]> {
    const take = Math.min(Math.max(1, limit ?? ROOM_PAGE_SIZE), ROOM_MAX_PAGE_SIZE)
    const afterCursor = decodeRoomCursor(after)
    const beforeCursor = decodeRoomCursor(before)

    // newer than a cursor: read forward, so the rows arrive oldest-first already
    if (afterCursor) {
      const rows = await context.prisma.message.findMany({
        where: {
          deleted_at: null,
          OR: [
            { created_at: { gt: afterCursor.createdAt } },
            { created_at: afterCursor.createdAt, message_id: { gt: afterCursor.messageId } },
          ],
        },
        orderBy: [{ created_at: 'asc' }, { message_id: 'asc' }],
        select: messageSelection,
        take,
      })

      return rows.map(toView)
    }

    // older than a cursor, or the newest page when there is none: read backward, then flip
    const rows = await context.prisma.message.findMany({
      where: {
        deleted_at: null,
        ...(beforeCursor
          ? {
              OR: [
                { created_at: { lt: beforeCursor.createdAt } },
                { created_at: beforeCursor.createdAt, message_id: { lt: beforeCursor.messageId } },
              ],
            }
          : {}),
      },
      orderBy: [{ created_at: 'desc' }, { message_id: 'desc' }],
      select: messageSelection,
      take,
    })

    return rows.reverse().map(toView)
  }
}
```

- [ ] **Step 2: Register the resolver**

In `apps/backend/src/utils/graphql.ts`, add the import beside the other resolver imports:

```ts
import { RoomResolver } from '@/resolvers/RoomResolver'
```

and replace the `resolvers` declaration (currently lines 29-32) with:

```ts
const resolvers: NonEmptyArray<
  typeof UserResolver | typeof TipIdeaResolver | typeof PersonalPageResolver | typeof RoomResolver
> = [UserResolver, TipIdeaResolver, PersonalPageResolver, RoomResolver]
```

- [ ] **Step 3: Verify the schema builds and the query needs no auth**

Run from the repo root: `yarn check-types`
Expected: PASS.

Then start the backend (`yarn dev`) and query it with no Authorization header:

```bash
curl -s localhost:8000/api/graphql -H 'content-type: application/json' \
  -d '{"query":"{ roomMessages { messageId body cursor } }"}'
```

Expected: `{"data":{"roomMessages":[]}}` against the empty table — and specifically not an `UNAUTHENTICATED` error, which is the whole point of this task.

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/resolvers/RoomResolver.ts apps/backend/src/utils/graphql.ts
git commit -m "feat(backend): read the public room"
```

---

### Task 6: Room resolver, post and delete

**Files:**
- Modify: `apps/backend/src/resolvers/RoomResolver.ts`

**Interfaces:**
- Consumes: `validateMessageBody` (Task 2), `checkRateLimit` (Task 4), `requireCurrentUser` and `Context` from `@/utils/graphql`
- Produces: `mutation postMessage(body: String!): RoomMessage!` and `mutation deleteMessage(messageId: ID!): Boolean!`

- [ ] **Step 1: Add the imports and limits**

At the top of `apps/backend/src/resolvers/RoomResolver.ts`, extend the type-graphql import to include `Authorized` and `Mutation`, extend the `@repo/database` import to include `PermissionName`, and add:

```ts
import { GraphQLError } from 'graphql'
import { requireCurrentUser } from '@/utils/graphql'
import { validateMessageBody } from '@/services/message-validation'
import { checkRateLimit } from '@/utils/rate-limit'

const POSTS_PER_WINDOW = 10
const WINDOW_MS = 60_000
```

- [ ] **Step 2: Add the post and delete mutations**

Inside the `RoomResolver` class, after `roomMessages`:

```ts
  /**
   * The room's only write path. The body is normalized server-side, and the rate limit is keyed on
   * the account rather than the IP, because the session is the thing being spent here.
   */
  @Mutation(() => RoomMessage)
  async postMessage(@Ctx() context: Context, @Arg('body', () => String) body: string): Promise<RoomMessage> {
    const currentUser = requireCurrentUser(context)
    const validation = validateMessageBody(body)

    if (!validation.ok) {
      throw new GraphQLError(validation.reason, { extensions: { code: 'BAD_USER_INPUT' } })
    }

    const limit = checkRateLimit({ key: currentUser.user_id, limit: POSTS_PER_WINDOW, windowMs: WINDOW_MS })

    if (!limit.allowed) {
      throw new GraphQLError(`slow down - try again in ${Math.ceil(limit.retryAfterMs / 1000)}s`, {
        extensions: { code: 'BAD_USER_INPUT' },
      })
    }

    const row = await context.prisma.message.create({
      data: { body: validation.value, kind: MessageKind.user, user_id: currentUser.user_id },
      select: messageSelection,
    })

    return toView(row)
  }

  /**
   * Soft delete: the row stays so the cursors either side of it keep resolving, and the read query
   * filters it out. This is the first real job the Admin role has had.
   */
  @Authorized(PermissionName.UserWrite)
  @Mutation(() => Boolean)
  async deleteMessage(@Ctx() context: Context, @Arg('messageId', () => ID) messageId: string): Promise<boolean> {
    const updated = await context.prisma.message.updateMany({
      where: { message_id: messageId, deleted_at: null },
      data: { deleted_at: new Date() },
    })

    return updated.count > 0
  }
```

- [ ] **Step 3: Verify all three guards by hand**

Start the backend and check each case:

```bash
# no session -> UNAUTHENTICATED
curl -s localhost:8000/api/graphql -H 'content-type: application/json' \
  -d '{"query":"mutation { postMessage(body: \"hey\") { messageId } }"}'
```

Then, with a valid Bearer token from signing in: post `"   "` and expect `BAD_USER_INPUT` with `type something first`; post 11 messages inside a minute and expect the 11th to be refused with the `slow down` message; call `deleteMessage` as a `Basic` account and expect `FORBIDDEN`. Confirm a normal post returns a `messageId` and a `cursor`.

- [ ] **Step 4: Verify and commit**

Run from the repo root: `yarn check-types && yarn lint`

```bash
git add apps/backend/src/resolvers/RoomResolver.ts
git commit -m "feat(backend): post to and moderate the public room"
```

---

### Task 7: Public profile query

**Files:**
- Modify: `apps/backend/src/resolvers/PersonalPageResolver.ts`

**Interfaces:**
- Consumes: `Context`
- Produces: `type PublicProfile { username: String!, introTitle: String, introSubhead: String, introBody: String }` and `query publicProfile(username: String!): PublicProfile`

The intro copy is the account's profile text — the away message shown when a handle in the room is clicked. It is public by decision (see the spec's *decisions*). This query takes no auth and never returns the email, password hash, role, or user id.

- [ ] **Step 1: Add the type**

In `apps/backend/src/resolvers/PersonalPageResolver.ts`, add above the `PersonalPageResolver` class:

```ts
@ObjectType()
class PublicProfile {
  @Field(() => String)
  username!: string

  @Field(() => String, { nullable: true })
  introTitle?: string | null

  @Field(() => String, { nullable: true })
  introSubhead?: string | null

  @Field(() => String, { nullable: true })
  introBody?: string | null
}
```

- [ ] **Step 2: Add the query**

Inside the `PersonalPageResolver` class:

```ts
  /**
   * Public: this is what a handle in the room resolves to. The selection is written out rather
   * than spread, so the password hash and email cannot reach it by accident.
   */
  @Query(() => PublicProfile, { nullable: true })
  async publicProfile(
    @Ctx() context: Context,
    @Arg('username', () => String) username: string,
  ): Promise<PublicProfile | null> {
    const row = await context.prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
        personalPage: { select: { intro_title: true, intro_subhead: true, intro_body: true } },
      },
    })

    if (!row) return null

    return {
      username: row.username,
      introTitle: row.personalPage?.intro_title ?? null,
      introSubhead: row.personalPage?.intro_subhead ?? null,
      introBody: row.personalPage?.intro_body ?? null,
    }
  }
```

- [ ] **Step 3: Verify it takes no auth and leaks nothing**

```bash
curl -s localhost:8000/api/graphql -H 'content-type: application/json' \
  -d '{"query":"{ publicProfile(username: \"kelev\") { username introTitle introSubhead } }"}'
```

Expected: the profile, with no Authorization header sent. Confirm an unknown username returns `null` rather than an error, and confirm the schema exposes no `email` or `passwordHash` field on `PublicProfile`.

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/resolvers/PersonalPageResolver.ts
git commit -m "feat(backend): expose public profile copy"
```

---

### Task 8: System lines from the guestbook

**Files:**
- Create: `apps/my-app/app/lib/system-lines.ts`
- Modify: `apps/my-app/app/lib/guestbook.ts` (the `signGuestbook` function)
- Create: `packages/database/prisma/backfill-guestbook-lines.ts`
- Modify: `packages/database/package.json` (scripts)
- Create: `apps/my-app/tests/system-lines.test.ts`

**Interfaces:**
- Consumes: `MessageKind` from `@repo/database`, `DrawingKindName` from `app/input/guestbook-name`
- Produces: `guestbookSystemLine(seed: string, kind: DrawingKindName): string` and `writeGuestbookSystemLine(seed, kind): Promise<void>`

The guestbook is written from the Next app straight to Prisma (`lib/guestbook.ts` is `server-only`), while the room is written from the Fastify backend. Both are server-side writers into the same table — that is expected, not a mistake.

- [ ] **Step 1: Write the failing test**

Create `apps/my-app/tests/system-lines.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { guestbookSystemLine } from '../app/lib/system-lines'

describe('guestbook system lines', () => {
  it('names the signer', () => {
    expect(guestbookSystemLine('kaleb-hines', 'face')).toBe('kaleb-hines signed the guestbook')
  })

  it('mentions the remix for a cat drawing', () => {
    expect(guestbookSystemLine('kaleb-hines', 'cat')).toBe('kaleb-hines signed the guestbook as a cat')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run from `apps/my-app`: `yarn test system-lines`
Expected: FAIL — cannot resolve `../app/lib/system-lines`.

The import of `system-lines` pulls in `server-only`, which throws outside a server context. If vitest reports that rather than a missing module, split the pure `guestbookSystemLine` into `app/lib/system-line-copy.ts` with no `server-only` import and have both the test and `system-lines.ts` import it from there.

- [ ] **Step 3: Write the line builder and writer**

Create `apps/my-app/app/lib/system-lines.ts`:

```ts
import 'server-only'

import { MessageKind, prisma } from '@repo/database'
import type { DrawingKindName } from '../input/guestbook-name'

/** Pure, so the copy is testable without a database. */
export function guestbookSystemLine(seed: string, kind: DrawingKindName) {
  return kind === 'cat' ? `${seed} signed the guestbook as a cat` : `${seed} signed the guestbook`
}

/**
 * The room's baseline content. A signature is already public, so announcing it discloses nothing
 * new - it just gives the room real history instead of an empty transcript.
 */
export async function writeGuestbookSystemLine(seed: string, kind: DrawingKindName) {
  await prisma.message.create({
    data: { body: guestbookSystemLine(seed, kind), kind: MessageKind.system },
  })
}
```

- [ ] **Step 4: Call it from the guestbook write path**

In `apps/my-app/app/lib/guestbook.ts`, import `writeGuestbookSystemLine` and replace `signGuestbook` with:

```ts
export async function signGuestbook(seed: string, kind: DrawingKindName) {
  const existing = await prisma.guestbookEntry.findUnique({
    select: { entry_id: true },
    where: { seed_kind: { kind, seed } },
  })

  await prisma.guestbookEntry.upsert({
    create: { kind, seed },
    update: {},
    where: { seed_kind: { kind, seed } },
  })

  // signing the same name twice is a no-op today and must stay one, so it must not announce twice
  if (!existing) await writeGuestbookSystemLine(seed, kind)
}
```

- [ ] **Step 5: Write the backfill script**

Create `packages/database/prisma/backfill-guestbook-lines.ts`:

```ts
import { MessageKind, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Gives the room real history on the day it ships. The timestamps are the guestbook's own, so
 * nothing here invents activity. Safe to re-run: it skips any signature already announced.
 */
async function main() {
  const entries = await prisma.guestbookEntry.findMany({
    orderBy: [{ created_at: 'asc' }, { entry_id: 'asc' }],
    select: { created_at: true, kind: true, seed: true },
  })

  let written = 0

  for (const entry of entries) {
    const body =
      entry.kind === 'cat' ? `${entry.seed} signed the guestbook as a cat` : `${entry.seed} signed the guestbook`

    const already = await prisma.message.findFirst({
      select: { message_id: true },
      where: { body, kind: MessageKind.system },
    })

    if (already) continue

    await prisma.message.create({ data: { body, created_at: entry.created_at, kind: MessageKind.system } })
    written += 1
  }

  console.log(`wrote ${written} system lines from ${entries.length} guestbook entries`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
```

Add to the `scripts` block of `packages/database/package.json`:

```json
"db:backfill:room": "tsx prisma/backfill-guestbook-lines.ts"
```

- [ ] **Step 6: Run the backfill and the tests**

Run from `packages/database`: `yarn db:backfill:room`
Expected: `wrote 4 system lines from 4 guestbook entries`. Run it a second time and expect `wrote 0 system lines from 4 guestbook entries`, proving it is re-runnable.

Run from `apps/my-app`: `yarn test system-lines`
Expected: PASS, 2 tests.

- [ ] **Step 7: Commit**

```bash
git add apps/my-app/app/lib/system-lines.ts apps/my-app/app/lib/guestbook.ts apps/my-app/tests/system-lines.test.ts packages/database/prisma/backfill-guestbook-lines.ts packages/database/package.json
git commit -m "feat(room): announce guestbook signatures as system lines"
```

---

### Task 9: System lines from new accounts

**Files:**
- Modify: `apps/backend/src/services/UserService.ts` (the account creation path)

**Interfaces:**
- Consumes: `MessageKind` from `@repo/database`
- Produces: a `system` message written when an account is created

Existing accounts get **no** join lines. `User.created_at` was only added in Task 1, so every existing row carries the migration timestamp — backfilling would claim nine accounts joined at the same instant, which is exactly the fabricated activity the design rules out.

- [ ] **Step 1: Write the line when an account is created**

In `apps/backend/src/services/UserService.ts`, add `MessageKind` to the existing `@repo/database` import, then find the method that calls `prisma.user.create` and add this immediately after the account is created, before it is returned:

```ts
    // new accounts announce themselves. existing ones are not backfilled: User.created_at arrived
    // with the room, so every older account would claim to have joined at the migration.
    await this.prisma.message.create({
      data: { body: `${created.username} joined`, kind: MessageKind.system },
    })
```

Use whatever the local variable for the created user is actually called in that method rather than assuming `created`.

- [ ] **Step 2: Verify by signing up**

Start the app, create an account through `/welcome`, then:

```bash
curl -s localhost:8000/api/graphql -H 'content-type: application/json' \
  -d '{"query":"{ roomMessages { kind body } }"}'
```

Expected: the newest line is `{"kind":"system","body":"<username> joined"}`.

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/services/UserService.ts
git commit -m "feat(room): announce new accounts as system lines"
```

---

### Task 10: Room data hook

**Files:**
- Create: `apps/my-app/app/talk/use-room.ts`
- Modify: `apps/my-app/app/generated/` (regenerated by codegen)

**Interfaces:**
- Consumes: `gqlClient`, `checkMessageBody` (Task 2), the `roomMessages` query and `postMessage` mutation (Tasks 5 and 6)
- Produces: `useRoom({ recoverSession }): { hasOlder, isLoaded, isPosting, loadError, loadOlder, messages, post }` where `messages: RoomLine[]`, `RoomLine = { messageId: string; kind: 'user' | 'system'; body: string; authorUsername: string | null; createdAt: string; cursor: string }`, and `post(body: string): Promise<PostResult>` with `PostResult = { ok: true } | { ok: false; reason: string }`. Also exports `ROOM_MESSAGES_QUERY` for reuse by Tasks 14 and 15.

Polling, not subscriptions — see the spec's *transport*. Follows the shape of the existing `usePersonalPage` hook, including its `recoverSession` escape hatch.

- [ ] **Step 1: Write the documents and run codegen**

Create `apps/my-app/app/talk/use-room.ts` with the imports and documents:

```ts
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { graphql } from '../generated/gql'
import { gqlClient } from '../services/graphql-client'
import { checkMessageBody } from '../lib/room'

export const ROOM_MESSAGES_QUERY = graphql(`
  query RoomMessages($after: String, $before: String, $limit: Int) {
    roomMessages(after: $after, before: $before, limit: $limit) {
      messageId
      kind
      body
      authorUsername
      createdAt
      cursor
    }
  }
`)

const POST_MESSAGE_MUTATION = graphql(`
  mutation PostMessage($body: String!) {
    postMessage(body: $body) {
      messageId
      kind
      body
      authorUsername
      createdAt
      cursor
    }
  }
`)

const POLL_INTERVAL_MS = 5_000
const PAGE_SIZE = 50
```

Run from `apps/my-app`: `yarn codegen`
Expected: the generated documents appear under `app/generated/`. The backend must be running, since codegen reads the live schema.

- [ ] **Step 2: Write the hook**

Append to `apps/my-app/app/talk/use-room.ts`:

```ts
export type RoomLine = {
  messageId: string
  kind: 'user' | 'system'
  body: string
  authorUsername: string | null
  createdAt: string
  cursor: string
}

export type PostResult = { ok: true } | { ok: false; reason: string }

/**
 * Polls rather than subscribes. graphql-request has no subscription transport, and at this room's
 * size a five-second cursor poll is indistinguishable from a live socket. Polling pauses while the
 * tab is hidden, so a backgrounded dashboard is not a standing query every five seconds.
 */
export function useRoom({ recoverSession }: { recoverSession: (caughtError: unknown) => boolean }) {
  const [messages, setMessages] = useState<RoomLine[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isPosting, setIsPosting] = useState(false)
  const [hasOlder, setHasOlder] = useState(true)
  const newestCursor = useRef<string | null>(null)

  // cursors sort lexically in timeline order (see room-cursor.ts), so merging never decodes them
  const merge = useCallback((incoming: RoomLine[]) => {
    if (!incoming.length) return

    setMessages((current) => {
      const seen = new Set(current.map((line) => line.messageId))
      const added = incoming.filter((line) => !seen.has(line.messageId))

      if (!added.length) return current

      const next = [...current, ...added].sort((left, right) => (left.cursor < right.cursor ? -1 : 1))
      newestCursor.current = next[next.length - 1]?.cursor ?? null

      return next
    })
  }, [])

  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const result = await gqlClient.request(ROOM_MESSAGES_QUERY, {
          after: newestCursor.current,
          limit: PAGE_SIZE,
        })

        if (cancelled) return

        merge(result.roomMessages as RoomLine[])
        setLoadError(null)
        setIsLoaded(true)
      } catch (caughtError) {
        if (cancelled || recoverSession(caughtError)) return

        setLoadError('could not reach the room')
      }
    }

    void poll()

    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void poll()
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [merge, recoverSession])

  const loadOlder = useCallback(async () => {
    const oldest = messages[0]?.cursor

    if (!oldest) return

    try {
      const result = await gqlClient.request(ROOM_MESSAGES_QUERY, { before: oldest, limit: PAGE_SIZE })
      const older = result.roomMessages as RoomLine[]

      // a short page means there is nothing further back
      setHasOlder(older.length === PAGE_SIZE)
      merge(older)
    } catch (caughtError) {
      if (recoverSession(caughtError)) return

      setLoadError('could not load older lines')
    }
  }, [merge, messages, recoverSession])

  const post = useCallback(
    async (body: string): Promise<PostResult> => {
      const localReason = checkMessageBody(body)

      if (localReason) return { ok: false, reason: localReason }

      setIsPosting(true)

      try {
        const result = await gqlClient.request(POST_MESSAGE_MUTATION, { body })

        merge([result.postMessage as RoomLine])

        return { ok: true }
      } catch (caughtError) {
        if (recoverSession(caughtError)) {
          return { ok: false, reason: 'your session expired - sign in again' }
        }

        return { ok: false, reason: 'could not send that' }
      } finally {
        setIsPosting(false)
      }
    },
    [merge, recoverSession],
  )

  return { hasOlder, isLoaded, isPosting, loadError, loadOlder, messages, post }
}
```

- [ ] **Step 3: Verify types**

Run from the repo root: `yarn check-types`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/my-app/app/talk/use-room.ts apps/my-app/app/generated
git commit -m "feat(room): poll the room over a cursor"
```

---

### Task 11: Room component

**Files:**
- Create: `apps/my-app/app/talk/room.tsx`

**Interfaces:**
- Consumes: `useRoom` (Task 10), `MAX_MESSAGE_LENGTH` from `app/lib/room`, `useAuth`, `Button` from `@repo/ui/button`, `Variant` from `@repo/ui/variant`
- Produces: `<Room canPost={boolean} />` — the transcript plus, when `canPost`, the composer. Mounted by both `/talk` (Task 12) and the dashboard (Task 13).

- [ ] **Step 1: Write the component**

Create `apps/my-app/app/talk/room.tsx`:

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@repo/ui/button'
import { Variant } from '@repo/ui/variant'
import { useAuth } from '../components/use-auth'
import { MAX_MESSAGE_LENGTH } from '../lib/room'
import { useRoom } from './use-room'

const MOTD = 'one room. be nice.'

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function Room({ canPost }: { canPost: boolean }) {
  const { recoverSession } = useAuth()
  const { hasOlder, isLoaded, isPosting, loadError, loadOlder, messages, post } = useRoom({ recoverSession })
  const [draft, setDraft] = useState('')
  const [sendError, setSendError] = useState<string | null>(null)
  const transcript = useRef<HTMLDivElement>(null)

  // pin to the newest line, unless the reader has scrolled up to read history
  useEffect(() => {
    const element = transcript.current

    if (!element) return

    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 80

    if (isNearBottom) element.scrollTop = element.scrollHeight
  }, [messages])

  async function send() {
    const result = await post(draft)

    if (!result.ok) {
      setSendError(result.reason)
      return
    }

    setDraft('')
    setSendError(null)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-[clamp(18px,2vw,28px)] py-4" ref={transcript}>
        <p className="m-0 font-mono text-[0.64rem] tracking-[0.06em] text-muted lowercase">{MOTD}</p>

        {hasOlder && messages.length > 0 ? (
          <button
            className="mt-3 font-mono text-[0.64rem] tracking-[0.06em] text-muted lowercase underline"
            onClick={() => void loadOlder()}
            type="button"
          >
            load older
          </button>
        ) : null}

        <ol className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
          {messages.map((line) => (
            <li className="font-mono text-[0.72rem] leading-[1.5]" key={line.messageId}>
              <span className="text-muted">{formatTime(line.createdAt)}</span>{' '}
              {line.kind === 'system' ? (
                <span className="text-muted">* {line.body}</span>
              ) : (
                <>
                  <span className="text-accent">{line.authorUsername ?? 'someone'}</span>{' '}
                  <span className="text-foreground">{line.body}</span>
                </>
              )}
            </li>
          ))}
        </ol>

        {isLoaded && messages.length === 0 ? (
          <p className="m-0 mt-4 font-mono text-[0.66rem] tracking-[0.06em] text-muted lowercase">nothing here yet</p>
        ) : null}
      </div>

      <div className="border-t border-line px-[clamp(18px,2vw,28px)] py-4">
        {canPost ? (
          <div className="flex items-center gap-3">
            <input
              aria-label="message"
              className="min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-[0.72rem] text-foreground caret-accent outline-none placeholder:text-muted"
              maxLength={MAX_MESSAGE_LENGTH}
              onChange={(event) => {
                setDraft(event.currentTarget.value)
                setSendError(null)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void send()
              }}
              placeholder="say something"
              value={draft}
            />
            <Button
              disabled={isPosting || draft.trim().length === 0}
              onClick={() => void send()}
              variant={Variant.PRIMARY}
            >
              {isPosting ? 'sending...' : 'send'}
            </Button>
          </div>
        ) : (
          <p className="m-0 font-mono text-[0.66rem] tracking-[0.06em] text-muted lowercase">
            sign in to say something
          </p>
        )}

        {sendError || loadError ? (
          <p className="m-0 mt-2 font-mono text-[0.66rem] tracking-[0.06em] text-danger lowercase" role="alert">
            {sendError || loadError}
          </p>
        ) : null}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify types and lint**

Run from the repo root: `yarn check-types && yarn lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/my-app/app/talk/room.tsx
git commit -m "feat(room): add the shared room component"
```

---

### Task 12: The /talk route

**Files:**
- Create: `apps/my-app/app/talk/page.tsx`
- Create: `apps/my-app/app/talk/layout.tsx`
- Modify: `apps/my-app/app/lib/site-routes.ts`
- Modify: `apps/my-app/tests/site-routes.test.ts`

**Interfaces:**
- Consumes: `Room` (Task 11), `PageShell`, `PageIntro`, `useAuth`
- Produces: the public `/talk` route, and a `/talk/` entry in the shared route table that the homepage, the shell's `ls`, and the admin console all read

- [ ] **Step 1: Add the route to the site route table**

In `apps/my-app/app/lib/site-routes.ts`, add this entry to `SITE_ROUTES` immediately after the `users` entry, so the shell's `ls` lists it beside the shell itself:

```ts
  { command: 'talk', href: '/talk/', label: 'talk', path: 'talk' },
```

`/dashboard` and `/admin` are deliberately absent from this table because they are not public; `/talk` belongs in it because it is.

Then extend `apps/my-app/tests/site-routes.test.ts` so the new route is covered by the two existing cases:

```ts
    expect(resolveSiteRoute('talk')?.href).toBe('/talk/')
```

added to the first `it`, and:

```ts
    expect(getTerminalListing()).toContain('talk/')
```

added to the second.

- [ ] **Step 2: Write the page**

Create `apps/my-app/app/talk/page.tsx`:

```tsx
'use client'

import { PageIntro } from '../components/page-intro'
import { PageShell } from '../components/page-shell'
import { useAuth } from '../components/use-auth'
import { Room } from './room'

export default function TalkPage() {
  const { isHydrated, isSessionChecked, user } = useAuth()
  const canPost = isHydrated && isSessionChecked && Boolean(user)

  return (
    <PageShell
      breadcrumbs={[
        { label: 'users', href: '/users/' },
        { label: 'talk', href: '/talk/' },
      ]}
      titleId="talk-title"
      left={
        <PageIntro
          body="anyone can read it. an account is what lets you answer."
          subhead="one room, no dms, no threads"
          title={'say\nsomething'}
          titleId="talk-title"
        />
      }
      right={<Room canPost={canPost} />}
      rightInset={false}
    />
  )
}
```

- [ ] **Step 3: Add the metadata layout**

`page.tsx` is a client component, and `metadata` cannot be exported from one. Create `apps/my-app/app/talk/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'talk',
  description: 'the one public room.',
}

export default function TalkLayout({ children }: { children: ReactNode }) {
  return children
}
```

- [ ] **Step 4: Verify in the browser**

Run `yarn dev` and open `http://localhost:3000/talk/` **signed out**.
Expected: the transcript renders the 4 backfilled guestbook lines, and the composer is replaced by `sign in to say something`. Then sign in and confirm the composer appears, a posted message shows immediately, and a second browser sees it within five seconds.

- [ ] **Step 5: Verify and commit**

Run from the repo root: `yarn check-types && yarn lint`; from `apps/my-app`: `yarn test`

```bash
git add apps/my-app/app/talk apps/my-app/app/lib/site-routes.ts apps/my-app/tests/site-routes.test.ts
git commit -m "feat(talk): add the public room route"
```

---

### Task 13: Swap the dashboard pad for the room

**Files:**
- Modify: `apps/my-app/app/dashboard/dashboard.tsx`
- Delete: `apps/my-app/app/dashboard/personal-drawing.tsx`

**Interfaces:**
- Consumes: `Room` (Task 11)
- Produces: the dashboard's right card is the room; its left column keeps the profile copy unchanged

- [ ] **Step 1: Replace the right panel**

In `apps/my-app/app/dashboard/dashboard.tsx`, remove the `PersonalDrawing` import and add `import { Room } from '../talk/room'`. Replace the whole `right={...}` prop with:

```tsx
      right={<Room canPost={isReady} />}
```

Then remove `saveDrawing` and `savedStrokes` from the `usePersonalPage` destructuring, since nothing consumes them now. Leave `isSettled`, `loadError`, `saveIntro`, and `savedIntro` in place — the intro half of the hook is unchanged.

- [ ] **Step 2: Delete the drawing pad**

```bash
git rm apps/my-app/app/dashboard/personal-drawing.tsx
```

- [ ] **Step 3: Verify in the browser**

Run `yarn dev`, sign in, open `/dashboard/`.
Expected: the intro copy still loads blank-then-revealed and still saves; the right card is the room with a working composer; a message posted from `/dashboard` appears at `/talk` within five seconds.

- [ ] **Step 4: Verify and commit**

Run from the repo root: `yarn check-types && yarn lint`

```bash
git add apps/my-app/app/dashboard/dashboard.tsx
git commit -m "feat(dashboard): put the room where the drawing pad was"
```

---

### Task 14: The shell's talk command

**Files:**
- Modify: `apps/my-app/app/users/users-terminal.tsx`

**Interfaces:**
- Consumes: `ROOM_MESSAGES_QUERY` exported from `app/talk/use-room` (Task 10)
- Produces: a `talk` command tailing the last 10 lines

Read-only in v1. The shell already owns `login`/`signup`, so posting from it is tempting, but it would be a second write path with its own validation surface.

- [ ] **Step 1: Add the command**

In `apps/my-app/app/users/users-terminal.tsx`, import the shared query document:

```ts
import { ROOM_MESSAGES_QUERY } from '../talk/use-room'
```

Add `'talk'` to the `guestCommands` array (after `'ideas'`), and add the handler beside the existing `ideas` handler, following its exact shape:

```tsx
    if (command === 'talk') {
      try {
        const result = await gqlClient.request(ROOM_MESSAGES_QUERY, { limit: 10 })

        if (result.roomMessages.length === 0) {
          append([{ kind: 'muted', text: 'the room is empty' }])
          return
        }

        append(
          result.roomMessages.map((line) =>
            line.kind === 'system'
              ? { kind: 'muted' as const, text: `* ${line.body}` }
              : { kind: 'output' as const, text: `<${line.authorUsername ?? 'someone'}> ${line.body}` },
          ),
        )
      } catch {
        append([{ kind: 'error', text: 'talk: could not reach the room' }])
      }

      return
    }
```

Unlike `ideas`, this command has **no login check** — the room is public, and gating the shell view would contradict `/talk`.

- [ ] **Step 2: Update help**

Add `talk` to the `help` command's listing so the command is discoverable, matching the phrasing of the existing entries.

- [ ] **Step 3: Verify in the browser**

Open `/users/` signed out and type `talk`.
Expected: the last 10 lines, system lines prefixed `*` and messages as `<handle> body`. Confirm it works signed out, which is the point.

- [ ] **Step 4: Commit**

```bash
git add apps/my-app/app/users/users-terminal.tsx
git commit -m "feat(users): tail the room from the shell"
```

---

### Task 15: Admin moderation

**Files:**
- Create: `apps/my-app/app/admin/talk-panel.tsx`
- Modify: `apps/my-app/app/admin/admin-console.tsx` (the `TabId` union, the tab list near lines 183-190, and the panel rendering)

**Interfaces:**
- Consumes: `ROOM_MESSAGES_QUERY` and `RoomLine` from `app/talk/use-room` (Task 10), `deleteMessage` (Task 6)
- Produces: a `talk` tab listing recent lines with a delete control per line

`admin-console.tsx` is already 437 lines, so the panel goes in its own file rather than growing it further.

- [ ] **Step 1: Write the panel**

Create `apps/my-app/app/admin/talk-panel.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { graphql } from '../generated/gql'
import { gqlClient } from '../services/graphql-client'
import { ROOM_MESSAGES_QUERY, type RoomLine } from '../talk/use-room'

const DELETE_MESSAGE_MUTATION = graphql(`
  mutation DeleteMessage($messageId: ID!) {
    deleteMessage(messageId: $messageId)
  }
`)

export function TalkPanel() {
  const [lines, setLines] = useState<RoomLine[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    gqlClient
      .request(ROOM_MESSAGES_QUERY, { limit: 50 })
      .then((result) => setLines(result.roomMessages as RoomLine[]))
      .catch(() => setError('could not load the room'))
  }, [])

  async function remove(messageId: string) {
    try {
      await gqlClient.request(DELETE_MESSAGE_MUTATION, { messageId })
      setLines((current) => current.filter((line) => line.messageId !== messageId))
    } catch {
      setError('could not delete that line')
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto font-mono text-[0.7rem]">
      {error ? <p className="m-0 text-danger lowercase">{error}</p> : null}
      {lines.map((line) => (
        <div className="flex items-start justify-between gap-3" key={line.messageId}>
          <span className="min-w-0 flex-1 truncate">
            {line.kind === 'system' ? `* ${line.body}` : `<${line.authorUsername ?? 'someone'}> ${line.body}`}
          </span>
          <button className="text-danger lowercase underline" onClick={() => void remove(line.messageId)} type="button">
            delete
          </button>
        </div>
      ))}
      {lines.length === 0 && !error ? <p className="m-0 text-muted lowercase">nothing to moderate</p> : null}
    </div>
  )
}
```

- [ ] **Step 2: Add the tab**

In `apps/my-app/app/admin/admin-console.tsx`: import `TalkPanel`, add `'talk'` to the `TabId` union, add `{ id: 'talk', label: 'talk', value: '--' }` to the tab list beside the `users` entry, and render `<TalkPanel />` when `activeTab === 'talk'`, following how the existing panels are rendered.

Run `yarn codegen` from `apps/my-app` so the delete mutation document is generated.

- [ ] **Step 3: Verify the guard and the soft delete**

Sign in as an Admin, reach `/admin` through the shell's `sudo admin`, open the `talk` tab, delete a line, then reload `/talk`.
Expected: the deleted line is gone, **and the lines either side of it still load** — that is the soft delete keeping the cursors intact, and it is the specific thing worth checking here.

Then sign in as a `Basic` account and confirm the delete mutation returns `FORBIDDEN`.

- [ ] **Step 4: Verify and commit**

Run from the repo root: `yarn check-types && yarn lint`

```bash
git add apps/my-app/app/admin/talk-panel.tsx apps/my-app/app/admin/admin-console.tsx apps/my-app/app/generated
git commit -m "feat(admin): moderate the room"
```

---

### Task 16: A handle in the room opens its profile

**Files:**
- Modify: `apps/my-app/app/talk/room.tsx`
- Create: `apps/my-app/app/talk/use-profile.ts`

**Interfaces:**
- Consumes: `publicProfile` query (Task 7)
- Produces: `useProfile(): { profile, isLoading, open, close }` where `profile: PublicProfile | null` and `PublicProfile = { username: string; introTitle: string | null; introSubhead: string | null; introBody: string | null }`

This is what makes the profile copy mean anything: the away message is what a handle resolves to. Without it, Task 7's query has no caller and the left column of the dashboard is still a private notepad.

- [ ] **Step 1: Write the profile hook**

Create `apps/my-app/app/talk/use-profile.ts`:

```ts
'use client'

import { useCallback, useState } from 'react'
import { graphql } from '../generated/gql'
import { gqlClient } from '../services/graphql-client'

const PUBLIC_PROFILE_QUERY = graphql(`
  query PublicProfile($username: String!) {
    publicProfile(username: $username) {
      username
      introTitle
      introSubhead
      introBody
    }
  }
`)

export type PublicProfile = {
  username: string
  introTitle: string | null
  introSubhead: string | null
  introBody: string | null
}

/** Fetched on demand rather than inlined per message, which would repeat the copy on every row. */
export function useProfile() {
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const open = useCallback(async (username: string) => {
    setIsLoading(true)

    try {
      const result = await gqlClient.request(PUBLIC_PROFILE_QUERY, { username })

      setProfile((result.publicProfile as PublicProfile | null) ?? { username, introTitle: null, introSubhead: null, introBody: null })
    } catch {
      setProfile({ username, introTitle: null, introSubhead: null, introBody: null })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const close = useCallback(() => setProfile(null), [])

  return { close, isLoading, open, profile }
}
```

Run from `apps/my-app`: `yarn codegen`

- [ ] **Step 2: Make the handle a button**

In `apps/my-app/app/talk/room.tsx`, import the hook and destructure it beside `useRoom`:

```tsx
  const { close, isLoading: isProfileLoading, open, profile } = useProfile()
```

Replace the handle span in the message branch with a button, so it is reachable by keyboard as well as pointer:

```tsx
                  <button
                    className="text-accent underline underline-offset-2"
                    onClick={() => void open(line.authorUsername ?? '')}
                    type="button"
                  >
                    {line.authorUsername ?? 'someone'}
                  </button>{' '}
```

- [ ] **Step 3: Render the profile panel**

Add this immediately inside the outer `div`, before the transcript `div`:

```tsx
      {profile ? (
        <div className="border-b border-line px-[clamp(18px,2vw,28px)] py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="m-0 font-mono text-[0.72rem] text-accent">{profile.username}</p>
              {profile.introSubhead ? (
                <p className="m-0 mt-1 text-sm leading-[1.5] text-subhead">{profile.introSubhead}</p>
              ) : null}
              {profile.introBody ? (
                <p className="m-0 mt-1 text-sm leading-[1.5] text-muted">{profile.introBody}</p>
              ) : null}
              {!profile.introSubhead && !profile.introBody ? (
                <p className="m-0 mt-1 font-mono text-[0.66rem] text-muted lowercase">
                  {isProfileLoading ? 'loading...' : 'no profile yet'}
                </p>
              ) : null}
            </div>
            <button className="font-mono text-[0.66rem] text-muted lowercase underline" onClick={close} type="button">
              close
            </button>
          </div>
        </div>
      ) : null}
```

The title is deliberately not shown: it is sized for a page heading (`clamp(4.1rem, 8.7vw, 9rem)`) and would swamp the card.

- [ ] **Step 4: Verify in the browser**

Open `/talk/` and click a handle.
Expected: the panel opens with that account's subhead and body, `close` dismisses it, and an account with no saved copy reads `no profile yet` rather than blank. Confirm the handle is reachable by Tab and activates with Enter.

- [ ] **Step 5: Verify and commit**

Run from the repo root: `yarn check-types && yarn lint`

```bash
git add apps/my-app/app/talk/room.tsx apps/my-app/app/talk/use-profile.ts apps/my-app/app/generated
git commit -m "feat(room): open a profile from a handle"
```

---

### Task 17: Remove the strokes column and update the product doc

**Files:**
- Modify: `packages/database/prisma/schema.prisma`
- Create: `packages/database/prisma/migrations/20260907130000_drop_personal_page_strokes/migration.sql`
- Modify: `apps/backend/src/services/personal-page-validation.ts`
- Modify: `apps/my-app/app/lib/personal-page.ts`
- Modify: `apps/backend/src/resolvers/PersonalPageResolver.ts`
- Modify: `apps/my-app/app/dashboard/use-personal-page.ts`
- Modify: `apps/my-app/tests/personal-page.test.ts`
- Modify: `apps/my-app/PRODUCT.md`

Done last, so every earlier task runs against a working build. The one saved drawing belongs to the author and is dropped by decision (see the spec's *decisions*).

- [ ] **Step 1: Drop the column**

Remove the `strokes Json @default("[]")` line from the `PersonalPage` model, then create `packages/database/prisma/migrations/20260907130000_drop_personal_page_strokes/migration.sql`:

```sql
-- AlterTable
ALTER TABLE "PersonalPage" DROP COLUMN "strokes";
```

Run from `packages/database`: `npx prisma migrate dev` then `yarn db:validate`.

- [ ] **Step 2: Strip the stroke halves from both validation modules**

From `apps/backend/src/services/personal-page-validation.ts` remove: `VIEW_BOX_WIDTH`, `VIEW_BOX_HEIGHT`, `MAX_STROKE_COUNT`, `MAX_POINTS_PER_STROKE`, `MAX_TOTAL_POINTS`, `NormalizedStroke`, `StrokesValidation`, `normalizeStrokes`, and the now-unused `clamp` and `roundCoordinate` helpers.

From `apps/my-app/app/lib/personal-page.ts` remove the same five constants plus `DrawingPoint`, `DrawingStroke`, `StoredStroke`, `toStoredStrokes`, `fromStoredStrokes`, `countPoints`, `storedStrokesMatch`, and the same two helpers.

Keep `normalizeIntroText`, `validateIntroInput`, `IntroField`, `IntroFieldErrors`, and the three intro length constants in both files.

- [ ] **Step 3: Strip the stroke fields from the API and hook**

In `apps/backend/src/resolvers/PersonalPageResolver.ts`: remove the `strokes` field from the `PersonalPage` object type, from `PersonalPageRow`, from `pageSelection`, and from `toView`; delete the `savePersonalDrawing` mutation and the `SavePersonalDrawingInput` input type; drop the `normalizeStrokes` import and the comment on `toView` that describes re-validating strokes on read.

In `apps/my-app/app/dashboard/use-personal-page.ts`: remove `strokes` from all three GraphQL documents, delete the `savedStrokes` state and every `setSavedStrokes` call, delete `saveDrawing` and `SaveDrawingResult`, remove the `StoredStroke` import, and drop `saveDrawing` and `savedStrokes` from the returned object.

Run from `apps/my-app`: `yarn codegen`

- [ ] **Step 4: Strip the stroke tests**

In `apps/my-app/tests/personal-page.test.ts`: delete the `strokeOfLength` helper, every `describe`/`it` block covering strokes, and the stroke-related imports from both modules. Keep every intro validation case, including the one asserting the client and server agree.

- [ ] **Step 5: Update PRODUCT.md**

In `apps/my-app/PRODUCT.md`:
- Change `## Operating Context` from eleven to twelve primary surfaces.
- Add a `/talk` bullet: the one public room, readable by anyone and postable by any signed-in account, with real site events as system lines.
- Rewrite the `/dashboard` bullet: it pairs the editable profile copy with the room. **Delete the sentence "Nothing on the dashboard is public."**
- Rewrite the personal-page bullet to cover bounded intro copy only, deleting the stroke-bounds sentence.
- Narrow the no-moderation claim so it reads as being about the guestbook specifically, and add that room lines are soft-deleted by an Admin from `/admin`.

- [ ] **Step 6: Full verification**

Run from the repo root: `yarn check-types && yarn lint && yarn build`
Run from `apps/my-app`: `yarn test`
Expected: all PASS. If `check-types` reports duplicate declarations from generated files such as `.next/types/cache-life.d 2.ts`, follow the `AGENTS.md` note — move only those ` 2` duplicates to a temporary directory and rerun; do not weaken TypeScript settings.

Then in the browser: sign in, confirm `/dashboard` still saves intro copy, `/talk` still reads signed out, and posting still works.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(dashboard)!: replace the drawing pad with the public room

BREAKING CHANGE: PersonalPage.strokes is dropped and savePersonalDrawing is
removed. saved drawings are not migrated."
```

---

## Notes for the executor

- **Run the backfill once**, in Task 8. It is re-runnable, but running it before Task 1's migration fails on a missing table.
- **`recoverSession`** comes from `useAuth` and clears an expired session. Every network path in the room hook routes failures through it, exactly as `usePersonalPage` does. Do not swallow an error without calling it first.
- **Codegen needs the backend running** — it reads the live schema. Tasks 10, 15, 16, and 17 all run it.
- **The room component is mounted twice** (`/talk` and `/dashboard`), and each mount runs its own poll. That is acceptable: they are never on screen at the same time.
- **Message bodies are rendered as text**, never markdown and never with links parsed out. React escapes by default; do not reach for `dangerouslySetInnerHTML`.
- **`ROOM_MESSAGES_QUERY` is exported once** from `app/talk/use-room.ts` and imported by the shell (Task 14) and the admin panel (Task 15). Do not copy the document into either file — codegen would generate duplicates.
