# authentication form hookup lab issues

## the unpinned install selects an unsupported GraphQL version

compatibility: step 1 runs `yarn add graphql graphql-request` without versions. as of
September 2, 2026, yarn installs `graphql@17.0.2` alongside `graphql-request@7.4.0`, but
`graphql-request` declares support for GraphQL 14 through 16 and prints:

```
warning " > graphql-request@7.4.0" has incorrect peer dependency "graphql@14 - 16".
```

workaround: install the same supported major version already used by this repo's backend:

```
yarn workspace my-app add graphql@^16.11.0 graphql-request
```

## step 7 imports generated modules before step 8 creates them

compatibility: step 7 imports `generated/gql` and `generated/graphql`, but the lab does not run
GraphQL Code Generator until step 8. after completing step 7, `yarn workspace my-app
check-types` exits with:

```
error TS2307: Cannot find module '../generated/gql' or its corresponding type declarations.
error TS2307: Cannot find module '../generated/graphql' or its corresponding type declarations.
```

workaround: finish defining the GraphQL operations in step 7, then run `yarn workspace my-app
codegen` immediately. the hook cannot type-check between those two steps because codegen needs
the completed operations before it can create their types.

## the generated client does not export the schema-wide payload and user types

compatibility: with the current unpinned Codegen packages, step 8 successfully generates the
client, but step 7's `AuthPayload` and `UserDto` imports do not exist in
`generated/graphql.ts`. `yarn workspace my-app check-types` exits with:

```
error TS2305: Module '"../generated/graphql"' has no exported member 'AuthPayload'.
error TS2305: Module '"../generated/graphql"' has no exported member 'UserDto'.
```

workaround: import the generated `SignUpMutation` operation type and derive the two shapes from
the fields that the frontend actually requested:

```ts
type AuthPayload = SignUpMutation['signUp']
type AuthUser = AuthPayload['user']
```

## the hydration effect fails the current React Hooks lint rules

compatibility: step 7's completed hook reads `localStorage` and calls `setUser()` synchronously
inside `useEffect`. with this repo's React 19 ESLint rules, `yarn workspace my-app lint` exits
on `react-hooks/set-state-in-effect` because that state update causes an extra render immediately
after hydration.

workaround: initialize `user` lazily from `localStorage`, and use `useSyncExternalStore` with a
server snapshot of `false` and client snapshot of `true` for the hydration flag. this preserves
the dashboard's hydration guard without disabling the rule.

## step 11 replaces the site's existing homepage

compatibility: step 11 replaces `apps/my-app/app/page.tsx` with an authentication redirect.
this repo's homepage is already its route index and contains the Thursday interaction, timeline
link, and Spotify status. copying the lab would delete that existing product surface instead of
only adding authentication.

workaround: keep the homepage unchanged and use `/welcome` as the explicit authentication route
and `/dashboard` as the signed-in destination. authentication can be integrated into the existing
`/users` terminal later without turning `/` into a redirect.

## step 5 does not restart an already-running Next.js server

compatibility: step 5 creates `.env` with `NEXT_PUBLIC_API_URL`, but its main instructions do not
restart the frontend dev server. Next.js had already been running before the file was created, so
the browser bundle did not receive the new public variable. submitting the form then failed before
GraphQL could respond and displayed only the hook's fallback message:

```
sign up failed
```

workaround: stop and restart the Next.js dev server after creating or changing `.env`. the lab
mentions this only later under troubleshooting, but it is required before testing the form.

## the frontend content security policy blocks the GraphQL backend

compatibility: steps 5 and 6 send browser requests to `http://localhost:4000`, but this repo's
Next.js security headers originally allowed `connect-src 'self'` only. the browser blocks signup
before the request reaches CORS or GraphQL and reports:

```
Connecting to 'http://localhost:4000/api/graphql' violates the following Content Security Policy directive: "connect-src 'self' ws:".
Fetch API cannot load http://localhost:4000/api/graphql. Refused to connect because it violates the document's Content Security Policy.
```

the form then displays only the hook's fallback `sign up failed` message.

workaround: read `NEXT_PUBLIC_API_URL` in `next.config.ts`, reduce it to its origin, and add that
origin to `connect-src`. keep `'self'` and the development WebSocket source instead of replacing
the existing policy. restart the frontend after changing the config so it serves the new header.

## ignoring the generated client breaks clean builds

compatibility: step 4 ignores the generated client directory, but step 7 imports `gql.ts` and
`graphql.ts` from that directory. local builds pass only because step 8 left ignored copies on
disk. a fresh clone, CI job, or Vercel build has no generated client and fails with `TS2307` before
the app can build. generating during the build is not reliable because Codegen requires the
separately running backend schema endpoint.

workaround: ignore only the `schema.graphql` snapshot and commit the generated client files that
the frontend imports. rerun `yarn workspace my-app codegen` whenever the operations or backend
schema change.
