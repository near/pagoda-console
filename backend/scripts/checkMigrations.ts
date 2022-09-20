/**

This script will help ensure Prisma's automatic additions of dropping things doesn't accidentally drop one of our custom entities.
Running `npx prisma migrate dev` may create a migration file that includes some lines which should be removed because they drop custom entities.
In case a dev forgets to remove one of these lines, we will check if these lines are in the file.

Please add onto the DENY list if you have some custom SQL entities in a migration!

Examples of custom entities that Prisma attempts to drop:
```
-- DropForeignKey
ALTER TABLE "Audit" DROP CONSTRAINT "Audit_userId_fkey";

-- DropTable
DROP TABLE "Audit";

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

*/

import { promises as fsPromises } from 'fs';

const DENY_SQL_CODE = [
  // Audit table is created and maintained outside of Prisma. Prisma will attempt to delete it.
  'ALTER TABLE "Audit" DROP CONSTRAINT "Audit_userId_fkey";',
  'DROP TABLE "Audit";',
  // We have a custom conditional index on this table under the same name
  'CREATE UNIQUE INDEX "User_email_key" ON "User"("email");',
  'CREATE UNIQUE INDEX "Project_name_orgSlug_key" ON "Project"("name", "orgSlug");',
  'CREATE UNIQUE INDEX "Team_orgSlug_name_key" ON "Team"("orgSlug", "name");',
];

async function checkMigrationsAsync() {
  const [_n, _s, ...paths] = process.argv;

  await Promise.all(
    paths.map(async (path) => {
      const contents = await fsPromises.readFile(path, 'utf-8');

      for (const bl of DENY_SQL_CODE) {
        if (contents.includes(bl)) {
          throw `Please remove the following code from the file at ${path}: ${bl}`;
        }
      }
    }),
  );
}

checkMigrationsAsync().catch((e) => {
  console.error(e);
  process.exit(-1);
});
