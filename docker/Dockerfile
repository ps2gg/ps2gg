# Base image for all production images in this monorepo
FROM node:lts-bullseye

COPY . /app
WORKDIR /app
RUN yarn --prod