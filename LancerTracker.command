#!/bin/bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use 20

cd ~/Downloads/tracker2
npm run dev &
sleep 4
open http://localhost:5173
