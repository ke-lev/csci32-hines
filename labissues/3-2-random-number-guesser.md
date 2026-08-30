# random number guesser lab issues

## the required math package doesn't exist

compatibility: lab lists `/packages/math/package.json` as an updated file and only lists `getRandomInt.ts` as new, but at this point we don't even have a `packages/math` workspace at all, so there is no package.json, TypeScript config, or resolvable `@repo/math` export to update or import

workaround: create the `packages/math` workspace with its own `package.json`, `tsconfig.json`, ESLint config, and `src/getRandomInt.ts` - then expose the function from the package exports, add `"@repo/math": "*"` to `apps/my-app/package.json`, then run `yarn install`

i actually don't remember how i did this on my first pass, but i don't remember this being an issue then for some reason?
