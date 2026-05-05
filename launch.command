#!/bin/bash
# Double-click in Finder to launch the dev server and open the site.

set -e

cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

( sleep 2 && open "http://localhost:3001" ) &

echo ""
echo "Starting dev server on http://localhost:3001"
echo "Press Ctrl+C to stop."
echo ""

npm run dev
