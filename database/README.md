## Imports

Imports should target `pagoda-console-database/clients/<module>`

e.g.

```ts
import { User } from 'pagoda-console-database/clients/core';
```

## Client Generation

Client generation occurs after `npm install` is run on the project root and any time the `build` npm script is called on this workspace

## Commands

We have several Prisma schemas/instances, so we use a helper script to run Prisma commands on each in series.

Initialize database by running all migrations

```
npm run migrate:reset
```

Wipe the contents of the database (as needed) and apply all migrations

```
npm run migrate:reset
```

To create a new migration. This will attempt to delete custom SQL entities (e.g. Audit table) since it cannot be defined in the Prisma schema. Please remove this code from your migration!

Run this against the specific schema you modified
e.g.

```
npx prisma migrate dev --create-only --schema=schemas/<module>/schema.prisma
```

To apply all migrations in production mode (should only be needed by CI)

```
npm run migrate:deploy
```

### Database Documentation

We currently have a Github action that will generate DB docs and upload them to:
`https://dbdocs.io/jon-lewis/Pagoda-Developer-Console-Dev` when a PR is merged into `development` and
`https://dbdocs.io/jon-lewis/Pagoda-Developer-Console` when merged into `main`.

You will need a password to view these docs, please ask the team for it.
