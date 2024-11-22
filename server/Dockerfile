# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

FROM node:18-alpine


WORKDIR /usr/src/app

# Set memory allocation for Node.js
ENV NODE_OPTIONS="--max-old-space-size=8192"

# Use production node environment by default
ENV NODE_ENV production
#ENV NODE_TLS_REJECT_UNAUTHORIZED=0
#ENV DATABASE_URL=postgres://postgres:Maciejewski12@aws-rds.c16ejl6j0lwa.us-east-1.rds.amazonaws.com:5432/postgres
# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.yarn to speed up subsequent builds.
# Leverage a bind mounts to package.json and yarn.lock to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install --production --frozen-lockfile

# Run the application as a non-root user.
USER node

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 3001

# Run the application.
CMD yarn start
