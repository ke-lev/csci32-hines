# todo

revised after feedback on the september 4 review. keep the technical fixes and the terminal / suggestion-box directions. creative work now centers on the existing UI and a user's own intro and drawing. [ideas.md](ideas.md) holds possibilities to choose from, not a list to implement wholesale. course lab sections still need their normal explanation and go-ahead.

## fix first

- [x] protect `findManyUsers` with verified backend authentication/authorization; omit email from any public projection. verify anonymous and insufficient-permission requests fail without returning records.
- [x] enforce signup email/password rules and input bounds on the server, mirror them in form and terminal, and apply password-creation rules only to signup. test invalid inputs without creating rows and confirm both login paths accept the same valid credentials.
- [x] add a verified current-user query and session-expiry recovery. clear rejected sessions, synchronize logout across tabs, and verify refresh with valid, expired, missing, and malformed session data.
- [x] restore Tab and Shift+Tab traversal in `/users` while keeping an explicit autocomplete interaction. verify the input, exit link, and footer remain keyboard reachable.
- [x] use a shared route registry for terminal `open`, `ls`, and `tree`; include input, roll, and games. verify `open games` and `open input` navigate successfully.
- [x] show safe field-specific signup errors in the terminal and preserve nonsecret answers during correction; keep passwords out of output/history and login credential failures generic.

## small useful improvements

- [x] correct README guestbook removal guidance to account for the one-hour cache, or add authenticated removal with tag invalidation when moderation exists.
- [x] label the roll count as signatures rather than distinct people, and explain public name/portrait storage beside signing.
- [x] resolve the 10 lint warnings at their configuration/source: declare relevant Turbo environment dependencies, narrow the resolver type, and fix the generated lint-disable configuration.
- [x] document backend setup and deployment alongside frontend setup: required variable names, database migrations, API URL, CORS origin, and how to start the built API. keep secret values out of documentation.

## keep: terminal integration

- [x] build on the existing account commands: make `help` destinations clickable and expose the existing `/welcome` form as an alternative entry point.
- [x] add `cat timeline/<slug>` for reading existing posts in the shell. give unknown posts a useful error and keep rendering plain text.

## keep: suggestion-box follow-through

- [x] after real backend permissions exist, add an owner-only view of the ideas already being submitted; support “heard,” “trying it,” and “shipped.”
- [x] return an opaque receipt code on submission so a visitor can check status without exposing their suggestion text. optionally attach a shipped site's route or timeline link.

## proposed next UI experiment

- [x] prototype an editable personal intro on `/dashboard`: title, subhead, and optional short body, rendered through the existing `PageIntro`. preview edits in place with explicit save/cancel and restore-default controls.
- [x] make the whole right card one drawing pad: one pen, always live, edge to edge, with a bottom row of submit (primary) and scrap (secondary, clears the pad). no account details or mode toggle in the card; sign out stays in the `/users` shell.
- [x] persist one intro and one drawing per account behind verified ownership. `PersonalPage` holds bounded intro text and stroke data normalized to the pad view box; `myPersonalPage`, `savePersonalIntro`, and `savePersonalDrawing` are all keyed on the session user. verified refresh, save failure, malformed stored data, anonymous access, and cross-account read and overwrite against a local database. public sharing is still a separate decision.
- [ ] inspect the dashboard in a browser: desktop/mobile, both themes, and reduced motion. project checks (`check-types`, `lint`, `test`, `build`) pass and the `PersonalPage` migration is applied, but nothing here has been seen rendered yet.
- [ ] decide what a full-card pad should do to touch scrolling. the pad is always live now, so on a phone a finger drag over the card draws instead of scrolling the page. options: only start a stroke after a short press, ignore touch below some width, or keep it and accept the card as a dead zone for scrolling.
