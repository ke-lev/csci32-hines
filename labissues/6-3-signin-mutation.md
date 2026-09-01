# signin mutation lab issues

## step 4 imports `SignInInput` as a type, then uses it as a value

compatibility: the resolver block in step 4 opens with

```ts
import type { SignInInput } from './types/SignInTypes'
```

and then uses that same name as a runtime value in the decorator:

```ts
@Arg('input', () => SignInInput) input: SignInInput
```

`import type` is erased at compile time, so the class is not there when the decorator runs. the file does not compile:

```
src/resolvers/UserResolver.ts(40,25): error TS1361: 'SignInInput' cannot be used as a value
because it was imported using 'import type'.
```

this is easy to miss because the same line uses `SignInInput` in type position too, where `import type` is correct. the `() => SignInInput` half is what needs the real binding — type-graphql reads the input type from that thunk at runtime

workaround: drop `type` from the import. a plain import covers both uses

```ts
import { SignInInput } from '@/resolvers/types/SignInTypes'
```

note the lab writes `./types/SignInTypes`; this repo uses the `@/` alias everywhere else

## step 1 re-declares `UserDTO` and `AuthPayload`, which already exist

compatibility: `src/resolvers/types/AuthTypes.ts` already exports `UserDTO` and `AuthPayload` from the sign-up lab. step 1 has you declare both again in `SignInTypes.ts`, with `name`/`email` typed `string` rather than the `string | null` the prisma rows actually produce

this does not break anything, which is the annoying part — verified the schema builds either way. type-graphql only registers types reachable from a resolver, and nothing imports these copies: the lab's own step 4 pulls `AuthPayload` from `AuthTypes`, not `SignInTypes`. so you end up with two decorated classes named `AuthPayload` and two named `UserDTO`, one pair silently dead

the trap is later. the moment anything imports `AuthPayload` from `SignInTypes` while `signUp` still uses the one from `AuthTypes`, both become reachable and the schema has two types with one name

workaround: put only `SignInInput` in `SignInTypes.ts` and reuse the existing `AuthPayload`/`UserDTO`. the sign-in payload is the same shape as the sign-up payload — that is the point of it being a shared `AuthPayload`

## step 3 imports prisma from the wrong package name

compatibility: `UserService.ts` in step 3 starts with

```ts
import { PrismaClient } from 'csci32-database'
```

this repo renamed that workspace to `@repo/database` in 7ca7b26, matching `@repo/ui`, `@repo/math` and the rest. following the lab literally gives `TS2307: Cannot find module 'csci32-database'`

workaround: `import { PrismaClient } from '@repo/database'`, which is what the existing `UserService.ts` already does

## step 3 casts away the type that proves the hash is stripped

compatibility: the last two lines of `authenticateUser` are

```ts
const { passwordHash, ...user } = found as any
return { user, token }
```

`found` is already precisely typed by the prisma `select`. casting to `any` discards that, so `user` becomes `any` and typescript can no longer tell you whether `passwordHash` actually got removed from the object you are about to hand to a client. the one place you most want the checker is the place the cast turns it off

workaround: destructure the typed object and rename the discarded binding so lint does not flag it as unused

```ts
const { passwordHash: _passwordHash, ...user } = found
```

verified the hash does not reach the client either way, but this version is checked rather than trusted:

```
user payload returned to client: {"user_id":"...","email":"...","name":"Sign In Test"}
passwordHash leaked? no
```
