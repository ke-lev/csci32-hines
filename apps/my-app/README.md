# kelev

the Next.js app behind [csci32-hines.vercel.app](https://csci32-hines.vercel.app): a personal space for small experiments, games, and a dated semester devlog.

## routes

- `/` — homepage and route index
- `/buttons` — button experiments
- `/input` — deterministic name-to-portrait drawing
- `/games` — game index
- `/games/random-number-guesser` — configurable higher-or-lower game
- `/games/game-of-life` — interactive Conway’s Game of Life
- `/timeline` — dated Markdown devlog
- `/users` — zsh-style guest shell with a hidden admin-console path

the interface is intentionally minimal: lowercase copy, a black-and-off-white palette, path-style breadcrumbs, and a shared responsive two-column shell.

## local development

from the repository root:

```bash
yarn install
yarn dev
```

or run the app directly from this directory:

```bash
yarn dev
```

open [http://localhost:3000](http://localhost:3000) after the server starts.

use these checks before shipping:

```bash
yarn lint
yarn check-types
yarn build
```

## Spotify now playing

Spotify is an optional server-side integration used by the homepage card. start with [`.env.example`](.env.example):

```bash
cp .env.example .env.local
```

create a Spotify developer app, add `http://127.0.0.1:3000/api/spotify/callback` as a redirect URI, fill in the client ID and secret, then visit [the local login route](http://127.0.0.1:3000/api/spotify/login) to generate a refresh token. store it as `SPOTIFY_REFRESH_TOKEN`.

for production, configure the same four variables in Vercel and set `SPOTIFY_REDIRECT_URI` to `https://csci32-hines.vercel.app/api/spotify/callback`. keep `.env.local` and all secrets out of version control. the card is disabled gracefully when Spotify is not configured.

## content and structure

timeline posts live in [`app/timeline/posts`](app/timeline/posts) as Markdown files named `M-D.md`. the filename determines the 2026 date and slug; valid dates fall between August 17 and December 18.

shared layout and styling live in [`app/components`](app/components), [`app/globals.css`](app/globals.css), and the workspace UI package. route-specific experiments stay close to their route under `app/`.
