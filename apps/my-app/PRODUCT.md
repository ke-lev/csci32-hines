# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Inferred from the current project and brief: visitors exploring kelev's personal developer site and experiments.

## Product Purpose

A personal developer site for small experiments, course work, and a dated semester devlog.

## Operating Context

The site currently has six primary surfaces:

- `/` is the homepage and route index. Its intro links to the timeline with a dedicated pill control.
- The homepage intro places a compact rounded Spotify listening-status card beneath the Thursday control. Its bottom aligns with the route panel on desktop, and the most recently played track is its inactive fallback.
- `/buttons` is a small interaction experiment.
- `/input` deterministically turns a first and last name into one live-drawn, uninterrupted SVG face path; normalized names reproduce the same checksum and exaggerated landmark geometry without network or random-data dependencies, and the current portrait can be downloaded as a standalone square SVG.
- `/timeline` is the semester devlog. Each entry also has a shareable `/timeline/[slug]` URL.
- `/users` is a programmer-facing easter egg: a local zsh-style guest session can theatrically elevate into a project explorer with safe navigation and local session stats.
- `/admin` is the hidden payoff to the users shell: a conventional local-only admin console reached through `sudo admin`.

All pages use path-style breadcrumbs and a shared two-column shell that collapses to one column on smaller screens.

## Capabilities and Constraints

- Built with the existing Next.js App Router project.
- Preserve the existing homepage unless a request explicitly changes it.
- New routes should remain responsive and keyboard accessible.
- Do not fabricate destinations for links that have not been assigned yet.
- Reuse `PageShell` and `PageIntro` where their existing layout fits.
- Timeline posts are Markdown files stored in `app/timeline/posts` with `title` and `description` frontmatter.
- A timeline post filename must use `M-D.md`, such as `8-23.md`. The filename supplies both its slug and its 2026 date.
- Timeline dates must fall between August 17 and December 18, 2026. Invalid names or out-of-range dates intentionally fail the build.
- Timeline points are positioned proportionally within that fixed semester range, not distributed evenly.
- Visiting `/timeline` selects the post whose date is closest to the request date. Direct `/timeline/[slug]` links select the requested post instead.
- Selecting a timeline point updates the left-side post metadata, the reading card body, and the URL. Preserve the no-reload interaction, direct-link behavior, modified-click behavior, and browser Back/Forward support.
- The timeline is file-backed and statically generated. There is no database or CMS.

## Brand Commitments

- Casual, lowercase voice.
- Minimal black interface with off-white text, thin borders, Geist typography, and pill-shaped controls.
- Path-style page headers beginning with `users/kelev/`.
- Oversized, tightly tracked headings and a soft-blue keyboard focus color.
- Timeline dates appear horizontally above their points. The selected point uses an off-white fill.
- The timeline's left side displays the selected post title and description. The right card contains only the Markdown body.
- The timeline title reserves two lines of vertical space so short titles do not shift the timeline upward.

## Evidence on Hand

- Global styling and tokens: `app/globals.css` and `app/layout.tsx`.
- Shared layout components: `app/components/page-shell.tsx` and `app/components/page-intro.tsx`.
- Homepage, buttons, and input experiments: `app/page.tsx`, `app/buttons/page.tsx`, and `app/input/`.
- Timeline loading, parsing, routing, and interaction: `app/timeline/`.
- Users terminal interaction and route metadata: `app/users/`.
- Admin console, local privilege gate, route table, and simulated controls: `app/admin/`.

## Product Principles

- Keep navigation simple as routes grow.
- Make interactive states visible and tactile.
- Prefer direct, functional copy over invented product claims.
- Keep the casual voice intentional without sacrificing technical clarity.
- Prefer file-based content and static generation while the project remains small.
- Keep third-party credentials server-only and make optional integrations fail quietly.
