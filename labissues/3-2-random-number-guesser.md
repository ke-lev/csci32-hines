# random number guesser lab issues

## the required math package does not exist

compatibility: the lab lists `/packages/math/package.json` as an updated file and only lists `getRandomInt.ts` as new, but no earlier lab creates the `packages/math` workspace. the intended starting project has no math package, so there is no package manifest, TypeScript configuration, or resolvable `@repo/math` export to update or import

workaround: create the `packages/math` workspace with its own `package.json`, `tsconfig.json`, ESLint configuration, and `src/getRandomInt.ts`; expose the function from the package exports, add `"@repo/math": "*"` to `apps/my-app/package.json`, then run `yarn install`
