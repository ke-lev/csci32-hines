# prisma setup lab issues

## the npm and npx commands conflict with the repository's yarn requirement

compatibility: the lab uses `npm init -y`, `npx tsc --init`, `npx prisma init`, and `npx prisma migrate dev`, but this repository requires Yarn 1.22.22. npm and npx exit with `EBADDEVENGINES` instead of running the commands

workaround: use the Yarn versions throughout the lab: `yarn init -y`, `yarn tsc --init`, `yarn prisma init`, and `yarn prisma migrate dev`

## the unpinned Prisma install gets an incompatible new version

compatibility: the lab runs `yarn add -D prisma` without a version, which currently installs Prisma 8. Prisma 8 has breaking changes to its setup, configuration, schema, client, and migration workflow, so the rest of the lab's Prisma commands and files no longer match

workaround: install the lab-compatible version from the start with `yarn add -D prisma@6.19.0 typescript ts-node @types/node`
