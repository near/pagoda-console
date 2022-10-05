# Pagoda Console

This repo uses [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces) and [turborepo](https://turborepo.org/)

## Installing dependencies

Run `npm install` from the root to install depenedencies for all packages

## Developing / Debugging

Note: for debugging the frontend, add the following line

```ts
breakpoint;
```

These breakpoints will take effect if browser devtools are open.

### VS Code

A debugging configuration is included at `.vscode/launch.json`. Choose _Run > Start Debugging (F5)_ to run both the frontend and backend, with breakpoint gutter support for the backend.

### Other

To run both the frontend and backend:

```bash
npm run dev
```

## Running

To compile and run the project:

```bash
npm start
```
