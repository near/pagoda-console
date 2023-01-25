# ┌─────────────┬────────────────────────────────────────────────────────┐
# │ BUILD STAGE │
# └─────────────┘
FROM node:16.19-alpine3.17 as prune
RUN apk update

# turborepo setup
RUN apk add --no-cache libc6-compat
RUN npm i -g turbo

WORKDIR /opt/
COPY .. .

# pruning allows us to create a significantly more compact image, it trims the
# monorepo—including the package lock file—down to only what is needed for this
# package
RUN turbo prune --scope=@pc/cms --docker

# ┌─────────────┬────────────────────────────────────────────────────────┐
# │ BUILD STAGE │
# └─────────────┘
FROM node:16.19-alpine3.17 as build
RUN apk update

# strapi deps
RUN apk add build-base gcc autoconf automake zlib-dev libpng-dev vips-dev && rm -rf /var/cache/apk/* > /dev/null 2>&1

# turborepo setup
RUN apk add --no-cache libc6-compat
RUN npm i -g turbo

# Installing libvips-dev for sharp Compatibility
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /opt/

# First install the dependencies (as they change less often)
COPY --from=prune /opt/out/json/ .
COPY --from=prune /opt/out/package-lock.json ./package-lock.json

# Ignore prepare script which will attempt to install husky: https://typicode.github.io/husky/#/?id=disable-husky-in-cidockerprod
RUN npm set-script prepare ""

# This is to get around the local dev tasks we currently do at postinstall. Ideally this can be removed at some point
RUN npm set-script postinstall ""

# does a prod install driven by NODE_ENV
RUN npm install

# Build the project
COPY --from=prune /opt/out/full/ .
COPY turbo.json turbo.json
RUN turbo build:cms --filter=@pc/cms...

# ┌─────────────┬────────────────────────────────────────────────────────┐
# │ BUILD STAGE │
# └─────────────┘
FROM node:16.19-alpine3.17
RUN apk update
# Installing libvips-dev for sharp Compatibility
RUN apk add vips-dev
RUN rm -rf /var/cache/apk/*
USER node
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /opt/
COPY --from=build /opt/node_modules ./node_modules
ENV PATH /opt/node_modules/.bin:$PATH
COPY --from=build /opt/ ./
EXPOSE 1337
CMD ["npm", "run","-w","cms","start:cms"]