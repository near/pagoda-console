# ! Ideally we would use turbo prune here, but it doesn't work our CMS project
# ! because npm install has issues with the generated package-lock.json file.

# ┌─────────────┬────────────────────────────────────────────────────────┐
# │ BUILD STAGE │
# └─────────────┘
FROM --platform=linux/amd64 node:16.19-alpine3.17 as build
RUN apk update

# turborepo setup
RUN apk add --no-cache libc6-compat
RUN npm i -g turbo

WORKDIR /opt/

COPY package*.json ./
COPY turbo.json ./
COPY tsconfig.json ./

COPY ./cms/package.json ./cms/package.json

# Ignore prepare script which will attempt to install husky: https://typicode.github.io/husky/#/?id=disable-husky-in-cidockerprod
RUN npm set-script prepare ""

# This is to get around the prisma client generation we currently do at postinstall. Once turbo is handling client generation
# in dev and build, the postinstall script can be removed along with this
RUN npm set-script postinstall ""

RUN npm ci

COPY ./cms ./cms

RUN turbo build:cms --filter=@pc/cms...

# ┌─────────────┬────────────────────────────────────────────────────────┐
# │ RUN STAGE   │
# └─────────────┘
FROM --platform=linux/amd64 node:16.19-alpine3.17 as runner
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