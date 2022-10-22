#!/bin/sh
yarn --cwd /app nx build players --prod
node /app/dist/services/players/main.js