# roles and permissions lab issues

## seed entry file imports from the wrong folder

compatibility: step 3.2 puts the seeders in `prisma/seeders/`, but `prisma/seed.ts` imports `./seedPermissions`, `./seedRoles`, and `./seedUsers`. those paths point directly into `prisma/`, where the files do not exist. checking the provided permission import against that layout fails with `ERR_MODULE_NOT_FOUND`, before any seed data can be inserted.

workaround: import from `./seeders/seedPermissions.js`, `./seeders/seedRoles.js`, and `./seeders/seedUsers.js`. the `.js` extensions work with this package's NodeNext ESM setup and `tsx` resolves them to the TypeScript source files.

for this repo's Next.js webpack build, those `.js` imports also need `config.resolve.extensionAlias['.js'] = ['.ts', '.tsx', '.js']` in `apps/my-app/next.config.ts`. after re-exporting the seeders, CI confirmed that the build otherwise fails with `Module not found: Can't resolve '../prisma/seeders/seedRoles.js'` (and the other two seeders). this extra mapping is needed for our NodeNext adaptation, not the lab's original extensionless imports.
