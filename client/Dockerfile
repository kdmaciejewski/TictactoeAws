#FROM node:18-alpine
ARG NODE_VERSION=22.8.0

FROM node:${NODE_VERSION}-alpine

WORKDIR /app

COPY package.json .

RUN npm install && \
    apk add --no-cache xdg-utils

COPY . .

EXPOSE 3000

CMD [ "npm", "run", "dev" ]