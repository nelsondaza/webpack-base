#!/usr/bin/env bash

set -e

if [ ! -f ./config/.env.yml ];
  then
    cp ./config/.env.example.yml ./config/.env.yml;
fi

# test app
# yarn test

# build app
yarn webpack --mode production --bail

# build stories
yarn build-storybook -c config/storybook -o dist/public/stories
