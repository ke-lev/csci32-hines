# roles and permissions lab issues

## seed entry file imports from the wrong folder

compatibility: step 3.2 puts the seeders in `prisma/seeders/`, but `prisma/seed.ts` imports `./seedPermissions`, `./seedRoles`, and `./seedUsers`. those paths point directly into `prisma/`, where the files do not exist. checking the provided permission import against that layout fails with `ERR_MODULE_NOT_FOUND`, before any seed data can be inserted.

workaround: import from `./seeders/seedPermissions.js`, `./seeders/seedRoles.js`, and `./seeders/seedUsers.js`. the `.js` extensions work with this package's NodeNext ESM setup and `tsx` resolves them to the TypeScript source files.
