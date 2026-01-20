#!/bin/bash
# Ultra-light static file server for pipeline dashboard
# Uses Python with lowest priority to minimize CPU impact
# Last Modified: 2026-01-19

PORT=${1:-8081}
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Starting dashboard server on port $PORT..."
echo "Access from phone: http://$(ipconfig getifaddr en0):$PORT/dashboard.html"
echo "Press Ctrl+C to stop"

# Run with lowest priority (nice 19) and in background-friendly mode
cd "$DIR" && exec nice -n 19 python3 -m http.server "$PORT" --bind 0.0.0.0 2>/dev/null
