#!/bin/bash

npm stop
git pull
npm run build
npm install
EGG_SERVER_ENV=local npm start --ignore-stderr

