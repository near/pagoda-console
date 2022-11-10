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
import { resolve } from 'path';

const DENY_SQL_CODE = [
  // Audit table is created and maintained outside of Prisma. Prisma will attempt to delete it.
  {
    sqlCode: 'ALTER TABLE "Audit" DROP CONSTRAINT "Audit_userId_fkey";',
    allowInMigration: []
  },
  {
    sqlCode: 'DROP TABLE "Audit";',
    allowInMigration: []
  },
  // We have a custom conditional index on this table under the same name
  {
    sqlCode: 'CREATE UNIQUE INDEX "User_email_key" ON "User"("email");',
  // For some migration files it's fine to include one of these codes because at least for one migration it's valid
    allowInMigration: ['core/migrations/20211216195054_v1']
  },
  {
    sqlCode: 'CREATE UNIQUE INDEX "Project_name_orgSlug_key" ON "Project"("name", "orgSlug");',
    allowInMigration: []
  },
  {
    sqlCode: 'CREATE UNIQUE INDEX "Team_orgSlug_name_key" ON "Team"("orgSlug", "name");',
    allowInMigration: []
  },
];

async function getMigrationFiles(dir: string): Promise<string[]> {
  const dirents = await fsPromises.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = resolve(dir, dirent.name);
    return dirent.isDirectory() ? getMigrationFiles(res) : res;
  }));
  return Array.prototype.concat(...files).filter((file) => file.endsWith('.sql'));
}

async function checkMigrationsAsync() {
  const migrationPaths = await getMigrationFiles('./schemas');

  await Promise.all(
    migrationPaths.map(async (path) => {
      const contents = await fsPromises.readFile(path, 'utf-8');

      for (const bl of DENY_SQL_CODE) {
        if (contents.includes(bl.sqlCode) && bl.allowInMigration.some((code) => !path.includes(code))) {
          throw `Please remove the following code from the file at ${path}: ${bl.sqlCode}`;
        }
      }
    }),
  );
}

checkMigrationsAsync().catch((e) => {
  console.error(e);
  process.exit(-1);
});
