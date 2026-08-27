<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Product context

Read `PRODUCT.md` before making product-facing changes. Treat it as the source of truth for the site's purpose, routes, brand commitments, content conventions, and interaction constraints. Update it when those product-level facts change.

## Shared button system

- The reusable button lives in `packages/ui/src/button.tsx`; its public options are the `Size` and `Variant` enums beside it. Import them through `@repo/ui/button`, `@repo/ui/size`, and `@repo/ui/variant`.
- Keep every Tailwind class in complete static strings inside the component's size and variant maps. Do not build class names from partial strings because the UI package compiles its own Tailwind stylesheet.
- The supported variants are `PRIMARY`, `SECONDARY`, `TERTIARY`, and `GLASS`; the supported sizes are `SMALL`, `MEDIUM`, and `LARGE`. Medium matches the site's existing pill controls.
- Glass is intentionally dependency-free CSS using transparency, `backdrop-filter`, and saturation. It has no inset highlights. The rainbow line on `/buttons` is a page-level backdrop used to demonstrate the blur; do not bake that line into the shared component.
- The homepage Thursday interaction uses the shared primary and secondary variants. Preserve that integration when changing the button API.

## Verification and generated cache

Run `yarn check-types`, `yarn lint`, and `yarn build` from the repository root after shared UI changes.

If type checking reports duplicate declarations from generated files such as `.next/types/cache-life.d 2.ts`, inspect `.next` for files containing the literal ` 2` suffix. These are duplicate generated cache artifacts, not source files. Move only those duplicates to a recoverable temporary directory, then rerun the checks; do not weaken TypeScript settings to hide the conflict.
