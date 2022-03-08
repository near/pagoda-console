## **Backend Service for the NEAR Developer Console**

# Stack

Language: Typescript

Framework: [Nest.js](https://nestjs.com/)

ORM: [Prisma](https://www.prisma.io/)

Identity Management: [Firebase Auth](https://firebase.google.com/docs/auth)

# Usage

## Local Environment Variables

Environment variables are loaded for a `.env` file at the root of the project. These are not currently tracked in git, so you will need to obtain them from a fellow developer. In the future, the goal would be to have three files

1. Secrets file: not tracked in git, must be obtained from another developer
2. Base environment file: tracked in git, contains default settings for environment variables
3. Local overrides: not tracked in git, allows overriding specific environment variables as needed for development

For the most part, the project should be able to run without overrides, however there will be exceptions. For example, in order to avoid conflicts in the API key management service, each developer will need to have a different value for `PROJECT_REF_PREFIX`

## Database

Initialize database with Prisma models

```
npx prisma migrate dev
```

Wipe the contents of the database (as needed)

```
npx prisma migrate reset
```

### Update models

Whenever models are changed,even locally, a new Prisma client must be generated

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

## Debugging

If using VS Code, you can copy the [devResources/launch.json](devResources/launch.json) file to your `.vscode` directory to get a working debugging configuration. Hit F5 to run it and use breakpoints in the gutter of the editor window

# Contributing

The recommended way to run a development instance of this project is with VS Code and Dev Containers. The container definitions are part of this repository (`.devcontainer/`), so using dev containers will allow you to easily keep your environment in sync with other team members.

If VS Code is not your preferred development environment, you are more than welcome to stray from this recommendation and run the containers with Docker directly.

> TODO: Define a docker-compose stack for running without VS Code

## Endpoints

This is an RPC-style API. All endpoints are POSTs and all bodies are JSON. This style was chosen since the API is serving a specific frontend client and set of features.

## Input Validation

All endpoints which accept input (JSON bodies) should validate that input with [Joi](https://joi.dev/). The best way to learn how to do this is to inspect an existing endpoint.

## Authentication

Users tokens are verified with Firebase in [src/auth/auth.service.ts](src/auth/auth.service.ts). The authenticated user details are attached in the request object and accessible in endpoint handlers as seen below

```ts
@Post('exampleHandler')
@UseGuards(BearerAuthGuard)
async exampleHandler(@Request() req) {
  console.log(req.user);
}
```

## Configuration

See [./src/config/validate.ts](./src/config/validate.ts)

Always set the type of ConfigService in the constructor and use `{infer: true}` in getter for proper typing and nested access

constructor example:
```ts
private config: ConfigService<AppConfig>
```

getter example:
```ts
this.config.get('analytics.url', {infer: true});
```
In the future, the need to add infer to ever call could be removed by extending `ConfigService` [as suggested by a contributor](https://github.com/nestjs/config/issues/636#issuecomment-889168693)

### Local Config
During local development, Nest loads config from dotenv files. There are two to use  

`.env`  
Default and nonsensitive environment variables. This is tracked in git so that when new config values are added other developers do not need to manually make changes on their end  

`.env.local`  
Secrets and overrides. Easily override defaults from `.env` by defining a different value for that variable in `.env.local`. Not tracked by git so secrets aren't leaked and you don't constantly create diffs when changing values for your own dev purposes. To start, copy `.env.local.example` to `.env.local` and ask a fellow developer for existing secrets

## Comments

Where helpful, utilize [Better Comments](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments) syntax to add context to your comments

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
