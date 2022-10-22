#!/bin/sh
yarn --cwd /app nx build discord --prod
node /app/dist/services/discord/main.js