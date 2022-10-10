# Implements some security tips found here: https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/
FROM --platform=linux/amd64 node:16 as builder

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY turbo.json ./

RUN npm install -g prisma

COPY ./database ./database
COPY ./backend/package.json ./backend/package.json
COPY ./frontend/package.json ./frontend/package.json

# Ignore prepare script which will attempt to install husky: https://typicode.github.io/husky/#/?id=disable-husky-in-cidockerprod
RUN npm set-script prepare ""

RUN npm install

COPY ./backend ./backend

RUN npm run -w backend prebuild
RUN npm run -w backend build

RUN rm -rf ./frontend

FROM --platform=linux/amd64 node:16-alpine as runner

EXPOSE 8080
ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src/app

COPY --from=builder --chown=node:node /usr/src/app/package*.json ./
COPY --from=builder --chown=node:node /usr/src/app/turbo.json ./
COPY --from=builder --chown=node:node /usr/src/app/backend/package*.json ./backend/
COPY --from=builder --chown=node:node /usr/src/app/database ./database
COPY --from=builder --chown=node:node /usr/src/app/backend/dist ./backend/dist
COPY --from=builder --chown=node:node /usr/src/app/node_modules ./node_modules

USER node
CMD ["npm", "run", "-w", "backend", "start:prod"]
