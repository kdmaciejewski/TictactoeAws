# Use the specified Node.js version with Alpine
ARG NODE_VERSION=22.8.0
FROM node:${NODE_VERSION}-alpine

# Set the working directory
WORKDIR /app

# Set memory allocation for Node.js
ENV NODE_OPTIONS="--max-old-space-size=8192"

# Copy package.json and install dependencies
COPY package.json .
RUN npm install && \
    apk add --no-cache xdg-utils

# Copy the rest of the source files into the image
COPY . .

# Expose the port that the application listens on
EXPOSE 3000

# Run the application
CMD [ "npm", "run", "dev" ]


##FROM node:18-alpine
#ARG NODE_VERSION=22.8.0
#
#FROM node:${NODE_VERSION}-alpine
#
#WORKDIR /app
#
#COPY package.json .
#
#RUN npm install && \
#    apk add --no-cache xdg-utils
#
#COPY . .
#
#EXPOSE 3000
#
#CMD [ "npm", "run", "dev" ]