# input lab issues

## the instructed `src/app` page is not the current turbo route

discrepancy: previous turborepo lab had us move the contents of `src/app/` (`./src/app/my-app`) into the turbo scaffold (`./apps/my-app`) - so at this point we basically cut out src/app/ altogether

compatibility: the lab says to add `src/app/input/page.tsx`, but the current app already uses `apps/my-app/app`. Next.js 16 ignores `src/app` when a root `app` directory exists, so following the path literally does not create the `/input` route

workaround: add the page at the new scaffold route: `apps/my-app/app/input/page.tsx`

## the required `any` props fail lint

compatibility: the lab requires `value` and `defaultValue` to use `any`. the current `@repo/ui` ESLint configuration reports `@typescript-eslint/no-explicit-any` for both, and `eslint . --max-warnings 0` exits because of the two warnings

workaround: define `type InputValue = string | number | readonly string[]` and use `InputValue` for both props
