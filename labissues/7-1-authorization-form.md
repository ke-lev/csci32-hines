# authorization form lab issues

## scope note about the deployment issues

the first two issues below are not caused by this lab. this lab uses a stubbed `useAuth` hook,
so its form never contacts the backend or Supabase.

they are included here because they are confirmed consequences of following the earlier
database setup literally, and they become visible once the frontend is connected to the real
backend in the following authentication-hookup lab. they also affect any existing Next.js
route, such as the guestbook, that queries the database from Vercel. treat them as important
deployment prerequisites, not authorization-form implementation failures.

## the direct Supabase connection cannot be reached from Vercel

compatibility: the backend setup lab puts Supabase's direct connection string in
`DATABASE_URL`:

```
postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
```

the direct host is IPv6-only, while Vercel functions do not have IPv6 egress. the build still
passes because `prisma generate` does not connect to the database, but deployed requests fail
as soon as the app actually queries it:

```
PrismaClientInitializationError: Can't reach database server at
`db.<project-ref>.supabase.co:5432`
```

workaround: keep the direct string locally for migrations, but use Supabase's transaction
pooler for `DATABASE_URL` in Vercel:

```
postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

the username includes the project ref. redeploy after changing the environment variable.

> i only ran into this and the next one because i went ahead and hooked up my database early for a rollcall feature inside input/
> other students likely wont run into this problem since they arent hooking anything up yet
> and now i fear ive jumped the gun and hooked things up differently than the next lab wants me to
> !!! before making any real changes to the labs based on this labissue entry (and related) GO READ AHEAD IN THE LABS and make sure they are relevant, and not just something that gets solved later, and that i was just too eager to get to

## the transaction pooler fails under concurrency without `pgbouncer=true`

compatibility: Supabase's transaction pooler uses port `6543`. without `pgbouncer=true`,
Prisma uses prepared statements even though separate queries may land on different backend
connections. concurrent requests then fail with errors such as:

```
PostgresError { code: "26000", message: "prepared statement \"s8\" does not exist" }
```

this passed sequential browser testing but failed 22 of 25 concurrent requests. the same test
passed 12 of 12 concurrent Prisma queries after adding the flag.

workaround: append `?pgbouncer=true&connection_limit=1` to the transaction-pooler URL. use
port `6543`, not the session pooler's port `5432`, so concurrent Vercel functions do not each
hold a dedicated database connection.

## step 0's tsconfig alias points at a directory that does not exist

compatibility: step 0 replaces the app's alias with:

```json
"paths": { "@/*": ["./src/*"] }
```

this repo has no `src/` directory. its App Router lives directly under `apps/my-app/app/`, and
the existing `"@/*": ["./*"]` mapping is already correct. the lab also names
`next.config.mjs`, while this repo uses `next.config.ts`.

workaround: skip the tsconfig change.

## step 1 logs the submitted password

compatibility: the stubbed `signUp` and `signIn` functions log their entire `data` argument.
that object contains the plaintext password, so every attempt exposes it in the browser
console.

workaround: remove the input logs. if visible confirmation is useful, log the returned fake
user instead because that object does not contain the password.

## step 2's Input import suppression causes a type error

compatibility: the lab adds this suppression:

```tsx
// @ts-expect-error - Input component export in package.json
import { Input } from '@repo/ui/input'
```

this repo already exports `@repo/ui/input`, so there is no error to suppress. TypeScript then
reports the unused `@ts-expect-error` as an error itself.

workaround: delete the comment and import `Input` normally.

## step 2's Input cannot register with React Hook Form

compatibility: `register()` supplies `name`, `onChange`, `onBlur`, and `ref`, but the shared
`Input` originally forwards only `name`. typing still appears to work, but React Hook Form
never receives the field value. submitting visibly filled fields reports:

```
email is required
password is required
```

the lab's three `Input` usages also omit the required `id` prop, so the copied code does not
type-check in this repo.

workaround: give each field an `id`, then add `onChange`, `onBlur`, and `ref` to `InputProps`
and pass them to the underlying `<input>`. preserve the existing `setValue` behavior when
composing the new `onChange` handler because other pages still use it.
