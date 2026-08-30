# input lab issues

## the instructed `src/app` page is not the current turbo route

discrepancy: previous turborepo lab had us move the contents of `src/app/` (`./src/app/my-app`) into the turbo scaffold (`./apps/my-app`) - so at this point we basically cut out src/app/ altogether

compatibility: lab says to add `src/app/input/page.tsx`, but the current app already uses `apps/my-app/app`. i guess Next.js 16 ignores `src/app` when a root `app` directory exists, so following the path won't create the intended `/input` route

workaround: add the page at the new route: `apps/my-app/app/input/page.tsx`

## the `any` props fail lint

compatibility: lab sets `value` and `defaultValue` to use `any`. the current `@repo/ui` ESLint config reports `@typescript-eslint/no-explicit-any` for both, and a tight lint pass (`eslint . --max-warnings 0`) exits because of the two warnings

workaround: define `type InputValue = string | number | readonly string[]` and use `InputValue` for both props
