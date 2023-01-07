#!/bin/zsh
set -e

# shellcheck disable=SC1090
source ~/.zshrc

echo "Starting colima"
colima start

cd /Users/paulologeh/Projects/dodgechat
rm flask.log
echo "Starting backend"
docker-compose -f docker-compose.yml up --force-recreate -d

cd /Users/paulologeh/Projects/dodgechat/frontend
echo "Starting frontend"
yarn start > yarn.log 2>&1 &