#!/bin/bash
# Kill any existing Next.js processes
pkill -9 -f "next dev" 2>/dev/null
sleep 1

# Kill anything on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 1

# Start the server
cd "$(dirname "$0")"
npm run dev





