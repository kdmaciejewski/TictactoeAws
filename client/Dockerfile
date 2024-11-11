FROM node:18-alpine

WORKDIR /app

COPY package.json .

RUN npm install && \
    apk add --no-cache xdg-utils

COPY . .

EXPOSE 3000

CMD [ "npm", "run", "dev" ]