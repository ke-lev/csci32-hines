# Project guidance

This turborepo hosts a Next.js app (`apps/my-app`), a Fastify backend (`apps/backend`), and
shared packages under `packages/`. Run `yarn dev`, `yarn check-types`, `yarn lint`, and
`yarn build` from the root.

## read AGENTS.md

read and follow `AGENTS.md` before starting for the shared repo instructions.

## subagents

for precise, bounded, mostly simple code or verification work, prefer Sonnet with the highest
available reasoning level. keep integration, review, and final verification in the parent agent.

## responses

please just chill the fuck out in your responses - no need to be so verbose unless its called for
seriously like 4 sentences will prolly do the trick most of the time

- lead with the outcome, blocker, or decision instead of a process recap
- give concise progress updates during tool-heavy work without narrating routine commands
- state assumptions and tradeoffs plainly, at the user's level
- keep formatting light and the tone warm, direct, curious, and specific
- make the final handoff self-contained: what changed, what was verified, and what remains
