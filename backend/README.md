NestJS API for the NEAR developer console

# Usage

## Database

Initialize database with Prisma models

```
npx prisma migrate dev
```

Wipe the contents of the database

```
npx prisma migrate reset
```

### Update models

Whenever models are changed, a new Prisma client must be generated

```
npx prisma generate
```

> The `prisma generate` command reads your Prisma schema and updates the generated Prisma Client library inside `node_modules/@prisma/client`.

## Running the app

```bash
# run in watch mode to live-reload on changes
$ npm run start:dev

# run in development without live-reload
$ npm run start
```

# Contributing

## Errors

This project uses [VError](https://github.com/joyent/node-verror). All errors should be instances of VError. Errors thrown should propagate any lower level causes.

e.g.

```ts
function executeCommand() {
  throw new VError('Something went wrong');
}

function process() {
  try {
    executeCommand();
  } catch (e) {
    throw new VError(e, 'Failed while executing command');
  }
}
```

to get an error message like

```
Failed while executing command: Something went wrong
```

### Converting to client response

A metadata property named `code` should be used to identify known errors so that the controller can map them to an appropriate HTTP response.

e.g.
In a service

```ts
// assuming a query was just performed that determined a user does not have permission to perform the action they attempted
throw new VError(
  { info: { code: 'PERMISSION_DENIED' } },
  'User does not have rights to perform action X',
);
```

then, in the controller

```ts
switch (VError.info(e)?.code) {
  case 'PERMISSION_DENIED':
    throw new ForbiddenException();
  default:
    // 500 server error
    throw e;
}
```

which sends the client

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

This allows us to easily handle known errors at the controller level even though the originating error may have been wrapped by several VErrors in between.

> This example chooses not to display a custom error message to the client, but that can be accomplished in the controller if desired.
