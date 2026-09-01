# backend setup lab issues

## `yarn global add tsx` installs a binary you cannot run

compatibility: the lab opens with `yarn global add tsx`. yarn 1.22.22 reports `success Installed "tsx@4.23.13"` and links the binary into `~/.yarn/bin`, but yarn never adds that directory to `PATH`. running `tsx` afterwards fails with `command not found: tsx`, so the step looks like it worked and silently did nothing

workaround: skip the global install entirely. the lab already adds `tsx` to `apps/backend` devDependencies a few sections later, and the `dev` script (`tsx watch src/app.ts`) resolves it from `node_modules/.bin`. if you want it earlier, use `yarn add -D tsx` in the workspace rather than `yarn global add`

## the placeholder `test` script breaks `yarn test` for the whole repo

compatibility: the scripts block the lab adds to `apps/backend/package.json` includes the `npm init` placeholder `"test": "echo \"Error: no test specified\" && exit 1"`. turbo runs `test` across every workspace, so adding it makes the root `yarn test` fail even though the rest of the repo passes

```
backend:test: $ echo "Error: no test specified" && exit 1
backend:test: Error: no test specified
backend#test:  ERROR  command (apps/backend) yarn run test exited (1)
 Tasks:    3 successful, 4 total
```

workaround: add only `dev` and `build` from that block and leave `test` out. turbo skips workspaces that do not define the task, so the backend is simply not part of `yarn test` until it has real tests

## the `UserService` code block is labelled with the wrong path

compatibility: the "Build our `UserService`" section runs `touch src/services/UserService.ts`, but the file path printed above the code block that follows is `src/resolvers/UserService.ts`. every other block in the lab is labelled with its real path, so following the label puts the file in `src/resolvers/`. nothing fails until the next section, where `src/plugins/user-service.ts` does `import { UserService } from '@/services/UserService'` and dies with `TS2307: Cannot find module '@/services/UserService'`

workaround: trust the `touch` command, not the label. the file belongs at `src/services/UserService.ts`

## `src/utils/graphql.ts` uses `FastifyBaseLogger` without importing it

compatibility: the `Context` interface declares `log: FastifyBaseLogger`, but the fastify import line above it only brings in `FastifyInstance`, `FastifyReply`, and `FastifyRequest`. the file does not compile as written

```
src/utils/graphql.ts(20,8): error TS2304: Cannot find name 'FastifyBaseLogger'.
```

workaround: add the missing name to the existing type import

```ts
import type { FastifyBaseLogger, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
```

## the `build` script produces a bundle that cannot start, in either format

compatibility: the lab adds `"build": "tsup src/app.ts --format esm,cjs --dts"` to `apps/backend/package.json`. it exits 0 and writes `dist/`, so turbo and CI report success, but neither artifact runs

the cjs bundle dies immediately, because tsup compiles `import.meta.url` in `src/app.ts` to an undefined value when targeting commonjs:

```
TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string or an instance of URL. Received undefined
    at fileURLToPath (node:internal/url:1605:11)
    at Object.<anonymous> (apps/backend/dist/app.js:138:52)
```

the esm bundle starts and then fails differently. tsup flattens everything into one file, so the `src/plugins/` directory the lab points `@fastify/autoload` at does not exist next to the output:

```
ENOENT: no such file or directory, scandir 'apps/backend/dist/plugins'
    at async buildTree (@fastify/autoload/lib/find-plugins.js:25:22)
```

autoload discovers plugins by reading the filesystem at runtime, which a bundler cannot preserve. without it, nothing decorates `fastify.prisma` or `fastify.userService`

a third problem hides behind those two. `@repo/database` exports raw TypeScript (`./src/client.ts`), and tsup leaves workspace dependencies external, so the bundle asks node to import a `.ts` file. that only works on node >=22.18, where type stripping is on by default. this repo's `engines` allows `>=22.13.0` and CI pins `22.13.0`, where it fails:

```
TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".ts" for packages/database/src/client.ts
```

workaround: none of this affects the lab itself, which only runs `yarn dev` — `tsx` reads `src/app.ts` directly and is immune to all three. if you want a build that actually runs, add `"type": "module"` to `apps/backend/package.json` and replace the CLI flags with `apps/backend/tsup.config.ts`:

```ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/app.ts', 'src/plugins/*.ts'],
  outDir: 'dist',
  format: ['esm'],
  target: 'node22',
  noExternal: ['@repo/database'],
  external: ['@prisma/client'],
})
```

listing the plugins as entry points keeps `dist/plugins/` on disk for autoload to find, esm-only avoids the `import.meta.url` problem, and bundling `@repo/database` while keeping `@prisma/client` external removes the raw-`.ts` import without pulling prisma's commonjs `require()`s into an esm bundle. verified: `node dist/app.js` serves `findManyUsers` correctly, including with `--no-experimental-strip-types`
