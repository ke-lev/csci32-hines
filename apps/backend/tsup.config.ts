import { defineConfig } from 'tsup'

export default defineConfig({
  // app.ts loads the Reflect polyfill before importing the server and its plugins.
  entry: ['src/app.ts'],
  outDir: 'dist',
  // The bootstrap uses top-level await to preserve polyfill initialization order.
  format: ['esm'],
  target: 'node22',
  // @repo/database exports raw TypeScript (./src/client.ts). left external, node
  // can only load it on >=22.18 where type stripping is on by default, and this
  // repo's engines and CI both allow 22.13. bundling it sidesteps that entirely
  noExternal: ['@repo/database'],
  // ...but @prisma/client itself must stay external. it is CommonJS and does
  // dynamic require()s, which esbuild cannot express in an ESM bundle
  // ("Dynamic require of \"fs\" is not supported" at startup)
  external: ['@prisma/client'],
})
