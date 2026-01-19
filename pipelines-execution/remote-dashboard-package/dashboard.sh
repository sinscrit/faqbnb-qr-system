#!/bin/bash
# =============================================================================
# Pipeline Dashboard Launcher - Remote Client
# =============================================================================
# Launches the pipeline dashboard, optionally using a configured remote URL.
#
# Usage:
#   ./dashboard.sh                          # Use URL from config
#   ./dashboard.sh --remote http://IP:8080/ # Specify URL directly
#
# Created: 2026-01-18
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/.dashboard-config"

# Load config if exists
REMOTE_URL=""
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE" 2>/dev/null
fi

# Check if --remote is already specified in args
if [[ "$*" != *"--remote"* ]] && [[ "$*" != *"-R"* ]]; then
    # If REMOTE_URL is configured, add it
    if [ -n "$REMOTE_URL" ]; then
        exec python3 "$SCRIPT_DIR/pipeline-dashboard.py" --remote "$REMOTE_URL" "$@"
    fi
fi

# Run with provided args
exec python3 "$SCRIPT_DIR/pipeline-dashboard.py" "$@"
