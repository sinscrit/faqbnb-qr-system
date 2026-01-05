#!/bin/bash
# =============================================================================
# Pipeline Dashboard Launcher
# =============================================================================
# Quick launcher for the pipeline dashboard TUI.
#
# Usage:
#   ./scripts/dashboard.sh              # Run with defaults
#   ./scripts/dashboard.sh --once       # Single render (no live update)
#   ./scripts/dashboard.sh -r 5         # Refresh every 5 seconds
#
# Created: 2026-01-05
# =============================================================================

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( dirname "$SCRIPT_DIR" )"

cd "$PROJECT_DIR"

/Library/Developer/CommandLineTools/usr/bin/python3 "$SCRIPT_DIR/pipeline-dashboard.py" "$@"
