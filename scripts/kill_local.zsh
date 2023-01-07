#!/bin/zsh
set -e

# shellcheck disable=SC1090
source ~/.zshrc

echo "Killing colima"
colima stop

echo "Killing front end"
ps -ef | grep 'yarn.js start' | grep -v 'grep' | awk '{print $2}' | xargs kill