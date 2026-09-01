import { defineConfig } from 'tsup'

export default defineConfig({
  // app.ts plus every plugin: @fastify/autoload discovers plugins by reading the
  // filesystem at runtime, so dist/ has to keep the same shape as src/
  entry: ['src/app.ts', 'src/plugins/*.ts'],
  outDir: 'dist',
  // esm only. under --format cjs, tsup compiles `import.meta.url` in app.ts to
  // undefined and fileURLToPath throws on startup
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
