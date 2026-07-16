#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/web"

if [ ! -d node_modules ]; then
  npm install
fi

if [[ "${1:-}" == "--debug" || "${1:-}" == "-d" ]]; then
  export VITE_DEBUG=true
  echo "Debug mode on (VITE_DEBUG=true) -- debug panels and preset buttons enabled."
fi

npm run dev
