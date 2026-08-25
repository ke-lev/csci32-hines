# turborepo lab issues

## `create-turbo@latest` requires node 24

compatibility: the current `npx create-turbo@latest`-generated root `package.json` declares `"node": ">=24"`. yarn checks this during installation and exits because of `nvm use 22`

workaround: change `my-turborepo/package.json` (line 13) from `"node": ">=24"` to `"node": ">=22.13.0"`, then `cd my-turborepo` and `yarn install`

## the provided `tsconfig.json` is outdated

compatibility: replacing the app's current `tsconfig.json` with the lab version removes newer next.js settings, including the `@/*` path alias and next 16 type paths
(codex thought this was an issue but i think it's only because i've developed my-app quite a bit)

workaround: add `"extends": "@repo/typescript-config/nextjs.json"` to the top of the current `tsconfig.json` and keep the rest of it as is

## `npx turbo` conflicts with the yarn requirement

compatibility: the generated root `package.json` requires yarn through `devEngines`, but the lab uses `npx turbo`. `npx` runs through npm, so npm exits with `EBADDEVENGINES` before turbo starts

workaround: use `yarn turbo login` and `yarn turbo link` instead of the `npx` commands
