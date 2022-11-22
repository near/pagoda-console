# Pagoda Console

This monorepo uses [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces) and [turborepo](https://turborepo.org/)

**Prod**: [console.pagoda.co](https://console.pagoda.co)  
**Dev**: [core.dev.console.pagoda.co](https://core.dev.console.pagoda.co)

## Quickstart

### Configure Environment Variables

Copy the following files as starting points, and complete them by obtaining secrets from fellow developers.

- `frontend/.env.local.example` → `frontend/.env.local`
- `backend/.env.nest.local.example` → `backend/.env.nest.local`

### VS Code Dev Container (recommended)

The recommend way to run this project is with VS Code and Dev Containers.

> The Visual Studio Code Remote - Containers extension lets you use a Docker container as a full-featured development environment. It allows you to open any folder inside (or mounted into) a container and take advantage of Visual Studio Code's full feature set.

This will create a set of Docker containers with all required dependencies preconfigured by the Console team.

1. Follow the [official Installation instructions](https://code.visualstudio.com/docs/remote/containers#_installation) from VS Code to install Docker and the required extensions
2. Open this directory in VS Code
3. If prompted in the bottom right with the pictured message, click "Reopen in Container".
   <img src="./devResources/reopen-in-container.png" width="500">  
   Otherwise, open the VS Code command palette and run `Remote-Containers: Reopen in Container`.
4. Wait for the build process to complete. You will now have two connected Docker containers running. One is your Node+Typescript development environment and one is a Postgres instance. Your files are mounted into the Node+Typescript container, so edits made through VS Code apply to the files on your local filesystem
5. Open an in-editor terminal by selecting `Terminal > New Terminal` from the Menu Bar
6. Run `npm install` to install dependencies
7. Run `npm -w database run migrate:reset` to initialize the database
8. Choose `Run > Start Debugging` or hit F5 to run both the frontend and backend live-reload mode
9. The frontend is available at `localhost:3000` and the backend is available at `localhost:3001`. VS Code will automatically expose the port from the Dev Container to the rest of your machine

### nvm + Docker (alternate)

If you're running in to performance issues running/building the app inside the Dev Container, another option is run the app locally via [nvm](https://github.com/nvm-sh/nvm) and Postgres directly through Docker

#### Postgres

For now, you will need to make a change to your `/etc/hosts` file to properly resolve connections to the database container.
See the following comment: https://github.com/near/pagoda-console/pull/18#issuecomment-1258366725

You can run a Postgres container with the appropriate default environment variables via either `docker compose` or `docker run`

##### Docker Compose

```bash
cd .devcontainer
docker compose up db
```

##### Docker Run

```bash
docker run -d --name console-db -p 5432:5432 -e POSTGRES_USER=pguser -e POSTGRES_PASSWORD=pgpass -e POSTGRES_DB=devconsole postgres:13-alpine
```

#### Frontend + Backend

1. Install `nvm`.
2. Open your preferred terminal and navigate to the project's root directory.
3. Run `nvm use`. This will install and activate the correct version of `npm` and `node` within your terminal session.
4. Run `npm install` to install dependecies.
5. Run `npm run dev` to start both the frontend and backend in live-reload mode
6. The frontend is available at `localhost:3000` and the backend is available at `localhost:3001`.

## Dev Container Usage

The default resource allocations for Docker are relatively low. If you plan to continue using VS Code Dev Containers, it is recommended to raise them significantly in Docker Desktop's preferences so that your development environment can benefit from the full power of your machine.

The `node_modules` dir is mounted to a volume instead of the host for increased performance. Running `rm -rf node_modules` may interrupt the mount, so opt for the following to wipe dependencies ([context](https://code.visualstudio.com/remote/advancedcontainers/improve-performance#_use-a-targeted-named-volume))

```bash
rm -rf node_modules/* node_modules/.*
```

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
