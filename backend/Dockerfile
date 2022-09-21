# Implements some security tips found here: https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/
FROM --platform=linux/amd64 node:16 as builder

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install -g prisma

# Install app dependencies
RUN npm install

COPY . ./

# NOT IDEAL, WE SHOULD BE GENERATING ON THE DEPLOY IMAGE BELOW SO WE DONT
# NEED TO FORCE COMPATIBILITY IN SCHEMA FILES
RUN npm run prisma:generate

RUN npm run prebuild
RUN npm run build

FROM --platform=linux/amd64 node:16-alpine as runner

EXPOSE 8080
ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src/app

COPY --from=builder --chown=node:node /usr/src/app/package*.json ./
COPY --from=builder --chown=node:node /usr/src/app/dist ./dist
COPY --from=builder --chown=node:node /usr/src/app/generated ./generated

# Ignore prepare script which will attempt to install husky: https://typicode.github.io/husky/#/?id=disable-husky-in-cidockerprod
RUN npm set-script prepare ""
# Install optimized dependencies, running after having all files
RUN npm ci

USER node
CMD ["npm", "run", "start:prod"]