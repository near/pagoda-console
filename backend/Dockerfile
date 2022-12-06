# NOTE: this Dockerfile requires a context of its parent directory in order to consume other packages in the monorep
# i.e. as called from parent directory `docker build -t <tag> -f backend/Dockerfile .`

# Implements some security tips found here: https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/
FROM --platform=linux/amd64 node:16 as builder
# Do not set NODE_ENV to production on this image, or dependencies used for building will not be installed

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY turbo.json ./
COPY tsconfig.json ./

COPY ./database/package.json ./database/package.json
COPY ./common/package.json ./common/package.json
COPY ./abi/package.json ./abi/package.json
COPY ./backend/package.json ./backend/package.json
COPY ./frontend/package.json ./frontend/package.json

# Ignore prepare script which will attempt to install husky: https://typicode.github.io/husky/#/?id=disable-husky-in-cidockerprod
RUN npm set-script prepare ""

# This is to get around the prisma client generation we currently do at postinstall. Once turbo is handling client generation
# in dev and build, the postinstall script can be removed along with this
RUN npm set-script postinstall ""

RUN npm ci

COPY ./backend ./backend
COPY ./common ./common
COPY ./abi ./abi
COPY ./database ./database

# This will also build any other packages in the repo which backend depends on
RUN npx turbo build --filter=backend

FROM --platform=linux/amd64 node:16-alpine as runner

EXPOSE 8080
ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src/app

# Order from least likely to change to most likely to change for best layer caching
COPY --from=builder --chown=node:node /usr/src/app/backend/tsconfig.json ./backend/
COPY --from=builder --chown=node:node /usr/src/app/package*.json ./
COPY --from=builder --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /usr/src/app/backend/package*.json ./backend/
COPY --from=builder --chown=node:node /usr/src/app/turbo.json ./
COPY --from=builder --chown=node:node /usr/src/app/database/clients ./database/clients
COPY --from=builder --chown=node:node /usr/src/app/backend/dist ./backend/dist

USER node
CMD ["npm", "run", "-w", "backend", "start:prod"]