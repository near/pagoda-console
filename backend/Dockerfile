FROM node:16 as builder

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

COPY . ./

CMD ["npm", "run", "build"]

FROM node:16-alpine as runner

EXPOSE 8080
USER node

# Create app directory
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY prisma ./prisma

# Install optimized dependencies, running after having all files
RUN npm ci


CMD ["npm", "run", "start:prod"]