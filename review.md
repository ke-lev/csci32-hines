# review

reviewed september 4, 2026. scope: one evolving CSCI 32 experiment, with the labs as starting points for creative work.

## overall take

the site already has an identity. the huge type, warm monochrome, path navigation, consistent right panel, and tiny interactive jokes make the different exercises feel related. keep that restraint. the portrait generator becoming a persistent class photo is the strongest extension so far: a basic input lesson becomes something people can contribute to and revisit. terminal authentication is another good sideways move.

the next useful step is connecting these experiments. accounts currently lead to a list of account fields; they could instead hold things someone made. keep the public toys immediately playable and make signing in useful when someone wants to save something.

## course context

read the signed-in [BWM Two course overview](https://beginnertowebmaster.com/course/bwm-2) in Chrome. its sequence moves from components and forms through Prisma, GraphQL, authentication, roles, pagination/search, and final-project mutations and queries. this repo visibly implements much of that foundation. upcoming roles and relations are a natural place to introduce ownership; later queries can support a searchable collection. course completion badges are not evidence of implementation correctness, and this review is not a lab-by-lab grading audit.

## findings

> i think most of these have been solved now

### high: the user directory has no authorization boundary

`apps/backend/src/resolvers/UserResolver.ts` exposes `findManyUsers`, including the `email` field, without an authorization check. `src/services/UserService.ts` reads every user without pagination. `src/utils/graphql.ts` puts services into context but never verifies a bearer token or establishes a current user.

confirmed by source inspection; no account records were queried through the API for this review. any caller able to reach this endpoint can request the directory. restrict it before putting real account data behind a publicly reachable backend. default public projections should omit email; private account details should come from a verified current-user query. add pagination when the directory is actually needed.

### high: signup validation differs between entry points

`apps/my-app/app/components/auth-form.tsx` requires six password characters, but the terminal sends any nonblank password. the backend only requires truthy username/email/password values and validates the normalized username; it does not enforce password length or email format. the conventional form also uses `noValidate` and registers email as required without a format rule.

source-confirmed: a short password can reach account creation through the terminal or a direct mutation, while the form subsequently rejects that same short password during login. make the server authoritative, mirror its rules in both clients, and apply creation policy during signup rather than making existing credentials impossible to submit at login. enforce reasonable input bounds before hashing. no test accounts were created.

### medium: restored identity is treated as a valid session

`components/use-auth.ts` restores `authUser` from local storage, while `dashboard/dashboard.tsx` checks only whether that object exists. `services/graphql-client.ts` restores the token header but does not validate expiry or obtain a fresh user. an expired token can therefore leave the interface presenting someone as signed in.

this is a source-confirmed session-lifecycle gap, not evidence that private server data was accessed. add a verified current-user request, clear invalid sessions, and propagate logout across tabs. the local `admin/password` shortcut and `sudo admin` are explicitly theatrical today; do not connect their sessionStorage flag to real privileged operations when roles arrive.

### medium: terminal autocomplete captures keyboard navigation

reproduced in Chrome on `/users`: focus the command input and press Tab; focus remains in `terminal-command`. the key handler prevents default for every Tab, including Shift+Tab. this prevents normal focus traversal to surrounding controls. preserve a documented completion shortcut while allowing Tab/Shift+Tab to leave the input. verify both directions and keep the exit link reachable without knowing Ctrl+C.

### medium: terminal navigation has fallen behind the site

reproduced `open games` → `open: route not found: games`. `users/users-terminal.tsx` only maps home, buttons, timeline, and users; its `ls` and `tree` output omit the portrait and games routes too. use a small shared route registry for these outputs so the terminal remains a useful alternative interface as the site grows.

### medium: signup recovery discards the useful reason

`users/users-terminal.tsx` ignores the error exposed by `useAuth` and restarts failed signup from the username prompt with a generic message. duplicate usernames and invalid usernames have specific backend messages, but terminal users cannot see them. return safe structured field errors, preserve nonsecret answers, and reprompt only what needs correction. retain generic invalid-credentials copy for login.

### low: the guestbook removal instructions overpromise freshness

`README.md` says a direct Prisma Studio/SQL deletion disappears on the next request. `app/lib/guestbook.ts` caches pages for 3,600 seconds; a direct database deletion does not invalidate that cache. document the delay or provide an authorized moderation action that invalidates the guestbook tag. this mismatch is visible in source; no entries were deleted to test it.

## design and product opportunities

- the desktop homepage composition works, and the 390px mobile homepage had no horizontal overflow, including the expanded Thursday controls. on mobile, the first experiment starts well below the heading, controls, and Spotify card. consider a compact “try the portrait” link near the intro while preserving the shared panel silhouette.

> meh, mayyybe idk - not now

- `/input` leads with hashing, decimals, and vector-path mechanics. keep a short invitation near the form and move that explanation into an optional “how it works” view. the mechanics are interesting course evidence, but the drawing is the reason to engage.

> i actually was already thinking about putting a little "i" circle in maybe the footer? when clicked it would show a little popup explaining the technical stuff on the current page - thatd give more room and make the site more consistent i think

- the timeline can link directly from each build note to the experiment it discusses. a small “lab → my detour” note would make the learning visible to an instructor without turning the homepage into a syllabus.

> no

- keep the terms parody as a set piece; give guestbook signing plain copy explaining that the submitted normalized name and portrait become public. humor and understandable submission behavior can coexist.

> ok

- the class photo counts signatures as “people.” because face and cat are separate unique entries for the same name, “10 signatures” would be more accurate than claiming 10 distinct people.

> yep

## verification and limits

| check              | result                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `yarn check-types` | passed                                                                                                                          |
| `yarn lint`        | passed with 10 warnings: 8 undeclared environment references, one broad `Function` type, one unused generated disable directive |
| `yarn test`        | all 33 tests passed across six files                                                                                            |
| `yarn build`       | passed for all five build tasks                                                                                                 |
| `yarn dev`         | Next.js and Fastify started successfully                                                                                        |
| Chrome             | desktop homepage, portrait and guestbook reads, terminal commands/focus, and 390×844 homepage checked                           |

Turbo reused some unchanged task results. the tests cover deterministic drawings, input validation, rate limiting, dates, and random-number helpers; they do not establish end-to-end authentication or authorization correctness. browser review used local development, not the Vercel deployment. mobile coverage was the homepage only; no comprehensive screen-reader, contrast, performance, or all-route accessibility audit was performed. no signup, guestbook, tip, or moderation writes were submitted. no lab issue logs were changed because this task reviewed the project rather than executing a lab.
